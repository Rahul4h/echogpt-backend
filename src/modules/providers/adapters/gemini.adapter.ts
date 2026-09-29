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

interface GeminiResponse {
  status?: string;

  steps?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;

  usage?: {
    total_input_tokens?: number;
    total_output_tokens?: number;
    total_tokens?: number;
  };
}

interface GeminiModelsResponse {
  models?: Array<{
    name: string;
  }>;
}

@Injectable()
export class GeminiAdapter implements AiProviderAdapter {
  private readonly defaultBaseUrl =
    'https://generativelanguage.googleapis.com/v1beta';

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
        'Gemini model is not configured',
      );
    }

    const baseUrl =
      this.config.baseUrl ??
      this.defaultBaseUrl;

    const inputParts = [
      ...(request.conversation ?? [])
        .filter(
          (message) =>
            message.role !== 'SYSTEM',
        )
        .map((message) => {
          const role =
            message.role === 'ASSISTANT'
              ? 'Assistant'
              : 'User';

          return `${role}: ${message.content}`;
        }),

      `User: ${request.message}`,
    ];

    const input = inputParts.join('\n\n');

    const systemMessage =
      request.conversation?.find(
        (message) =>
          message.role === 'SYSTEM',
      );

    const response =
      await this.httpClient.request<GeminiResponse>(
        `${baseUrl}/interactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.config.apiKey,
          },
          body: JSON.stringify({
            model,
            input,

            ...(systemMessage && {
              system_instruction:
                systemMessage.content,
            }),

            ...(request.maxTokens !== undefined && {
              generation_config: {
                max_output_tokens:
                  request.maxTokens,
              },
            }),
          }),
        },
      );

    const content =
      response.steps
        ?.filter(
          (step) =>
            step.type === 'model_output',
        )
        .flatMap(
          (step) =>
            step.content ?? [],
        )
        .filter(
          (part) =>
            part.type === 'text',
        )
        .map(
          (part) =>
            part.text ?? '',
        )
        .join('') ?? '';

    const promptTokens =
      response.usage?.total_input_tokens;

    const completionTokens =
      response.usage?.total_output_tokens;

    return {
      content,
      provider: 'GOOGLE',
      model,
      promptTokens,
      completionTokens,
      totalTokens:
        response.usage?.total_tokens ??
        (promptTokens !== undefined &&
        completionTokens !== undefined
          ? promptTokens +
            completionTokens
          : undefined),
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startedAt = Date.now();

    const baseUrl =
      this.config.baseUrl ??
      this.defaultBaseUrl;

    try {
      await this.httpClient.request<GeminiModelsResponse>(
        `${baseUrl}/models?key=${encodeURIComponent(
          this.config.apiKey,
        )}`,
        {
          method: 'GET',
        },
      );

      return {
        healthy: true,
        provider: 'GOOGLE',
        latencyMs:
          Date.now() - startedAt,
      };
    } catch (error) {
      return {
        healthy: false,
        provider: 'GOOGLE',
        latencyMs:
          Date.now() - startedAt,
        message:
          error instanceof Error
            ? error.message
            : 'Gemini health check failed',
      };
    }
  }
}