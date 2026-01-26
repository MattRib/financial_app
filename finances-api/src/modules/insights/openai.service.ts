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
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
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
        max_tokens: 2000,
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
    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
      new Date(input.year, input.month - 1),
    );

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

    return `
Analise os dados financeiros de ${monthName}/${input.year}:

RESUMO FINANCEIRO:
- Receitas: R$ ${input.total_income.toFixed(2)}
- Despesas: R$ ${input.total_expense.toFixed(2)}
- Saldo: R$ ${input.balance.toFixed(2)}

GASTOS POR CATEGORIA:
${categoriesText}

TOP 5 MAIORES TRANSAÇÕES:
${topTransactionsText}

TAREFA:
Forneça uma análise financeira completa em formato JSON com a seguinte estrutura:

{
  "summary": {
    "spending_pattern": "string descrevendo o padrão geral de gastos",
    "financial_health": "excellent | good | moderate | warning | critical",
    "balance_trend": "positive | neutral | negative"
  },
  "insights": [
    {
      "title": "Título do insight",
      "description": "Descrição detalhada",
      "category": "nome da categoria (opcional)",
      "impact": "high | medium | low",
      "type": "observation | warning | opportunity"
    }
  ],
  "recommendations": [
    {
      "title": "Título da recomendação",
      "description": "Descrição detalhada e acionável",
      "priority": "high | medium | low",
      "estimated_savings": número (opcional)
    }
  ],
  "top_categories": [
    {
      "category_name": "Nome da categoria",
      "amount": número,
      "percentage": número
    }
  ]
}

INSTRUÇÕES:
- Seja específico e cite valores reais
- Priorize insights acionáveis
- Se houver gastos excessivos, alerte e sugira cortes
- Se o saldo for negativo, priorize isso nos insights
- Limite: 3-5 insights, 3-5 recomendações
- Use linguagem clara e profissional em português BR
`;
  }
}
