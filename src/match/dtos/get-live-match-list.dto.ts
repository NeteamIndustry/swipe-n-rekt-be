import { ApiProperty } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';
import { MatchEntity } from '../entities/match.entity';

export class GetLiveMatchListResponse extends ResponseWrapper {
  @ApiProperty({ type: MatchEntity, isArray: true })
  declare data: MatchEntity[];
}
