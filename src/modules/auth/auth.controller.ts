import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  ApiBearerAuth,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

class RegisterDto {
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
    description: 'Account password. Must be 8–128 characters.',
    minLength: 8,
    maxLength: 128,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

class LoginDto {
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

class RefreshDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-refresh-token',
    description:
      'Refresh token returned by the login or refresh endpoint.',
  })
  @IsString()
  refreshToken!: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.email,
      dto.name,
      dto.password,
    );
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.email,
      dto.password,
    );
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(
      dto.refreshToken,
    );
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(
      dto.refreshToken,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.authService.me(user.id);
  }
}