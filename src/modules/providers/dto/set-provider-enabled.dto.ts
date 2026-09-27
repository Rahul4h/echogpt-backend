import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetProviderEnabledDto {
  @ApiProperty({
    example: true,
    description: 'Enable or disable the AI provider.',
  })
  @IsBoolean()
  enabled: boolean;
}