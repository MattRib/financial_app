import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import type { CategoryType } from '../../../common/types/database.types';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(['income', 'expense', 'investment'])
  type?: CategoryType;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
