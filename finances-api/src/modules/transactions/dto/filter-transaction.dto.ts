import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import type { TransactionType } from '../../../common/types/database.types';

export class FilterTransactionDto {
  @IsOptional()
  @IsEnum(['income', 'expense'])
  type?: TransactionType;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
