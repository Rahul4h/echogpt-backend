import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  createConversation(data: {
    userId: string;
    providerId?: string;
    title: string;
  }) {
    return this.prisma.conversation.create({
      data,
    });
  }

  findConversationById(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
    });
  }

  findConversationByIdForUser(
    id: string,
    userId: string,
  ) {
    return this.prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  findConversationsByUserId(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  updateConversation(
    id: string,
    data: {
      title?: string;
      providerId?: string | null;
    },
  ) {
    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  deleteConversation(id: string) {
    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  createMessage(data: {
    conversationId: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    providerName?: string;
    modelName?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  }) {
    return this.prisma.message.create({
      data,
    });
  }

  findMessagesByConversationId(conversationId: string) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  findRecentMessages(
    conversationId: string,
    limit: number,
  ) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}