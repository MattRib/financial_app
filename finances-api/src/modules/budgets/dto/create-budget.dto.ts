import { IsNumber, IsOptional, IsUUID, Min, Max, IsInt } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;
}
