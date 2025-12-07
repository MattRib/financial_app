import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import type { DebtStatus } from '../../../common/types/database.types';

export class FilterDebtDto {
  @IsOptional()
  @IsEnum(['pending', 'paid', 'overdue'])
  status?: DebtStatus;

  @IsOptional()
  @IsDateString()
  due_date_start?: string;

  @IsOptional()
  @IsDateString()
  due_date_end?: string;
}
