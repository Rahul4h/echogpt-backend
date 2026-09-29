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

import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current subscription',
    description:
      'Returns the currently authenticated user subscription and plan details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current subscription retrieved successfully.',
    schema: {
      example: {
        id: 'subscription-uuid',
        status: 'ACTIVE',
        startedAt: '2026-09-01T00:00:00.000Z',
        expiresAt: null,
        plan: {
          id: 'plan-uuid',
          name: 'FREE',
          description: 'Free subscription plan',
          price: 0,
          currency: 'USD',
          requestLimit: 100,
          tokenLimit: 100000,
        },
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
    description: 'No active subscription was found for the user.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  getCurrentSubscription(
    @CurrentUser() user: { id: string },
  ) {
    return this.subscriptionsService.getCurrentSubscription(
      user.id,
    );
  }

  @Get('me/history')
  @ApiOperation({
    summary: 'Get subscription history',
    description:
      'Returns the subscription history of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Subscription history retrieved successfully. Returns an empty array when no subscription history exists.',
    schema: {
      example: [
        {
          id: 'subscription-uuid',
          status: 'ACTIVE',
          startedAt: '2026-09-01T00:00:00.000Z',
          expiresAt: null,
          cancelledAt: null,
          createdAt: '2026-09-01T00:00:00.000Z',
          plan: {
            id: 'plan-uuid',
            name: 'FREE',
            description: 'Free subscription plan',
            price: 0,
            currency: 'USD',
            requestLimit: 100,
            tokenLimit: 100000,
          },
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
    status: 500,
    description: 'Unexpected server error.',
  })
  getSubscriptionHistory(
    @CurrentUser() user: { id: string },
  ) {
    return this.subscriptionsService.getSubscriptionHistory(
      user.id,
    );
  }

  @Get('me/usage')
  @ApiOperation({
    summary: 'Get current subscription usage',
    description:
      'Returns the authenticated user request and token usage, including limits and remaining capacity.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Current subscription usage retrieved successfully.',
    schema: {
      example: {
        subscription: {
          id: 'subscription-uuid',
          status: 'ACTIVE',
          plan: 'FREE',
          startedAt: '2026-09-01T00:00:00.000Z',
          expiresAt: null,
        },
        requests: {
          used: 25,
          limit: 100,
          remaining: 75,
        },
        tokens: {
          promptUsed: 12000,
          completionUsed: 8000,
          totalUsed: 20000,
          limit: 100000,
          remaining: 80000,
        },
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
    description: 'No active subscription was found for the user.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  getCurrentUsage(
    @CurrentUser() user: { id: string },
  ) {
    return this.subscriptionsService.getCurrentUsage(
      user.id,
    );
  }
}