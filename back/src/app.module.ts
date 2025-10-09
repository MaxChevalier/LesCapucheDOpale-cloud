import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users.module';
import { PrismaModule } from './prisma/prisma.service';
import { AuthModule } from './modules/auth.module';

@Module({
  imports: [PrismaModule, UsersModule,AuthModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
