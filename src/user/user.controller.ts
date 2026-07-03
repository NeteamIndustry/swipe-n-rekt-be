import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/jwt-auth.guard';
import { GetAuthenticatedUserResponse } from './dtos/get-authenticated-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated user info',
    description:
      'Returns the profile and statistics of the currently authenticated user based on the JWT bearer token, including username, wallet address, balance, streak metrics, PnL, total predictions, and account creation date.',
  })
  @ApiOkResponse({ type: GetAuthenticatedUserResponse })
  async getAuthenticatedUser(
    @Req() request: AuthenticatedRequest,
  ): Promise<GetAuthenticatedUserResponse> {
    return this.userService.getAuthenticatedUser(request.user.sub);
  }
}
