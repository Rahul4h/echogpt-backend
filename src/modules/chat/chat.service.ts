import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EncryptionService } from '../../common/encryption/encryption.service';

import { ProviderAdapterFactory } from '../providers/adapters/provider-adapter.factory';
import { ProvidersService } from '../providers/providers.service';

import { SubscriptionsService } from '../subscriptions/subscriptions.service';

import { UsageRepository } from '../usage/repositories/usage.repository';

import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

import { ChatRepository } from './repositories/chat.repository';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly providersService: ProvidersService,
    private readonly usageRepository: UsageRepository,
    private readonly encryptionService: EncryptionService,
    private readonly providerAdapterFactory: ProviderAdapterFactory,
  ) {}

  async sendMessage(
    userId: string,
    dto: SendChatMessageDto,
  ) {
    const startedAt = Date.now();

    /*
     * 1. Check active subscription and request quota.
     */
    const usage =
      await this.subscriptionsService.getCurrentUsage(userId);

    if (
      usage.requests.remaining !== null &&
      usage.requests.remaining <= 0
    ) {
      throw new ConflictException(
        'Request limit exceeded for your subscription',
      );
    }

    /*
     * 2. Resolve existing conversation first.
     *
     * Conversation ownership is checked here so a user
     * cannot access another user's conversation.
     */
    let conversation;

    if (dto.conversationId) {
      conversation =
        await this.chatRepository.findConversationByIdForUser(
          dto.conversationId,
          userId,
        );

      if (!conversation) {
        throw new NotFoundException(
          'Conversation not found',
        );
      }
    }

    /*
     * 3. Resolve the provider.
     *
     * Existing conversation:
     * - explicit providerId -> use requested provider
     * - no providerId -> keep conversation provider
     *
     * New conversation:
     * - explicit providerId -> use requested provider
     * - no providerId -> use configured default provider
     *
     * Provider existence and enabled state are handled
     * by ProvidersService.
     */
    const selectedProviderId =
      dto.providerId ??
      conversation?.providerId ??
      undefined;

    const provider =
      await this.resolveProvider(
        selectedProviderId,
      );

    /*
     * A provider without an encrypted API key cannot
     * perform a real AI request.
     */
    if (!provider.encryptedApiKey) {
      throw new ConflictException(
        'AI provider API key is not configured',
      );
    }

    /*
     * 4. Create a new conversation if necessary.
     */
    if (!conversation) {
      conversation =
        await this.chatRepository.createConversation({
          userId,
          providerId: provider.id,
          title: this.createConversationTitle(
            dto.prompt,
          ),
        });
    } else if (
      dto.providerId &&
      dto.providerId !== conversation.providerId
    ) {
      /*
       * User explicitly selected another provider.
       * Keep conversation metadata synchronized.
       */
      conversation =
        await this.chatRepository.updateConversation(
          conversation.id,
          {
            providerId: provider.id,
          },
        );
    }

    /*
     * 5. Load previous conversation history.
     *
     * Only the latest 20 messages are sent to the provider
     * to prevent unbounded context growth.
     */
    const previousMessages =
      await this.chatRepository.findRecentMessages(
        conversation.id,
        20,
      );

    /*
     * Repository returns newest first.
     * Provider conversation history should be chronological.
     */
    previousMessages.reverse();

    /*
     * 6. Build provider prompt with optional page context.
     */
    const providerMessage =
      this.buildProviderMessage(dto);

    /*
     * 7. Save user message before calling the provider.
     */
    await this.chatRepository.createMessage({
      conversationId: conversation.id,
      role: 'USER',
      content: dto.prompt,
    });

    /*
     * 8-9. Decrypt API key, create adapter and call
     * the actual AI provider.
     *
     * These operations are intentionally inside the same
     * protected block because decryption/factory/provider
     * failures should all be handled safely.
     */
    try {
      const apiKey =
        this.encryptionService.decrypt(
          provider.encryptedApiKey,
        );

      if (!apiKey) {
        throw new Error(
          'Provider API key decryption returned an empty key',
        );
      }

      const adapter =
        this.providerAdapterFactory.create(
          provider.type,
          {
            apiKey,
            baseUrl: provider.baseUrl,
            modelName: provider.modelName,
          },
        );

      const response = await adapter.chat({
        message: providerMessage,
        conversation: previousMessages.map(
          (message) => ({
            role: message.role,
            content: message.content,
          }),
        ),
        model:
          dto.model ??
          provider.modelName ??
          undefined,
      });

      const latencyMs = Date.now() - startedAt;

      /*
       * 10. Save assistant response.
       */
      await this.chatRepository.createMessage({
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: response.content,
        providerName: response.provider,
        modelName: response.model,
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      });

      /*
       * 11. Save successful API usage.
       *
       * Logging failure should not turn a successful AI
       * response into a provider failure.
       */
      await this.logApiUsageSafely({
        userId,
        provider: response.provider,
        model: response.model,
        requestCount: 1,
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
        status: 'SUCCESS',
        latencyMs,
      });

      /*
       * 12. Return safe response.
       *
       * Provider API key and internal provider details
       * are never exposed.
       */
      return {
        conversationId: conversation.id,
        message: {
          role: 'ASSISTANT',
          content: response.content,
        },
        provider: {
          type: response.provider,
          model: response.model,
        },
        usage: {
          promptTokens:
            response.promptTokens ?? null,
          completionTokens:
            response.completionTokens ?? null,
          totalTokens:
            response.totalTokens ?? null,
        },
      };
    } catch (error) {
      const latencyMs = Date.now() - startedAt;

      /*
       * Never expose:
       * - API keys
       * - provider HTTP errors
       * - provider response bodies
       * - encryption errors
       * - adapter errors
       * - internal stack traces
       */
      await this.logApiUsageSafely({
        userId,
        provider: provider.type,
        model:
          dto.model ??
          provider.modelName ??
          undefined,
        requestCount: 1,
        status: 'ERROR',
        latencyMs,
      });

      throw new BadGatewayException(
        'AI provider request failed',
      );
    }
  }

  private async resolveProvider(
    providerId?: string,
  ) {
    return this.providersService.getRuntimeProvider(
      providerId,
    );
  }

  private buildProviderMessage(
    dto: SendChatMessageDto,
  ) {
    if (!dto.pageContext) {
      return dto.prompt;
    }

    const contextParts: string[] = [];

    if (dto.pageContext.url) {
      contextParts.push(
        `Page URL: ${dto.pageContext.url}`,
      );
    }

    if (dto.pageContext.title) {
      contextParts.push(
        `Page Title: ${dto.pageContext.title}`,
      );
    }

    if (dto.pageContext.content) {
      contextParts.push(
        `Page Content:\n${dto.pageContext.content}`,
      );
    }

    if (contextParts.length === 0) {
      return dto.prompt;
    }

    return `${dto.prompt}\n\n--- Page Context ---\n${contextParts.join(
      '\n\n',
    )}`;
  }

  private async logApiUsageSafely(data: {
    userId?: string;
    provider?: string;
    model?: string;
    requestCount?: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    status: 'SUCCESS' | 'ERROR';
    latencyMs?: number;
  }) {
    try {
      await this.usageRepository.createApiUsageLog(
        data,
      );
    } catch {
      /*
       * Usage logging must never overwrite the original
       * application/provider result.
       *
       * In production, this could additionally be sent
       * to an application logger/monitoring system.
       */
    }
  }

  async getConversations(userId: string) {
    return this.chatRepository.findConversationsByUserId(
      userId,
    );
  }

  async getConversation(
    userId: string,
    conversationId: string,
  ) {
    const conversation =
      await this.chatRepository.findConversationByIdForUser(
        conversationId,
        userId,
      );

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    return conversation;
  }

  async updateConversation(
    userId: string,
    conversationId: string,
    dto: UpdateConversationDto,
  ) {
    const conversation =
      await this.chatRepository.findConversationByIdForUser(
        conversationId,
        userId,
      );

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    return this.chatRepository.updateConversation(
      conversationId,
      dto,
    );
  }

  async deleteConversation(
    userId: string,
    conversationId: string,
  ) {
    const conversation =
      await this.chatRepository.findConversationByIdForUser(
        conversationId,
        userId,
      );

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    await this.chatRepository.deleteConversation(
      conversationId,
    );
  }

  async getMessages(
    userId: string,
    conversationId: string,
  ) {
    const conversation =
      await this.chatRepository.findConversationByIdForUser(
        conversationId,
        userId,
      );

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    return this.chatRepository.findMessagesByConversationId(
      conversationId,
    );
  }

  private createConversationTitle(
    prompt: string,
  ) {
    const normalized = prompt.trim();

    if (normalized.length <= 80) {
      return normalized;
    }

    return `${normalized.slice(0, 77)}...`;
  }
}