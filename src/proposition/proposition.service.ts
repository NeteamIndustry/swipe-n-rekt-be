import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PropositionRepository } from './repositories/proposition.repository';
import {
  GetPropositionListRequest,
  GetPropositionListResponse,
} from './dtos/get-proposition-list.dto';
import { PropositionEntity } from './entities/proposition.entity';
import { buildMeta } from '../app.utils';
import { SolanaService } from '../solana/solana.service';
import { BetEntity } from '../bet/entities/bet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { sideForPick } from '../solana/solana.constants';
import {
  DEFAULT_ON_CHAIN_COMPARISON,
  DEFAULT_ON_CHAIN_PERIOD,
  DEFAULT_ON_CHAIN_STAT_KEY,
  DEFAULT_ON_CHAIN_THRESHOLD,
  deriveFixtureId,
} from './proposition.onchain';
import { SettlePropositionResponse } from './dtos/settle-proposition.dto';
import { RetryMarketInitResponse } from './dtos/retry-market-init.dto';
import { KeeperStatusResponse } from './dtos/keeper-status.dto';

export interface CreatePropositionPayload {
  matchId: string;
  matchExternalId?: string;
  question: string;
  category: string;
  contextText: string;
  oddsYes: number;
  oddsNo: number;
  settlesAt: Date;
  outcomeKey?: string;
}

@Injectable()
export class PropositionService {
  private readonly logger = new Logger(PropositionService.name);

  constructor(
    private readonly propositionRepository: PropositionRepository,
    private readonly solanaService: SolanaService,
    @InjectRepository(BetEntity)
    private readonly betRepository: Repository<BetEntity>,
  ) {}

  async getPropositionList(
    payload: GetPropositionListRequest,
  ): Promise<GetPropositionListResponse> {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 1;

    const [data, totalData] = await this.propositionRepository
      .createQueryBuilder('proposition')
      .orderBy('proposition.settles_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      status: true,
      message: 'Proposition list retrieved successfully',
      data,
      meta: buildMeta(page, limit, totalData),
    };
  }

  async createProposition(
    payload: CreatePropositionPayload,
  ): Promise<PropositionEntity> {
    const proposition = this.propositionRepository.create({
      ...payload,
      status: 'open',
    });
    const saved = await this.propositionRepository.save(proposition);

    return this.initializeOnChainMarket(saved, payload.matchExternalId);
  }

  /**
   * Whether the given match already has a still-active (not yet resolved)
   * proposition for the same market outcome. Used by the generation cron to
   * avoid piling up duplicate propositions for a match+outcome on every run;
   * once the previous one resolves, a fresh round can be created again.
   */
  async hasActivePropositionForOutcome(
    matchId: string,
    outcomeKey: string,
  ): Promise<boolean> {
    const count = await this.propositionRepository.count({
      where: { matchId, outcomeKey, status: Not('resolved') },
    });
    return count > 0;
  }

  /**
   * Attempts to create the on-chain market for a proposition and persist the
   * resulting address fields. On failure, the proposition is left DB-only
   * (not yet the sole source of truth) but the error is surfaced via
   * marketInitError and an error-level log, instead of being swallowed —
   * callers such as retryMarketInit rely on marketInitError being set to
   * find propositions worth retrying.
   */
  private async initializeOnChainMarket(
    proposition: PropositionEntity,
    matchExternalId: string | undefined,
  ): Promise<PropositionEntity> {
    try {
      const fixtureId = deriveFixtureId(matchExternalId);
      const windowStart = BigInt(Math.floor(Date.now() / 1000));
      const windowEnd = BigInt(
        Math.floor((proposition.settlesAt?.getTime() ?? Date.now()) / 1000),
      );

      const { marketAddress, vaultAddress, txSignature } =
        await this.solanaService.initializeMarket({
          fixtureId,
          statKey: DEFAULT_ON_CHAIN_STAT_KEY,
          period: DEFAULT_ON_CHAIN_PERIOD,
          threshold: DEFAULT_ON_CHAIN_THRESHOLD,
          comparison: DEFAULT_ON_CHAIN_COMPARISON,
          windowStart,
          windowEnd,
        });

      proposition.marketAddress = marketAddress;
      proposition.vaultAddress = vaultAddress;
      proposition.marketInitTx = txSignature;
      proposition.onChainFixtureId = fixtureId.toString();
      proposition.onChainStatKey = DEFAULT_ON_CHAIN_STAT_KEY;
      proposition.onChainThreshold = DEFAULT_ON_CHAIN_THRESHOLD;
      proposition.onChainComparison = DEFAULT_ON_CHAIN_COMPARISON;
      proposition.onChainWindowStart = windowStart.toString();
      proposition.onChainWindowEnd = windowEnd.toString();
      proposition.marketInitError = null;

      return await this.propositionRepository.save(proposition);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize on-chain market for proposition ${proposition.id}; leaving it DB-only.`,
        error instanceof Error ? error.stack : String(error),
      );
      proposition.marketInitError = message;
      return await this.propositionRepository.save(proposition);
    }
  }

  async getKeeperStatus(): Promise<KeeperStatusResponse> {
    const status = await this.solanaService.getKeeperStatus();
    return {
      status: true,
      message: 'Keeper status retrieved successfully',
      data: status,
    };
  }

  async retryMarketInit(id: string): Promise<RetryMarketInitResponse> {
    const proposition = await this.propositionRepository.findOne({
      where: { id },
      relations: { match: true },
    });
    if (!proposition) {
      throw new NotFoundException('Proposition not found');
    }
    if (proposition.marketAddress) {
      throw new BadRequestException(
        'This proposition already has an on-chain market',
      );
    }

    const result = await this.initializeOnChainMarket(
      proposition,
      proposition.match?.externalId,
    );

    if (!result.marketAddress) {
      throw new BadRequestException(
        `On-chain market init failed: ${result.marketInitError}`,
      );
    }

    return {
      status: true,
      message: 'On-chain market initialized successfully',
      data: result,
    };
  }

  async settleProposition(
    id: string,
    winningSide: boolean,
  ): Promise<SettlePropositionResponse> {
    const proposition = await this.propositionRepository.findOne({
      where: { id },
    });
    if (!proposition) {
      throw new NotFoundException('Proposition not found');
    }
    if (!proposition.marketAddress) {
      throw new BadRequestException(
        'This proposition has no on-chain market to settle',
      );
    }
    if (proposition.status === 'resolved') {
      throw new BadRequestException('This proposition is already resolved');
    }

    await this.solanaService.settleMarketMock(
      proposition.marketAddress,
      sideForPick(winningSide),
    );

    proposition.status = 'resolved';
    proposition.outcome = winningSide;
    const settled = await this.propositionRepository.save(proposition);

    const activeBets = await this.betRepository.find({
      where: { propositionId: id, status: 'active' },
    });
    await Promise.all(
      activeBets.map((bet) =>
        this.betRepository.update(bet.id, {
          status: bet.pick === winningSide ? 'won' : 'lost',
        }),
      ),
    );

    return {
      status: true,
      message: 'Proposition settled successfully',
      data: settled,
    };
  }
}
