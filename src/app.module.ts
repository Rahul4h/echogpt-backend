import { Module } from '@nestjs/common';
import { AppController, HeaderUserGuard } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService, HeaderUserGuard],
})
export class AppModule {}