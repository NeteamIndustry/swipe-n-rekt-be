import { Injectable } from '@nestjs/common';
import { PropositionRepository } from './repositories/proposition.repository';
import {
  GetPropositionListRequest,
  GetPropositionListResponse,
} from './dtos/get-proposition-list.dto';
import { PropositionEntity } from './entities/proposition.entity';
import { buildMeta } from '../app.utils';

export interface CreatePropositionPayload {
  matchId: string;
  question: string;
  category: string;
  contextText: string;
  oddsYes: number;
  oddsNo: number;
  settlesAt: Date;
}

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

  async createProposition(
    payload: CreatePropositionPayload,
  ): Promise<PropositionEntity> {
    const proposition = this.propositionRepository.create({
      ...payload,
      status: 'open',
    });

    return this.propositionRepository.save(proposition);
  }
}
