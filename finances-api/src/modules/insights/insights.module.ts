import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { OpenAIService } from './openai.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { SupabaseModule } from '../../config/supabase.module';

@Module({
  imports: [ConfigModule, SupabaseModule, TransactionsModule],
  controllers: [InsightsController],
  providers: [InsightsService, OpenAIService],
  exports: [InsightsService],
})
export class InsightsModule {}
