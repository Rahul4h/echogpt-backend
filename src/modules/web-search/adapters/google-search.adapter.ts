import { Injectable } from '@nestjs/common';

import {
  SearchProviderAdapter,
  SearchRequest,
  SearchResponse,
} from './search-provider.adapter';

import { ProviderHttpClient } from '../../providers/http/provider-http.client';

interface GoogleSearchResponse {
  items?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
  }>;
}

@Injectable()
export class GoogleSearchAdapter
  implements SearchProviderAdapter
{
  private readonly defaultBaseUrl =
    'https://www.googleapis.com/customsearch/v1';

  constructor(
    private readonly httpClient: ProviderHttpClient,
  ) {}

  async search(
    request: SearchRequest,
  ): Promise<SearchResponse> {
    throw new Error('Not implemented');
  }
}