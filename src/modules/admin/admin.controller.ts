import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { ProvidersService } from '../providers/providers.service';
import { CreateProviderDto } from '../providers/dto/create-provider.dto';
import { UpdateProviderDto } from '../providers/dto/update-provider.dto';
import { SetProviderEnabledDto } from '../providers/dto/set-provider-enabled.dto';

@ApiTags('Admin - AI Providers')
@ApiBearerAuth()
@Controller('admin/providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly providersService: ProvidersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create an AI provider',
    description:
      'Creates an AI provider and securely encrypts its API key before storing it.',
  })
  @ApiResponse({
    status: 201,
    description: 'AI provider created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
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
    status: 409,
    description: 'Provider name already exists or provider configuration conflicts.',
  })
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all AI providers',
    description:
      'Returns all configured AI providers. API keys are never returned in plaintext.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI providers retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin role required.',
  })
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an AI provider',
    description: 'Returns a single AI provider by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'AI provider retrieved successfully.',
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
    description: 'AI provider not found.',
  })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an AI provider',
    description:
      'Updates provider configuration. If a new API key is supplied, it is encrypted before storage.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'AI provider updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
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
    description: 'AI provider not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Provider name already exists or configuration conflicts.',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an AI provider',
    description: 'Permanently deletes an AI provider configuration.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'AI provider deleted successfully.',
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
    description: 'AI provider not found.',
  })
  remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }

  @Patch(':id/enabled')
  @ApiOperation({
    summary: 'Enable or disable an AI provider',
    description:
      'Enables or disables an AI provider. Disabling a default provider also removes its default status.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiBody({
    type: SetProviderEnabledDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Provider enabled status updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
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
    description: 'AI provider not found.',
  })
  setEnabled(
    @Param('id') id: string,
    @Body() dto: SetProviderEnabledDto,
  ) {
    return this.providersService.setEnabled(id, dto.enabled);
  }

  @Patch(':id/default')
  @ApiOperation({
    summary: 'Set an AI provider as default',
    description:
      'Sets an enabled AI provider as the default provider. Only one provider can be default at a time.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider set as default successfully.',
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
    description: 'AI provider not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Disabled provider cannot be set as default.',
  })
  setDefault(@Param('id') id: string) {
    return this.providersService.setDefault(id);
  }

  @Get(':id/health')
  @ApiOperation({
    summary: 'Check AI provider health',
    description:
      'Checks whether the configured AI provider is reachable and its credentials are accepted.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider health check completed.',
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
    description: 'AI provider not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Disabled provider cannot be health checked.',
  })
  healthCheck(@Param('id') id: string) {
    return this.providersService.healthCheck(id);
  }
}