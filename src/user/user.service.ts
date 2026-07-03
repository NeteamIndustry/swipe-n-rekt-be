import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { GetAuthenticatedUserResponse } from './dtos/get-authenticated-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAuthenticatedUser(
    userId: string,
  ): Promise<GetAuthenticatedUserResponse> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: true,
      message: 'Authenticated user info retrieved successfully',
      data: {
        id: user.id,
        username: user.username ?? null,
        walletAddress: user.wallet_address ?? null,
        balanceUsdc: user.balance_usdc ?? null,
        winRatePercentage: user.win_rate_percentage ?? null,
        bestStreak: user.best_streak ?? null,
        currentStreak: user.current_streak ?? null,
        netPnl: user.net_pnl ?? null,
        totalPredictions: user.total_predictions ?? null,
        createdAt: user.created_at ?? null,
      },
    };
  }
}
