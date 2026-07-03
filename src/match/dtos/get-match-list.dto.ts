import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ResponseWrapper } from '../../app.utils';

export class GetMatchListRequest {
  @ApiPropertyOptional({
    description: 'Match status filter',
    default: 'live',
    example: 'live',
  })
  @IsOptional()
  @IsString()
  status?: string = 'live';

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

export class MatchListItemResponseData {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  teamHome: string | null;

  @ApiProperty({ required: false, nullable: true })
  teamAway: string | null;

  @ApiProperty({ required: false, nullable: true })
  scoreHome: number | null;

  @ApiProperty({ required: false, nullable: true })
  scoreAway: number | null;

  @ApiProperty({ required: false, nullable: true })
  matchMinute: string | null;

  @ApiProperty({ required: false, nullable: true })
  half: string | null;

  @ApiProperty({ required: false, nullable: true })
  status: string | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  createdAt: Date | null;
}

export class MatchListPaginationResponseData {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalData: number;

  @ApiProperty()
  totalPages: number;
}

export class GetMatchListResponseData {
  @ApiProperty({
    type: MatchListItemResponseData,
    isArray: true,
  })
  items: MatchListItemResponseData[];

  @ApiProperty({
    type: MatchListPaginationResponseData,
  })
  pagination: MatchListPaginationResponseData;
}

export class GetMatchListResponse extends ResponseWrapper {
  @ApiProperty({
    description: 'The response data',
    type: GetMatchListResponseData,
  })
  declare data: GetMatchListResponseData;
}
