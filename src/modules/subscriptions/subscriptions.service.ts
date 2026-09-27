import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SubscriptionsRepository } from './repositories/subscriptions.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async getCurrentSubscription(userId: string) {
    const subscription =
      await this.subscriptionsRepository.findCurrentByUserId(
        userId,
      );

    if (!subscription) {
      throw new NotFoundException(
        'Active subscription not found',
      );
    }

    return {
      id: subscription.id,
      status: subscription.status,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        description: subscription.plan.description,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        requestLimit: subscription.plan.requestLimit,
        tokenLimit: subscription.plan.tokenLimit,
      },
    };
  }



  async getCurrentUsage(userId: string) {
  const subscription =
    await this.subscriptionsRepository.findCurrentByUserId(
      userId,
    );

  if (!subscription) {
    throw new NotFoundException(
      'Active subscription not found',
    );
  }

  const usage =
    await this.subscriptionsRepository.getUsageSince(
      userId,
      subscription.startedAt,
    );

  const requestsUsed = usage._sum.requestCount ?? 0;
  const promptTokensUsed = usage._sum.promptTokens ?? 0;
  const completionTokensUsed =
    usage._sum.completionTokens ?? 0;
  const totalTokensUsed = usage._sum.totalTokens ?? 0;

  const requestLimit = subscription.plan.requestLimit;
  const tokenLimit = subscription.plan.tokenLimit;

  return {
    subscription: {
      id: subscription.id,
      status: subscription.status,
      plan: subscription.plan.name,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
    },

    requests: {
      used: requestsUsed,
      limit: requestLimit,
      remaining:
        requestLimit === null
          ? null
          : Math.max(requestLimit - requestsUsed, 0),
    },

    tokens: {
      promptUsed: promptTokensUsed,
      completionUsed: completionTokensUsed,
      totalUsed: totalTokensUsed,
      limit: tokenLimit,
      remaining:
        tokenLimit === null
          ? null
          : Math.max(tokenLimit - totalTokensUsed, 0),
    },
  };
}

  async getSubscriptionHistory(userId: string) {
    const subscriptions =
      await this.subscriptionsRepository.findHistoryByUserId(
        userId,
      );

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      cancelledAt: subscription.cancelledAt,
      createdAt: subscription.createdAt,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        description: subscription.plan.description,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        requestLimit: subscription.plan.requestLimit,
        tokenLimit: subscription.plan.tokenLimit,
      },
    }));
  }
}