import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PropositionService } from './proposition.service';
import {
  GetPropositionListRequest,
  GetPropositionListResponse,
} from './dtos/get-proposition-list.dto';

@ApiTags('Proposition')
@Controller('proposition')
export class PropositionController {
  constructor(private readonly propositionService: PropositionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get proposition list by match ID',
    description:
      'Returns a paginated list of propositions filtered by match_id. By default, the limit is set to 1 item per page.',
  })
  @ApiOkResponse({ type: GetPropositionListResponse })
  async getPropositionList(
    @Query() query: GetPropositionListRequest,
  ): Promise<GetPropositionListResponse> {
    return this.propositionService.getPropositionList(query);
  }
}
