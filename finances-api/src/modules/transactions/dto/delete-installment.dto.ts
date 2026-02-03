import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InstallmentDeleteMode {
  SINGLE = 'single', // Remove apenas esta parcela
  FUTURE = 'future', // Remove esta e as parcelas futuras
  ALL = 'all', // Remove todas as parcelas do grupo
}

export class DeleteInstallmentDto {
  @ApiProperty({
    enum: InstallmentDeleteMode,
    default: InstallmentDeleteMode.ALL,
    description:
      'Modo de deleção: "single" (apenas esta), "future" (esta e futuras), "all" (todas)',
    required: false,
  })
  @IsOptional()
  @IsEnum(InstallmentDeleteMode)
  mode?: InstallmentDeleteMode = InstallmentDeleteMode.ALL;
}
