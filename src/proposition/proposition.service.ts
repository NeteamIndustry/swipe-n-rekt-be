import { Injectable } from '@nestjs/common';
import { PropositionRepository } from './repositories/proposition.repository';
import {
  GetPropositionListRequest,
  GetPropositionListResponse,
} from './dtos/get-proposition-list.dto';

@Injectable()
export class PropositionService {
  constructor(private readonly propositionRepository: PropositionRepository) {}

  async getPropositionList(
    query: GetPropositionListRequest,
  ): Promise<GetPropositionListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 1;

    const queryBuilder = this.propositionRepository
      .createQueryBuilder('proposition')
      .leftJoinAndSelect('proposition.match_id', 'match')
      .where('match.id = :matchId', {
        matchId: query.match_id,
      })
      .orderBy('proposition.settles_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [propositions, totalData] = await queryBuilder.getManyAndCount();

    return {
      status: true,
      message: 'Proposition list retrieved successfully',
      data: {
        items: propositions.map((proposition) => ({
          id: proposition.id,
          matchId: proposition.match_id?.id ?? query.match_id,
          question: proposition.question ?? null,
          category: proposition.category ?? null,
          contextText: proposition.context_text ?? null,
          priceYes:
            proposition.price_yes !== null &&
            proposition.price_yes !== undefined
              ? Number(proposition.price_yes)
              : null,
          priceNo:
            proposition.price_no !== null && proposition.price_no !== undefined
              ? Number(proposition.price_no)
              : null,
          status: proposition.status ?? null,
          outcome: proposition.outcome ?? null,
          settlesAt: proposition.settles_at ?? null,
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
