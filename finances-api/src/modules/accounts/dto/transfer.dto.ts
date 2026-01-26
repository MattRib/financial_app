import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ description: 'ID da conta de origem' })
  @IsUUID()
  from_account_id: string;

  @ApiProperty({ description: 'ID da conta de destino' })
  @IsUUID()
  to_account_id: string;

  @ApiProperty({ description: 'Valor da transferência', example: 500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Descrição' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Data da transferência (YYYY-MM-DD)',
    example: '2026-01-26',
  })
  @IsDateString()
  date: string;
}
