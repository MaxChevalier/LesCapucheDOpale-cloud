import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiTags('Health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck(): { 
    status: string; 
    timestamp: string; 
    service: string; 
    database: { connected: boolean; status: string };
  } {
    const dbConnected = this.prisma.isDatabaseConnected();
    return {
      status: dbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'capuchesdopale-api',
      database: {
        connected: dbConnected,
        status: dbConnected ? 'connected' : 'disconnected',
      },
    };
  }
}
