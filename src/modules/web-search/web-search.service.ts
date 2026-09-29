import {
  BadGatewayException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { SearchStatus } from '@prisma/client';

import { SearchProviderFactory } from './adapters/search-provider.factory';
import { SearchRequest } from './adapters/search-provider.adapter';
import { WebSearchRepository } from './repositories/web-search.repository';
import { WebSearchDto } from './dto/web-search.dto';

import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ProvidersService } from '../providers/providers.service';
import { UsageRepository } from '../usage/repositories/usage.repository';
import { EncryptionService } from '../../common/encryption/encryption.service';
import { ProviderAdapterFactory } from '../providers/adapters/provider-adapter.factory';

@Injectable()
export class WebSearchService {
  constructor(
    private readonly searchProviderFactory: SearchProviderFactory,
    private readonly webSearchRepository: WebSearchRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly providersService: ProvidersService,
    private readonly usageRepository: UsageRepository,
    private readonly encryptionService: EncryptionService,
    private readonly providerAdapterFactory: ProviderAdapterFactory,
  ) {}

  async search(
    userId: string,
    dto: WebSearchDto,
  ) {
    const startedAt = Date.now();

    const usage =
      await this.subscriptionsService.getCurrentUsage(
        userId,
      );

    if (
      usage.requests.remaining !== null &&
      usage.requests.remaining <= 0
    ) {
      throw new ConflictException(
        'Monthly request limit reached',
      );
    }

    const provider =
      await this.providersService.getRuntimeProvider(
        dto.providerId,
      );

    if (!provider.encryptedApiKey) {
      throw new ConflictException(
        'AI provider API key is not configured',
      );
    }

    let resultCount = 0;

    try {
      // 1. Search the web using Tavily
      const searchProvider =
        this.searchProviderFactory.create('TAVILY');

      const searchRequest: SearchRequest = {
        query: dto.query,
      };

      const searchResult =
        await searchProvider.search(searchRequest);

      resultCount = searchResult.results.length;

      // 2. Convert search results into AI context
      const searchContext =
        searchResult.results
          .map(
            (result, index) =>
              `Source ${index + 1}
Title: ${result.title}
URL: ${result.url}
Content: ${result.content}`,
          )
          .join('\n\n');

      // 3. Build prompt for selected AI provider
      const aiPrompt = `Answer the user's question using the web search results below.

Be accurate and concise. Do not invent information that is not supported by the provided search results. When appropriate, mention the source URLs.

User question:
${dto.query}

Web search results:
${searchContext}`;

      // 4. Decrypt provider API key
      const apiKey =
        this.encryptionService.decrypt(
          provider.encryptedApiKey,
        );

      // 5. Create selected AI provider adapter
      const adapter =
        this.providerAdapterFactory.create(
          provider.type,
          {
            apiKey,
            baseUrl: provider.baseUrl,
            modelName: provider.modelName,
          },
        );

      // 6. Ask selected AI provider
      const response = await adapter.chat({
        message: aiPrompt,
        model:
          dto.model ??
          provider.modelName ??
          undefined,
      });

      const latencyMs =
        Date.now() - startedAt;

      // 7. Save successful search
      await this.webSearchRepository.create({
        userId,
        providerId: provider.id,
        query: dto.query,
        status: SearchStatus.SUCCESS,
        resultCount,
        latencyMs,
      });

      // 8. Log AI provider usage
      try {
        await this.usageRepository.createApiUsageLog({
          userId,
          provider: response.provider,
          model: response.model,
          status: 'SUCCESS',
          promptTokens:
            response.promptTokens,
          completionTokens:
            response.completionTokens,
          totalTokens:
            response.totalTokens,
          latencyMs,
        });
      } catch {
        // Usage logging must not break a successful search.
      }

      // 9. Return AI answer + sources
      return {
        query: dto.query,
        answer: response.content,
        provider: {
          type: response.provider,
          model: response.model,
        },
        sources: searchResult.results.map(
          (result) => ({
            title: result.title,
            url: result.url,
          }),
        ),
        resultCount,
        latencyMs,
      };
    } catch (error) {
      console.error('Web search failed:', error);
      const latencyMs =
        Date.now() - startedAt;

      await this.webSearchRepository.create({
        userId,
        providerId: provider.id,
        query: dto.query,
        status: SearchStatus.FAILED,
        resultCount,
        latencyMs,
      });

      try {
        await this.usageRepository.createApiUsageLog({
          userId,
          provider: provider.type,
          model:
            dto.model ??
            provider.modelName ??
            undefined,
          status: 'ERROR',
          latencyMs,
        });
      } catch {
        // Usage logging failure must not hide the original error.
      }

      throw new BadGatewayException(
        'AI-assisted web search request failed',
      );
    }
  }

  async getHistory(
    userId: string,
  ) {
    return this.webSearchRepository.findHistory(
      userId,
    );
  }

  async getRecent(
    userId: string,
  ) {
    return this.webSearchRepository.findRecent(
      userId,
    );
  }

  async getSuggestions(
    userId: string,
    query: string,
  ) {
    return this.webSearchRepository.findSuggestions(
      userId,
      query,
    );
  }
}