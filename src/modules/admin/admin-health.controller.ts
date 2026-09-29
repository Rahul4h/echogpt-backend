import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
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

import { AdminHealthService } from './admin-health.service';

@ApiTags('Admin - Health')
@ApiBearerAuth()
@Controller('admin/health')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminHealthController {
  constructor(
    private readonly adminHealthService: AdminHealthService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get system health',
    description:
      'Checks the application health and verifies that the PostgreSQL database is reachable. This endpoint is restricted to administrators.',
  })
  @ApiResponse({
    status: 200,
    description: 'System is healthy.',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2026-09-29T10:30:00.000Z',
        uptimeSeconds: 8420,
        database: {
          status: 'healthy',
          latencyMs: 4,
        },
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
  @ApiResponse({
    status: 503,
    description: 'One or more system dependencies are unavailable.',
    schema: {
      example: {
        statusCode: 503,
        message: {
          status: 'unhealthy',
          timestamp: '2026-09-29T10:30:00.000Z',
          uptimeSeconds: 8420,
          database: {
            status: 'unhealthy',
            latencyMs: 1502,
          },
        },
      },
    },
  })
  getHealth() {
    return this.adminHealthService.getHealth();
  }
}