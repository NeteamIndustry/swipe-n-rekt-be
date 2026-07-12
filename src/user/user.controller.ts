import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/jwt-auth.guard';
import { GetAuthenticatedUserResponse } from './dtos/get-authenticated-user.dto';
import {
  GetLeaderboardRequest,
  GetLeaderboardResponse,
} from './dtos/get-leaderboard.dto';
import { OpenPackRequest, OpenPackResponse } from './dtos/open-pack.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated user info',
    description:
      'Returns the profile and statistics of the currently authenticated user based on the JWT bearer token, including username, wallet address, balance, streak metrics, PnL, total predictions, account creation date, owned cards (with their card and album details), and owned card packs.',
  })
  @ApiOkResponse({ type: GetAuthenticatedUserResponse })
  async getAuthenticatedUser(
    @Req() request: AuthenticatedRequest,
  ): Promise<GetAuthenticatedUserResponse> {
    return this.userService.getAuthenticatedUser(request.user.sub);
  }

  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get leaderboard',
    description:
      'Returns a paginated list of users ranked by net PnL in descending order.',
  })
  @ApiOkResponse({ type: GetLeaderboardResponse })
  async getLeaderboard(
    @Query() query: GetLeaderboardRequest,
  ): Promise<GetLeaderboardResponse> {
    return this.userService.getLeaderboard(query);
  }

  @Post('pack/open')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Open a user pack',
    description:
      "Opens one of the authenticated user's unopened card packs and awards cards based on the pack rarity: common (1 common card), uncommon (1 common + 1 uncommon card), rare (3 cards, guaranteed 1 rare, rest random common/uncommon), epic (4 cards, guaranteed 1 epic, rest random uncommon/rare), legendary (5 cards, guaranteed 1 legendary, rest random rare/epic).",
  })
  @ApiOkResponse({ type: OpenPackResponse })
  async openPack(
    @Req() request: AuthenticatedRequest,
    @Body() payload: OpenPackRequest,
  ): Promise<OpenPackResponse> {
    return this.userService.openPack(request.user.sub, payload);
  }
}
