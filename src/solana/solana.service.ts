export interface PlaceBetResult {
  txSig: string;
  positionId: string;
}

export interface SettleMarketPayout {
  wallet: string;
  amount: number;
}

export interface SettleMarketResult {
  txSig: string;
  payouts: SettleMarketPayout[];
}

export interface MintCardResult {
  txSig: string;
  mintAddress: string;
}

export interface ClaimSetRewardResult {
  txSig: string;
  amount: number;
}

/**
 * Fixed contract for the on-chain program described in
 * Swipe_n_Rekt_Backend_Blockchain_Contract.md, section 3.2. The mock
 * implementation (SolanaMockService) satisfies this today; once the
 * blockchain team ships an IDL + program ID, swap the DI binding in
 * solana.module.ts to a real Anchor-backed implementation without
 * touching any calling module.
 */
export abstract class SolanaService {
  abstract placeBet(
    marketId: string,
    side: boolean,
    amount: number,
    userWallet: string,
  ): Promise<PlaceBetResult>;

  abstract settleMarket(
    marketId: string,
    merkleProof: string,
    outcome: boolean,
  ): Promise<SettleMarketResult>;

  abstract mintCard(
    userWallet: string,
    catalogId: string,
    rarity: string,
  ): Promise<MintCardResult>;

  abstract claimSetReward(
    userWallet: string,
    country: string,
    period: string,
  ): Promise<ClaimSetRewardResult>;

  abstract getSupplyCount(catalogId: string): Promise<number>;

  abstract getPoolBalance(): Promise<number>;

  abstract getUserBalance(wallet: string): Promise<number>;
}
