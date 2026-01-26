import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiPropertyOptional({ description: 'Conta ativa', default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
