import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = console;

  log(message: any, context?: string) {
    this.logger.log(
      `[INFO] ${context ?? 'Application'}:`,
      message,
    );
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(
      `[ERROR] ${context ?? 'Application'}:`,
      message,
      trace ?? '',
    );
  }

  warn(message: any, context?: string) {
    this.logger.warn(
      `[WARN] ${context ?? 'Application'}:`,
      message,
    );
  }

  debug(message: any, context?: string) {
    this.logger.debug(
      `[DEBUG] ${context ?? 'Application'}:`,
      message,
    );
  }

  verbose(message: any, context?: string) {
    this.logger.info(
      `[VERBOSE] ${context ?? 'Application'}:`,
      message,
    );
  }
}