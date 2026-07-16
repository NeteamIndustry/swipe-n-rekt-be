import { MatchEntity } from 'src/match/entities/match.entity';

/**
 * Maps a raw priceName to a plain-English description of what that outcome
 * means, per superOddsType. This is fixed domain knowledge about TxOdds'
 * market shapes — the AI shouldn't have to infer it, and getting it wrong
 * silently would mislabel real-money propositions.
 */
export function describeOutcome(
  superOddsType: string,
  priceName: string,
  match: MatchEntity,
): string {
  if (superOddsType === '1X2_PARTICIPANT_RESULT') {
    switch (priceName) {
      case 'part1':
        return `${match.teamHome ?? 'the home team'} to win`;
      case 'draw':
        return 'the match to end in a draw';
      case 'part2':
        return `${match.teamAway ?? 'the away team'} to win`;
    }
  }

  return priceName;
}
