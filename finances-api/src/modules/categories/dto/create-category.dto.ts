import {
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import type { CategoryType } from '../../../common/types/database.types';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1, { message: 'O nome da categoria não pode estar vazio' })
  @MaxLength(50, {
    message: 'O nome da categoria não pode ter mais de 50 caracteres',
  })
  name: string;

  @IsEnum(['income', 'expense', 'investment'], {
    message: 'O tipo deve ser income, expense ou investment',
  })
  type: CategoryType;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'A cor deve estar no formato hexadecimal (ex: #FF5733)',
  })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'O ícone não pode ter mais de 50 caracteres',
  })
  icon?: string;
}
