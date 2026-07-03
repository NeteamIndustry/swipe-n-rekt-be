import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetMatchListRequest,
  GetMatchListResponse,
} from './dtos/get-match-list.dto';
import { MatchService } from './match.service';

@ApiTags('Match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get match list',
    description:
      'Returns a paginated list of matches. By default, the status filter is set to live and the limit is set to 10 items per page.',
  })
  @ApiOkResponse({ type: GetMatchListResponse })
  async getMatchList(
    @Query() query: GetMatchListRequest,
  ): Promise<GetMatchListResponse> {
    return this.matchService.getMatchList(query);
  }
}
