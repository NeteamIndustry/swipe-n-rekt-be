import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationMeta, ResponseWrapper } from '../../app.utils';
import { PropositionEntity } from '../entities/proposition.entity';

export class GetPropositionListRequest {
  @ApiProperty({
    description: 'Match ID filter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  match_id: string;

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
