import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';
import { BetEntity } from '../entities/bet.entity';

export class BetResponseData {
  @ApiProperty({ description: 'The bet record', type: BetEntity })
  bet: BetEntity;
}

export class BetResponse extends OmitType(ResponseWrapper, ['meta']) {
  @ApiProperty({
    description: 'The bet response data',
    type: BetResponseData,
  })
  declare data: BetResponseData;
}
