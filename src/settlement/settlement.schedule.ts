import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SettlementService } from './settlement.service';

@Injectable()
export class SettlementSchedule {
  constructor(private readonly settlementService: SettlementService) {}

  @Cron('*/30 * * * * *')
  async handleCron() {
    await this.settlementService.settleDuePropositions();
  }
}
