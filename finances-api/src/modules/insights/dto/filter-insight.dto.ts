import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterInsightDto {
  @ApiPropertyOptional({
    description: 'Filtrar por mês (1-12)',
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ano',
    minimum: 2020,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  year?: number;
}
