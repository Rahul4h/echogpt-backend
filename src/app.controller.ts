import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { Type } from 'class-transformer';
import { AppService } from './app.service';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

class ConversationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;
}

class MessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsIn(['USER', 'SYSTEM'])
  role?: 'USER' | 'SYSTEM';
}

class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

type RequestUser = {
  user: {
    id: string;
  };
};

@ApiTags('EchoGPT')
@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get()
  status() {
    return this.service.status();
  }

  

  

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  list(
    @Req() request: RequestUser,
    @Query() query: PaginationDto,
  ) {
    return this.service.list(
      request.user.id,
      query.page,
      query.limit,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  create(
    @Req() request: RequestUser,
    @Body() dto: ConversationDto,
  ) {
    return this.service.create(
      request.user.id,
      dto.title,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('conversations/:id')
  update(
    @Req() request: RequestUser,
    @Param('id') id: string,
    @Body() dto: ConversationDto,
  ) {
    return this.service.update(
      request.user.id,
      id,
      dto.title,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('conversations/:id')
  @HttpCode(204)
  async remove(
    @Req() request: RequestUser,
    @Param('id') id: string,
  ) {
    await this.service.remove(
      request.user.id,
      id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id/messages')
  messages(
    @Req() request: RequestUser,
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.messages(
      request.user.id,
      id,
      query.page,
      query.limit,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('conversations/:id/messages')
  message(
    @Req() request: RequestUser,
    @Param('id') id: string,
    @Body() dto: MessageDto,
  ) {
    return this.service.message(
      request.user.id,
      id,
      dto.content,
      dto.role,
    );
  }
}