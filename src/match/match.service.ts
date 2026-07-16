import { Injectable } from '@nestjs/common';
import { MatchRepository } from './repositories/match.repository';
import {
  GetMatchListRequest,
  GetMatchListResponse,
} from './dtos/get-match-list.dto';
import { GetLiveMatchListResponse } from './dtos/get-live-match-list.dto';
import { buildMeta } from '../app.utils';
import { TxlineService } from './txline.service';

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly txlineService: TxlineService,
  ) {}

  async getMatchList(
    payload: GetMatchListRequest,
  ): Promise<GetMatchListResponse> {
    const status = payload.status ?? 'live';
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;

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

  async getLiveMatches(): Promise<GetLiveMatchListResponse> {
    const data =
      (await this.txlineService.getLiveMatches()) ??
      (await this.matchRepository.find({
        where: { status: 'live' },
        order: { createdAt: 'DESC' },
      }));

    return {
      status: true,
      message: 'Live matches retrieved successfully',
      data,
    };
  }
}
