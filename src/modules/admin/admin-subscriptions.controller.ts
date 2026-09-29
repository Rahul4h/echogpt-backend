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

import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { AdminSubscriptionsQueryDto } from './dto/admin-subscriptions-query.dto';

@ApiTags('Admin - Subscriptions')
@ApiBearerAuth()
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminSubscriptionsController {
  constructor(
    private readonly adminSubscriptionsService: AdminSubscriptionsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List subscriptions',
    description:
      'Returns a paginated list of subscriptions with optional status, plan, user search, and sorting filters.',
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
    example: 10,
    description: 'Number of subscriptions per page. Maximum 100.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL'],
    example: 'ACTIVE',
    description: 'Filter subscriptions by status.',
  })
  @ApiQuery({
    name: 'planId',
    required: false,
    type: String,
    example: 'plan-uuid',
    description: 'Filter subscriptions by plan ID.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'rahul',
    description: 'Search by user name or email.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'startedAt', 'expiresAt'],
    example: 'createdAt',
    description: 'Field used to sort subscriptions.',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
    description: 'Sort direction.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: 'subscription-uuid',
            status: 'ACTIVE',
            startedAt: '2026-09-29T08:00:00.000Z',
            expiresAt: null,
            cancelledAt: null,
            createdAt: '2026-09-29T08:00:00.000Z',
            updatedAt: '2026-09-29T08:00:00.000Z',
            user: {
              id: 'user-uuid',
              email: 'rahul@example.com',
              name: 'Rahul Ghosh',
            },
            plan: {
              id: 'plan-uuid',
              name: 'Premium',
              price: '19.99',
              currency: 'USD',
              requestLimit: 1000,
              tokenLimit: 100000,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin role required.',
  })
  getSubscriptions(@Query() query: AdminSubscriptionsQueryDto) {
    return this.adminSubscriptionsService.findSubscriptions(query);
  }
}