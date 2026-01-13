import { Module } from '@nestjs/common';
import { FinancesController } from '../controllers/finances.controller';
import { FinancesService } from '../services/finances.service';
import { PrismaModule } from '../prisma/prisma.service';
import { AuthModule } from './auth.module';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FinancesController],
  providers: [FinancesService, JwtAuthGuard, RolesGuard],
  exports: [FinancesService],
})
export class FinancesModule {}
