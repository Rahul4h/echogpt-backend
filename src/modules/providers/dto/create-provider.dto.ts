import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export enum ProviderType {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GOOGLE = 'GOOGLE',
}

export class CreateProviderDto {
  @ApiProperty({
    example: 'OpenAI Primary',
    description: 'Unique display name for the AI provider.',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    enum: ProviderType,
    example: ProviderType.OPENAI,
    description:
      'AI provider type. Supported values: OPENAI, ANTHROPIC, GOOGLE.',
  })
  @IsEnum(ProviderType)
  type: ProviderType;

  @ApiPropertyOptional({
    example: 'https://api.openai.com/v1',
    description:
      'Optional custom provider base URL. The default vendor URL is used when omitted.',
  })
  @IsOptional()
  @IsUrl()
  baseUrl?: string;

  @ApiPropertyOptional({
    example: 'gpt-5',
    description:
      'Default model used for chat requests when no model override is provided.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  modelName?: string;

  @ApiProperty({
    example: 'sk-example-not-a-real-key',
    description:
      'Provider API key. It is encrypted before storage and never returned in plaintext.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  apiKey: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether the provider is enabled.',
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description:
      'Whether this provider should become the default provider.',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}