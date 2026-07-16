import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { ResponseWrapper } from '../../app.utils';

export class ClaimSetRewardRequest {
  @ApiProperty({
    description: 'Reward period identifier, e.g. "2026-Q1"',
    example: '2026-Q1',
  })
  @IsString()
  @IsNotEmpty()
  period: string;
}

export class ClaimSetRewardData {
  @ApiProperty({ description: 'Payout amount reported by claimSetReward' })
  amount: number;

  @ApiProperty({
    description: 'Solana tx signature for the claim_set_reward call',
  })
  txSig: string;

  @ApiProperty({ description: 'Timestamp the claim was recorded' })
  claimedAt: Date;
}

export class ClaimSetRewardResponse extends OmitType(ResponseWrapper, [
  'meta',
] as const) {
  @ApiProperty({ type: ClaimSetRewardData })
  declare data: ClaimSetRewardData;
}
