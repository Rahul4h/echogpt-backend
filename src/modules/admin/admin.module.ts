import { Module } from '@nestjs/common';

import { ProvidersModule } from '../providers/providers.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './repositories/admin.repository';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersRepository } from './repositories/admin-users.repository';
import { AdminUsersController } from './admin-users.controller';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { AdminSubscriptionsRepository } from './repositories/admin-subscriptions.repository';
import { AdminUsageController } from './admin-usage.controller';
import { AdminUsageService } from './admin-usage.service';
import { AdminUsageRepository } from './repositories/admin-usage.repository';

import { AdminRequestLogsController } from './admin-request-logs.controller';
import { AdminRequestLogsService } from './admin-request-logs.service';
import { AdminRequestLogsRepository } from './repositories/admin-request-logs.repository';
import { AdminHealthController } from './admin-health.controller';
import { AdminHealthService } from './admin-health.service';
@Module({
  imports: [ProvidersModule],
  controllers: [AdminController,
    AdminDashboardController,
    AdminUsersController,
    AdminSubscriptionsController,
    AdminUsageController,
    AdminRequestLogsController,
    AdminHealthController,
  ],
  providers: [
  AdminService,
  AdminRepository,
  AdminUsersService,
  AdminUsersRepository,
  AdminSubscriptionsService,
  AdminSubscriptionsRepository,
  AdminUsageService,
  AdminUsageRepository,
  AdminRequestLogsService,
AdminRequestLogsRepository,
  AdminHealthService,
  
],
})
export class AdminModule {}