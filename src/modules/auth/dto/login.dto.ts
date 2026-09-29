import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'rahul@example.com',
    description: 'Registered account email address.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Account password.',
    format: 'password',
  })
  @IsString()
  password!: string;
}