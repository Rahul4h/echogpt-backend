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
    description: 'Updated unique display name for the AI provider.',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    enum: ProviderType,
    example: ProviderType.OPENAI,
    description:
      'Updated AI provider type: OPENAI, ANTHROPIC, or GOOGLE.',
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
    description: 'Updated default model identifier.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  modelName?: string;

  @ApiPropertyOptional({
    example: 'sk-example-not-a-real-key',
    description:
      'Optional replacement API key. It is encrypted before storage.',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  apiKey?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Enable or disable the provider.',
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Set whether this provider is the default provider.',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}