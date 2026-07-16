import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AiService } from 'src/ai/ai.service';
import { GeneratedPropositionText } from 'src/ai/dtos/generate-question.dto';
import { MatchRepository } from 'src/match/repositories/match.repository';
import { configService } from 'src/app.config';
import { PropositionService } from './proposition.service';
import {
  computeMarginedOdds,
  deriveOutcomeProbabilities,
} from './proposition.pricing';
import { describeOutcome } from './proposition.market';

const PROPOSITION_WINDOW_MS = 5 * 60 * 1000;

@Injectable()
export class PropositionSchedule {
  private readonly logger = new Logger(PropositionSchedule.name);

  constructor(
    private readonly aiService: AiService,
    private readonly matchRepository: MatchRepository,
    private readonly propositionService: PropositionService,
  ) {}

  @Cron('0 */12 * * *')
  async handleCron() {
    const match = await this.matchRepository.findOne({
      where: { status: 'live' },
      order: { createdAt: 'DESC' },
    });

    if (!match) {
      this.logger.debug(
        'No live match found; skipping proposition generation.',
      );
      return;
    }

    // TODO: replace this stub with a real TxLine odds snapshot for `match`
    // once TxlineService.getLiveMatches is implemented — see txline.service.ts.
    const oddsInput = {
      superOddsType: '1X2_PARTICIPANT_RESULT',
      marketPeriod: 'half=1',
      priceNames: ['part1', 'draw', 'part2'],
      prices: [3858, 1968, 4298],
      pct: [25.92, 50.813, 23.267],
    };

    const { houseMarginPct } = configService.getPricingConfig();

    // This market has 3 outcomes, so there's no single YES/NO pair to ask
    // the AI to find. Instead, turn each outcome into its own binary
    // proposition — "this outcome" vs "everything else" — computed
    // deterministically from the data, and only ask the AI to phrase the
    // question text for the specific outcome we already picked.
    for (const [index, priceName] of oddsInput.priceNames.entries()) {
      const outcomeLabel = describeOutcome(
        oddsInput.superOddsType,
        priceName,
        match,
      );

      let generated: GeneratedPropositionText;
      try {
        generated = await this.aiService.generateProposition({
          outcomeLabel,
          superOddsType: oddsInput.superOddsType,
          marketPeriod: oddsInput.marketPeriod,
        });
      } catch (error) {
        this.logger.error(
          `Failed to generate proposition text for outcome "${outcomeLabel}"`,
          error,
        );
        continue;
      }

      const { rawYesProbability, rawNoProbability } =
        deriveOutcomeProbabilities(oddsInput.pct, index);
      const { oddsYes, oddsNo } = computeMarginedOdds(
        rawYesProbability,
        rawNoProbability,
        houseMarginPct,
      );

      console.log({
        matchId: match.id,
        question: generated.question,
        category: generated.category,
        contextText: generated.contextText,
        oddsYes,
        oddsNo,
        settlesAt: new Date(Date.now() + PROPOSITION_WINDOW_MS),
      });

      const proposition = await this.propositionService.createProposition({
        matchId: match.id,
        question: generated.question,
        category: generated.category,
        contextText: generated.contextText,
        oddsYes,
        oddsNo,
        settlesAt: new Date(Date.now() + PROPOSITION_WINDOW_MS),
      });

      this.logger.debug(
        `Created proposition ${proposition.id} "${generated.question}" for match ${match.id} (YES ${oddsYes}, NO ${oddsNo})`,
      );
    }
  }
}
