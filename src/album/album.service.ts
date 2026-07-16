import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlbumRepository } from 'src/card/repositories/album.repository';
import { GetAlbumDetailResponse } from './dtos/get-album-detail.dto';
import {
  GetAlbumListRequest,
  GetAlbumListResponse,
} from './dtos/get-album-list.dto';
import {
  ClaimSetRewardRequest,
  ClaimSetRewardResponse,
} from './dtos/claim-set-reward.dto';
import { buildMeta } from '../app.utils';
import { UserCardEntity } from '../user/entities/user-card.entity';
import { UserEntity } from '../user/entities/user.entity';
import { SetRewardClaimEntity } from './entities/set-reward-claim.entity';
import { SolanaService } from '../solana/solana.service';

@Injectable()
export class AlbumService {
  constructor(
    private readonly albumRepository: AlbumRepository,
    @InjectRepository(UserCardEntity)
    private readonly userCardRepository: Repository<UserCardEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SetRewardClaimEntity)
    private readonly setRewardClaimRepository: Repository<SetRewardClaimEntity>,
    private readonly solanaService: SolanaService,
  ) {}

  async getAlbumDetail(id: string): Promise<GetAlbumDetailResponse> {
    const data = await this.albumRepository.findOne({
      where: { id },
      relations: { cards: true },
    });

    if (!data) {
      throw new NotFoundException(`Album with id ${id} not found`);
    }

    return {
      status: true,
      message: 'Album detail retrieved successfully',
      data,
    };
  }

  async getAlbumList(
    payload: GetAlbumListRequest,
  ): Promise<GetAlbumListResponse> {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;

    const [data, totalData] = await this.albumRepository.findAndCount({
      order: { countryName: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { cards: true },
    });

    return {
      status: true,
      message: 'Album list retrieved successfully',
      data,
      meta: buildMeta(page, limit, totalData),
    };
  }

  async claimSetReward(
    userId: string,
    albumId: string,
    payload: ClaimSetRewardRequest,
  ): Promise<ClaimSetRewardResponse> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: { cards: true },
    });
    if (!album) {
      throw new NotFoundException(`Album with id ${albumId} not found`);
    }

    const existingClaim = await this.setRewardClaimRepository.findOne({
      where: { userId, albumId, period: payload.period },
    });
    if (existingClaim) {
      throw new BadRequestException(
        'Reward already claimed for this album and period',
      );
    }

    const albumCardIds = album.cards.map((card) => card.id);
    let ownedCount = 0;
    if (albumCardIds.length > 0) {
      const raw = await this.userCardRepository
        .createQueryBuilder('uc')
        .select('COUNT(DISTINCT uc.card_id)', 'count')
        .where('uc.user_id = :userId', { userId })
        .andWhere('uc.card_id IN (:...cardIds)', { cardIds: albumCardIds })
        .getRawOne<{ count: string }>();
      ownedCount = parseInt(raw?.count ?? '0', 10);
    }

    if (!album.totalCardsRequired || ownedCount < album.totalCardsRequired) {
      throw new BadRequestException(
        `Set not yet completed: ${ownedCount}/${album.totalCardsRequired ?? '?'} cards owned`,
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { txSig, amount } = await this.solanaService.claimSetReward(
      user.walletAddress,
      album.countryName,
      payload.period,
    );

    const claim = this.setRewardClaimRepository.create({
      userId,
      albumId,
      period: payload.period,
      amount,
      txSig,
    });
    await this.setRewardClaimRepository.save(claim);

    return {
      status: true,
      message: 'Set reward claimed successfully',
      data: { amount, txSig, claimedAt: claim.claimedAt },
    };
  }
}
