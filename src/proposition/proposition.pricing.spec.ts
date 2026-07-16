import {
  computeMarginedOdds,
  deriveOutcomeProbabilities,
} from './proposition.pricing';

describe('computeMarginedOdds', () => {
  it('shortens a fair 60/40 probability into odds carrying a 6% overround', () => {
    const { oddsYes, oddsNo } = computeMarginedOdds(0.6, 0.4, 0.06);

    expect(oddsYes).toBeCloseTo(1.57, 1);
    expect(oddsNo).toBeCloseTo(2.36, 1);

    // implied probability sums to 1 + margin
    const impliedSum = 1 / oddsYes + 1 / oddsNo;
    expect(impliedSum).toBeCloseTo(1.06, 1);
  });

  it('normalizes raw probabilities that do not already sum to 1', () => {
    // e.g. upstream odds already carry their own overround (60/45 -> 105%)
    const { oddsYes, oddsNo } = computeMarginedOdds(0.6, 0.45, 0);

    const impliedSum = 1 / oddsYes + 1 / oddsNo;
    expect(impliedSum).toBeCloseTo(1, 1);
    // the more likely side (yes) gets the shorter odds
    expect(oddsYes).toBeLessThan(oddsNo);
  });

  it('applies zero margin as a fair-odds pass-through matching the screenshot math', () => {
    const { oddsYes, oddsNo } = computeMarginedOdds(0.41, 0.59, 0);

    expect(oddsYes).toBeCloseTo(2.44, 1);
    expect(oddsNo).toBeCloseTo(1.69, 1);

    // $20 stake at oddsYes ~= the $49 payout shown in the app screenshot
    expect(20 * oddsYes).toBeCloseTo(49, 0);
  });

  it('clamps extreme probabilities to a sane odds range', () => {
    const { oddsYes, oddsNo } = computeMarginedOdds(0.98, 0.02, 0.1);

    expect(oddsYes).toBeGreaterThanOrEqual(1.01);
    expect(oddsNo).toBeLessThanOrEqual(50);
  });

  it('throws for non-positive probabilities', () => {
    expect(() => computeMarginedOdds(0, 0.5, 0.06)).toThrow();
    expect(() => computeMarginedOdds(0.5, -0.1, 0.06)).toThrow();
  });
});

describe('deriveOutcomeProbabilities', () => {
  it('splits a 3-way market into "this outcome" vs "everything else"', () => {
    const pct = [25.92, 50.813, 23.267];

    const home = deriveOutcomeProbabilities(pct, 0);
    expect(home.rawYesProbability).toBeCloseTo(0.2592, 4);
    expect(home.rawNoProbability).toBeCloseTo(0.7408, 4);

    const draw = deriveOutcomeProbabilities(pct, 1);
    expect(draw.rawYesProbability).toBeCloseTo(0.50813, 4);
    expect(draw.rawNoProbability).toBeCloseTo(0.49187, 4);

    const away = deriveOutcomeProbabilities(pct, 2);
    expect(away.rawYesProbability).toBeCloseTo(0.23267, 4);
    expect(away.rawNoProbability).toBeCloseTo(0.76733, 4);
  });

  it('yes + no always sums to 1 for each outcome in a fair market', () => {
    const pct = [25.92, 50.813, 23.267];

    for (let i = 0; i < pct.length; i++) {
      const { rawYesProbability, rawNoProbability } =
        deriveOutcomeProbabilities(pct, i);
      expect(rawYesProbability + rawNoProbability).toBeCloseTo(1, 4);
    }
  });

  it('throws for an out-of-range outcome index', () => {
    expect(() => deriveOutcomeProbabilities([50, 50], 2)).toThrow();
    expect(() => deriveOutcomeProbabilities([50, 50], -1)).toThrow();
  });
});
