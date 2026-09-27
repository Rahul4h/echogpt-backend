import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

@Injectable()
export class ProviderHttpClient {
  private readonly timeoutMs = 30_000;
  private readonly maxRetries = 2;

  async request<T>(
    url: string,
    options: RequestInit,
  ): Promise<T> {
    let lastError: unknown;

    for (
      let attempt = 0;
      attempt <= this.maxRetries;
      attempt++
    ) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        const responseText = await response.text();

        let data: unknown;

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          data = {};
        }

        if (response.ok) {
          return data as T;
        }

        if (!this.isRetryableStatus(response.status)) {
          throw this.mapHttpError(
            response.status,
            data,
          );
        }

        lastError = this.mapHttpError(
          response.status,
          data,
        );
      } catch (error) {
        if (
          error instanceof BadGatewayException ||
          error instanceof ServiceUnavailableException ||
          error instanceof GatewayTimeoutException
        ) {
          lastError = error;
        } else {
          lastError = new ServiceUnavailableException(
            'AI provider request failed',
          );
        }
      }

      if (attempt < this.maxRetries) {
        await this.sleep(500 * 2 ** attempt);
      }
    }

    throw (
      lastError ??
      new ServiceUnavailableException(
        'AI provider request failed',
      )
    );
  }

  private isRetryableStatus(status: number): boolean {
    return (
      status === 408 ||
      status === 429 ||
      status >= 500
    );
  }

  private mapHttpError(
    status: number,
    data: unknown,
  ) {
    if (status === 408) {
      return new GatewayTimeoutException(
        'AI provider request timed out',
      );
    }

    if (status === 429) {
      return new ServiceUnavailableException(
        'AI provider rate limit exceeded',
      );
    }

    if (status >= 500) {
      return new BadGatewayException(
        'AI provider is currently unavailable',
      );
    }

    return new BadGatewayException(
      this.extractProviderError(data),
    );
  }

  private extractProviderError(data: unknown): string {
    if (
      typeof data === 'object' &&
      data !== null &&
      'error' in data
    ) {
      const error = (
        data as {
          error?: {
            message?: string;
          };
        }
      ).error;

      if (error?.message) {
        return `AI provider error: ${error.message}`;
      }
    }

    return 'AI provider request failed';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, ms),
    );
  }
}