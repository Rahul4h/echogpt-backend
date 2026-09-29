import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AdminRequestLogsService } from './admin-request-logs.service';
import { AdminRequestLogsQueryDto } from './dto/admin-request-logs-query.dto';

@ApiTags('Admin - Request Logs')
@ApiBearerAuth()
@Controller('admin/request-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminRequestLogsController {
  constructor(
    private readonly adminRequestLogsService: AdminRequestLogsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List request logs',
    description:
      'Returns paginated HTTP request logs. Administrators can filter logs by request status, HTTP method, status code, user, and date range.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Number of request logs per page. Maximum 100.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['SUCCESS', 'ERROR'],
    example: 'ERROR',
    description: 'Filter logs by request status.',
  })
  @ApiQuery({
    name: 'method',
    required: false,
    type: String,
    example: 'POST',
    description: 'Filter logs by HTTP method.',
  })
  @ApiQuery({
    name: 'statusCode',
    required: false,
    type: Number,
    example: 500,
    description: 'Filter logs by HTTP status code.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    example: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
    description: 'Filter logs for a specific user.',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    example: '2026-09-01T00:00:00.000Z',
    description:
      'Return logs created on or after this ISO 8601 timestamp.',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    example: '2026-09-29T23:59:59.999Z',
    description:
      'Return logs created on or before this ISO 8601 timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Request logs retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: 'request-log-uuid',
            userId: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
            method: 'POST',
            path: '/api/v1/chat',
            statusCode: 500,
            status: 'ERROR',
            latencyMs: 1240,
            ipAddress: '192.168.1.10',
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            requestId: 'req-8f21c4',
            createdAt: '2026-09-29T10:30:00.000Z',
            user: {
              id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
              email: 'rahul@example.com',
              name: 'Rahul Ghosh',
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid query parameters, status code, date format, or pagination values.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin role required.',
  })
  getRequestLogs(@Query() query: AdminRequestLogsQueryDto) {
    return this.adminRequestLogsService.findRequestLogs(query);
  }
}