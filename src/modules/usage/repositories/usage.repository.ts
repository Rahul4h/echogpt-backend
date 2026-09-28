import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  createApiUsageLog(data: {
    userId?: string;
    provider?: string;
    model?: string;
    requestCount?: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    status: 'SUCCESS' | 'ERROR';
    latencyMs?: number;
  }) {
    return this.prisma.apiUsageLog.create({
      data,
    });
  }

  createRequestLog(data: {
    userId?: string;
    method: string;
    path: string;
    statusCode: number;
    status: 'SUCCESS' | 'ERROR';
    latencyMs?: number;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }) {
    return this.prisma.requestLog.create({
      data,
    });
  }
}