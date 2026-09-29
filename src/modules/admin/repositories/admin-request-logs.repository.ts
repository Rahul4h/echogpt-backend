import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminRequestLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findRequestLogs(params: {
    page: number;
    limit: number;
    status?: 'SUCCESS' | 'ERROR';
    method?: string;
    statusCode?: number;
    userId?: string;
    from?: Date;
    to?: Date;
  }) {
    const {
      page,
      limit,
      status,
      method,
      statusCode,
      userId,
      from,
      to,
    } = params;

    const where = {
      ...(status ? { status } : {}),
      ...(method ? { method } : {}),
      ...(statusCode !== undefined ? { statusCode } : {}),
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
      this.prisma.requestLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          userId: true,
          method: true,
          path: true,
          statusCode: true,
          status: true,
          latencyMs: true,
          ipAddress: true,
          userAgent: true,
          requestId: true,
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

      this.prisma.requestLog.count({
        where,
      }),
    ]);
  }
}