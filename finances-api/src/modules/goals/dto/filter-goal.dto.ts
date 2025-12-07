import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import type { GoalStatus } from '../../../common/types/database.types';

export class FilterGoalDto {
  @IsOptional()
  @IsEnum(['active', 'completed', 'cancelled'])
  status?: GoalStatus;

  @IsOptional()
  @IsDateString()
  target_date_start?: string;

  @IsOptional()
  @IsDateString()
  target_date_end?: string;

  @IsOptional()
  category?: string;
}
