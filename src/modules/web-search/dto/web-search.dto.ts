import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class WebSearchDto {
  @ApiProperty({
    example:
      'What are the best practices for NestJS authentication?',
    description:
      'The question or query to search on the web.',
    minLength: 2,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(500)
  query!: string;

  @ApiPropertyOptional({
    example:
      '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    format: 'uuid',
    description:
      'AI provider ID. If omitted, the configured default provider is used.',
  })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({
    example: 'gpt-5',
    description:
      'Optional AI model override. If omitted, the provider default model is used.',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  model?: string;
}