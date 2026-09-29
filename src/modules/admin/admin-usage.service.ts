import { Injectable } from '@nestjs/common';

import { AdminUsageRepository } from './repositories/admin-usage.repository';

@Injectable()
export class AdminUsageService {
  constructor(
    private readonly adminUsageRepository: AdminUsageRepository,
  ) {}

  async findUsage(params: {
    page: number;
    limit: number;
    provider?: string;
    status?: 'SUCCESS' | 'ERROR';
    userId?: string;
    from?: string;
    to?: string;
  }) {
    const [usage, total] =
      await this.adminUsageRepository.findUsage({
        page: params.page,
        limit: params.limit,
        provider: params.provider,
        status: params.status,
        userId: params.userId,
        from: params.from ? new Date(params.from) : undefined,
        to: params.to ? new Date(params.to) : undefined,
      });

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: usage,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }
}