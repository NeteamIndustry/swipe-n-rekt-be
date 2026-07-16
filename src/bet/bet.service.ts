import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BetEntity } from './entities/bet.entity';
import { PropositionEntity } from '../proposition/entities/proposition.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateBetRequest } from './dtos/create-bet.dto';
import { BetResponse } from './dtos/bet-response.dto';
import { GetBetListRequest, GetBetListResponse } from './dtos/get-bet-list.dto';
import { buildMeta } from '../app.utils';
import { SolanaService } from '../solana/solana.service';
import { deriveMarketId } from '../solana/derive-market-id.util';

@Injectable()
export class BetService {
  constructor(
    @InjectRepository(BetEntity)
    private readonly betRepository: Repository<BetEntity>,
    @InjectRepository(PropositionEntity)
    private readonly propositionRepository: Repository<PropositionEntity>,
    private readonly dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proposition = await queryRunner.manager.findOne(PropositionEntity, {
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

      if (user.balanceUsdc === null || user.balanceUsdc < payload.stake) {
        throw new BadRequestException('Insufficient balance to place this bet');
      }

      const odds = payload.pick ? proposition.oddsYes : proposition.oddsNo;
      if (!odds) {
        throw new BadRequestException(
          'Odds not available for the selected pick',
        );
      }

      const potentialWin = parseFloat((payload.stake * odds).toFixed(4));

      const marketId = deriveMarketId(proposition);
      const { txSig, positionId } = await this.solanaService.placeBet(
        marketId,
        payload.pick,
        payload.stake,
        user.walletAddress,
      );

      const bet = this.betRepository.create({
        userId: user.id,
        propositionId: payload.propositionId,
        pick: payload.pick,
        stake: payload.stake,
        potentialWin,
        status: 'active',
        marketId,
        positionId,
        placeBetTxSig: txSig,
      });

      await queryRunner.manager.save(bet);

      const newBalance = parseFloat(
        (user.balanceUsdc - payload.stake).toFixed(4),
      );
      await queryRunner.manager.update(
        UserEntity,
        { id: user.id },
        { balanceUsdc: newBalance },
      );

      await queryRunner.commitTransaction();

      return {
        status: true,
        message: 'Bet placed successfully',
        data: { bet },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
