import { Module } from '@nestjs/common';

import { UsageRepository } from './repositories/usage.repository';

@Module({
  providers: [UsageRepository],
  exports: [UsageRepository],
})
export class UsageModule {}