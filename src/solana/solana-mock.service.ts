import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import {
  ClaimSetRewardResult,
  MintCardResult,
  PlaceBetResult,
  SettleMarketResult,
  SolanaService,
} from './solana.service';

// Fixed placeholder payout used until the reward-pool contract exists
// on-chain (plan doc section 4) and can report a real amount.
const MOCK_SET_REWARD_AMOUNT = 50;

@Injectable()
export class SolanaMockService extends SolanaService {
  private readonly logger = new Logger(SolanaMockService.name);
  private readonly supplyCounts = new Map<string, number>();

  async placeBet(
    marketId: string,
    side: boolean,
    amount: number,
    userWallet: string,
  ): Promise<PlaceBetResult> {
    await this.simulateLatency();
    const result = { txSig: this.mockSignature(), positionId: randomUUID() };
    this.logger.debug(
      `[mock] placeBet market=${marketId} side=${side} amount=${amount} wallet=${userWallet} -> ${JSON.stringify(result)}`,
    );
    return result;
  }

  async settleMarket(
    marketId: string,
    merkleProof: string,
    outcome: boolean,
  ): Promise<SettleMarketResult> {
    await this.simulateLatency();
    const result = { txSig: this.mockSignature(), payouts: [] };
    this.logger.debug(
      `[mock] settleMarket market=${marketId} proof=${merkleProof} outcome=${outcome} -> ${JSON.stringify(result)}`,
    );
    return result;
  }

  async mintCard(
    userWallet: string,
    catalogId: string,
    rarity: string,
  ): Promise<MintCardResult> {
    await this.simulateLatency();
    this.supplyCounts.set(
      catalogId,
      (this.supplyCounts.get(catalogId) ?? 0) + 1,
    );
    const result = {
      txSig: this.mockSignature(),
      mintAddress: `mock-mint-${randomBytes(16).toString('hex')}`,
    };
    this.logger.debug(
      `[mock] mintCard wallet=${userWallet} catalog=${catalogId} rarity=${rarity} -> ${JSON.stringify(result)}`,
    );
    return result;
  }

  async claimSetReward(
    userWallet: string,
    country: string,
    period: string,
  ): Promise<ClaimSetRewardResult> {
    await this.simulateLatency();
    const result = {
      txSig: this.mockSignature(),
      amount: MOCK_SET_REWARD_AMOUNT,
    };
    this.logger.debug(
      `[mock] claimSetReward wallet=${userWallet} country=${country} period=${period} -> ${JSON.stringify(result)}`,
    );
    return result;
  }

  getSupplyCount(catalogId: string): Promise<number> {
    return Promise.resolve(this.supplyCounts.get(catalogId) ?? 0);
  }

  getPoolBalance(): Promise<number> {
    return Promise.resolve(0);
  }

  getUserBalance(): Promise<number> {
    return Promise.resolve(0);
  }

  private mockSignature(): string {
    return `mock-${randomBytes(32).toString('hex')}`;
  }

  private async simulateLatency(): Promise<void> {
    const delayMs = 150 + Math.floor(Math.random() * 250);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
