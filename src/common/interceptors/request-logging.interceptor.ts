import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { Observable, finalize } from 'rxjs';

import { UsageRepository } from '../../modules/usage/repositories/usage.repository';

@Injectable()
export class RequestLoggingInterceptor
  implements NestInterceptor
{
  constructor(
    private readonly usageRepository: UsageRepository,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request =
      context.switchToHttp().getRequest();

    const response =
      context.switchToHttp().getResponse();

    const requestId = randomUUID();
    const startedAt = Date.now();

    response.setHeader(
      'X-Request-Id',
      requestId,
    );

   return next.handle().pipe(
  finalize(() => {
    const latencyMs =
      Date.now() - startedAt;

    void this.usageRepository.createRequestLog({
      userId: request.user?.id,
      method: request.method,
      path:
        request.originalUrl ??
        request.url,
      statusCode: response.statusCode,
      status:
        response.statusCode >= 400
          ? 'ERROR'
          : 'SUCCESS',
      latencyMs,
      ipAddress: request.ip,
      userAgent:
        request.headers['user-agent'],
      requestId,
    });
  }),
);
  }
}