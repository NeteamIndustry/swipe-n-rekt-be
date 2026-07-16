export interface MarginedOdds {
  oddsYes: number;
  oddsNo: number;
}

// Below 1.01 a "win" pays back essentially nothing more than the stake;
// above 50 the implied probability is under 2%, not realistic for a 5-minute
// in-play binary prop. Both are safety rails against bad upstream data.
const MIN_ODDS = 1.01;
const MAX_ODDS = 50;

/**
 * Converts raw YES/NO implied probabilities (they don't need to sum to 1)
 * into fixed decimal odds — the number a stake is multiplied by to get the
 * total payout (`payout = stake * odds`). Odds are shortened so the
 * underlying probabilities sum to `1 + marginPct` instead of 1, which is
 * what gives the platform a guaranteed edge on every bet regardless of
 * which side wins (the same mechanism as a sportsbook's overround).
 *
 * Odds, not a fixed price, are the right thing to store here: the stake is
 * chosen freely by the user at bet time, so the only fixed quantity a
 * proposition can carry is the multiplier applied to whatever stake comes in.
 */
export function computeMarginedOdds(
  rawYesProbability: number,
  rawNoProbability: number,
  marginPct: number,
): MarginedOdds {
  if (rawYesProbability <= 0 || rawNoProbability <= 0) {
    throw new Error(
      'computeMarginedOdds: raw probabilities must both be positive',
    );
  }

  const total = rawYesProbability + rawNoProbability;
  const targetSum = 1 + marginPct;

  const marginedYesProbability = (rawYesProbability / total) * targetSum;
  const marginedNoProbability = (rawNoProbability / total) * targetSum;

  return {
    oddsYes: toDecimalOdds(marginedYesProbability),
    oddsNo: toDecimalOdds(marginedNoProbability),
  };
}

function toDecimalOdds(probability: number): number {
  return clamp(roundToTwoDecimals(1 / probability));
}

function clamp(value: number): number {
  return Math.min(MAX_ODDS, Math.max(MIN_ODDS, value));
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface OutcomeProbabilities {
  rawYesProbability: number;
  rawNoProbability: number;
}

/**
 * Splits an N-way market (e.g. a 3-way 1X2 result: home/draw/away) into
 * "this outcome" vs "everything else" probabilities, so a single outcome
 * can be turned into its own binary proposition. `pct` values are
 * percentages (0-100), not fractions. `rawNoProbability` is the sum of all
 * the *other* outcomes' pct rather than `1 - yes`, so it still reflects the
 * market's own overround if `pct` doesn't sum to exactly 100.
 */
export function deriveOutcomeProbabilities(
  pct: number[],
  outcomeIndex: number,
): OutcomeProbabilities {
  if (outcomeIndex < 0 || outcomeIndex >= pct.length) {
    throw new Error('deriveOutcomeProbabilities: outcomeIndex out of range');
  }

  const rawYesProbability = pct[outcomeIndex] / 100;
  const rawNoProbability =
    pct.reduce(
      (sum, value, index) => (index === outcomeIndex ? sum : sum + value),
      0,
    ) / 100;

  return { rawYesProbability, rawNoProbability };
}
