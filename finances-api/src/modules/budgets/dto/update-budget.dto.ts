import { IsNumber, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}
