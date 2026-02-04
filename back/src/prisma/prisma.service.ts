import { Global, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 3000;
  private isConnected = false;

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(): Promise<void> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Connecting to database (attempt ${attempt}/${this.maxRetries})...`);
        await this.$connect();
        this.logger.log('Database connection established successfully');
        this.isConnected = true;
        return;
      } catch (error) {
        this.logger.error(`Database connection failed (attempt ${attempt}/${this.maxRetries}):`, error);
        if (attempt < this.maxRetries) {
          this.logger.log(`Retrying in ${this.retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        } else {
          this.logger.error('All database connection attempts failed - running in degraded mode');
          this.isConnected = false;
          // Don't throw - let the app start in degraded mode
          // Database operations will fail gracefully with proper error responses
        }
      }
    }
  }

  /**
   * Check if database is connected
   */
  isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Attempt to reconnect to the database
   */
  async reconnect(): Promise<boolean> {
    this.logger.log('Attempting to reconnect to database...');
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Database reconnection successful');
      return true;
    } catch (error) {
      this.logger.error('Database reconnection failed:', error);
      this.isConnected = false;
      return false;
    }
  }
}

import { Module } from '@nestjs/common';
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
