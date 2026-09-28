import { Type } from 'class-transformer';

import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class PageContextDto {
  @ApiPropertyOptional({
    example: 'https://example.com/article',
    description: 'URL of the current browser page.',
    maxLength: 2048,
  })
  @IsOptional()
  @IsString()
  
  @MaxLength(2048)
  url?: string;

  @ApiPropertyOptional({
    example: 'Example Article',
    description: 'Title of the current browser page.',
    maxLength: 512,
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  title?: string;

  @ApiPropertyOptional({
    example:
      'This is the selected text or relevant content from the current page.',
    description:
      'Optional page content that will be provided as context to the AI provider.',
    maxLength: 50000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  content?: string;
}

export class SendChatMessageDto {
  @ApiProperty({
    example: 'Explain this paragraph in simple terms.',
    description:
      'User prompt sent to the selected AI provider.',
    minLength: 1,
    maxLength: 10000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  prompt: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description:
      'Existing conversation ID. If omitted, a new conversation is created.',
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional({
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
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
      'Optional model override. If omitted, the provider default model is used.',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional({
    type: () => PageContextDto,
    description:
      'Optional browser page context containing the current page URL, title, or selected content.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PageContextDto)
  pageContext?: PageContextDto;
}