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
      where: { walletAddress: loginRequest.walletAddress },
    });

    if (!user) {
      user = this.userRepository.create({
        walletAddress: loginRequest.walletAddress,
        nonce: loginRequest.nonce,
      });
      await this.userRepository.save(user);
    } else if (user.nonce !== loginRequest.nonce) {
      throw new UnauthorizedException('Invalid nonce');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      walletAddress: user.walletAddress,
    });

    return {
      status: true,
      message: 'Login successful',
      data: { token },
    };
  }
}
