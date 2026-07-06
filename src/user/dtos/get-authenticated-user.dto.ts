import { ApiProperty } from '@nestjs/swagger';
import { ResponseWrapper } from '../../app.utils';
import { UserEntity } from '../entities/user.entity';

export class GetAuthenticatedUserResponse extends ResponseWrapper {
  @ApiProperty({ type: UserEntity })
  declare data: UserEntity;
}
