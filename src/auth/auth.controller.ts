import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequest, LoginResponse } from './dtos/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with wallet address and nonce',
    description:
      'Authenticates a user using their wallet address and nonce. If the wallet address does not exist, a new user will be created with the provided nonce. Returns a JWT access token on success.',
  })
  @ApiBody({ type: LoginRequest })
  @ApiOkResponse({ type: LoginResponse })
  async login(@Body() payload: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(payload);
  }
}
