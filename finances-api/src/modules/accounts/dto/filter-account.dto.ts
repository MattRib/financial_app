import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AccountTypeValues } from './create-account.dto';
import type { AccountType } from './create-account.dto';

export class FilterAccountDto {
  @ApiPropertyOptional({ enum: AccountTypeValues })
  @IsEnum(AccountTypeValues)
  @IsOptional()
  type?: AccountType;

  @ApiPropertyOptional({ description: 'Apenas contas ativas' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active?: boolean;
}
