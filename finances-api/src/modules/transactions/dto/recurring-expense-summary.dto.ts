import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TransactionType } from '../../../common/types/database.types';

export class RecurringExpenseSummaryDto {
  @ApiProperty({ description: 'ID do grupo de recorrência' })
  recurring_group_id: string;

  @ApiProperty({ description: 'Descrição da despesa fixa' })
  description: string;

  @ApiPropertyOptional({ description: 'Informações da categoria' })
  category?: {
    name: string;
    color: string;
    icon: string;
  } | null;

  @ApiProperty({ description: 'Total de recorrências planejadas' })
  total_recurrences: number;

  @ApiProperty({
    description: 'Número de recorrências já ocorridas (date <= today)',
  })
  completed_recurrences: number;

  @ApiProperty({ description: 'Número de recorrências futuras' })
  pending_recurrences: number;

  @ApiProperty({ description: 'Valor mensal da despesa' })
  monthly_amount: number;

  @ApiProperty({
    description: 'Valor total (monthly_amount * total_recurrences)',
  })
  total_amount: number;

  @ApiProperty({ description: 'Valor já pago' })
  paid_amount: number;

  @ApiProperty({ description: 'Valor restante a pagar' })
  remaining_amount: number;

  @ApiProperty({ description: 'Data da primeira ocorrência' })
  first_date: string;

  @ApiProperty({ description: 'Data da última ocorrência' })
  last_date: string;

  @ApiProperty({ description: 'Tipo da transação' })
  type: TransactionType;

  @ApiProperty({ description: 'Se todas as recorrências estão ativas' })
  is_active: boolean;
}
