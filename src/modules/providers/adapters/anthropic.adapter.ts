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

interface AnthropicResponse {
  model: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

interface AnthropicModelsResponse {
  data?: Array<{
    id: string;
  }>;
}

@Injectable()
export class AnthropicAdapter
  implements AiProviderAdapter
{
  private readonly defaultBaseUrl =
    'https://api.anthropic.com';

  private readonly anthropicVersion =
    '2023-06-01';

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
        'Anthropic model is not configured',
      );
    }

    const baseUrl =
      this.config.baseUrl ??
      this.defaultBaseUrl;

    const messages = [
      ...(request.conversation ?? [])
        .filter(
          (message) =>
            message.role !== 'SYSTEM',
        )
        .map((message) => ({
          role:
            message.role === 'ASSISTANT'
              ? 'assistant'
              : 'user',
          content: message.content,
        })),
      {
        role: 'user',
        content: request.message,
      },
    ];

    const systemMessage =
      request.conversation?.find(
        (message) =>
          message.role === 'SYSTEM',
      );

    const response =
      await this.httpClient.request<AnthropicResponse>(
        `${baseUrl}/v1/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version':
              this.anthropicVersion,
          },
          body: JSON.stringify({
            model,
            max_tokens:
              request.maxTokens ?? 1024,
            messages,
            ...(systemMessage && {
              system: systemMessage.content,
            }),
            ...(request.temperature !== undefined && {
              temperature: request.temperature,
            }),
          }),
        },
      );

    const content =
      response.content
        ?.filter(
          (block) => block.type === 'text',
        )
        .map((block) => block.text ?? '')
        .join('') ?? '';

    const promptTokens =
      response.usage?.input_tokens;

    const completionTokens =
      response.usage?.output_tokens;

    return {
      content,
      provider: 'ANTHROPIC',
      model: response.model ?? model,
      promptTokens,
      completionTokens,
      totalTokens:
        promptTokens !== undefined &&
        completionTokens !== undefined
          ? promptTokens + completionTokens
          : undefined,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startedAt = Date.now();

    const baseUrl =
      this.config.baseUrl ??
      this.defaultBaseUrl;

    try {
      await this.httpClient.request<AnthropicModelsResponse>(
        `${baseUrl}/v1/models`,
        {
          method: 'GET',
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version':
              this.anthropicVersion,
          },
        },
      );

      return {
        healthy: true,
        provider: 'ANTHROPIC',
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        healthy: false,
        provider: 'ANTHROPIC',
        latencyMs: Date.now() - startedAt,
        message:
          error instanceof Error
            ? error.message
            : 'Anthropic health check failed',
      };
    }
  }
}