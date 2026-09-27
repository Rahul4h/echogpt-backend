import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProviderType {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GOOGLE = 'GOOGLE',
}

export class CreateProviderDto {
  @ApiProperty({
    example: 'OpenAI Primary',
    description: 'Unique display name for the AI provider.',
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    enum: ProviderType,
    example: ProviderType.OPENAI,
    description: 'AI provider type.',
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
    description: 'Model identifier used for chat requests.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  modelName?: string;

  @ApiProperty({
    example: 'your-provider-api-key',
    description:
      'Provider API key. It is encrypted before being stored and is never returned in plaintext.',
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