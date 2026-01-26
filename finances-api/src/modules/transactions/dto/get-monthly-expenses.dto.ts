import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMonthlyExpensesDto {
  @ApiProperty({
    description: 'Ano para filtrar os gastos',
    example: 2026,
    minimum: 2020,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  year: number;
}
