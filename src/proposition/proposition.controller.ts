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
import { RetryMarketInitResponse } from './dtos/retry-market-init.dto';
import { KeeperStatusResponse } from './dtos/keeper-status.dto';
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

  @Get('keeper/status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ServerSecretGuard)
  @ApiHeader({
    name: 'x-server-secret',
    description: 'Backend authority shared secret',
  })
  @ApiOperation({
    summary: 'Keeper wallet status (admin)',
    description:
      'Reports whether SOLANA_KEEPER_SECRET_KEY is loaded in this ' +
      'environment, the keeper public key, its on-chain SOL balance, and the ' +
      'RPC in use. Use this to diagnose why init-market/settle fail — an ' +
      'unconfigured or unfunded keeper cannot create or settle markets.',
  })
  @ApiOkResponse({ type: KeeperStatusResponse })
  async getKeeperStatus(): Promise<KeeperStatusResponse> {
    return this.propositionService.getKeeperStatus();
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

  @Post(':id/init-market')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ServerSecretGuard)
  @ApiHeader({
    name: 'x-server-secret',
    description: 'Backend authority shared secret',
  })
  @ApiOperation({
    summary: 'Retry on-chain market initialization for a proposition (admin)',
    description:
      'Propositions are normally given an on-chain market automatically when ' +
      'created. If that attempt failed (e.g. the keeper wallet was ' +
      'unfunded/misconfigured), marketAddress stays null and the proposition ' +
      'cannot accept bets or be settled. This retries initializeMarket for a ' +
      'proposition that does not yet have one, without waiting for the next ' +
      'proposition-generation run.',
  })
  @ApiOkResponse({ type: RetryMarketInitResponse })
  async retryMarketInit(
    @Param('id') id: string,
  ): Promise<RetryMarketInitResponse> {
    return this.propositionService.retryMarketInit(id);
  }
}
