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
import { Repository } from 'typeorm';
import { sideForPick } from '../solana/solana.constants';
import {
  DEFAULT_ON_CHAIN_COMPARISON,
  DEFAULT_ON_CHAIN_PERIOD,
  DEFAULT_ON_CHAIN_STAT_KEY,
  DEFAULT_ON_CHAIN_THRESHOLD,
  deriveFixtureId,
} from './proposition.onchain';
import { SettlePropositionResponse } from './dtos/settle-proposition.dto';

export interface CreatePropositionPayload {
  matchId: string;
  matchExternalId?: string;
  question: string;
  category: string;
  contextText: string;
  oddsYes: number;
  oddsNo: number;
  settlesAt: Date;
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

    try {
      const fixtureId = deriveFixtureId(payload.matchExternalId);
      const windowStart = BigInt(Math.floor(Date.now() / 1000));
      const windowEnd = BigInt(Math.floor(payload.settlesAt.getTime() / 1000));

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

      saved.marketAddress = marketAddress;
      saved.vaultAddress = vaultAddress;
      saved.marketInitTx = txSignature;
      saved.onChainFixtureId = fixtureId.toString();
      saved.onChainStatKey = DEFAULT_ON_CHAIN_STAT_KEY;
      saved.onChainThreshold = DEFAULT_ON_CHAIN_THRESHOLD;
      saved.onChainComparison = DEFAULT_ON_CHAIN_COMPARISON;
      saved.onChainWindowStart = windowStart.toString();
      saved.onChainWindowEnd = windowEnd.toString();

      return await this.propositionRepository.save(saved);
    } catch (error) {
      // On-chain market creation is additive infra right now, not yet the
      // sole source of truth — a failure here shouldn't block the
      // proposition from existing DB-only.
      this.logger.warn(
        `Failed to initialize on-chain market for proposition ${saved.id}; leaving it DB-only.`,
        error instanceof Error ? error.stack : String(error),
      );
      return saved;
    }
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
