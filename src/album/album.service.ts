import { Injectable, NotFoundException } from '@nestjs/common';
import { AlbumRepository } from 'src/card/repositories/album.repository';
import { GetAlbumDetailResponse } from './dtos/get-album-detail.dto';
import {
  GetAlbumListRequest,
  GetAlbumListResponse,
} from './dtos/get-album-list.dto';
import { buildMeta } from '../app.utils';

@Injectable()
export class AlbumService {
  constructor(private readonly albumRepository: AlbumRepository) {}

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
    query: GetAlbumListRequest,
  ): Promise<GetAlbumListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, totalData] = await this.albumRepository.findAndCount({
      order: { countryName: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: true,
      message: 'Album list retrieved successfully',
      data,
      meta: buildMeta(page, limit, totalData),
    };
  }
}
