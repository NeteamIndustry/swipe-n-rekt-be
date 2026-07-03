import { IsString } from 'class-validator';
import { ResponseWrapper } from '../../app.utils';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty()
  @IsString()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  nonce: string;
}

export class LoginResponseData {
  @ApiProperty({
    description: 'JWT access token',
  })
  token: string;
}

export class LoginResponse extends ResponseWrapper {
  @ApiProperty({
    description: 'The response data',
    type: LoginResponseData,
  })
  declare data: LoginResponseData;
}
