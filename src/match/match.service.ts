import { Injectable } from '@nestjs/common';
import { MatchRepository } from './repositories/match.repository';
import {
  GetMatchListRequest,
  GetMatchListResponse,
} from './dtos/get-match-list.dto';

@Injectable()
export class MatchService {
  constructor(private readonly matchRepository: MatchRepository) {}

  async getMatchList(
    query: GetMatchListRequest,
  ): Promise<GetMatchListResponse> {
    const status = query.status ?? 'live';
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [matches, totalData] = await this.matchRepository.findAndCount({
      where: {
        status,
      },
      order: {
        created_at: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: true,
      message: 'Match list retrieved successfully',
      data: {
        items: matches.map((match) => ({
          id: match.id,
          teamHome: match.team_home ?? null,
          teamAway: match.team_away ?? null,
          scoreHome: match.score_home ?? null,
          scoreAway: match.score_away ?? null,
          matchMinute: match.match_minute ?? null,
          half: match.half ?? null,
          status: match.status ?? null,
          createdAt: match.created_at ?? null,
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
