import { AccountType } from '../dto/create-account.dto';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  credit_limit?: number | null;
  closing_day?: number | null;
  due_day?: number | null;
  color: string;
  icon: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}
