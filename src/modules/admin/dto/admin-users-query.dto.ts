import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminUsersQueryDto {
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
    description: 'Number of users per page.',
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
    example: 'rahul',
    description: 'Search by user name or email.',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    description: 'Filter users by role.',
  })
  @IsIn(['USER', 'ADMIN'])
  @IsOptional()
  role?: 'USER' | 'ADMIN';

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'email', 'name'],
    default: 'createdAt',
    description: 'Field used to sort users.',
  })
  @IsIn(['createdAt', 'email', 'name'])
  @IsOptional()
  sortBy: 'createdAt' | 'email' | 'name' = 'createdAt';

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