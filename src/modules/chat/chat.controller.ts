import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
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
  getConversations(
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.getConversations(
      user.id,
    );
  }

  @Get('conversations/:id')
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