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
      'Creates an AI provider. The supplied API key is encrypted before storage and is never returned in plaintext.',
  })
  @ApiBody({
    type: CreateProviderDto,
  })
  @ApiResponse({
    status: 201,
    description: 'AI provider created successfully.',
    schema: {
      example: {
        id: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
        name: 'OpenAI Primary',
        type: 'OPENAI',
        baseUrl: 'https://api.openai.com/v1',
        modelName: 'gpt-5',
        enabled: true,
        isDefault: true,
        apiKey: '****',
        createdAt: '2026-09-29T10:30:00.000Z',
        updatedAt: '2026-09-29T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request data. For example, the provider name, type, URL, or API key does not satisfy the validation rules.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description:
      'The authenticated user does not have the ADMIN role.',
  })
  @ApiResponse({
    status: 409,
    description:
      'The provider name already exists, or a disabled provider was requested as the default provider.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all AI providers',
    description:
      'Returns all configured AI providers. Stored API keys are never returned in plaintext.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI providers retrieved successfully.',
    schema: {
      example: [
        {
          id: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
          name: 'OpenAI Primary',
          type: 'OPENAI',
          baseUrl: 'https://api.openai.com/v1',
          modelName: 'gpt-5',
          enabled: true,
          isDefault: true,
          apiKey: '****',
          createdAt: '2026-09-29T10:30:00.000Z',
          updatedAt: '2026-09-29T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description:
      'The authenticated user does not have the ADMIN role.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  findAll() {
    return this.providersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an AI provider',
    description:
      'Returns a single AI provider by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID.',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'AI provider retrieved successfully.',
    schema: {
      example: {
        id: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
        name: 'OpenAI Primary',
        type: 'OPENAI',
        baseUrl: 'https://api.openai.com/v1',
        modelName: 'gpt-5',
        enabled: true,
        isDefault: true,
        apiKey: '****',
        createdAt: '2026-09-29T10:30:00.000Z',
        updatedAt: '2026-09-29T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description:
      'The authenticated user does not have the ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'AI provider was not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an AI provider',
    description:
      'Updates an AI provider configuration. If a new API key is supplied, it is encrypted before storage.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID.',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiBody({
    type: UpdateProviderDto,
  })
  @ApiResponse({
    status: 200,
    description: 'AI provider updated successfully.',
    schema: {
      example: {
        id: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
        name: 'OpenAI Production',
        type: 'OPENAI',
        baseUrl: 'https://api.openai.com/v1',
        modelName: 'gpt-5',
        enabled: true,
        isDefault: true,
        apiKey: '****',
        createdAt: '2026-09-29T10:30:00.000Z',
        updatedAt: '2026-09-29T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request data. For example, the provider type, URL, or API key does not satisfy the validation rules.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description:
      'The authenticated user does not have the ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'AI provider was not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Another AI provider already uses the requested name.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
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
    description:
      'Permanently deletes an AI provider configuration.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID.',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'AI provider deleted successfully.',
    schema: {
      example: {
        message: 'Provider deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description:
      'The authenticated user does not have the ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'AI provider was not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }

  @Patch(':id/enabled')
  @ApiOperation({
    summary: 'Enable or disable an AI provider',
    description:
      'Changes the enabled state of an AI provider. Disabling a provider also removes its default status when applicable.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID.',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiBody({
    type: SetProviderEnabledDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Provider enabled status updated successfully.',
    schema: {
      example: {
        id: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
        name: 'OpenAI Primary',
        type: 'OPENAI',
        baseUrl: 'https://api.openai.com/v1',
        modelName: 'gpt-5',
        enabled: false,
        isDefault: false,
        apiKey: '****',
        createdAt: '2026-09-29T10:30:00.000Z',
        updatedAt: '2026-09-29T11:10:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description:
      'The authenticated user does not have the ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'AI provider was not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
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
      'Sets an enabled AI provider as the default provider. The provider must exist and be enabled.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID.',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider set as default successfully.',
    schema: {
      example: {
        id: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
        name: 'OpenAI Primary',
        type: 'OPENAI',
        baseUrl: 'https://api.openai.com/v1',
        modelName: 'gpt-5',
        enabled: true,
        isDefault: true,
        apiKey: '****',
        createdAt: '2026-09-29T10:30:00.000Z',
        updatedAt: '2026-09-29T11:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description:
      'The authenticated user does not have the ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'AI provider was not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'The provider is disabled and therefore cannot be set as the default provider.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  setDefault(@Param('id') id: string) {
    return this.providersService.setDefault(id);
  }

  @Get(':id/health')
  @ApiOperation({
    summary: 'Check AI provider health',
    description:
      'Checks whether the configured AI provider is reachable and whether its credentials are accepted.',
  })
  @ApiParam({
    name: 'id',
    description: 'AI provider UUID.',
    example: 'a7f2d7c4-8c8a-4a3f-9f12-123456789abc',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider health check completed.',
    schema: {
      example: {
        healthy: true,
        provider: 'OPENAI',
        latencyMs: 342,
        message: 'Provider is healthy',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication is required or the access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description:
      'The authenticated user does not have the ADMIN role.',
  })
  @ApiResponse({
    status: 404,
    description: 'AI provider was not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'The provider is disabled and cannot be health checked.',
  })
  @ApiResponse({
    status: 500,
    description:
      'The provider health check failed because of an unexpected server or provider adapter error.',
  })
  healthCheck(@Param('id') id: string) {
    return this.providersService.healthCheck(id);
  }
}