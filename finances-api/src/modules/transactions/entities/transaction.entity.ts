import type { TransactionType } from '../../../common/types/database.types';

export class Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  tags: string[];
  attachment_url: string | null;
  created_at: Date;

  // Installment fields
  installment_group_id?: string | null;
  installment_number?: number | null;
  total_installments?: number | null;
}
