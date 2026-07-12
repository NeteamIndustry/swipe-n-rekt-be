import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BetService } from './bet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateBetRequest } from './dtos/create-bet.dto';
import { BetResponse } from './dtos/bet-response.dto';
import { GetBetListRequest, GetBetListResponse } from './dtos/get-bet-list.dto';

@ApiTags('Bets')
@Controller('bets')
export class BetController {
  constructor(
    private readonly betService: BetService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get bet list',
    description:
      'Returns a paginated list of bets for the authenticated user, sorted by most recent first.',
  })
  @ApiOkResponse({
    description: 'Bet list retrieved successfully',
    type: GetBetListResponse,
  })
  async getBetList(
    @Req() request: AuthenticatedRequest,
    @Query() query: GetBetListRequest,
  ): Promise<GetBetListResponse> {
    return this.betService.getBetList(request.user.sub, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Place a new bet',
    description:
      "Places a bet on a specific proposition for the authenticated user. The stake amount is deducted from the user's USDC balance. The potential payout is calculated based on the current odds of the selected outcome (YES/NO). This endpoint uses a transaction to ensure atomicity of the bet placement and balance deduction.",
  })
  @ApiBody({ type: CreateBetRequest })
  @ApiCreatedResponse({
    description: 'Bet placed successfully',
    type: BetResponse,
  })
  async createBet(
    @Req() request: AuthenticatedRequest,
    @Body() payload: CreateBetRequest,
  ): Promise<BetResponse> {
    const user = await this.userRepository.findOne({
      where: { id: request.user.sub },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.betService.createBet(user, payload);
  }
}
