import type { GoalStatus } from '../../../common/types/database.types';

export class Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: GoalStatus;
  category?: string;
  notes?: string;
  created_at: Date;
  updated_at?: Date;
}
