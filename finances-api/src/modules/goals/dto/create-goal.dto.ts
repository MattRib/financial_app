import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import type { GoalStatus } from '../../../common/types/database.types';

export class CreateGoalDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  target_amount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  current_amount?: number;

  @IsDateString()
  target_date: string;

  @IsEnum(['active', 'completed', 'cancelled'])
  @IsOptional()
  status?: GoalStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
