import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './config/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { GoalsModule } from './modules/goals/goals.module';
import { DebtsModule } from './modules/debts/debts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
    SupabaseModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    InvestmentsModule,
    GoalsModule,
    DebtsModule,
  ],
})
export class AppModule {}
