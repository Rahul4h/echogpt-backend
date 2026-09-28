import { IsBoolean } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class SetProviderEnabledDto {
  @ApiProperty({
    example: true,
    description:
      'Set to true to enable the provider or false to disable it.',
  })
  @IsBoolean()
  enabled: boolean;
}