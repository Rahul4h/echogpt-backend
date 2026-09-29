import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { WebSearchDto } from './dto/web-search.dto';
import { WebSearchService } from './web-search.service';

@ApiTags('Web Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('web-search')
export class WebSearchController {
  constructor(
    private readonly webSearchService: WebSearchService,
  ) {}

  @Post()
search(
  @CurrentUser() user: { id: string },
  @Body() dto: WebSearchDto,
) {
  return this.webSearchService.search(
    user.id,
    dto,
  );
}

  @Get('history')
  getHistory(
    @CurrentUser() user: { id: string },
  ) {
    return this.webSearchService.getHistory(
      user.id,
    );
  }

  @Get('recent')
  getRecent(
    @CurrentUser() user: { id: string },
  ) {
    return this.webSearchService.getRecent(
      user.id,
    );
  }

 @Get('suggestions')
getSuggestions(
  @CurrentUser() user: { id: string },
  @Query('q') query: string,
) {
  return this.webSearchService.getSuggestions(
    user.id,
    query,
  );
}
}