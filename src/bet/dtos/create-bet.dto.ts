import { IsUUID, IsBoolean, IsNumber, IsPositive } from 'class-validator';
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
    description: 'Amount of USDC to stake',
    example: 10.0,
  })
  @IsNumber()
  @IsPositive()
  stake: number;
}
