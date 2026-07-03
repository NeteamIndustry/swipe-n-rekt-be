import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  GetAlbumListRequest,
  GetAlbumListResponse,
} from './dtos/get-album-list.dto';
import { AlbumService } from './album.service';

@ApiTags('Album')
@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

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
