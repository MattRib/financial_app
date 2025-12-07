import { InvestmentType } from '../../../common/types/database.types';

export class Investment {
  id: string;
  user_id: string;
  type: InvestmentType;
  name: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: Date;
}
