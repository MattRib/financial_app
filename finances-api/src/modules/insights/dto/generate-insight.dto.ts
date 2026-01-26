import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateInsightDto {
  @ApiProperty({
    description: 'Mês (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    description: 'Ano',
    example: 2026,
    minimum: 2020,
  })
  @IsInt()
  @Min(2020)
  year: number;
}
