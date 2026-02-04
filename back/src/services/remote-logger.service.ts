import { Injectable, Logger, LoggerService, LogLevel } from '@nestjs/common';

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: string;
  service: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class RemoteLoggerService implements LoggerService {
  private readonly localLogger = new Logger('RemoteLogger');
  private readonly functionUrl: string | undefined;
  private readonly serviceName = 'guild-backend';
  private readonly buffer: LogEntry[] = [];
  private readonly bufferSize = 10;
  private readonly flushInterval = 5000;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.functionUrl = process.env.LOG_FUNCTION_URL;

    if (this.functionUrl) {
      this.localLogger.log(`Remote logging enabled: ${this.functionUrl}`);
      this.startFlushTimer();
    } else {
      this.localLogger.warn('LOG_FUNCTION_URL not set - remote logging disabled');
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush().catch((err) =>
        this.localLogger.error('Failed to flush logs', err),
      );
    }, this.flushInterval);
  }

  onModuleDestroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush().catch(() => {});
  }

  log(message: string, context?: string): void {
    this.localLogger.log(message, context);
    this.addToBuffer('info', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.localLogger.error(message, trace, context);
    this.addToBuffer('error', message, context, { trace });
  }

  warn(message: string, context?: string): void {
    this.localLogger.warn(message, context);
    this.addToBuffer('warn', message, context);
  }

  debug(message: string, context?: string): void {
    this.localLogger.debug(message, context);
    this.addToBuffer('debug', message, context);
  }

  verbose(message: string, context?: string): void {
    this.localLogger.verbose(message, context);
    this.addToBuffer('debug', message, context);
  }

  setLogLevels(_levels: LogLevel[]): void {}

  private addToBuffer(
    level: LogEntry['level'],
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.functionUrl) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      service: this.serviceName,
      metadata,
    };

    this.buffer.push(entry);

    if (this.buffer.length >= this.bufferSize) {
      this.flush().catch((err) =>
        this.localLogger.error('Failed to flush logs', err),
      );
    }
  }

  private async flush(): Promise<void> {
    if (!this.functionUrl || this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer.length = 0;

    try {
      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logs),
      });

      if (!response.ok) {
        this.localLogger.warn(
          `Failed to send logs: ${response.status} ${response.statusText}`,
        );
        this.buffer.unshift(...logs);
      }
    } catch (error) {
      this.localLogger.warn('Failed to send logs to Azure Function', error);
      if (this.buffer.length < 100) {
        this.buffer.unshift(...logs);
      }
    }
  }

  async sendImmediate(
    level: LogEntry['level'],
    message: string,
    context?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.functionUrl) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      service: this.serviceName,
      metadata,
    };

    try {
      await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      this.localLogger.warn('Failed to send immediate log', error);
    }
  }
}

