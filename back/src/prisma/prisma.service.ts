import { Global, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 3000;

  async onModuleInit() {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Connecting to database (attempt ${attempt}/${this.maxRetries})...`);
        await this.$connect();
        this.logger.log('Database connection established successfully');
        return;
      } catch (error) {
        this.logger.error(`Database connection failed (attempt ${attempt}/${this.maxRetries}):`, error);
        if (attempt < this.maxRetries) {
          this.logger.log(`Retrying in ${this.retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        } else {
          this.logger.error('All database connection attempts failed');
          throw error;
        }
      }
    }
  }
}

import { Module } from '@nestjs/common';
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
