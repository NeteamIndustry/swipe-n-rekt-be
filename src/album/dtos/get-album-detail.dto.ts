import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';
import { AlbumEntity } from 'src/card/entities/album.entity';

export class GetAlbumDetailResponse extends OmitType(ResponseWrapper, [
  'meta',
]) {
  @ApiProperty({ type: AlbumEntity })
  declare data: AlbumEntity;
}
