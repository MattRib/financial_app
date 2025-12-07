import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import type { InvestmentType } from '../../../common/types/database.types';

export class FilterInvestmentDto {
  @IsOptional()
  @IsEnum(['renda_fixa', 'renda_variavel', 'cripto', 'outros'])
  type?: InvestmentType;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
