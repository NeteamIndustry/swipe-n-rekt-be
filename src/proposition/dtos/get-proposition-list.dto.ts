import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationMeta, ResponseWrapper } from '../../app.utils';
import { PropositionEntity } from '../entities/proposition.entity';

export class GetPropositionListRequest {
  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 1;
}

export class GetPropositionListResponse extends ResponseWrapper {
  @ApiProperty({ type: PropositionEntity, isArray: true })
  declare data: PropositionEntity[];

  @ApiProperty({ type: PaginationMeta })
  declare meta: PaginationMeta;
}
