import { Injectable, Logger } from '@nestjs/common';
import { configService } from '../app.config';
import { MatchEntity } from './entities/match.entity';

@Injectable()
export class TxlineService {
  private readonly logger = new Logger(TxlineService.name);

  // TODO: wire up the real TxLine fixtures/scores endpoint once its contract is known; returns null so callers fall back to local data.
  getLiveMatches(): Promise<MatchEntity[] | null> {
    const { apiBaseUrl, apiToken } = configService.getTxlineConfig();

    if (!apiBaseUrl || !apiToken) {
      this.logger.warn(
        'TxLine is not configured (TXLINE_API_BASE_URL/TXLINE_API_TOKEN missing); skipping TxLine fetch.',
      );
      return Promise.resolve(null);
    }

    this.logger.warn(
      'TxlineService.getLiveMatches is not implemented yet: TxLine fixtures/scores endpoint contract is unknown.',
    );
    return Promise.resolve(null);
  }
}
