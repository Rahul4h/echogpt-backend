import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'rahul@example.com',
    description: 'Unique email address used for account registration.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Rahul Ghosh',
    description: 'User display name.',
    minLength: 2,
    maxLength: 80,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Account password. Must be 8-128 characters.',
    minLength: 8,
    maxLength: 128,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}