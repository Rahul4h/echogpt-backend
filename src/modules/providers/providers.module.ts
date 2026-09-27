import { Module } from '@nestjs/common';

import { ProvidersRepository } from './repositories/providers.repository';
import { ProvidersService } from './providers.service';
import { ProviderHttpClient } from './http/provider-http.client';
import { ProviderAdapterFactory } from './adapters/provider-adapter.factory';

@Module({
  providers: [
    ProvidersRepository,
    ProvidersService,
    ProviderHttpClient,
    ProviderAdapterFactory,
  ],
  exports: [
    ProvidersService,
    ProviderHttpClient,
    ProviderAdapterFactory,
  ],
})
export class ProvidersModule {}