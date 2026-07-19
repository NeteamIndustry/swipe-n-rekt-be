import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PropositionService } from './proposition.service';
import {
  GetPropositionListRequest,
  GetPropositionListResponse,
} from './dtos/get-proposition-list.dto';
import {
  SettlePropositionRequest,
  SettlePropositionResponse,
} from './dtos/settle-proposition.dto';
import { ServerSecretGuard } from '../auth/server-secret.guard';

@ApiTags('Proposition')
@Controller('proposition')
export class PropositionController {
  constructor(private readonly propositionService: PropositionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get proposition list',
    description:
      'Returns a paginated list of propositions. By default, the limit is set to 1 item per page.',
  })
  @ApiOkResponse({ type: GetPropositionListResponse })
  async getPropositionList(
    @Query() query: GetPropositionListRequest,
  ): Promise<GetPropositionListResponse> {
    return this.propositionService.getPropositionList(query);
  }

  @Post(':id/settle')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ServerSecretGuard)
  @ApiHeader({
    name: 'x-server-secret',
    description: 'Backend authority shared secret',
  })
  @ApiOperation({
    summary: 'Settle a proposition (admin)',
    description:
      "Declares the winning side for a proposition's on-chain market via the " +
      'program\'s settle_market_mock instruction (backend-authority "week-1 ' +
      'fallback" settlement — trustless oracle settlement isn\'t wired up yet), ' +
      'then flips local proposition/bet statuses to match. Winners still claim ' +
      'their payout on-chain themselves via claim_payout.',
  })
  @ApiOkResponse({ type: SettlePropositionResponse })
  async settleProposition(
    @Param('id') id: string,
    @Body() payload: SettlePropositionRequest,
  ): Promise<SettlePropositionResponse> {
    return this.propositionService.settleProposition(id, payload.winningSide);
  }
}
