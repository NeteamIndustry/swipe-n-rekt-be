import { Injectable, Logger } from '@nestjs/common';
import { DataSource, In, LessThanOrEqual } from 'typeorm';
import { PropositionEntity } from '../proposition/entities/proposition.entity';
import { BetEntity } from '../bet/entities/bet.entity';
import { BetSettlementEntity } from '../bet/entities/bet-settlement.entity';
import { UserEntity } from '../user/entities/user.entity';
import { SolanaService } from '../solana/solana.service';
import { deriveMarketId } from '../solana/derive-market-id.util';
import { resolvePropositionOutcome } from './resolve-outcome.util';

function round4(value: number): number {
  return parseFloat(value.toFixed(4));
}

function round2(value: number): number {
  return parseFloat(value.toFixed(2));
}

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly solanaService: SolanaService,
  ) {}

  async settleDuePropositions(): Promise<void> {
    const dueProps = await this.dataSource
      .getRepository(PropositionEntity)
      .find({
        where: { status: 'open', settlesAt: LessThanOrEqual(new Date()) },
      });

    for (const proposition of dueProps) {
      try {
        await this.settleProposition(proposition.id);
      } catch (error) {
        this.logger.error(
          `Failed to settle proposition ${proposition.id}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }
  }

  private async settleProposition(propositionId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the row so an overlapping cron tick can't settle it twice.
      const proposition = await queryRunner.manager.findOne(PropositionEntity, {
        where: { id: propositionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!proposition || proposition.status !== 'open') {
        await queryRunner.rollbackTransaction();
        return;
      }

      const outcome = resolvePropositionOutcome(proposition);
      const marketId = deriveMarketId(proposition);
      const merkleProof = `mock-proof:${proposition.id}`;

      const { txSig } = await this.solanaService.settleMarket(
        marketId,
        merkleProof,
        outcome,
      );

      proposition.outcome = outcome;
      proposition.status = 'resolved';
      await queryRunner.manager.save(proposition);

      const bets = await queryRunner.manager.find(BetEntity, {
        where: { propositionId: proposition.id, status: 'active' },
      });

      for (const bet of bets) {
        const won = bet.pick === outcome;
        bet.status = won ? 'won' : 'lost';
        await queryRunner.manager.save(bet);

        const user = await queryRunner.manager.findOne(UserEntity, {
          where: { id: bet.userId },
        });
        if (!user) {
          continue;
        }

        const pnlDelta = won ? bet.potentialWin - bet.stake : -bet.stake;
        if (won) {
          user.balanceUsdc = round4((user.balanceUsdc ?? 0) + bet.potentialWin);
          user.currentStreak = (user.currentStreak ?? 0) + 1;
          user.bestStreak = Math.max(user.bestStreak ?? 0, user.currentStreak);
        } else {
          user.currentStreak = 0;
        }
        user.netPnl = round4((user.netPnl ?? 0) + pnlDelta);

        const [wonCount, settledCount] = await Promise.all([
          queryRunner.manager.count(BetEntity, {
            where: { userId: user.id, status: 'won' },
          }),
          queryRunner.manager.count(BetEntity, {
            where: { userId: user.id, status: In(['won', 'lost']) },
          }),
        ]);
        user.totalPredictions = settledCount;
        user.winRatePercentage =
          settledCount > 0 ? round2((wonCount / settledCount) * 100) : 0;

        await queryRunner.manager.save(user);

        const settlement = queryRunner.manager.create(BetSettlementEntity, {
          betId: bet.id,
          oracleSource: 'mock-solana-settlement',
          merkleRoot: merkleProof,
          leafHash: `mock-leaf:${bet.id}`,
          settlementTx: txSig,
          settledAt: new Date(),
        });
        await queryRunner.manager.save(settlement);
      }

      await queryRunner.commitTransaction();
      this.logger.debug(
        `Settled proposition ${proposition.id}: outcome=${outcome}, bets=${bets.length}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
