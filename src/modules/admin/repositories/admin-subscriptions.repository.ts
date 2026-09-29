import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminSubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSubscriptions(params: {
    page: number;
    limit: number;
    status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
    planId?: string;
    search?: string;
    sortBy?: 'createdAt' | 'startedAt' | 'expiresAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      status,
      planId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where = {
      ...(status ? { status } : {}),
      ...(planId ? { planId } : {}),
      ...(search
        ? {
            user: {
              OR: [
                {
                  email: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  name: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            },
          }
        : {}),
    };

    return Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          status: true,
          startedAt: true,
          expiresAt: true,
          cancelledAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
              currency: true,
              requestLimit: true,
              tokenLimit: true,
            },
          },
        },
      }),

      this.prisma.subscription.count({
        where,
      }),
    ]);
  }
}