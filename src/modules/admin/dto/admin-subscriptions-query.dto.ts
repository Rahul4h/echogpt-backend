import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AdminSubscriptionsQueryDto {
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
    example: 10,
    description: 'Number of subscriptions per page.',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 10;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL'],
    description: 'Filter subscriptions by status.',
  })
  @IsIn(['ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL'])
  @IsOptional()
  status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';

  @ApiPropertyOptional({
    example: 'plan-uuid',
    description: 'Filter subscriptions by plan ID.',
  })
  @IsString()
  @IsOptional()
  planId?: string;

  @ApiPropertyOptional({
    example: 'rahul',
    description: 'Search by user name or email.',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'startedAt', 'expiresAt'],
    default: 'createdAt',
    description: 'Field used to sort subscriptions.',
  })
  @IsIn(['createdAt', 'startedAt', 'expiresAt'])
  @IsOptional()
  sortBy: 'createdAt' | 'startedAt' | 'expiresAt' = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction.',
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder: 'asc' | 'desc' = 'desc';
}