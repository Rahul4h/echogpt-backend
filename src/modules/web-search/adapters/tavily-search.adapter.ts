import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  SearchProviderAdapter,
  SearchRequest,
  SearchResponse,
} from './search-provider.adapter';

import { ProviderHttpClient } from '../../providers/http/provider-http.client';

interface TavilySearchResponse {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
  }>;
}

@Injectable()
export class TavilySearchAdapter
  implements SearchProviderAdapter
{
  private readonly baseUrl =
    'https://api.tavily.com/search';

  constructor(
    private readonly httpClient: ProviderHttpClient,
    private readonly configService: ConfigService,
  ) {}

  async search(
    request: SearchRequest,
  ): Promise<SearchResponse> {
    const apiKey =
      this.configService.get<string>(
        'tavily.apiKey',
      );

    if (!apiKey) {
      throw new Error(
        'Tavily API key is not configured',
      );
    }

    const response =
      await this.httpClient.request<TavilySearchResponse>(
        this.baseUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: apiKey,
            query: request.query,
          }),
        },
      );

    return {
      query: request.query,
      results:
        response.results?.map((result) => ({
          title: result.title ?? '',
          url: result.url ?? '',
          content: result.content ?? '',
        })) ?? [],
    };
  }
}