import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'ADMIN',
    enum: ['USER', 'ADMIN'],
    description: 'New role assigned to the user.',
  })
  @IsIn(['USER', 'ADMIN'])
  role: 'USER' | 'ADMIN';
}