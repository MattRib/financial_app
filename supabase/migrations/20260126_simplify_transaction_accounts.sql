-- Migration: Simplify transaction accounts structure
-- Add account_id for regular transactions, keep from/to/transfer_id for transfers only

BEGIN;

-- Add account_id column (nullable initially for data migration)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS account_id uuid NULL;

-- Copy data: Prioritize from_account_id, then to_account_id for existing transactions
-- Only for non-transfer transactions (transfer_id IS NULL)
UPDATE public.transactions
SET account_id = COALESCE(from_account_id, to_account_id)
WHERE transfer_id IS NULL;

-- Validate: Check if there are any problematic rows before adding constraint
-- This will show rows that would violate the constraint
DO $$
DECLARE
  problem_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO problem_count
  FROM public.transactions
  WHERE account_id IS NULL AND transfer_id IS NULL;
  
  IF problem_count > 0 THEN
    RAISE EXCEPTION 'Found % transactions without account_id and transfer_id. Please fix these records before running this migration.', problem_count;
  END IF;
END $$;

-- Add CHECK constraint for regular transactions (non-transfers)
-- Note: Transfers (with transfer_id) will still use from_account_id/to_account_id
ALTER TABLE public.transactions
  ADD CONSTRAINT chk_account_id_required 
  CHECK (account_id IS NOT NULL OR transfer_id IS NOT NULL);

-- Add foreign key constraint
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_account 
  FOREIGN KEY (account_id) 
  REFERENCES public.accounts(id) 
  ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_account_id 
  ON public.transactions(account_id);

-- Add comment explaining the field usage
COMMENT ON COLUMN public.transactions.account_id IS 
  'Account associated with this transaction (income/expense). NULL for transfers (use from_account_id/to_account_id with transfer_id instead)';

COMMENT ON COLUMN public.transactions.from_account_id IS 
  'Source account for transfers only (used with transfer_id)';

COMMENT ON COLUMN public.transactions.to_account_id IS 
  'Destination account for transfers only (used with transfer_id)';

COMMENT ON COLUMN public.transactions.transfer_id IS 
  'Links two transactions that represent opposite sides of an account transfer';

COMMIT;
