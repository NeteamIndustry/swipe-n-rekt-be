import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationMeta, ResponseWrapper } from '../../app.utils';
import { AlbumEntity } from 'src/card/entities/album.entity';

export class GetAlbumListRequest {
  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    example: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class GetAlbumListResponse extends ResponseWrapper {
  @ApiProperty({ type: AlbumEntity, isArray: true })
  declare data: AlbumEntity[];

  @ApiProperty({ type: PaginationMeta })
  declare meta: PaginationMeta;
}
