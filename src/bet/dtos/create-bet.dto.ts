import { IsUUID, IsBoolean, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBetRequest {
  @ApiProperty({
    description: 'UUID of the proposition to bet on',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  propositionId: string;

  @ApiProperty({
    description: 'User pick — true for YES, false for NO',
    example: true,
  })
  @IsBoolean()
  pick: boolean;

  @ApiProperty({
    description:
      "Signature of the user's own place_bet transaction, already confirmed " +
      "on-chain against this proposition's market. The backend verifies this " +
      'transaction (amount, side, market, wallet) rather than trusting a ' +
      'client-supplied stake.',
    example: '5j7s1QpB1KfWXcy...',
  })
  @IsString()
  @MinLength(1)
  txSignature: string;
}
