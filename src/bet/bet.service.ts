import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BetEntity } from './entities/bet.entity';
import { PropositionEntity } from '../proposition/entities/proposition.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateBetRequest } from './dtos/create-bet.dto';
import { BetResponse } from './dtos/bet-response.dto';
import { GetBetListRequest, GetBetListResponse } from './dtos/get-bet-list.dto';
import { buildMeta } from '../app.utils';
import { SolanaService } from '../solana/solana.service';
import { pickForSide } from '../solana/solana.constants';

@Injectable()
export class BetService {
  constructor(
    @InjectRepository(BetEntity)
    private readonly betRepository: Repository<BetEntity>,
    @InjectRepository(PropositionEntity)
    private readonly propositionRepository: Repository<PropositionEntity>,
    private readonly solanaService: SolanaService,
  ) {}

  async getBetList(
    userId: string,
    payload: GetBetListRequest,
  ): Promise<GetBetListResponse> {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;

    const [data, totalData] = await this.betRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { proposition: true },
    });

    return {
      status: true,
      message: 'Bet list retrieved successfully',
      data,
      meta: buildMeta(page, limit, totalData),
    };
  }

  async createBet(
    user: UserEntity,
    payload: CreateBetRequest,
  ): Promise<BetResponse> {
    const proposition = await this.propositionRepository.findOne({
      where: { id: payload.propositionId },
    });
    if (!proposition) {
      throw new NotFoundException('Proposition not found');
    }
    if (proposition.status !== 'open') {
      throw new BadRequestException(
        'This proposition is no longer open for betting',
      );
    }
    if (!proposition.marketAddress) {
      throw new BadRequestException(
        'This proposition has no on-chain market to bet against',
      );
    }
    if (!user.walletAddress) {
      throw new BadRequestException('User has no linked wallet address');
    }

    const existing = await this.betRepository.findOne({
      where: { txSignature: payload.txSignature },
    });
    if (existing) {
      throw new ConflictException(
        'This transaction has already been recorded as a bet',
      );
    }

    const verified = await this.solanaService.verifyPlaceBetTx(
      payload.txSignature,
      {
        marketAddress: proposition.marketAddress,
        expectedUserWallet: user.walletAddress,
      },
    );

    if (pickForSide(verified.side) !== payload.pick) {
      throw new BadRequestException(
        'The on-chain bet side does not match the requested pick',
      );
    }

    const stake = verified.amount / LAMPORTS_PER_SOL;
    const odds = payload.pick ? proposition.oddsYes : proposition.oddsNo;
    if (!odds) {
      throw new BadRequestException('Odds not available for the selected pick');
    }
    const potentialWin = parseFloat((stake * odds).toFixed(4));

    const bet = this.betRepository.create({
      userId: user.id,
      propositionId: payload.propositionId,
      pick: payload.pick,
      stake,
      potentialWin,
      status: 'active',
      txSignature: payload.txSignature,
      positionAddress: verified.positionAddress,
    });

    await this.betRepository.save(bet);

    return {
      status: true,
      message: 'Bet placed successfully',
      data: { bet },
    };
  }
}
