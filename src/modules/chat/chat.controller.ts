import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Send a chat message',
    description:
      'Sends a user prompt to the selected AI provider, persists the conversation messages, and returns the generated assistant response. If no conversation ID is provided, a new conversation is created.',
  })
  @ApiBody({
    type: SendChatMessageDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Chat response generated successfully.',
    schema: {
      example: {
        conversationId:
          '550e8400-e29b-41d4-a716-446655440000',
        message: {
          role: 'ASSISTANT',
          content:
            'REST APIs allow applications to communicate over HTTP using standardized resources and methods.',
        },
        provider: {
          type: 'OPENAI',
          model: 'gpt-5',
        },
        usage: {
          promptTokens: 120,
          completionTokens: 85,
          totalTokens: 205,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request body, prompt, UUID, model, or page context.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 404,
    description:
      'The requested conversation or AI provider was not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Request limit exceeded, selected provider is unavailable, or provider API key is not configured.',
  })
  @ApiResponse({
    status: 502,
    description:
      'The AI provider request failed or the provider response could not be processed.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  sendMessage(
    @CurrentUser() user: { id: string },
    @Body() dto: SendChatMessageDto,
  ) {
    return this.chatService.sendMessage(
      user.id,
      dto,
    );
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'List user conversations',
    description:
      'Returns all conversations belonging to the authenticated user, ordered by most recently updated.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully.',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          userId:
            '35bdd3ef-437e-46f9-8076-e5235b6c725f',
          providerId:
            '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          title: 'Understanding REST APIs',
          createdAt: '2026-09-29T10:00:00.000Z',
          updatedAt: '2026-09-29T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  getConversations(
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.getConversations(
      user.id,
    );
  }

  @Get('conversations/:id')
  @ApiOperation({
    summary: 'Get a conversation',
    description:
      'Returns a specific conversation belonging to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation UUID.',
    format: 'uuid',
    example:
      '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId:
          '35bdd3ef-437e-46f9-8076-e5235b6c725f',
        providerId:
          '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        title: 'Understanding REST APIs',
        createdAt: '2026-09-29T10:00:00.000Z',
        updatedAt: '2026-09-29T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid conversation UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  getConversation(
    @CurrentUser() user: { id: string },
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    conversationId: string,
  ) {
    return this.chatService.getConversation(
      user.id,
      conversationId,
    );
  }

  @Patch('conversations/:id')
  @ApiOperation({
    summary: 'Update a conversation',
    description:
      'Updates conversation metadata for a conversation owned by the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation UUID.',
    format: 'uuid',
    example:
      '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateConversationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation updated successfully.',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId:
          '35bdd3ef-437e-46f9-8076-e5235b6c725f',
        providerId:
          '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        title: 'Understanding REST APIs',
        createdAt: '2026-09-29T10:00:00.000Z',
        updatedAt: '2026-09-29T10:35:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid conversation UUID or request body.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  updateConversation(
    @CurrentUser() user: { id: string },
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    conversationId: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.chatService.updateConversation(
      user.id,
      conversationId,
      dto,
    );
  }

  @Delete('conversations/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a conversation',
    description:
      'Permanently deletes a conversation and its associated messages. Only conversations belonging to the authenticated user can be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation UUID.',
    format: 'uuid',
    example:
      '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Conversation deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid conversation UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  async deleteConversation(
    @CurrentUser() user: { id: string },
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    conversationId: string,
  ) {
    await this.chatService.deleteConversation(
      user.id,
      conversationId,
    );
  }

  @Get('conversations/:id/messages')
  @ApiOperation({
    summary: 'Get conversation messages',
    description:
      'Returns all messages belonging to a conversation owned by the authenticated user, ordered chronologically.',
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation UUID.',
    format: 'uuid',
    example:
      '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation messages retrieved successfully.',
    schema: {
      example: [
        {
          id: 'message-user-uuid',
          conversationId:
            '550e8400-e29b-41d4-a716-446655440000',
          role: 'USER',
          content:
            'Explain REST APIs in simple terms.',
          providerName: null,
          modelName: null,
          promptTokens: null,
          completionTokens: null,
          totalTokens: null,
          createdAt: '2026-09-29T10:29:00.000Z',
        },
        {
          id: 'message-assistant-uuid',
          conversationId:
            '550e8400-e29b-41d4-a716-446655440000',
          role: 'ASSISTANT',
          content:
            'REST APIs allow applications to communicate over HTTP.',
          providerName: 'OPENAI',
          modelName: 'gpt-5',
          promptTokens: 120,
          completionTokens: 45,
          totalTokens: 165,
          createdAt: '2026-09-29T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid conversation UUID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Unexpected server error.',
  })
  getMessages(
    @CurrentUser() user: { id: string },
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    conversationId: string,
  ) {
    return this.chatService.getMessages(
      user.id,
      conversationId,
    );
  }
}