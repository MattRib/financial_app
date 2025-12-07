import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import type { InvestmentType } from '../../../common/types/database.types';

export class CreateInvestmentDto {
  @IsEnum(['renda_fixa', 'renda_variavel', 'cripto', 'outros'])
  type: InvestmentType;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
