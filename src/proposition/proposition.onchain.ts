/**
 * Placeholder on-chain market predicate for propositions. Real stat_key /
 * threshold / comparison modeling depends on TxLine stat data the backend
 * doesn't sync yet (see match.schedule.ts / txline.service.ts) — these
 * values are only exercised by the real oracle `settle_market`, which isn't
 * used yet either (settlement uses `settle_market_mock`), so they're inert
 * for now but persisted so a future migration isn't needed.
 */
export const DEFAULT_ON_CHAIN_STAT_KEY = 0;
export const DEFAULT_ON_CHAIN_PERIOD = 0;
export const DEFAULT_ON_CHAIN_THRESHOLD = 0;
export const DEFAULT_ON_CHAIN_COMPARISON = 0; // Comparison::GreaterThan

/**
 * Derives the i64 `fixture_id` used to seed the on-chain Market PDA from a
 * match's TxLine `externalId`. TxLine fixture ids are numeric, so the common
 * case is a direct parse; a stable FNV-1a hash is a fallback for anything
 * non-numeric (or missing) so market creation never blocks on this.
 */
export function deriveFixtureId(externalId: string | null | undefined): bigint {
  if (externalId && /^-?\d+$/.test(externalId)) {
    try {
      return BigInt(externalId);
    } catch {
      // fall through to hash
    }
  }
  return stableHashToBigInt(externalId ?? '');
}

function stableHashToBigInt(input: string): bigint {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return BigInt(hash >>> 0);
}
