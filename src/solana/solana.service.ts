import { Injectable, Logger } from '@nestjs/common';
import {
  AnchorProvider,
  BN,
  EventParser,
  Program,
  Wallet,
  utils,
} from '@coral-xyz/anchor';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { configService } from '../app.config';
import { buildSwipeNRektIdl } from './idl/swipe-n-rekt.idl';
import {
  deriveMarketAddress,
  derivePositionAddress,
  deriveVaultAddress,
} from './pda.util';

export interface InitializeMarketParams {
  fixtureId: bigint;
  statKey: number;
  period: number;
  threshold: number;
  comparison: number;
  windowStart: bigint;
  windowEnd: bigint;
}

export interface InitializeMarketResult {
  marketAddress: string;
  vaultAddress: string;
  txSignature: string;
}

export interface VerifyPlaceBetParams {
  marketAddress: string;
  expectedUserWallet: string;
}

export interface VerifiedPlaceBet {
  side: number;
  amount: number;
  fee: number;
  positionAddress: string;
}

export interface KeeperStatus {
  configured: boolean;
  publicKey: string | null;
  balanceSol: number | null;
  rpcUrl: string;
}

/**
 * Minimum keeper balance (in lamports) required before attempting
 * initializeMarket. Creating the Market PDA needs rent-exemption plus tx
 * fees; well under 0.05 SOL in practice, but we guard at a comfortable floor
 * so the failure is a clear "fund the keeper" message instead of an opaque
 * RPC error deep inside `.rpc()`.
 */
const MIN_KEEPER_LAMPORTS = 0.05 * LAMPORTS_PER_SOL;

/**
 * Thin wrapper around the swipe_n_rekt Anchor program. Only covers the
 * backend-authority actions (initializeMarket, settleMarketMock) and
 * verifying user-submitted place_bet transactions — place_bet and
 * claim_payout themselves are signed client-side by the user's wallet and
 * are never sent from here.
 */
@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly connection: Connection;
  private readonly programId: PublicKey;
  private readonly program: Program;
  private readonly keeperKeypair: Keypair | null;

  constructor() {
    const { rpcUrl, programId, keeperSecretKey } =
      configService.getSolanaConfig();
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.programId = new PublicKey(programId);
    this.keeperKeypair = keeperSecretKey
      ? Keypair.fromSecretKey(utils.bytes.bs58.decode(keeperSecretKey))
      : null;

    // Program construction always needs *some* wallet, even for read-only
    // use (event decoding / tx fetching sign nothing). Calls that actually
    // sign (initializeMarket, settleMarketMock) assert a real keeper first.
    const providerWallet = new Wallet(this.keeperKeypair ?? Keypair.generate());
    const provider = new AnchorProvider(this.connection, providerWallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(buildSwipeNRektIdl(programId), provider);

    if (!this.keeperKeypair) {
      this.logger.warn(
        'SOLANA_KEEPER_SECRET_KEY is not set — market creation and settlement will fail until configured.',
      );
    }
  }

  private assertKeeperConfigured(): Keypair {
    if (!this.keeperKeypair) {
      throw new Error(
        'SOLANA_KEEPER_SECRET_KEY is not configured; cannot sign as the backend authority',
      );
    }
    return this.keeperKeypair;
  }

  /**
   * Reports whether the keeper is configured and, if so, its public key and
   * current on-chain balance — the two things you need to answer "is the key
   * loaded in this environment?" and "is it funded?" without shell access.
   */
  async getKeeperStatus(): Promise<KeeperStatus> {
    const rpcUrl = this.connection.rpcEndpoint;
    if (!this.keeperKeypair) {
      return { configured: false, publicKey: null, balanceSol: null, rpcUrl };
    }
    const publicKey = this.keeperKeypair.publicKey.toBase58();
    try {
      const lamports = await this.connection.getBalance(
        this.keeperKeypair.publicKey,
      );
      return {
        configured: true,
        publicKey,
        balanceSol: lamports / LAMPORTS_PER_SOL,
        rpcUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to read keeper balance from ${rpcUrl}`,
        error instanceof Error ? error.stack : String(error),
      );
      return { configured: true, publicKey, balanceSol: null, rpcUrl };
    }
  }

  private async assertKeeperFunded(keeper: Keypair): Promise<void> {
    const lamports = await this.connection.getBalance(keeper.publicKey);
    if (lamports < MIN_KEEPER_LAMPORTS) {
      const pubkey = keeper.publicKey.toBase58();
      throw new Error(
        `Keeper wallet ${pubkey} has ${lamports / LAMPORTS_PER_SOL} SOL on ` +
          `${this.connection.rpcEndpoint}, not enough to create the market ` +
          `account. Fund it: solana airdrop 2 ${pubkey} --url devnet`,
      );
    }
  }

  async initializeMarket(
    params: InitializeMarketParams,
  ): Promise<InitializeMarketResult> {
    const keeper = this.assertKeeperConfigured();
    await this.assertKeeperFunded(keeper);
    const [marketAddress] = deriveMarketAddress(
      this.programId,
      params.fixtureId,
      params.statKey,
      params.windowStart,
    );
    const [vaultAddress] = deriveVaultAddress(this.programId, marketAddress);

    const txSignature = await this.program.methods
      .initializeMarket(
        new BN(params.fixtureId.toString()),
        params.statKey,
        params.period,
        params.threshold,
        params.comparison,
        new BN(params.windowStart.toString()),
        new BN(params.windowEnd.toString()),
      )
      .accounts({
        market: marketAddress,
        authority: keeper.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([keeper])
      .rpc();

    return {
      marketAddress: marketAddress.toBase58(),
      vaultAddress: vaultAddress.toBase58(),
      txSignature,
    };
  }

  async settleMarketMock(
    marketAddress: string,
    winningSide: number,
  ): Promise<string> {
    const keeper = this.assertKeeperConfigured();
    return this.program.methods
      .settleMarketMock(winningSide)
      .accounts({
        market: new PublicKey(marketAddress),
        authority: keeper.publicKey,
      })
      .signers([keeper])
      .rpc();
  }

  /**
   * Fetches a user-submitted place_bet transaction and confirms it actually
   * happened, on our program, on the expected market, for the expected
   * wallet — decoding the amount/side from the on-chain `BetPlaced` event
   * rather than trusting anything the caller sent.
   */
  async verifyPlaceBetTx(
    signature: string,
    params: VerifyPlaceBetParams,
  ): Promise<VerifiedPlaceBet> {
    const tx = await this.connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
      throw new Error(`Transaction ${signature} was not found`);
    }
    if (tx.meta?.err) {
      throw new Error(`Transaction ${signature} failed on-chain`);
    }
    const logs = tx.meta?.logMessages;
    if (!logs) {
      throw new Error(`Transaction ${signature} has no logs to verify`);
    }

    const parser = new EventParser(this.programId, this.program.coder);
    let betPlaced:
      | {
          market: PublicKey;
          user: PublicKey;
          side: number;
          amount: BN;
          fee: BN;
        }
      | undefined;
    for (const event of parser.parseLogs(logs)) {
      // Anchor's Program camelCases the IDL internally (convertIdlToCamelCase),
      // so decoded event names come back as e.g. "betPlaced", not "BetPlaced".
      if (event.name === 'betPlaced') {
        betPlaced = event.data as typeof betPlaced;
        break;
      }
    }
    if (!betPlaced) {
      throw new Error(`No BetPlaced event found in transaction ${signature}`);
    }

    const expectedMarket = new PublicKey(params.marketAddress);
    if (!betPlaced.market.equals(expectedMarket)) {
      throw new Error(
        `Transaction ${signature} placed a bet on a different market than expected`,
      );
    }

    const expectedUser = new PublicKey(params.expectedUserWallet);
    if (!betPlaced.user.equals(expectedUser)) {
      throw new Error(
        `Transaction ${signature} was not signed by the expected wallet`,
      );
    }

    const [positionAddress] = derivePositionAddress(
      this.programId,
      expectedMarket,
      expectedUser,
    );

    return {
      side: betPlaced.side,
      amount: Number(betPlaced.amount.toString()),
      fee: Number(betPlaced.fee.toString()),
      positionAddress: positionAddress.toBase58(),
    };
  }
}
