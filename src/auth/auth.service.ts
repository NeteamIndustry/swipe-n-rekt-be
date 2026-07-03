import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/user/repositories/user.repository';
import { LoginRequest, LoginResponse } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    let user = await this.userRepository.findOne({
      where: {
        wallet_address: loginRequest.walletAddress,
      },
    });

    if (!user) {
      user = this.userRepository.create({
        wallet_address: loginRequest.walletAddress,
        nonce: loginRequest.nonce,
      });
      await this.userRepository.save(user);
    } else {
      if (user.nonce !== loginRequest.nonce) {
        throw new UnauthorizedException('Invalid nonce');
      }
    }

    const payload = { sub: user.id, walletAddress: user.wallet_address };
    const token = await this.jwtService.signAsync(payload);

    return {
      data: {
        token: token,
      },
      message: 'Login successful',
      status: true,
    };
  }
}
