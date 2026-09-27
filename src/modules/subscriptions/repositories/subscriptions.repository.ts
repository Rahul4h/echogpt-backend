import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCurrentByUserId(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
      include: {
        plan: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  findHistoryByUserId(userId: string) {
    return this.prisma.subscription.findMany({
      where: {
        userId,
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUsageSince(userId: string, startedAt: Date) {
  return this.prisma.apiUsageLog.aggregate({
    where: {
      userId,
      createdAt: {
        gte: startedAt,
      },
    },
    _sum: {
      requestCount: true,
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
    },
  });
}
}