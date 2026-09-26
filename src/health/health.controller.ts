import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API health' })
  health() {
    return {
      status: 'ok',
      service: 'echogpt-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Check API readiness' })
  readiness() {
    return {
      status: 'ready',
      service: 'echogpt-api',
      timestamp: new Date().toISOString(),
    };
  }
}