import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  getTotalUsers() {
    return this.prisma.user.count();
  }

  getActiveUsers() {
    return this.prisma.user.count({
      where: {
        sessions: {
          some: {
            status: 'ACTIVE',
            expiresAt: {
              gt: new Date(),
            },
          },
        },
      },
    });
  }

  getSubscriptionBreakdown() {
    return this.prisma.subscription.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });
  }

  getChatRequestCount() {
    return this.prisma.apiUsageLog.aggregate({
      _sum: {
        requestCount: true,
      },
    });
  }

  getProviderStats() {
    return this.prisma.apiUsageLog.groupBy({
      by: ['provider', 'status'],
      _count: {
        _all: true,
      },
      _avg: {
        latencyMs: true,
      },
    });
  }

  getRecentErrors() {
    return this.prisma.requestLog.findMany({
      where: {
        status: 'ERROR',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        method: true,
        path: true,
        statusCode: true,
        latencyMs: true,
        requestId: true,
        createdAt: true,
      },
    });
  }
}