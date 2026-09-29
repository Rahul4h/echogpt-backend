import { Injectable } from '@nestjs/common';

import {
  SearchProviderAdapter,
  SearchProviderType,
} from './search-provider.adapter';

import { TavilySearchAdapter } from './tavily-search.adapter';

@Injectable()
export class SearchProviderFactory {
  constructor(
    private readonly tavilySearchAdapter: TavilySearchAdapter,
  ) {}

  create(
    type: SearchProviderType,
  ): SearchProviderAdapter {
    switch (type) {
      case 'TAVILY':
        return this.tavilySearchAdapter;

      default:
        throw new Error(
          `Unsupported search provider: ${type}`,
        );
    }
  }
}