import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { GoalStatus } from '../../../common/types/database.types';
import { GoalCategoryValues, type GoalCategory } from './create-goal.dto';

export class FilterGoalDto {
  @ApiPropertyOptional({
    description: 'Filtrar por status',
    enum: ['active', 'completed', 'cancelled'],
  })
  @IsOptional()
  @IsEnum(['active', 'completed', 'cancelled'])
  status?: GoalStatus;

  @ApiPropertyOptional({
    description: 'Data inicial do filtro (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  target_date_start?: string;

  @ApiPropertyOptional({
    description: 'Data final do filtro (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  target_date_end?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoria',
    enum: GoalCategoryValues,
  })
  @IsOptional()
  @IsEnum(GoalCategoryValues)
  category?: GoalCategory;
}
