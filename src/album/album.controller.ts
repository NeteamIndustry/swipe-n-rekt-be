import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
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
import { AlbumService } from './album.service';

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
}
