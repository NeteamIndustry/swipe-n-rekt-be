import { Injectable } from '@nestjs/common';
import { PropositionRepository } from './repositories/proposition.repository';
import {
  GetPropositionListRequest,
  GetPropositionListResponse,
} from './dtos/get-proposition-list.dto';
import { buildMeta } from '../app.utils';

@Injectable()
export class PropositionService {
  constructor(private readonly propositionRepository: PropositionRepository) {}

  async getPropositionList(
    query: GetPropositionListRequest,
  ): Promise<GetPropositionListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 1;

    const [data, totalData] = await this.propositionRepository
      .createQueryBuilder('proposition')
      .where('proposition.match_id = :matchId', { matchId: query.match_id })
      .orderBy('proposition.settles_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      status: true,
      message: 'Proposition list retrieved successfully',
      data,
      meta: buildMeta(page, limit, totalData),
    };
  }
}
