export interface InsightReport {
  summary: {
    spending_pattern: string;
    financial_health:
      | 'excellent'
      | 'good'
      | 'moderate'
      | 'warning'
      | 'critical';
    balance_trend: 'positive' | 'neutral' | 'negative';
  };
  insights: Array<{
    title: string;
    description: string;
    category?: string;
    impact: 'high' | 'medium' | 'low';
    type: 'observation' | 'warning' | 'opportunity';
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimated_savings?: number;
  }>;
  top_categories: Array<{
    category_name: string;
    amount: number;
    percentage: number;
  }>;
}

export class Insight {
  id: string;
  user_id: string;
  month: number;
  year: number;
  generated_at: Date;
  total_income: number;
  total_expense: number;
  balance: number;
  transactions_count: number;
  report_data: InsightReport;
  model_used: string;
  tokens_used?: number;
  generation_time_ms?: number;
  created_at: Date;
  updated_at: Date;
}
