import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-refresh-token',
    description: 'Refresh token returned by the login or refresh endpoint.',
  })
  @IsString()
  refreshToken!: string;
}