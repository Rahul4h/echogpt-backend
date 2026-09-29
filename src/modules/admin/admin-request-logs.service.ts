import { Injectable } from '@nestjs/common';

import { AdminRequestLogsRepository } from './repositories/admin-request-logs.repository';

@Injectable()
export class AdminRequestLogsService {
  constructor(
    private readonly adminRequestLogsRepository: AdminRequestLogsRepository,
  ) {}

  async findRequestLogs(params: {
    page: number;
    limit: number;
    status?: 'SUCCESS' | 'ERROR';
    method?: string;
    statusCode?: number;
    userId?: string;
    from?: string;
    to?: string;
  }) {
    const [logs, total] =
      await this.adminRequestLogsRepository.findRequestLogs({
        page: params.page,
        limit: params.limit,
        status: params.status,
        method: params.method,
        statusCode: params.statusCode,
        userId: params.userId,
        from: params.from ? new Date(params.from) : undefined,
        to: params.to ? new Date(params.to) : undefined,
      });

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: logs,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }
}