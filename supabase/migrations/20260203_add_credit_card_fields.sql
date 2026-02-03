-- Migration: Add credit card fields and invoice payments
-- Adds credit card settings to accounts and a table to track paid invoices
-- Date: 2026-02-03

BEGIN;

-- Credit card fields on accounts
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(12,2) NULL,
  ADD COLUMN IF NOT EXISTS closing_day INTEGER NULL,
  ADD COLUMN IF NOT EXISTS due_day INTEGER NULL;

-- Constraints for day fields (1-31 when provided)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_accounts_closing_day'
  ) THEN
    ALTER TABLE public.accounts
      ADD CONSTRAINT chk_accounts_closing_day
      CHECK (closing_day IS NULL OR (closing_day >= 1 AND closing_day <= 31));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_accounts_due_day'
  ) THEN
    ALTER TABLE public.accounts
      ADD CONSTRAINT chk_accounts_due_day
      CHECK (due_day IS NULL OR (due_day >= 1 AND due_day <= 31));
  END IF;
END $$;

-- Track paid invoices without creating transactions
CREATE TABLE IF NOT EXISTS public.credit_card_invoice_payments (
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (account_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_cc_invoice_payments_account
  ON public.credit_card_invoice_payments(account_id);

COMMIT;

-- Rollback instructions (manual):
-- BEGIN;
-- DROP INDEX IF EXISTS idx_cc_invoice_payments_account;
-- DROP TABLE IF EXISTS public.credit_card_invoice_payments;
-- ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS chk_accounts_closing_day;
-- ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS chk_accounts_due_day;
-- ALTER TABLE public.accounts DROP COLUMN IF EXISTS credit_limit;
-- ALTER TABLE public.accounts DROP COLUMN IF EXISTS closing_day;
-- ALTER TABLE public.accounts DROP COLUMN IF EXISTS due_day;
-- COMMIT;
