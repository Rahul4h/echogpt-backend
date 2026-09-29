import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and automatically assigns the default FREE subscription plan.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    schema: {
      example: {
        user: {
          id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
          email: 'rahul@example.com',
          name: 'Rahul Ghosh',
          role: 'USER',
          createdAt: '2026-09-29T10:30:00.000Z',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email, name, or password.',
  })
  @ApiResponse({
    status: 409,
    description: 'An account with this email address already exists.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.email,
      dto.name,
      dto.password,
    );
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticates a user and returns access and refresh tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    schema: {
      example: {
        user: {
          id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
          email: 'rahul@example.com',
          name: 'Rahul Ghosh',
          role: 'USER',
          createdAt: '2026-09-29T10:30:00.000Z',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or password format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.email,
      dto.password,
    );
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Validates the refresh token, revokes the current session, and creates a new access/refresh token pair.',
  })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully.',
    schema: {
      example: {
        user: {
          id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
          email: 'rahul@example.com',
          name: 'Rahul Ghosh',
          role: 'USER',
          createdAt: '2026-09-29T10:30:00.000Z',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token is missing or invalid in format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, revoked, or mismatched refresh token.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout',
    description:
      'Revokes the session associated with the provided refresh token.',
  })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Logout successful.',
    schema: {
      example: {
        message: 'Logged out successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token is missing or invalid in format.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, revoked, or mismatched refresh token.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the authenticated user profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user retrieved successfully.',
    schema: {
      example: {
        id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
        email: 'rahul@example.com',
        name: 'Rahul Ghosh',
        role: 'USER',
        createdAt: '2026-09-29T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required or access token is invalid/expired.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  me(@CurrentUser() user: { id: string }) {
    return this.authService.me(user.id);
  }
}