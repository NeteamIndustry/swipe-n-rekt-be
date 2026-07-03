import { ApiProperty } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';

export class GetAuthenticatedUserRequest {}

export class GetAuthenticatedUserResponseData {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  username: string | null;

  @ApiProperty({ required: false, nullable: true })
  walletAddress: string | null;

  @ApiProperty({ required: false, nullable: true })
  balanceUsdc: number | null;

  @ApiProperty({ required: false, nullable: true })
  winRatePercentage: number | null;

  @ApiProperty({ required: false, nullable: true })
  bestStreak: number | null;

  @ApiProperty({ required: false, nullable: true })
  currentStreak: number | null;

  @ApiProperty({ required: false, nullable: true })
  netPnl: number | null;

  @ApiProperty({ required: false, nullable: true })
  totalPredictions: number | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  createdAt: Date | null;
}

export class GetAuthenticatedUserResponse extends ResponseWrapper {
  @ApiProperty({
    description: 'The response data',
    type: GetAuthenticatedUserResponseData,
  })
  declare data: GetAuthenticatedUserResponseData;
}
