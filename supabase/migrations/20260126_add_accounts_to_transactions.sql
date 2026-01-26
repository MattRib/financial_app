-- Migration: add account references and transfer_id to transactions
BEGIN;

-- Add nullable account reference columns
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS from_account_id uuid NULL,
  ADD COLUMN IF NOT EXISTS to_account_id uuid NULL,
  ADD COLUMN IF NOT EXISTS transfer_id uuid NULL;

-- Indexes for faster queries by account/transfer
CREATE INDEX IF NOT EXISTS idx_transactions_from_account_id ON public.transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_account_id ON public.transactions(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_id ON public.transactions(transfer_id);

-- Foreign key constraints (set NULL on account deletion)
ALTER TABLE public.transactions
  ADD CONSTRAINT fk_transactions_from_account FOREIGN KEY (from_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_transactions_to_account FOREIGN KEY (to_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;

COMMIT;

--
-- Down / rollback (manual):
-- ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS fk_transactions_from_account;
-- ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS fk_transactions_to_account;
-- DROP INDEX IF EXISTS idx_transactions_from_account_id;
-- DROP INDEX IF EXISTS idx_transactions_to_account_id;
-- DROP INDEX IF EXISTS idx_transactions_transfer_id;
-- ALTER TABLE public.transactions DROP COLUMN IF EXISTS from_account_id;
-- ALTER TABLE public.transactions DROP COLUMN IF EXISTS to_account_id;
-- ALTER TABLE public.transactions DROP COLUMN IF EXISTS transfer_id;

-- Data migration note:
-- The migration does not assign accounts to historical transactions automatically.
-- To assist manual migration, you can export transactions without account references:
-- COPY (
--   SELECT id, user_id, amount, type, date, description
--   FROM public.transactions
--   WHERE from_account_id IS NULL AND to_account_id IS NULL
-- ) TO '/tmp/transactions_without_account.csv' CSV HEADER;
