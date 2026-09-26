import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsEmail,
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

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

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
  headers: {
    authorization?: string;
  };
  userId: string;
};

@Injectable()
export class HeaderUserGuard {
  canActivate(context: {
    switchToHttp(): {
      getRequest(): RequestUser;
    };
  }) {
    const request = context.switchToHttp().getRequest();

    const id = request.headers.authorization?.replace(
      /^Bearer\s+/i,
      '',
    );

    if (!id) {
      throw new UnauthorizedException(
        'Use Bearer <user-id>',
      );
    }

    request.userId = id;

    return true;
  }
}

@ApiTags('EchoGPT')
@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get()
  status() {
    return this.service.status();
  }

  @Post('auth/register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(
      dto.email,
      dto.name,
      dto.password,
    );
  }

  @Post('auth/login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.service.login(
      dto.email,
      dto.password,
    );
  }

  @ApiBearerAuth()
  @UseGuards(HeaderUserGuard)
  @Get('users/me')
  me(@Req() request: RequestUser) {
    return this.service.me(request.userId);
  }

  @ApiBearerAuth()
  @UseGuards(HeaderUserGuard)
  @Delete('users/me')
  @HttpCode(204)
  async removeAccount(@Req() request: RequestUser) {
    await this.service.removeAccount(request.userId);
  }

  @ApiBearerAuth()
  @UseGuards(HeaderUserGuard)
  @Get('conversations')
  list(
    @Req() request: RequestUser,
    @Query() query: PaginationDto,
  ) {
    return this.service.list(
      request.userId,
      query.page,
      query.limit,
    );
  }

  @ApiBearerAuth()
  @UseGuards(HeaderUserGuard)
  @Post('conversations')
  create(
    @Req() request: RequestUser,
    @Body() dto: ConversationDto,
  ) {
    return this.service.create(
      request.userId,
      dto.title,
    );
  }

  @ApiBearerAuth()
  @UseGuards(HeaderUserGuard)
  @Patch('conversations/:id')
  update(
    @Req() request: RequestUser,
    @Param('id') id: string,
    @Body() dto: ConversationDto,
  ) {
    return this.service.update(
      request.userId,
      id,
      dto.title,
    );
  }

  @ApiBearerAuth()
  @UseGuards(HeaderUserGuard)
  @Delete('conversations/:id')
  @HttpCode(204)
  async remove(
    @Req() request: RequestUser,
    @Param('id') id: string,
  ) {
    await this.service.remove(
      request.userId,
      id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(HeaderUserGuard)
  @Get('conversations/:id/messages')
  messages(
    @Req() request: RequestUser,
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.messages(
      request.userId,
      id,
      query.page,
      query.limit,
    );
  }

  @ApiBearerAuth()
  @UseGuards(HeaderUserGuard)
  @Post('conversations/:id/messages')
  message(
    @Req() request: RequestUser,
    @Param('id') id: string,
    @Body() dto: MessageDto,
  ) {
    return this.service.message(
      request.userId,
      id,
      dto.content,
      dto.role,
    );
  }
}