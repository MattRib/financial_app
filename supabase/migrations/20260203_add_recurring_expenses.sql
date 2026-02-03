-- Migration: Add recurring expenses support
-- Adds fields to transactions table to support fixed recurring expenses
-- Author: Claude Code
-- Date: 2026-02-03

BEGIN;

-- Add recurring expense columns
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS recurring_group_id UUID NULL,
  ADD COLUMN IF NOT EXISTS recurring_number INTEGER NULL,
  ADD COLUMN IF NOT EXISTS total_recurrences INTEGER NULL,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Add check constraint for recurring fields consistency
-- Either all fields are NULL/FALSE or all are populated
ALTER TABLE public.transactions
  ADD CONSTRAINT chk_recurring_fields
  CHECK (
    (recurring_group_id IS NULL AND recurring_number IS NULL AND total_recurrences IS NULL AND is_recurring = FALSE) OR
    (recurring_group_id IS NOT NULL AND recurring_number IS NOT NULL AND total_recurrences IS NOT NULL AND is_recurring = TRUE)
  );

-- Add index for performance on recurring queries
-- Partial index: only indexes rows where recurring_group_id is not null
CREATE INDEX IF NOT EXISTS idx_transactions_recurring_group_id
  ON public.transactions(recurring_group_id)
  WHERE recurring_group_id IS NOT NULL;

-- Partial index for filtering recurring transactions
CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring
  ON public.transactions(is_recurring)
  WHERE is_recurring = TRUE;

-- Add comments explaining the fields usage
COMMENT ON COLUMN public.transactions.recurring_group_id IS
  'Groups transactions that are part of a recurring expense (e.g., monthly rent for 12 months). Each group shares the same UUID.';

COMMENT ON COLUMN public.transactions.recurring_number IS
  'The sequence number of this recurrence (1, 2, 3, ..., N). Indicates which month/occurrence this is.';

COMMENT ON COLUMN public.transactions.total_recurrences IS
  'Total number of recurrences in this group (e.g., 6, 12, 24). Set by user when creating the recurring expense.';

COMMENT ON COLUMN public.transactions.is_recurring IS
  'Flag indicating if this transaction is part of a recurring expense group. Makes queries easier and faster.';

COMMIT;

-- Rollback instructions (for manual execution if needed):
-- BEGIN;
-- ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS chk_recurring_fields;
-- DROP INDEX IF EXISTS idx_transactions_recurring_group_id;
-- DROP INDEX IF EXISTS idx_transactions_is_recurring;
-- ALTER TABLE public.transactions DROP COLUMN IF EXISTS recurring_group_id;
-- ALTER TABLE public.transactions DROP COLUMN IF EXISTS recurring_number;
-- ALTER TABLE public.transactions DROP COLUMN IF EXISTS total_recurrences;
-- ALTER TABLE public.transactions DROP COLUMN IF EXISTS is_recurring;
-- COMMIT;
