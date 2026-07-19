import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiService } from 'src/ai/ai.service';
import { GeneratedPropositionText } from 'src/ai/dtos/generate-question.dto';
import { MatchEntity } from 'src/match/entities/match.entity';
import { MatchRepository } from 'src/match/repositories/match.repository';
import { configService } from 'src/app.config';
import { PropositionService } from './proposition.service';
import {
  computeMarginedOdds,
  deriveOutcomeProbabilities,
} from './proposition.pricing';
import { describeOutcome } from './proposition.market';
import { In } from 'typeorm';

const PROPOSITION_WINDOW_MS = 5 * 60 * 1000;

@Injectable()
export class PropositionSchedule {
  private readonly logger = new Logger(PropositionSchedule.name);

  constructor(
    private readonly aiService: AiService,
    private readonly matchRepository: MatchRepository,
    private readonly propositionService: PropositionService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.debug('Running cronjob proposition');
    const matches = await this.matchRepository.find({
      where: { status: In(['live', 'scheduled']) },
      order: { createdAt: 'DESC' },
    });

    if (matches.length === 0) {
      this.logger.debug(
        'No live matches found; skipping proposition generation.',
      );
      return;
    }

    for (const match of matches) {
      try {
        await this.generatePropositionsForMatch(match);
      } catch (error) {
        this.logger.error(
          `Failed to generate propositions for match ${match.id}`,
          error,
        );
      }
    }
  }

  private async generatePropositionsForMatch(match: MatchEntity) {
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
      const outcomeKey = `${oddsInput.superOddsType}:${priceName}`;

      // Skip (before spending an AI call) if this match already has a
      // still-active proposition for this outcome — keeps the every-5-minute
      // cron from piling up duplicates. A new round is generated only once the
      // previous one is resolved.
      if (
        await this.propositionService.hasActivePropositionForOutcome(
          match.id,
          outcomeKey,
        )
      ) {
        this.logger.debug(
          `Skipping "${outcomeLabel}" for match ${match.id}: an active proposition for this outcome already exists.`,
        );
        continue;
      }

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

      const proposition = await this.propositionService.createProposition({
        matchId: match.id,
        matchExternalId: match.externalId,
        question: generated.question,
        category: generated.category,
        contextText: generated.contextText,
        oddsYes,
        oddsNo,
        settlesAt: new Date(Date.now() + PROPOSITION_WINDOW_MS),
        outcomeKey,
      });

      this.logger.debug(
        `Created proposition ${proposition.id} "${generated.question}" for match ${match.id} (YES ${oddsYes}, NO ${oddsNo})`,
      );
    }
  }
}
