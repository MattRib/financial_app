-- Migration: Create insights table
-- Description: Tabela para armazenar insights financeiros gerados pela OpenAI

-- Tabela de insights
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Dados de contexto
  total_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_expense DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  transactions_count INTEGER NOT NULL DEFAULT 0,

  -- Relatório JSON da OpenAI
  report_data JSONB NOT NULL,

  -- Metadados
  model_used VARCHAR(50) NOT NULL,
  tokens_used INTEGER,
  generation_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único para cache (um insight por mês/usuário)
CREATE UNIQUE INDEX idx_insights_user_month_year
  ON insights(user_id, month, year);

-- Índice para listar histórico
CREATE INDEX idx_insights_user_generated
  ON insights(user_id, generated_at DESC);

-- Row Level Security
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own insights"
  ON insights FOR ALL
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
