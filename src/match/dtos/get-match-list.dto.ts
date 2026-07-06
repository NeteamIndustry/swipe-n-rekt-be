import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationMeta, ResponseWrapper } from '../../app.utils';
import { MatchEntity } from '../entities/match.entity';

export class GetMatchListRequest {
  @ApiPropertyOptional({
    description: 'Match status filter',
    default: 'live',
    example: 'live',
  })
  @IsOptional()
  @IsString()
  status?: string = 'live';

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

export class GetMatchListResponse extends ResponseWrapper {
  @ApiProperty({ type: MatchEntity, isArray: true })
  declare data: MatchEntity[];

  @ApiProperty({ type: PaginationMeta })
  declare meta: PaginationMeta;
}
