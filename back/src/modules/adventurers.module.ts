import { Module } from '@nestjs/common';
import { AdventurersService } from '../services/adventurers.service';
import { AdventurersController } from '../controllers/adventurers.controller';
import { PrismaModule } from '../prisma/prisma.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdventurersController],
  providers: [AdventurersService],
})
export class AdventurersModule {}
