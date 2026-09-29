import { Injectable } from '@nestjs/common';

import { AdminSubscriptionsRepository } from './repositories/admin-subscriptions.repository';

@Injectable()
export class AdminSubscriptionsService {
  constructor(
    private readonly adminSubscriptionsRepository: AdminSubscriptionsRepository,
  ) {}

  async findSubscriptions(params: {
    page: number;
    limit: number;
    status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL';
    planId?: string;
    search?: string;
    sortBy?: 'createdAt' | 'startedAt' | 'expiresAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const [subscriptions, total] =
      await this.adminSubscriptionsRepository.findSubscriptions(params);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: subscriptions,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }
}