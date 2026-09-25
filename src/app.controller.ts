import { Body, Controller, Delete, Get, HttpCode, Injectable, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'; import { AppService } from './app.service';
class RegisterDto { @IsEmail() email:string; @IsString() @MinLength(2) @MaxLength(80) name:string; @IsString() @MinLength(8) @MaxLength(128) password:string; }
class LoginDto { @IsEmail() email:string; @IsString() password:string; }
class ConversationDto { @IsString() @MinLength(1) @MaxLength(120) title:string; }
class MessageDto { @IsString() @MinLength(1) @MaxLength(10000) content:string; @IsOptional() @IsIn(['USER','SYSTEM']) role?:'USER'|'SYSTEM'; }
type RequestUser={headers:{authorization?:string};userId:string};
@Injectable() export class HeaderUserGuard { canActivate(context:{switchToHttp():{getRequest():RequestUser}}){const r=context.switchToHttp().getRequest(); const id=r.headers.authorization?.replace(/^Bearer\s+/i,''); if(!id) throw new UnauthorizedException('Use Bearer <user-id>'); r.userId=id; return true;} }
@ApiTags('EchoGPT') @Controller() export class AppController { constructor(private readonly service:AppService) {}
  @Get() status(){return this.service.status()} @Get('health') health(){return {status:'ok'}}
  @Post('auth/register') register(@Body() d:RegisterDto){return this.service.register(d.email,d.name,d.password)} @Post('auth/login') @HttpCode(200) login(@Body()d:LoginDto){return this.service.login(d.email,d.password)}
  @ApiBearerAuth() @UseGuards(HeaderUserGuard) @Get('users/me') me(@Req()r:RequestUser){return this.service.me(r.userId)}
  @ApiBearerAuth() @UseGuards(HeaderUserGuard) @Get('conversations') list(@Req()r:RequestUser){return this.service.list(r.userId)} @ApiBearerAuth() @UseGuards(HeaderUserGuard) @Post('conversations') create(@Req()r:RequestUser,@Body()d:ConversationDto){return this.service.create(r.userId,d.title)}
  @ApiBearerAuth() @UseGuards(HeaderUserGuard) @Patch('conversations/:id') update(@Req()r:RequestUser,@Param('id')id:string,@Body()d:ConversationDto){return this.service.update(r.userId,id,d.title)} @ApiBearerAuth() @UseGuards(HeaderUserGuard) @Delete('conversations/:id') @HttpCode(204) remove(@Req()r:RequestUser,@Param('id')id:string){this.service.remove(r.userId,id)}
  @ApiBearerAuth() @UseGuards(HeaderUserGuard) @Get('conversations/:id/messages') messages(@Req()r:RequestUser,@Param('id')id:string){return this.service.messages(r.userId,id)} @ApiBearerAuth() @UseGuards(HeaderUserGuard) @Post('conversations/:id/messages') message(@Req()r:RequestUser,@Param('id')id:string,@Body()d:MessageDto){return this.service.message(r.userId,id,d.content,d.role)} }
