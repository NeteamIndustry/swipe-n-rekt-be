import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationMeta, ResponseWrapper } from '../../app.utils';

export class GetLeaderboardRequest {
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

export class LeaderboardEntry {
  @ApiProperty()
  rank: number;

  @ApiProperty({ required: false, nullable: true })
  username: string;

  @ApiProperty({ required: false, nullable: true })
  walletAddress: string;

  @ApiProperty({ required: false, nullable: true })
  netPnl: number;

  @ApiProperty({ required: false, nullable: true })
  winRatePercentage: number;

  @ApiProperty({ required: false, nullable: true })
  bestStreak: number;

  @ApiProperty({ required: false, nullable: true })
  totalPredictions: number;
}

export class GetLeaderboardResponse extends ResponseWrapper {
  @ApiProperty({ type: LeaderboardEntry, isArray: true })
  declare data: LeaderboardEntry[];

  @ApiProperty({ type: PaginationMeta })
  declare meta: PaginationMeta;
}
