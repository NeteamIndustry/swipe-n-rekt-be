import { PublicKey } from '@solana/web3.js';

/** Mirrors the PDA seed prefixes in swipenrekt-blockchain's constants.rs. */
const MARKET_SEED = Buffer.from('market');
const POSITION_SEED = Buffer.from('position');
const VAULT_SEED = Buffer.from('vault');
const REWARD_POOL_SEED = Buffer.from('reward_pool');
const REWARD_VAULT_SEED = Buffer.from('reward_vault');

function i64LeBytes(value: bigint | number): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(BigInt(value));
  return buf;
}

function u32LeBytes(value: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(value);
  return buf;
}

/** seeds = [b"market", fixture_id(le8), stat_key(le4), window_start(le8)] */
export function deriveMarketAddress(
  programId: PublicKey,
  fixtureId: bigint | number,
  statKey: number,
  windowStart: bigint | number,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      MARKET_SEED,
      i64LeBytes(fixtureId),
      u32LeBytes(statKey),
      i64LeBytes(windowStart),
    ],
    programId,
  );
}

/** seeds = [b"position", market, user] */
export function derivePositionAddress(
  programId: PublicKey,
  market: PublicKey,
  user: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [POSITION_SEED, market.toBuffer(), user.toBuffer()],
    programId,
  );
}

/** seeds = [b"vault", market] */
export function deriveVaultAddress(
  programId: PublicKey,
  market: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [VAULT_SEED, market.toBuffer()],
    programId,
  );
}

/** seeds = [b"reward_pool"] */
export function deriveRewardPoolAddress(
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([REWARD_POOL_SEED], programId);
}

/** seeds = [b"reward_vault"] */
export function deriveRewardVaultAddress(
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([REWARD_VAULT_SEED], programId);
}
