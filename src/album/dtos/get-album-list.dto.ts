import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ResponseWrapper } from '../../app.utils';

export class GetAlbumListRequest {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    example: 1,
  })
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

export class AlbumListItemResponseData {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  countryName: string | null;

  @ApiProperty({ required: false, nullable: true })
  totalCardsRequired: number | null;

  @ApiProperty({ required: false, nullable: true })
  rewardType: string | null;
}

export class AlbumListPaginationResponseData {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalData: number;

  @ApiProperty()
  totalPages: number;
}

export class GetAlbumListResponseData {
  @ApiProperty({
    type: AlbumListItemResponseData,
    isArray: true,
  })
  items: AlbumListItemResponseData[];

  @ApiProperty({
    type: AlbumListPaginationResponseData,
  })
  pagination: AlbumListPaginationResponseData;
}

export class GetAlbumListResponse extends ResponseWrapper {
  @ApiProperty({
    description: 'The response data',
    type: GetAlbumListResponseData,
  })
  declare data: GetAlbumListResponseData;
}
