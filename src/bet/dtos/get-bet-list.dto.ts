import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationMeta, ResponseWrapper } from '../../app.utils';
import { BetEntity } from '../entities/bet.entity';

export class GetBetListRequest {
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

export class GetBetListResponse extends ResponseWrapper {
  @ApiProperty({ type: BetEntity, isArray: true })
  declare data: BetEntity[];

  @ApiProperty({ type: PaginationMeta })
  declare meta: PaginationMeta;
}
