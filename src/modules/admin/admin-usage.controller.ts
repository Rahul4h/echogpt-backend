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

import { AdminUsageService } from './admin-usage.service';
import { AdminUsageQueryDto } from './dto/admin-usage-query.dto';

@ApiTags('Admin - Usage')
@ApiBearerAuth()
@Controller('admin/usage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsageController {
  constructor(
    private readonly adminUsageService: AdminUsageService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List API usage records',
    description:
      'Returns paginated AI API usage records. Administrators can filter usage by provider, request status, user, and date range.',
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
    description: 'Number of usage records per page. Maximum 100.',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    type: String,
    example: 'OPENAI',
    description: 'Filter records by AI provider.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['SUCCESS', 'ERROR'],
    example: 'SUCCESS',
    description: 'Filter records by request status.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    example: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
    description: 'Filter records for a specific user.',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    example: '2026-09-01T00:00:00.000Z',
    description:
      'Return records created on or after this ISO 8601 timestamp.',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    example: '2026-09-29T23:59:59.999Z',
    description:
      'Return records created on or before this ISO 8601 timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage records retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: 'usage-log-uuid',
            userId: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
            provider: 'OPENAI',
            model: 'gpt-4o-mini',
            requestCount: 1,
            promptTokens: 125,
            completionTokens: 340,
            totalTokens: 465,
            status: 'SUCCESS',
            latencyMs: 842,
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
      'Invalid query parameters, date format, status, or pagination values.',
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
  status: 500,
  description: 'Unexpected server error.',
})
  getUsage(@Query() query: AdminUsageQueryDto) {
    return this.adminUsageService.findUsage(query);
  }
}