import { Module } from '@nestjs/common';

import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ProvidersModule } from '../providers/providers.module';
import { UsageModule } from '../usage/usage.module';

import { ChatRepository } from './repositories/chat.repository';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    SubscriptionsModule,
    ProvidersModule,
    UsageModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatRepository,
    ChatService,
  ],
  exports: [ChatService],
})
export class ChatModule {}