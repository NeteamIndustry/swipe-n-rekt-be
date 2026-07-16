import { PropositionEntity } from '../proposition/entities/proposition.entity';

/**
 * Placeholder market_id derivation. The plan doc (section 2B) flags the real
 * PDA seed (e.g. [b"market", fixture_id, market_type, window_start]) as a
 * cross-team decision the blockchain side still needs to confirm. Until
 * then, this deterministic string keeps place_bet/settle_market calls
 * addressing the same "market" for a given proposition.
 */
export function deriveMarketId(proposition: PropositionEntity): string {
  return `mock-market:${proposition.matchId}:${proposition.id}`;
}
