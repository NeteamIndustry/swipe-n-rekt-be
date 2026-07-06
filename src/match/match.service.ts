import { Injectable } from '@nestjs/common';
import { MatchRepository } from './repositories/match.repository';
import {
  GetMatchListRequest,
  GetMatchListResponse,
} from './dtos/get-match-list.dto';
import { buildMeta } from '../app.utils';

@Injectable()
export class MatchService {
  constructor(private readonly matchRepository: MatchRepository) {}

  async getMatchList(
    query: GetMatchListRequest,
  ): Promise<GetMatchListResponse> {
    const status = query.status ?? 'live';
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [data, totalData] = await this.matchRepository.findAndCount({
      where: { status },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: true,
      message: 'Match list retrieved successfully',
      data,
      meta: buildMeta(page, limit, totalData),
    };
  }
}
