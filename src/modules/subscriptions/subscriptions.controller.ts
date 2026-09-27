import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
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
  getCurrentSubscription(
    @CurrentUser() user: { id: string },
  ) {
    return this.subscriptionsService.getCurrentSubscription(
      user.id,
    );
  }

  @Get('me/history')
  getSubscriptionHistory(
    @CurrentUser() user: { id: string },
  ) {
    return this.subscriptionsService.getSubscriptionHistory(
      user.id,
    );
  }



  @Get('me/usage')
getCurrentUsage(
  @CurrentUser() user: { id: string },
) {
  return this.subscriptionsService.getCurrentUsage(
    user.id,
  );
}
}