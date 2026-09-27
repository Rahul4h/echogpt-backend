export type AiProviderType =
  | 'OPENAI'
  | 'ANTHROPIC'
  | 'GOOGLE';

export interface ChatRequest {
  message: string;

  conversation?: Array<{
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
  }>;

  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  provider: AiProviderType;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface ProviderHealth {
  healthy: boolean;
  provider: AiProviderType;
  latencyMs: number;
  message?: string;
}

export interface ProviderRuntimeConfig {
  apiKey: string;
  baseUrl?: string | null;
  modelName?: string | null;
}

export interface AiProviderAdapter {
  chat(request: ChatRequest): Promise<ChatResponse>;

  healthCheck(): Promise<ProviderHealth>;
}