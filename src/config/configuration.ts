export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),

  nodeEnv: process.env.NODE_ENV ?? 'development',

  corsOrigin:
    process.env.CORS_ORIGIN ?? 'http://localhost:3000',

  databaseUrl: process.env.DATABASE_URL,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn:
      process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn:
      process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  

    tavily: {
    apiKey: process.env.TAVILY_API_KEY,
  },
});