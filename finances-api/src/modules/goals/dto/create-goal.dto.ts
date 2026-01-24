import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { GoalStatus } from '../../../common/types/database.types';

/**
 * Enum para categorias de metas financeiras
 */
export const GoalCategoryValues = [
  'emergency_fund',
  'travel',
  'purchase',
  'debt_payoff',
  'investment',
  'education',
  'retirement',
  'other',
] as const;

export type GoalCategory = (typeof GoalCategoryValues)[number];

export class CreateGoalDto {
  @ApiProperty({
    description: 'Nome da meta',
    example: 'Reserva de emergência',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Valor alvo da meta',
    example: 10000.0,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  target_amount: number;

  @ApiPropertyOptional({
    description: 'Valor atual acumulado',
    example: 2500.0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  current_amount?: number;

  @ApiProperty({
    description: 'Data limite para atingir a meta (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsDateString()
  target_date: string;

  @ApiPropertyOptional({
    description: 'Status da meta',
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  })
  @IsEnum(['active', 'completed', 'cancelled'])
  @IsOptional()
  status?: GoalStatus;

  @ApiPropertyOptional({
    description: 'Categoria da meta',
    enum: GoalCategoryValues,
    example: 'emergency_fund',
  })
  @IsOptional()
  @IsEnum(GoalCategoryValues)
  category?: GoalCategory;

  @ApiPropertyOptional({
    description: 'Notas ou observações adicionais',
    example: '6 meses de despesas',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
