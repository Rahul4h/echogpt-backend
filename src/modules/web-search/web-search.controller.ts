import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { WebSearchDto } from './dto/web-search.dto';
import { WebSearchService } from './web-search.service';

@ApiTags('Web Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('web-search')
export class WebSearchController {
  constructor(
    private readonly webSearchService: WebSearchService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Perform an AI-assisted web search',
    description:
      'Searches the web using the configured search provider, sends the search context to the selected AI provider, and returns an AI-generated answer with source URLs. The request consumes subscription usage.',
  })
  @ApiBody({
    type: WebSearchDto,
    description:
      'Web search query and optional AI provider/model selection.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Web search completed successfully.',
    schema: {
      example: {
        query:
          'What are the best practices for NestJS authentication?',
        answer:
          'NestJS authentication commonly uses Passport strategies, JWT access tokens, refresh tokens, password hashing, and role-based authorization.',
        provider: {
          type: 'OPENAI',
          model: 'gpt-5',
        },
        sources: [
          {
            title: 'Authentication | NestJS',
            url: 'https://docs.nestjs.com/security/authentication',
          },
          {
            title: 'Authorization | NestJS',
            url: 'https://docs.nestjs.com/security/authorization',
          },
        ],
        resultCount: 5,
        latencyMs: 842,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request body. For example, query is missing or outside the allowed length.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication required. A valid JWT access token must be provided.',
  })
  @ApiResponse({
    status: 409,
    description:
      'The search request cannot be processed because the subscription request limit was reached or the selected AI provider is not configured correctly.',
    schema: {
      examples: {
        requestLimitExceeded: {
          summary: 'Request limit exceeded',
          value: {
            statusCode: 409,
            message:
              'Monthly request limit reached',
          },
        },
        providerKeyMissing: {
          summary: 'Provider API key missing',
          value: {
            statusCode: 409,
            message:
              'AI provider API key is not configured',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 502,
    description:
      'The external web-search or AI provider request failed.',
    schema: {
      example: {
        statusCode: 502,
        message:
          'AI-assisted web search request failed',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description:
      'Unexpected server error.',
  })
  search(
    @CurrentUser() user: { id: string },
    @Body() dto: WebSearchDto,
  ) {
    return this.webSearchService.search(
      user.id,
      dto,
    );
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get web search history',
    description:
      'Returns the authenticated user’s web search history, ordered from newest to oldest. The service currently returns up to 20 records.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Web search history retrieved successfully.',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId:
            '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          providerId:
            '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          query:
            'What are the best practices for NestJS authentication?',
          pageUrl: null,
          pageContext: null,
          status: 'SUCCESS',
          resultCount: 5,
          latencyMs: 842,
          createdAt:
            '2026-09-29T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication required.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Unexpected server error.',
  })
  getHistory(
    @CurrentUser() user: { id: string },
  ) {
    return this.webSearchService.getHistory(
      user.id,
    );
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent web searches',
    description:
      'Returns the authenticated user’s most recent web searches, ordered from newest to oldest. The service currently returns up to 10 records.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Recent searches retrieved successfully.',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId:
            '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          providerId:
            '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          query:
            'How does JWT authentication work?',
          pageUrl: null,
          pageContext: null,
          status: 'SUCCESS',
          resultCount: 5,
          latencyMs: 615,
          createdAt:
            '2026-09-29T10:25:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication required.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Unexpected server error.',
  })
  getRecent(
    @CurrentUser() user: { id: string },
  ) {
    return this.webSearchService.getRecent(
      user.id,
    );
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get search suggestions',
    description:
      'Returns previous search queries from the authenticated user that contain the provided search text. Results are ordered from newest to oldest and limited to 10 records.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    example: 'nestjs',
    description:
      'Text used to find matching previous search queries.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Search suggestions retrieved successfully.',
    schema: {
      example: [
        {
          query:
            'NestJS authentication best practices',
        },
        {
          query:
            'NestJS JWT authentication',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Authentication required.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Unexpected server error.',
  })
  getSuggestions(
    @CurrentUser() user: { id: string },
    @Query('q') query: string,
  ) {
    return this.webSearchService.getSuggestions(
      user.id,
      query,
    );
  }
}