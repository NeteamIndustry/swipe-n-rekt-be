import { createHash } from 'crypto';

/**
 * Anchor's standard discriminator derivation: first 8 bytes of
 * sha256("<namespace>:<name>"), e.g. sha256("global:place_bet") for
 * instructions, sha256("account:Market") for accounts, sha256("event:BetPlaced")
 * for events. Computed here instead of hand-typed since there's no `anchor
 * build` output to copy from in this environment (see swipenrekt-blockchain
 * README — toolchain not installed).
 */
export function anchorDiscriminator(
  namespace: 'global' | 'account' | 'event',
  name: string,
): number[] {
  const hash = createHash('sha256').update(`${namespace}:${name}`).digest();
  return Array.from(hash.subarray(0, 8));
}
