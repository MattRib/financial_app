export class Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  month: number;
  year: number;
  created_at: Date;
}
