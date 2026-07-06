import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { GetAuthenticatedUserResponse } from './dtos/get-authenticated-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAuthenticatedUser(
    userId: string,
  ): Promise<GetAuthenticatedUserResponse> {
    const data = await this.userRepository.findOne({ where: { id: userId } });

    if (!data) {
      throw new NotFoundException('User not found');
    }

    return {
      status: true,
      message: 'Authenticated user info retrieved successfully',
      data,
    };
  }
}
