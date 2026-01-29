import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTransactionDto } from './create-transaction.dto';

export class ParsedOfxTransactionDto {
  @ApiProperty({ description: 'Descrição da transação' })
  description: string;

  @ApiProperty({ description: 'Valor da transação' })
  amount: number;

  @ApiProperty({ description: 'Data da transação (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({
    enum: ['income', 'expense'],
    description: 'Tipo da transação',
  })
  type: 'income' | 'expense';

  @ApiProperty({ description: 'ID da categoria sugerida', required: false })
  suggested_category_id?: string;
}

export class OfxPreviewDto {
  @ApiProperty({ description: 'Total de transações encontradas' })
  total_transactions: number;

  @ApiProperty({
    type: [ParsedOfxTransactionDto],
    description: 'Lista de transações parseadas',
  })
  transactions: ParsedOfxTransactionDto[];

  @ApiProperty({
    type: [Number],
    description: 'Índices das transações duplicadas',
  })
  duplicates: number[];
}

export class ConfirmOfxImportDto {
  @ApiProperty({
    type: [CreateTransactionDto],
    description: 'Transações a serem importadas',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionDto)
  transactions: CreateTransactionDto[];
}
