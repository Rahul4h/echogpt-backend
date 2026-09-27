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
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

interface GeminiModelsResponse {
  models?: Array<{
    name: string;
  }>;
}

@Injectable()
export class GeminiAdapter
  implements AiProviderAdapter
{
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

    const contents = [
      ...(request.conversation ?? [])
        .filter(
          (message) =>
            message.role !== 'SYSTEM',
        )
        .map((message) => ({
          role:
            message.role === 'ASSISTANT'
              ? 'model'
              : 'user',
          parts: [
            {
              text: message.content,
            },
          ],
        })),
      {
        role: 'user',
        parts: [
          {
            text: request.message,
          },
        ],
      },
    ];

    const systemMessage =
      request.conversation?.find(
        (message) =>
          message.role === 'SYSTEM',
      );

    const response =
      await this.httpClient.request<GeminiResponse>(
        `${baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(this.config.apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            ...(systemMessage && {
              systemInstruction: {
                parts: [
                  {
                    text: systemMessage.content,
                  },
                ],
              },
            }),
            generationConfig: {
              ...(request.temperature !== undefined && {
                temperature: request.temperature,
              }),
              ...(request.maxTokens !== undefined && {
                maxOutputTokens:
                  request.maxTokens,
              }),
            },
          }),
        },
      );

    const content =
      response.candidates
        ?.flatMap(
          (candidate) =>
            candidate.content?.parts ?? [],
        )
        .map((part) => part.text ?? '')
        .join('') ?? '';

    const promptTokens =
      response.usageMetadata?.promptTokenCount;

    const completionTokens =
      response.usageMetadata?.candidatesTokenCount;

    return {
      content,
      provider: 'GOOGLE',
      model,
      promptTokens,
      completionTokens,
      totalTokens:
        response.usageMetadata?.totalTokenCount ??
        (promptTokens !== undefined &&
        completionTokens !== undefined
          ? promptTokens + completionTokens
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
        `${baseUrl}/models?key=${encodeURIComponent(this.config.apiKey)}`,
        {
          method: 'GET',
        },
      );

      return {
        healthy: true,
        provider: 'GOOGLE',
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        healthy: false,
        provider: 'GOOGLE',
        latencyMs: Date.now() - startedAt,
        message:
          error instanceof Error
            ? error.message
            : 'Gemini health check failed',
      };
    }
  }
}