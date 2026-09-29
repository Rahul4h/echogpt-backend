import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminDashboardController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get admin dashboard',
    description:
      'Returns system-wide statistics including users, subscriptions, chat usage, AI provider performance, and recent request errors.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard retrieved successfully.',
    schema: {
      example: {
        users: {
          total: 150,
          active: 127,
        },
        subscriptions: [
          {
            status: 'ACTIVE',
            count: 120,
          },
          {
            status: 'CANCELLED',
            count: 15,
          },
          {
            status: 'EXPIRED',
            count: 10,
          },
          {
            status: 'TRIAL',
            count: 5,
          },
        ],
        chat: {
          requestCount: 1840,
        },
        providers: {
          successRate: 96.52,
          failureRate: 3.48,
          averageLatencyMs: 842.35,
        },
        recentErrors: [
          {
            id: '7f5c3e21-2c8a-4f1a-9a72-123456789abc',
            method: 'POST',
            path: '/api/v1/chat',
            statusCode: 502,
            latencyMs: 1200,
            requestId: 'req-8f21c4',
            createdAt: '2026-09-29T10:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin role required.',
  })
  getDashboard() {
    return this.adminService.getDashboard();
  }
}