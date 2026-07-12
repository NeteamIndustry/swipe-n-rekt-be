import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';
import { UserEntity } from '../entities/user.entity';

export class GetAuthenticatedUserResponse extends OmitType(ResponseWrapper, [
  'meta',
] as const) {
  @ApiProperty({ type: UserEntity })
  declare data: UserEntity;
}
