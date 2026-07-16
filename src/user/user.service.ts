import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { UserRepository } from './repositories/user.repository';
import { GetAuthenticatedUserResponse } from './dtos/get-authenticated-user.dto';
import {
  GetLeaderboardRequest,
  GetLeaderboardResponse,
} from './dtos/get-leaderboard.dto';
import { OpenPackRequest, OpenPackResponse } from './dtos/open-pack.dto';
import { UserPackEntity } from './entities/user-pack.entity';
import { UserCardEntity } from './entities/user-card.entity';
import { UserEntity } from './entities/user.entity';
import { CardEntity } from '../card/entities/card.entity';
import { buildMeta } from '../app.utils';
import { buildPackDraw } from './user.util';
import { SolanaService } from '../solana/solana.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly solanaService: SolanaService,
  ) {}

  async getAuthenticatedUser(
    userId: string,
  ): Promise<GetAuthenticatedUserResponse> {
    const data = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        userCards: { card: { album: true } },
        userPacks: true,
      },
    });

    if (!data) {
      throw new NotFoundException('User not found');
    }

    return {
      status: true,
      message: 'Authenticated user info retrieved successfully',
      data,
    };
  }

  async getLeaderboard(
    payload: GetLeaderboardRequest,
  ): Promise<GetLeaderboardResponse> {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, totalData] = await this.userRepository.findAndCount({
      order: { netPnl: { direction: 'DESC', nulls: 'LAST' } },
      skip,
      take: limit,
    });

    const leaderboard = data.map((user, index) => ({
      rank: skip + index + 1,
      username: user.username,
      walletAddress: user.walletAddress,
      netPnl: user.netPnl,
      winRatePercentage: user.winRatePercentage,
      bestStreak: user.bestStreak,
      totalPredictions: user.totalPredictions,
    }));

    return {
      status: true,
      message: 'Leaderboard retrieved successfully',
      data: leaderboard,
      meta: buildMeta(page, limit, totalData),
    };
  }

  async openPack(
    userId: string,
    payload: OpenPackRequest,
  ): Promise<OpenPackResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userPack = await queryRunner.manager.findOne(UserPackEntity, {
        where: { id: payload.userPackId, userId },
      });

      if (!userPack) {
        throw new NotFoundException('Pack not found');
      }

      if (!userPack.quantity || userPack.quantity < 1) {
        throw new BadRequestException('No packs of this type remaining');
      }

      const rarityDraw = buildPackDraw(userPack.packRarity);

      const uniqueRarities = [...new Set(rarityDraw)];
      const availableCards = await queryRunner.manager.find(CardEntity, {
        where: { rarity: In(uniqueRarities) },
      });

      const cardsByRarity = new Map<string, CardEntity[]>();
      for (const rarity of uniqueRarities) {
        cardsByRarity.set(
          rarity,
          availableCards.filter((card) => card.rarity === rarity),
        );
      }

      const awardedCards = rarityDraw.map((rarity) => {
        const pool = cardsByRarity.get(rarity) ?? [];
        if (pool.length === 0) {
          throw new NotFoundException(
            `No cards available for rarity: ${rarity}`,
          );
        }
        return pool[Math.floor(Math.random() * pool.length)];
      });

      const mintResults = await Promise.all(
        awardedCards.map((card) =>
          this.solanaService.mintCard(user.walletAddress, card.id, card.rarity),
        ),
      );

      const userCards = awardedCards.map((card, index) =>
        queryRunner.manager.create(UserCardEntity, {
          userId,
          cardId: card.id,
          mintAddress: mintResults[index].mintAddress,
          mintTxSig: mintResults[index].txSig,
        }),
      );
      await queryRunner.manager.save(UserCardEntity, userCards);

      const remainingQuantity = userPack.quantity - 1;
      if (remainingQuantity <= 0) {
        await queryRunner.manager.delete(UserPackEntity, {
          id: userPack.id,
        });
      } else {
        await queryRunner.manager.update(
          UserPackEntity,
          { id: userPack.id },
          { quantity: remainingQuantity },
        );
      }

      await queryRunner.commitTransaction();

      return {
        status: true,
        message: 'Pack opened successfully',
        data: {
          packRarity: userPack.packRarity,
          cards: awardedCards,
          remainingQuantity: Math.max(remainingQuantity, 0),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
