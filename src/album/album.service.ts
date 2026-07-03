import { Injectable } from '@nestjs/common';
import { AlbumRepository } from 'src/card/repositories/album.repository';
import {
  GetAlbumListRequest,
  GetAlbumListResponse,
} from './dtos/get-album-list.dto';

@Injectable()
export class AlbumService {
  constructor(private readonly albumRepository: AlbumRepository) {}

  async getAlbumList(
    query: GetAlbumListRequest,
  ): Promise<GetAlbumListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [albums, totalData] = await this.albumRepository.findAndCount({
      order: {
        country_name: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: true,
      message: 'Album list retrieved successfully',
      data: {
        items: albums.map((album) => ({
          id: album.id,
          countryName: album.country_name ?? null,
          totalCardsRequired: album.total_cards_required ?? null,
          rewardType: album.reward_type ?? null,
        })),
        pagination: {
          page,
          limit,
          totalData,
          totalPages: Math.ceil(totalData / limit),
        },
      },
    };
  }
}
