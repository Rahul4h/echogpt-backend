import { Injectable } from '@nestjs/common';

import {
  AiProviderAdapter,
  ChatRequest,
  ChatResponse,
  ProviderHealth,
} from './ai-provider.adapter';

import type {
  ProviderRuntimeConfig,
} from './ai-provider.adapter';

import { ProviderHttpClient } from '../http/provider-http.client';

interface OpenAiResponse {
  output_text?: string;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
}

@Injectable()
export class OpenAiAdapter implements AiProviderAdapter {
  private readonly defaultBaseUrl =
    'https://api.openai.com/v1';

  constructor(
    private readonly httpClient: ProviderHttpClient,
    private readonly config: ProviderRuntimeConfig,
  ) {}

  async chat(
    request: ChatRequest,
  ): Promise<ChatResponse> {
    const model =
      request.model ??
      this.config.modelName;

    if (!model) {
      throw new Error(
        'OpenAI model is not configured',
      );
    }

    const baseUrl =
      this.config.baseUrl ??
      this.defaultBaseUrl;

    const input = [
      ...(request.conversation ?? []).map(
        (message) => ({
          role: this.mapRole(message.role),
          content: message.content,
        }),
      ),
      {
        role: 'user',
        content: request.message,
      },
    ];

    const response =
      await this.httpClient.request<OpenAiResponse>(
        `${baseUrl}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model,
            input,
            ...(request.temperature !== undefined && {
              temperature: request.temperature,
            }),
            ...(request.maxTokens !== undefined && {
              max_output_tokens: request.maxTokens,
            }),
          }),
        },
      );

    return {
      content: response.output_text ?? '',
      provider: 'OPENAI',
      model: response.model ?? model,
      promptTokens:
        response.usage?.input_tokens,
      completionTokens:
        response.usage?.output_tokens,
      totalTokens:
        response.usage?.total_tokens,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startedAt = Date.now();

    const baseUrl =
      this.config.baseUrl ??
      this.defaultBaseUrl;

    try {
      await this.httpClient.request(
        `${baseUrl}/models`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
      );

      return {
        healthy: true,
        provider: 'OPENAI',
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        healthy: false,
        provider: 'OPENAI',
        latencyMs: Date.now() - startedAt,
        message:
          error instanceof Error
            ? error.message
            : 'OpenAI health check failed',
      };
    }
  }

  private mapRole(
    role: 'USER' | 'ASSISTANT' | 'SYSTEM',
  ): 'user' | 'assistant' | 'system' {
    switch (role) {
      case 'ASSISTANT':
        return 'assistant';

      case 'SYSTEM':
        return 'system';

      case 'USER':
      default:
        return 'user';
    }
  }
}