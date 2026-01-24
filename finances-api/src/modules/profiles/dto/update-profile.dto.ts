import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  full_name?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Avatar URL deve ser uma URL válida' })
  @MaxLength(255)
  avatar_url?: string;

  @IsOptional()
  @IsEnum(['BRL', 'USD', 'EUR', 'GBP', 'JPY'], {
    message: 'Moeda deve ser BRL, USD, EUR, GBP ou JPY',
  })
  currency?: string;

  @IsOptional()
  @IsEnum(['pt-BR', 'en-US', 'es-ES', 'fr-FR'], {
    message: 'Idioma deve ser pt-BR, en-US, es-ES ou fr-FR',
  })
  locale?: string;

  @IsOptional()
  @IsEnum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], {
    message: 'Formato de data deve ser DD/MM/YYYY, MM/DD/YYYY ou YYYY-MM-DD',
  })
  date_format?: string;

  @IsOptional()
  @IsBoolean()
  email_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  push_notifications?: boolean;
}
