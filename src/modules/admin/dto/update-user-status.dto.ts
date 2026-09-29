import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    example: 'SUSPENDED',
    enum: ['ACTIVE', 'SUSPENDED'],
    description: 'New status assigned to the user.',
  })
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status: 'ACTIVE' | 'SUSPENDED';
}