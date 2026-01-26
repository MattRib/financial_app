import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const AccountTypeValues = [
  'checking',
  'savings',
  'credit_card',
  'cash',
  'investment',
  'other',
] as const;

export type AccountType = (typeof AccountTypeValues)[number];

export class CreateAccountDto {
  @ApiProperty({
    description: 'Nome da conta',
    example: 'Nubank',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Tipo da conta',
    enum: AccountTypeValues,
    example: 'checking',
  })
  @IsEnum(AccountTypeValues)
  type: AccountType;

  @ApiPropertyOptional({
    description: 'Saldo inicial',
    example: 1000.0,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  initial_balance?: number;

  @ApiPropertyOptional({
    description: 'Cor em hexadecimal',
    example: '#8B5CF6',
  })
  @IsString()
  @MaxLength(7)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Emoji/ícone', example: '💳' })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Incluir no total geral',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  include_in_total?: boolean;

  @ApiPropertyOptional({ description: 'Notas/observações' })
  @IsString()
  @IsOptional()
  notes?: string;
}
