import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { configService } from 'src/app.config';
import { MatchEntity } from './entities/match.entity';

// See scripts/txline-competition-test.ts — this is the proven-working
// contract: Bearer JWT + X-Api-Token header against the fixtures snapshot
// endpoint. TxLine docs don't expose this as a configurable base URL.
const TXLINE_BASE_URL = 'https://txline.txodds.com';

interface TxlineFixture {
  FixtureId: number;
  Participant1: string;
  Participant2: string;
  Participant1IsHome: boolean;
  StartTime: string;
  GameState?: string;
  gameState?: string;
}

@Injectable()
export class MatchSchedule {
  private readonly logger = new Logger(MatchSchedule.name);

  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
  ) {}

  @Cron('0 */12 * * * *') // every 12 hours
  async handleCron() {
    const { apiToken, jwt, competitionId } =
      configService.getTxlineFixturesConfig();

    if (!apiToken || !jwt) {
      this.logger.warn(
        'TxLine fixtures sync is not configured (TXLINE_TOKEN/TXLINE_JWT missing); skipping.',
      );
      return;
    }

    const httpClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
        'X-Api-Token': apiToken,
      },
      baseURL: TXLINE_BASE_URL,
    });

    let fixtures: TxlineFixture[];
    try {
      const response = await httpClient.get<TxlineFixture[]>(
        '/api/fixtures/snapshot',
        competitionId ? { params: { competitionId } } : undefined,
      );
      fixtures = response.data;
    } catch (error) {
      this.logger.error('Failed to fetch TxLine fixtures snapshot', error);
      return;
    }

    this.logger.debug(`Retrieved ${fixtures.length} fixtures from TxLine`);

    let createdCount = 0;
    for (const fixture of fixtures) {
      const externalId = String(fixture.FixtureId);

      const existing = await this.matchRepository.findOne({
        where: { externalId },
      });
      if (existing) {
        continue;
      }

      const teamHome = fixture.Participant1IsHome
        ? fixture.Participant1
        : fixture.Participant2;
      const teamAway = fixture.Participant1IsHome
        ? fixture.Participant2
        : fixture.Participant1;

      const match = this.matchRepository.create({
        externalId,
        teamHome,
        teamAway,
        status: 'scheduled',
      });

      await this.matchRepository.save(match);
      createdCount++;
    }

    this.logger.debug(
      `TxLine fixture sync complete: ${createdCount} new match(es) inserted, ${fixtures.length - createdCount} already existed.`,
    );
  }
}
