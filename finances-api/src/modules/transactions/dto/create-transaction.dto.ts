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
import type { TransactionType } from '../../../common/types/database.types';

export class CreateTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsEnum(['income', 'expense'])
  type: TransactionType;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsUUID()
  account_id: string;

  @IsOptional()
  @IsString()
  attachment_url?: string;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(60)
  total_installments?: number;
}
