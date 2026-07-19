import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { ResponseWrapper } from '../../app.utils';
import { PropositionEntity } from '../entities/proposition.entity';

export class SettlePropositionRequest {
  @ApiProperty({
    description:
      'Winning side to settle the market with — true for YES, false for NO',
    example: true,
  })
  @IsBoolean()
  winningSide: boolean;
}

export class SettlePropositionResponse extends OmitType(ResponseWrapper, [
  'meta',
]) {
  @ApiProperty({ type: PropositionEntity })
  declare data: PropositionEntity;
}
