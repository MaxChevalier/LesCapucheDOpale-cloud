import { Module } from '@nestjs/common';
import { QuestsController } from '../controllers/quests.controller';
import { QuestsService } from '../services/quests.service';
import { PrismaModule } from '../prisma/prisma.service';
import { AuthModule } from './auth.module';
import { FinancesModule } from './finances.module';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Module({
  imports: [PrismaModule, AuthModule, FinancesModule],
  controllers: [QuestsController],
  providers: [QuestsService, JwtAuthGuard, RolesGuard],
})
export class QuestsModule {}
