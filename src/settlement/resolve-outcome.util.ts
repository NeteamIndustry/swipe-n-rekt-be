import { PropositionEntity } from '../proposition/entities/proposition.entity';

/**
 * Placeholder oracle. Real settlement needs the TxLine scores stream /
 * Merkle-proved outcome data described in the plan doc (sections 3.1 "TxoddsModule"
 * and 3.3 "Outcome data") — neither exists yet. Until then, resolve outcomes by
 * sampling the implied probability already priced into the proposition's odds,
 * so the rest of the settlement pipeline (bet payout, streaks, on-chain settle
 * call) can be built and tested end-to-end today.
 */
export function resolvePropositionOutcome(
  proposition: PropositionEntity,
): boolean {
  const impliedYes = proposition.oddsYes ? 1 / proposition.oddsYes : 0.5;
  const impliedNo = proposition.oddsNo ? 1 / proposition.oddsNo : 0.5;
  const total = impliedYes + impliedNo;
  const probabilityYes = total > 0 ? impliedYes / total : 0.5;
  return Math.random() < probabilityYes;
}
