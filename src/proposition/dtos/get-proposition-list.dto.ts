import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ResponseWrapper } from '../../app.utils';

export class GetPropositionListRequest {
  @ApiProperty({
    description: 'Match ID filter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  match_id: string;

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
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 1;
}

export class PropositionListItemResponseData {
  @ApiProperty()
  id: string;

  @ApiProperty()
  matchId: string;

  @ApiProperty({ required: false, nullable: true })
  question: string | null;

  @ApiProperty({ required: false, nullable: true })
  category: string | null;

  @ApiProperty({ required: false, nullable: true })
  contextText: string | null;

  @ApiProperty({ required: false, nullable: true })
  priceYes: number | null;

  @ApiProperty({ required: false, nullable: true })
  priceNo: number | null;

  @ApiProperty({ required: false, nullable: true })
  status: string | null;

  @ApiProperty({ required: false, nullable: true })
  outcome: boolean | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  settlesAt: Date | null;
}

export class PropositionListPaginationResponseData {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalData: number;

  @ApiProperty()
  totalPages: number;
}

export class GetPropositionListResponseData {
  @ApiProperty({
    type: PropositionListItemResponseData,
    isArray: true,
  })
  items: PropositionListItemResponseData[];

  @ApiProperty({
    type: PropositionListPaginationResponseData,
  })
  pagination: PropositionListPaginationResponseData;
}

export class GetPropositionListResponse extends ResponseWrapper {
  @ApiProperty({
    description: 'The response data',
    type: GetPropositionListResponseData,
  })
  declare data: GetPropositionListResponseData;
}
