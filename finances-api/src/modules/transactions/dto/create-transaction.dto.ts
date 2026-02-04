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
  ValidateIf,
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

  @ValidateIf((o) => !o.start_date)
  @IsDateString()
  date?: string;

  @ValidateIf((o) => !o.date)
  @IsDateString()
  start_date?: string;

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

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(60)
  total_recurrences?: number;
}
