import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { AppLogger } from './common/logger/app.logger';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { AdminModule } from './modules/admin/admin.module';
import { ChatModule } from './modules/chat/chat.module';
import { UsageModule } from './modules/usage/usage.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    PrismaModule,

    HealthModule,
    
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    EncryptionModule,
    ProvidersModule,
    UsageModule,
    ChatModule,
    AdminModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    
    AppLogger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
  provide: APP_INTERCEPTOR,
  useClass: RequestLoggingInterceptor,
   },
  ],
})
export class AppModule {}