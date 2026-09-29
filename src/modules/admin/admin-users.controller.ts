
import {
  Controller,
  Get,
  Query,
  Param,
  Patch,
  Body,
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

import { AdminUsersService } from './admin-users.service';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';


@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(
    private readonly adminUsersService: AdminUsersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List users',
    description:
      'Returns a paginated list of users with optional search, role filtering, and sorting.',
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
    description: 'Number of users per page. Maximum 100.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'rahul',
    description: 'Search by user name or email.',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['USER', 'ADMIN'],
    example: 'USER',
    description: 'Filter users by role.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'email', 'name'],
    example: 'createdAt',
    description: 'Field used to sort users.',
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
    description: 'Users retrieved successfully.',
    schema: {
      example: {
        data: [
          {
            id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
            email: 'rahul@example.com',
            name: 'Rahul',
            role: 'USER',
            emailVerified: true,
            createdAt: '2026-09-29T08:00:00.000Z',
            updatedAt: '2026-09-29T08:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 5,
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
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminUsersService.findUsers(query);
  }


  @Patch(':id/role')
@ApiOperation({
  summary: 'Update user role',
  description: 'Updates the role of a user. Only administrators can perform this action.',
})
@ApiResponse({
  status: 200,
  description: 'User role updated successfully.',
  schema: {
    example: {
      id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
      email: 'rahul@example.com',
      name: 'Rahul Ghosh',
      role: 'ADMIN',
      emailVerified: false,
      createdAt: '2026-09-29T08:00:00.000Z',
      updatedAt: '2026-09-29T08:15:00.000Z',
    },
  },
})
@ApiResponse({
  status: 400,
  description: 'Invalid user ID or role.',
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
  status: 404,
  description: 'User not found.',
})
updateUserRole(
  @Param('id') id: string,
  @Body() dto: UpdateUserRoleDto,
) {
  return this.adminUsersService.updateUserRole(id, dto.role);
}

@Patch(':id/status')
@ApiOperation({
  summary: 'Update user status',
  description:
    'Updates the status of a user. Only administrators can perform this action.',
})
@ApiResponse({
  status: 200,
  description: 'User status updated successfully.',
  schema: {
    example: {
      id: '35bdd3ef-437e-46f9-8076-e5235b6c725f',
      email: 'rahul@example.com',
      name: 'Rahul Ghosh',
      role: 'USER',
      status: 'SUSPENDED',
      emailVerified: false,
      createdAt: '2026-09-29T08:00:00.000Z',
      updatedAt: '2026-09-29T08:15:00.000Z',
    },
  },
})
@ApiResponse({
  status: 400,
  description: 'Invalid user ID or status.',
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
  status: 404,
  description: 'User not found.',
})
updateUserStatus(
  @Param('id') id: string,
  @Body() dto: UpdateUserStatusDto,
) {
  return this.adminUsersService.updateUserStatus(id, dto.status);
}
}
