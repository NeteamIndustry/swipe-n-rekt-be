export class GeneratePropositionDto {
  // Plain-English description of the specific outcome this question asks
  // about, e.g. "Argentina to win". YES means it happens, NO means it
  // doesn't — resolved by proposition.market.ts before calling the AI.
  outcomeLabel: string;
  superOddsType: string;
  marketPeriod: string;
}

export interface GeneratedPropositionText {
  question: string;
  category: string;
  contextText: string;
}
