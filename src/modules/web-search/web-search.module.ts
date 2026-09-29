import { Module } from '@nestjs/common';

import { ProvidersModule } from '../providers/providers.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsageModule } from '../usage/usage.module';
import { ProviderHttpClient } from '../providers/http/provider-http.client';

import { TavilySearchAdapter } from './adapters/tavily-search.adapter';
import { SearchProviderFactory } from './adapters/search-provider.factory';
import { WebSearchRepository } from './repositories/web-search.repository';
import { WebSearchService } from './web-search.service';
import { WebSearchController } from './web-search.controller';

@Module({
  imports: [
    ProvidersModule,
    SubscriptionsModule,
    UsageModule,
  ],
  controllers: [
    WebSearchController,
  ],
  providers: [
    ProviderHttpClient,
    TavilySearchAdapter,
    SearchProviderFactory,
    WebSearchRepository,
    WebSearchService,
  ],
  exports: [
    TavilySearchAdapter,
    SearchProviderFactory,
    WebSearchRepository,
    WebSearchService,
  ],
})
export class WebSearchModule {}