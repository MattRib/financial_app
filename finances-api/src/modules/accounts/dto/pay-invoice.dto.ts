import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class PayInvoiceDto {
  @ApiProperty({
    description: 'Data inicial do período da fatura (YYYY-MM-DD)',
    example: '2026-01-16',
  })
  @IsDateString()
  period_start: string;

  @ApiProperty({
    description: 'Data final do período da fatura (YYYY-MM-DD)',
    example: '2026-02-15',
  })
  @IsDateString()
  period_end: string;
}
