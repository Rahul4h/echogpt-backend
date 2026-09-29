import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminHealthService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getHealth() {
    const startedAt = Date.now();

    let database: 'healthy' | 'unhealthy' = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'unhealthy';
    }

    const databaseLatencyMs = Date.now() - startedAt;

    const isHealthy = database === 'healthy';

    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: database,
        latencyMs: databaseLatencyMs,
      },
    };

    if (!isHealthy) {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }
}