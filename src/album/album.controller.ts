import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetAlbumListRequest,
  GetAlbumListResponse,
} from './dtos/get-album-list.dto';
import { GetAlbumDetailResponse } from './dtos/get-album-detail.dto';
import {
  ClaimSetRewardRequest,
  ClaimSetRewardResponse,
} from './dtos/claim-set-reward.dto';
import { AlbumService } from './album.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@ApiTags('Album')
@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get album detail',
    description:
      'Returns the detail of an album including all cards within it.',
  })
  @ApiOkResponse({ type: GetAlbumDetailResponse })
  @ApiNotFoundResponse({ description: 'Album not found' })
  async getAlbumDetail(
    @Param('id') id: string,
  ): Promise<GetAlbumDetailResponse> {
    return this.albumService.getAlbumDetail(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get album list',
    description:
      'Returns a paginated list of albums. By default, the limit is set to 10 items per page.',
  })
  @ApiOkResponse({ type: GetAlbumListResponse })
  async getAlbumList(
    @Query() query: GetAlbumListRequest,
  ): Promise<GetAlbumListResponse> {
    return this.albumService.getAlbumList(query);
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Claim set-completion reward',
    description:
      'Claims the set-completion reward for an album, provided the authenticated user owns every card required by the set and has not already claimed for the given period.',
  })
  @ApiBody({ type: ClaimSetRewardRequest })
  @ApiOkResponse({ type: ClaimSetRewardResponse })
  @ApiNotFoundResponse({ description: 'Album or user not found' })
  async claimSetReward(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() payload: ClaimSetRewardRequest,
  ): Promise<ClaimSetRewardResponse> {
    return this.albumService.claimSetReward(request.user.sub, id, payload);
  }
}
