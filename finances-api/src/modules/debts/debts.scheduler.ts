import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DebtsService } from './debts.service';

@Injectable()
export class DebtsScheduler {
  private readonly logger = new Logger(DebtsScheduler.name);

  constructor(private readonly debtsService: DebtsService) {}

  /**
   * Runs daily at midnight to update all pending debts that are past their due date to 'overdue' status.
   * This ensures that even users who haven't logged in will have their debt statuses updated.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOverdueDebts(): Promise<void> {
    this.logger.log('Running daily overdue debts update...');

    try {
      await this.debtsService.updateAllOverdueStatuses();
      this.logger.log('Successfully updated overdue debts');
    } catch (error) {
      this.logger.error('Failed to update overdue debts', error);
    }
  }
}
