import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

export interface OpenAIInsightInput {
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  balance: number;
  categories: Array<{
    category_name: string;
    total: number;
    percentage: number;
  }>;
  top_transactions: Array<{
    description: string;
    amount: number;
    category_name?: string;
    date: string;
  }>;
  // Dados do mês anterior para comparação
  previous_month?: {
    total_income: number;
    total_expense: number;
    balance: number;
  };
  transactions_count: number;
}

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY não configurada. Adicione no arquivo .env',
      );
    }

    this.openai = new OpenAI({ apiKey });
    this.model =
      this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  async generateFinancialInsight(input: OpenAIInsightInput): Promise<{
    report: any;
    tokens: number;
    duration: number;
  }> {
    const startTime = Date.now();

    const prompt = this.buildPrompt(input);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Você é um assessor financeiro pessoal experiente.
Analise os dados financeiros do usuário e forneça insights claros,
recomendações práticas e alertas quando necessário.
Seja direto, profissional e focado em ações concretas.
Sempre responda em português do Brasil.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3500,
        response_format: { type: 'json_object' },
      });

      const duration = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('OpenAI retornou resposta vazia');
      }

      const report = JSON.parse(content);
      const tokens = completion.usage?.total_tokens || 0;

      return { report, tokens, duration };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new InternalServerErrorException(
            'Limite de uso da API OpenAI atingido. Tente novamente em alguns minutos.',
          );
        }
        throw new InternalServerErrorException(
          `Erro na API OpenAI: ${error.message}`,
        );
      }

      if (error instanceof SyntaxError) {
        throw new InternalServerErrorException(
          'Resposta da IA em formato inválido. Tente novamente.',
        );
      }

      throw error;
    }
  }

  private buildPrompt(input: OpenAIInsightInput): string {
    const monthName = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
    }).format(new Date(input.year, input.month - 1));

    const categoriesText =
      input.categories.length > 0
        ? input.categories
            .map(
              (cat) =>
                `- ${cat.category_name}: R$ ${cat.total.toFixed(2)} (${cat.percentage.toFixed(1)}%)`,
            )
            .join('\n')
        : '- Nenhuma categoria registrada';

    const topTransactionsText =
      input.top_transactions.length > 0
        ? input.top_transactions
            .map(
              (t, i) =>
                `${i + 1}. ${t.description || 'Sem descrição'} - R$ ${t.amount.toFixed(2)} (${t.category_name || 'Sem categoria'}) - ${t.date}`,
            )
            .join('\n')
        : '- Nenhuma transação registrada';

    // Comparação com mês anterior
    let comparisonText = '';
    if (input.previous_month) {
      const incomeChange =
        ((input.total_income - input.previous_month.total_income) /
          (input.previous_month.total_income || 1)) *
        100;
      const expenseChange =
        ((input.total_expense - input.previous_month.total_expense) /
          (input.previous_month.total_expense || 1)) *
        100;

      comparisonText = `
COMPARAÇÃO COM MÊS ANTERIOR:
- Receitas: ${incomeChange > 0 ? '+' : ''}${incomeChange.toFixed(1)}% (anterior: R$ ${input.previous_month.total_income.toFixed(2)})
- Despesas: ${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}% (anterior: R$ ${input.previous_month.total_expense.toFixed(2)})
- Saldo anterior: R$ ${input.previous_month.balance.toFixed(2)}
`;
    }

    // Calcular métricas adicionais
    const savingsRate =
      input.total_income > 0
        ? (input.balance / input.total_income) * 100
        : 0;
    const avgTransactionValue =
      input.transactions_count > 0
        ? input.total_expense / input.transactions_count
        : 0;

    return `
Você é um consultor financeiro experiente especializado em finanças pessoais.
Analise os dados financeiros de ${monthName}/${input.year} e forneça insights PROFUNDOS e ACIONÁVEIS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMO FINANCEIRO MENSAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Receitas: R$ ${input.total_income.toFixed(2)}
- Despesas: R$ ${input.total_expense.toFixed(2)}
- Saldo: R$ ${input.balance.toFixed(2)}
- Taxa de poupança: ${savingsRate.toFixed(1)}%
- Número de transações: ${input.transactions_count}
- Ticket médio por transação: R$ ${avgTransactionValue.toFixed(2)}
${comparisonText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 DISTRIBUIÇÃO DE GASTOS POR CATEGORIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${categoriesText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔝 TOP 5 MAIORES TRANSAÇÕES DO MÊS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${topTransactionsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TAREFA: ANÁLISE FINANCEIRA PROFUNDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Forneça uma análise financeira COMPLETA e PROFUNDA em formato JSON com a seguinte estrutura:

{
  "financial_score": {
    "score": número de 0 a 100,
    "level": "excellent | good | moderate | needs_attention | critical",
    "description": "Explicação do score"
  },
  "summary": {
    "spending_pattern": "Descrição DETALHADA do padrão de gastos (2-3 frases)",
    "financial_health": "excellent | good | moderate | warning | critical",
    "balance_trend": "positive | neutral | negative",
    "key_highlight": "Principal destaque positivo ou negativo do mês"
  },
  "month_comparison": {
    "income_trend": "increasing | stable | decreasing",
    "expense_trend": "increasing | stable | decreasing",
    "analysis": "Análise da evolução comparada ao mês anterior"
  },
  "insights": [
    {
      "title": "Título claro e direto",
      "description": "Descrição DETALHADA com dados concretos e contexto",
      "category": "categoria relacionada (opcional)",
      "impact": "high | medium | low",
      "type": "observation | warning | opportunity",
      "metric": "Métrica específica (ex: '35% acima da média')"
    }
  ],
  "recommendations": [
    {
      "title": "Título da ação recomendada",
      "description": "PASSO A PASSO detalhado e acionável de como implementar",
      "priority": "high | medium | low",
      "category": "categoria afetada (opcional)",
      "estimated_savings": número (se aplicável),
      "difficulty": "easy | medium | hard",
      "timeframe": "immediate | short_term | long_term"
    }
  ],
  "spending_alerts": [
    {
      "category": "nome da categoria",
      "message": "Alerta específico",
      "severity": "high | medium | low",
      "suggested_limit": número (se aplicável)
    }
  ],
  "goals_suggestions": [
    {
      "title": "Meta sugerida",
      "description": "Por que essa meta é importante",
      "target_amount": número,
      "timeframe_months": número
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DIRETRIZES PARA ANÁLISE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **Score Financeiro (0-100):**
   - 90-100: Excelente gestão, ótima taxa de poupança
   - 70-89: Boa gestão, algumas oportunidades de melhoria
   - 50-69: Gestão moderada, precisa de ajustes
   - 30-49: Atenção necessária, gastos acima do ideal
   - 0-29: Situação crítica, ação imediata necessária

2. **Insights (4-7 insights):**
   - Identifique PADRÕES comportamentais nos gastos
   - Compare com mês anterior se disponível
   - Identifique categorias que fogem do padrão comum
   - Calcule percentuais em relação à renda
   - Seja específico com números e contexto

3. **Recomendações (4-7 recomendações):**
   - Seja ULTRA ESPECÍFICO e ACIONÁVEL
   - Forneça valores concretos de economia
   - Priorize por impacto financeiro real
   - Inclua dificuldade e prazo de implementação
   - Explique COMO fazer, não só O QUE fazer

4. **Alertas de Gastos (2-4 alertas):**
   - Identifique categorias com gastos excessivos
   - Sugira limites realistas baseados em % da renda
   - Compare com benchmarks de finanças pessoais

5. **Metas Sugeridas (2-3 metas):**
   - Baseie-se na capacidade de poupança atual
   - Seja realista e alcançável
   - Defina prazos concretos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ REGRAS IMPORTANTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Use SEMPRE valores e percentuais reais dos dados
- Seja CRÍTICO mas construtivo
- Priorize AÇÃO sobre observação genérica
- Se saldo negativo, faça disso prioridade #1
- Compare com benchmarks (ex: "habitação não deve passar de 30% da renda")
- Use linguagem clara, profissional e motivadora
- NUNCA use frases genéricas como "controle seus gastos"
- SEMPRE especifique QUANTO economizar e COMO

Retorne APENAS o JSON válido, sem texto adicional.
`;
  }
}
