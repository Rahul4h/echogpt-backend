import { Injectable } from '@nestjs/common';

import { AdminRepository } from './repositories/admin.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
  ) {}

  async getDashboard() {
    const [
      totalUsers,
      activeUsers,
      subscriptionBreakdown,
      chatRequestCount,
      providerStats,
      recentErrors,
    ] = await Promise.all([
      this.adminRepository.getTotalUsers(),
      this.adminRepository.getActiveUsers(),
      this.adminRepository.getSubscriptionBreakdown(),
      this.adminRepository.getChatRequestCount(),
      this.adminRepository.getProviderStats(),
      this.adminRepository.getRecentErrors(),
    ]);

    const totalProviderRequests = providerStats.reduce(
      (sum, item) => sum + item._count._all,
      0,
    );

    const successfulProviderRequests = providerStats
      .filter((item) => item.status === 'SUCCESS')
      .reduce((sum, item) => sum + item._count._all, 0);

    const failedProviderRequests = providerStats
      .filter((item) => item.status === 'ERROR')
      .reduce((sum, item) => sum + item._count._all, 0);

    const providerSuccessRate =
      totalProviderRequests > 0
        ? (successfulProviderRequests / totalProviderRequests) * 100
        : 0;

    const providerFailureRate =
      totalProviderRequests > 0
        ? (failedProviderRequests / totalProviderRequests) * 100
        : 0;

    const latencyValues = providerStats
      .map((item) => item._avg.latencyMs)
      .filter((latency): latency is number => latency !== null);

    const averageProviderLatency =
      latencyValues.length > 0
        ? latencyValues.reduce((sum, latency) => sum + latency, 0) /
          latencyValues.length
        : 0;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },

      subscriptions: subscriptionBreakdown.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),

      chat: {
        requestCount: chatRequestCount._sum.requestCount ?? 0,
      },

      providers: {
        successRate: Number(providerSuccessRate.toFixed(2)),
        failureRate: Number(providerFailureRate.toFixed(2)),
        averageLatencyMs: Number(averageProviderLatency.toFixed(2)),
      },

      recentErrors,
    };
  }
}