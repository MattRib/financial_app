import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import type { DebtStatus } from '../../../common/types/database.types';

export class CreateDebtDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsDateString()
  due_date: string;

  @IsEnum(['pending', 'paid', 'overdue'])
  @IsOptional()
  status?: DebtStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  amount_paid?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  creditor?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
