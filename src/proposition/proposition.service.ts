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
    payload: GetPropositionListRequest,
  ): Promise<GetPropositionListResponse> {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 1;

    const [data, totalData] = await this.propositionRepository
      .createQueryBuilder('proposition')
      .where('proposition.match_id = :matchId', { matchId: payload.match_id })
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
