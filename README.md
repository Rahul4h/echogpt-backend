# EchoGPT Backend

Production-oriented REST API backend for the **EchoGPT Chrome Extension**, built with NestJS and PostgreSQL.

The backend is designed around a modular architecture with clear separation of concerns, centralized configuration, validation, error handling, authentication, rate limiting, API documentation, health checks, and database persistence.

> **Current status:** Project foundation is complete. Feature development is being implemented incrementally through dedicated feature branches.

---

## Tech Stack

* **Runtime:** Node.js
* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **API Documentation:** Swagger / OpenAPI
* **Authentication:** JWT
* **Validation:** class-validator / class-transformer
* **Testing:** Jest
* **Test Transformer:** SWC
* **Security:** Helmet, CORS
* **Rate Limiting:** @nestjs/throttler
* **Package Manager:** npm

---

## Architecture

The project follows a modular NestJS architecture designed to keep business logic isolated from HTTP, infrastructure, and cross-cutting concerns.

```text
src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── logger/
│
├── config/
│
├── health/
│
├── prisma/
│
├── modules/
│   ├── admin/
│   ├── auth/
│   ├── chat/
│   ├── providers/
│   ├── subscriptions/
│   ├── usage/
│   ├── users/
│   └── web-search/
│
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts

prisma/
└── schema.prisma
```

### Request flow

```text
HTTP Request
     │
     ▼
Controller
     │
     ▼
Guard / Validation / Interceptor
     │
     ▼
Service
     │
     ▼
Repository / Prisma
     │
     ▼
PostgreSQL
```

Cross-cutting concerns such as configuration, authentication guards, exception handling, logging, validation, and rate limiting are kept outside individual business modules.

---

## Core Modules

The backend is structured around the following modules:

| Module          | Responsibility                                       |
| --------------- | ---------------------------------------------------- |
| `auth`          | Registration, login, JWT authentication and sessions |
| `users`         | User profile and account management                  |
| `subscriptions` | Plans, subscriptions and usage limits                |
| `providers`     | AI provider configuration and credentials            |
| `chat`          | Conversations and chat messages                      |
| `web-search`    | Web search integration and caching                   |
| `usage`         | API and AI usage tracking                            |
| `admin`         | Administrative operations                            |
| `health`        | Health and readiness checks                          |

Some modules are currently scaffolding for upcoming feature branches.

---

## Foundation Features

The current project foundation includes:

* Modular project structure
* Centralized environment configuration
* Environment variable validation
* Global request validation
* Global exception handling
* API versioning
* Security headers with Helmet
* Configurable CORS
* Global API rate limiting
* Structured application logging
* Health and readiness endpoints
* Swagger/OpenAPI documentation
* Automated unit tests
* Production build verification
* ESLint/Oxlint-based code quality checks

---

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL

Verify the installations:

```bash
node --version
npm --version
```

Verify that PostgreSQL is running before starting the application.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Rahul4h/echogpt-backend.git
cd echogpt-backend
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the project root.

Example:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/echogpt?schema=public"

JWT_ACCESS_SECRET=replace_with_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ENCRYPTION_KEY=replace_with_secure_encryption_key

CORS_ORIGIN=http://localhost:3000
```

### Important

Never commit `.env` or production secrets to version control.

A sanitized `.env.example` should be used for sharing required configuration with other developers.

---

## Database

The application uses PostgreSQL with Prisma.

After configuring `DATABASE_URL`, generate the Prisma client:

```bash
npx prisma generate
```

When database migrations are introduced:

```bash
npx prisma migrate dev
```

For production deployments:

```bash
npx prisma migrate deploy
```

---

## Running the Application

### Development

```bash
npm run start
```

### Watch mode

```bash
npm run start:dev
```

### Production

First build the application:

```bash
npm run build
```

Then start:

```bash
npm run start:prod
```

---

## API

The API uses URI versioning.

Base API URL:

```text
/api/v1
```

Example:

```text
http://localhost:3000/api/v1
```

---

## Swagger Documentation

Interactive API documentation is available at:

```text
http://localhost:3000/docs
```

Swagger provides an interactive interface for exploring and testing the backend API without requiring a frontend application.

---

## Health Checks

Basic health endpoint:

```text
GET /api/v1/health
```

Readiness endpoint:

```text
GET /api/v1/health/readiness
```

Example:

```json
{
  "status": "ok",
  "service": "echogpt-api",
  "timestamp": "2026-09-26T00:00:00.000Z"
}
```

These endpoints are intended for application monitoring and deployment health checks.

---

## Security

The backend includes several security-oriented foundation features:

### Helmet

HTTP security headers are configured using Helmet.

### CORS

CORS is configurable through the `CORS_ORIGIN` environment variable.

### Input Validation

Requests are validated globally using:

* `class-validator`
* `class-transformer`

Unknown request properties are rejected.

### Rate Limiting

Global request throttling is configured using `@nestjs/throttler`.

### Authentication

Protected routes are designed to use JWT-based authentication.

### Secrets

Sensitive configuration such as:

* database credentials
* JWT secrets
* encryption keys
* AI provider credentials

must be provided through environment variables and must not be committed to source control.

---

## Error Handling

The application uses a global HTTP exception filter to provide a consistent error response format.

Example:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "path": "/api/v1/example",
  "timestamp": "2026-09-26T00:00:00.000Z"
}
```

This keeps API error responses predictable across modules.

---

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage:

```bash
npm run test:cov
```

Run end-to-end tests:

```bash
npm run test:e2e
```

The project uses Jest with SWC for TypeScript test transformation.

---

## Code Quality

Run linting:

```bash
npm run lint
```

Build the project:

```bash
npm run build
```

A production-ready branch should pass:

```text
npm run lint
npm run build
npm test
```

---

## Development Workflow

Development follows a feature-branch workflow.

```text
main
 │
 ├── feature/project-foundation
 │
 ├── feature/database-schema
 │
 ├── feature/auth-jwt
 │
 ├── feature/subscriptions
 │
 ├── feature/ai-providers
 │
 ├── feature/chat-api
 │
 ├── feature/web-search
 │
 └── feature/admin-api
```

### Branch naming

Use descriptive feature branches:

```text
feature/database-schema
feature/auth-jwt
feature/chat-api
feature/web-search
```

### Typical workflow

```bash
git checkout main
git pull origin main

git checkout -b feature/<feature-name>
```

Implement the feature, then verify:

```bash
npm run lint
npm run build
npm test
```

Commit the changes:

```bash
git add .
git commit -m "feat: implement <feature>"
```

Push the branch:

```bash
git push -u origin feature/<feature-name>
```

Open a pull request against `main`.

---

## Production Considerations

Before production deployment, configure:

* Production PostgreSQL
* Strong JWT secrets
* Secure encryption key
* Production CORS origins
* HTTPS
* Database migrations
* Secure cookie/token handling where applicable
* Proper logging and monitoring
* Rate limiting appropriate for production traffic
* AI provider credential encryption
* Environment-specific configuration
* Database backups
* Health/readiness monitoring

---

## Project Status

### Completed

* [x] NestJS project foundation
* [x] Modular architecture
* [x] Environment configuration
* [x] Environment validation
* [x] Global validation
* [x] Global exception handling
* [x] API versioning
* [x] Helmet
* [x] CORS
* [x] Rate limiting
* [x] Application logger
* [x] Health/readiness endpoints
* [x] Swagger/OpenAPI
* [x] Unit testing setup
* [x] Production build verification

### In Progress

* [ ] PostgreSQL schema
* [ ] Prisma migrations
* [ ] JWT authentication
* [ ] User management
* [ ] Subscription and plan management
* [ ] AI provider management
* [ ] Chat/conversation APIs
* [ ] Web search integration
* [ ] Search caching
* [ ] Usage tracking
* [ ] Admin APIs
* [ ] Production deployment

---

## License

This project is developed as part of the EchoGPT backend implementation and interview assignment.
