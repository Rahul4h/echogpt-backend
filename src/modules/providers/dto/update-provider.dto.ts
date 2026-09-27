import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderType } from './create-provider.dto';

export class UpdateProviderDto {
  @ApiPropertyOptional({
    example: 'OpenAI Production',
    description: 'Unique display name for the AI provider.',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    enum: ProviderType,
    example: ProviderType.OPENAI,
    description: 'AI provider type.',
  })
  @IsOptional()
  @IsEnum(ProviderType)
  type?: ProviderType;

  @ApiPropertyOptional({
    example: 'https://api.openai.com/v1',
    description: 'Optional custom provider base URL.',
  })
  @IsOptional()
  @IsUrl()
  baseUrl?: string;

  @ApiPropertyOptional({
    example: 'gpt-5',
    description: 'Model identifier used for chat requests.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  modelName?: string;

  @ApiPropertyOptional({
    example: 'new-provider-api-key',
    description:
      'Optional replacement API key. It is encrypted before storage.',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  apiKey?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the provider is enabled.',
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this provider should become the default.',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}