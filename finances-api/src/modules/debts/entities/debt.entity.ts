import type { DebtStatus } from '../../../common/types/database.types';

export class Debt {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  status: DebtStatus;
  amount_paid: number;
  creditor?: string;
  notes?: string;
  created_at: Date;
  updated_at?: Date;
}
