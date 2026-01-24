import { Module } from '@nestjs/common';
import { DebtsController } from './debts.controller';
import { DebtsService } from './debts.service';
import { DebtsScheduler } from './debts.scheduler';

@Module({
  controllers: [DebtsController],
  providers: [DebtsService, DebtsScheduler],
  exports: [DebtsService],
})
export class DebtsModule {}
