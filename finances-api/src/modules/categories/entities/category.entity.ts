import type { CategoryType } from '../../../common/types/database.types';

export class Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  created_at: Date;
}
