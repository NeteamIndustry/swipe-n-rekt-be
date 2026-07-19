import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';
import { PropositionEntity } from '../entities/proposition.entity';

export class RetryMarketInitResponse extends OmitType(ResponseWrapper, [
  'meta',
]) {
  @ApiProperty({ type: PropositionEntity })
  declare data: PropositionEntity;
}
