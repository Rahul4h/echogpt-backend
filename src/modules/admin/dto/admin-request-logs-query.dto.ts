import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AdminRequestLogsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number.',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Number of request logs per page. Maximum 100.',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 20;

  @ApiPropertyOptional({
    example: 'ERROR',
    enum: ['SUCCESS', 'ERROR'],
    description: 'Filter request logs by request status.',
  })
  @IsIn(['SUCCESS', 'ERROR'])
  @IsOptional()
  status?: 'SUCCESS' | 'ERROR';

  @ApiPropertyOptional({
    example: 'POST',
    description: 'Filter request logs by HTTP method.',
  })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({
    example: 500,
    description: 'Filter request logs by HTTP status code.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(599)
  @IsOptional()
  statusCode?: number;

  @ApiPropertyOptional({
    example: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
    description: 'Filter request logs for a specific user.',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    example: '2026-09-01T00:00:00.000Z',
    description:
      'Return logs created on or after this ISO 8601 timestamp.',
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-09-29T23:59:59.999Z',
    description:
      'Return logs created on or before this ISO 8601 timestamp.',
  })
  @IsDateString()
  @IsOptional()
  to?: string;
}