import { ApiProperty } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';
import { AlbumEntity } from 'src/card/entities/album.entity';

export class GetAlbumDetailResponse extends ResponseWrapper {
  @ApiProperty({ type: AlbumEntity })
  declare data: AlbumEntity;
}
