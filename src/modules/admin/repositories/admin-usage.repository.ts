import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUsage(params: {
    page: number;
    limit: number;
    provider?: string;
    status?: 'SUCCESS' | 'ERROR';
    userId?: string;
    from?: Date;
    to?: Date;
  }) {
    const {
      page,
      limit,
      provider,
      status,
      userId,
      from,
      to,
    } = params;

    const where = {
      ...(provider ? { provider } : {}),
      ...(status ? { status } : {}),
      ...(userId ? { userId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    return Promise.all([
      this.prisma.apiUsageLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          userId: true,
          provider: true,
          model: true,
          requestCount: true,
          promptTokens: true,
          completionTokens: true,
          totalTokens: true,
          status: true,
          latencyMs: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),

      this.prisma.apiUsageLog.count({
        where,
      }),
    ]);
  }
}