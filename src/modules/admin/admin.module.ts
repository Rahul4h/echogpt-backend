import { Module } from '@nestjs/common';

import { ProvidersModule } from '../providers/providers.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [ProvidersModule],
  controllers: [AdminController],
})
export class AdminModule {}