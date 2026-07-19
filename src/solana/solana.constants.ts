/** Mirrors constants.rs / state/market.rs in swipenrekt-blockchain. */
export const SIDE_NO = 0;
export const SIDE_YES = 1;

export enum OnChainComparison {
  GreaterThan = 0,
  LessThan = 1,
  EqualTo = 2,
}

export function sideForPick(pick: boolean): number {
  return pick ? SIDE_YES : SIDE_NO;
}

export function pickForSide(side: number): boolean {
  return side === SIDE_YES;
}
