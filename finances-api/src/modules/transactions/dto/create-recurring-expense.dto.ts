import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsUUID,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TransactionType } from '../../../common/types/database.types';

export class CreateRecurringExpenseDto {
  @ApiProperty({
    description: 'Valor da despesa fixa mensal',
    example: 1200.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description:
      'Tipo da transação (geralmente "expense" para despesas fixas)',
    enum: ['income', 'expense'],
    example: 'expense',
  })
  @IsEnum(['income', 'expense'])
  type: TransactionType;

  @ApiPropertyOptional({ description: 'ID da categoria' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ description: 'Descrição da despesa fixa', example: 'Aluguel' })
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({
    description: 'Data de início (primeira ocorrência)',
    example: '2026-02-01',
  })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({ description: 'Tags opcionais' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'ID da conta' })
  @IsUUID()
  account_id: string;

  @ApiPropertyOptional({ description: 'URL do anexo' })
  @IsOptional()
  @IsString()
  attachment_url?: string;

  @ApiProperty({
    description: 'Número de meses de recorrência',
    example: 12,
    minimum: 2,
    maximum: 60,
  })
  @IsNumber()
  @Min(2)
  @Max(60)
  total_recurrences: number;
}
