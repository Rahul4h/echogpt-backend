import { plainToInstance } from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsInt()
  @Min(1)
  PORT!: number;

  @IsIn(['development', 'test', 'production'])
  NODE_ENV!: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  CORS_ORIGIN!: string;

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsString()
  ENCRYPTION_KEY!: string;

  @IsOptional()
  @IsString()
  GOOGLE_SEARCH_API_KEY?: string;

  @IsOptional()
  @IsString()
  GOOGLE_SEARCH_ENGINE_ID?: string;

    @IsOptional()
  @IsString()
  TAVILY_API_KEY?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    {
      enableImplicitConversion: true,
    },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed: ${errors
        .map((error) =>
          Object.values(error.constraints ?? {}).join(', '),
        )
        .join('; ')}`,
    );
  }

  return validatedConfig;
}