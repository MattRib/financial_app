import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { TransactionsService } from '../transactions/transactions.service';
import { OpenAIService } from './openai.service';
import { GenerateInsightDto, FilterInsightDto } from './dto';
import { Insight } from './entities/insight.entity';

@Injectable()
export class InsightsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private transactionsService: TransactionsService,
    private openAIService: OpenAIService,
  ) {}

  /**
   * Gera um novo insight para o mês/ano especificado
   * Se já existir, retorna o cached
   */
  async generate(userId: string, dto: GenerateInsightDto): Promise<Insight> {
    const { month, year } = dto;

    // 1. Verificar se já existe insight para este mês (cache lookup)
    const existing = await this.findByUserAndMonth(userId, month, year);
    if (existing) {
      return existing; // Cache hit - retorna instantaneamente
    }

    // 2. Buscar dados do mês
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [summary, categoryData, transactions] = await Promise.all([
      this.transactionsService.getSummary(userId, startDate, endDate),
      this.transactionsService.getByCategory(userId, startDate, endDate),
      this.transactionsService.findAll(userId, {
        start_date: startDate,
        end_date: endDate,
        type: 'expense',
      }),
    ]);

    // Edge case: sem transações no mês
    if (transactions.length === 0) {
      throw new NotFoundException(
        'Nenhuma transação encontrada para este período. Adicione transações antes de gerar insights.',
      );
    }

    // 3. Top 5 transações (maiores gastos)
    const topTransactions = transactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((t) => ({
        description: t.description || 'Sem descrição',
        amount: t.amount,
        category_name: (t as any).categories?.name,
        date: t.date,
      }));

    // 4. Chamar OpenAI
    const { report, tokens, duration } =
      await this.openAIService.generateFinancialInsight({
        month,
        year,
        total_income: summary.total_income,
        total_expense: summary.total_expense,
        balance: summary.balance,
        categories: categoryData,
        top_transactions: topTransactions,
      });

    // 5. Salvar no banco
    const { data, error } = await this.supabase
      .from('insights')
      .insert({
        user_id: userId,
        month,
        year,
        total_income: summary.total_income,
        total_expense: summary.total_expense,
        balance: summary.balance,
        transactions_count: transactions.length,
        report_data: report,
        model_used: 'gpt-4o-mini',
        tokens_used: tokens,
        generation_time_ms: duration,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Erro ao salvar insight no banco: ${error.message}`,
      );
    }

    return data as Insight;
  }

  /**
   * Lista todos os insights do usuário (histórico)
   */
  async findAll(
    userId: string,
    filters?: FilterInsightDto,
  ): Promise<Insight[]> {
    let query = this.supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId);

    if (filters?.month) {
      query = query.eq('month', filters.month);
    }

    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    const { data, error } = await query.order('generated_at', {
      ascending: false,
    });

    if (error) {
      throw new InternalServerErrorException(
        `Erro ao buscar insights: ${error.message}`,
      );
    }

    return (data || []) as Insight[];
  }

  /**
   * Busca insight específico por ID
   */
  async findOne(userId: string, id: string): Promise<Insight> {
    const { data, error } = await this.supabase
      .from('insights')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Insight não encontrado');
    }

    return data as Insight;
  }

  /**
   * Remove insight (invalidar cache)
   */
  async remove(userId: string, id: string): Promise<void> {
    // Validar se o insight existe e pertence ao usuário
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .from('insights')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new InternalServerErrorException(
        `Erro ao remover insight: ${error.message}`,
      );
    }
  }

  /**
   * Helper: Busca insight por mês/ano (cache lookup)
   */
  private async findByUserAndMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<Insight | null> {
    const { data, error } = await this.supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Erro ao buscar insight cached: ${error.message}`,
      );
    }

    return data as Insight | null;
  }
}
