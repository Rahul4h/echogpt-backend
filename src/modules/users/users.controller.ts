import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the profile of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
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
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 404,
    description: 'User account was not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description:
      'Updates the authenticated user name and/or email address.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully.',
    schema: {
      example: {
        id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
        email: 'rahul.new@example.com',
        name: 'Rahul Ghosh',
        role: 'USER',
        createdAt: '2026-09-29T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request data. For example, the email or name format is invalid.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 404,
    description: 'User account was not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'The requested email address is already registered.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/password')
  @ApiOperation({
    summary: 'Change account password',
    description:
      'Changes the authenticated user password after validating the current password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
    schema: {
      example: {
        message: 'Password changed successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid password data. Passwords must satisfy the required validation rules.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication failed or the current password is incorrect.',
  })
  @ApiResponse({
    status: 404,
    description: 'User account was not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete current user account',
    description:
      'Permanently deletes the authenticated user account and its related data.',
  })
  @ApiResponse({
    status: 204,
    description: 'User account deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 404,
    description: 'User account was not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  async deleteAccount(
    @CurrentUser() user: { id: string },
  ) {
    await this.usersService.deleteAccount(user.id);
  }
}