import { Injectable } from '@nestjs/common';

import {
  AiProviderAdapter,
  AiProviderType,
  ProviderRuntimeConfig,
} from './ai-provider.adapter';

import { AnthropicAdapter } from './anthropic.adapter';
import { OpenAiAdapter } from './openai.adapter';
import { GeminiAdapter } from './gemini.adapter';

import { ProviderHttpClient } from '../http/provider-http.client';

@Injectable()
export class ProviderAdapterFactory {
  constructor(
    private readonly httpClient: ProviderHttpClient,
  ) {}

  create(
    type: AiProviderType,
    config: ProviderRuntimeConfig,
  ): AiProviderAdapter {
    switch (type) {
      case 'OPENAI':
        return new OpenAiAdapter(
          this.httpClient,
          config,
        );

      case 'ANTHROPIC':
        return new AnthropicAdapter(
          this.httpClient,
          config,
        );

      case 'GOOGLE':
        return new GeminiAdapter(
          this.httpClient,
          config,
        );

      default:
        throw new Error(
          `Unsupported AI provider: ${type}`,
        );
    }
  }
}