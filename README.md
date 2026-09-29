# EchoGPT Backend

Production-oriented REST API backend for the EchoGPT Chrome Extension, built with **NestJS, PostgreSQL, Prisma ORM, JWT Authentication, and Swagger/OpenAPI**.

The backend provides authentication, user management, subscriptions and usage limits, AI provider management, AI-powered chat, AI-assisted web search, and administrative APIs.

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Technology Stack](#technology-stack)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Prerequisites](#prerequisites)
* [Environment Configuration](#environment-configuration)
* [PostgreSQL Setup](#postgresql-setup)
* [Installation](#installation)
* [Database Setup and Migrations](#database-setup-and-migrations)
* [Running the Application](#running-the-application)
* [Swagger / OpenAPI Documentation](#swagger--openapi-documentation)
* [Authentication Flow](#authentication-flow)
* [API Modules](#api-modules)
* [Security](#security)
* [Error Handling](#error-handling)
* [Validation and Rate Limiting](#validation-and-rate-limiting)
* [Database Design](#database-design)
* [Testing](#testing)
* [Code Quality](#code-quality)
* [Git Workflow](#git-workflow)
* [Postman](#postman)
* [Docker](#docker)
* [Known Limitations](#known-limitations)
* [Troubleshooting](#troubleshooting)
* [Submission Information](#submission-information)

---

## Overview

EchoGPT Backend is a modular REST API designed to support the EchoGPT Chrome Extension.

The application follows a layered and modular backend architecture using NestJS. It separates authentication, users, subscriptions, AI providers, chat, web search, usage tracking, request logging, and administrative functionality into dedicated modules.

The API uses:

* **NestJS** for the application framework
* **PostgreSQL** for persistent data storage
* **Prisma ORM** for database access and migrations
* **JWT** for authentication
* **Swagger/OpenAPI** for API documentation
* **bcrypt** for password hashing
* **Helmet** for HTTP security headers
* **ValidationPipe** and `class-validator` for request validation

---

## Features

### Authentication

* User registration
* User login
* JWT access token authentication
* Refresh token support
* Secure logout
* Refresh token rotation
* Password hashing using bcrypt
* Authenticated user profile endpoint
* Role-based authorization

### User Management

* User profile retrieval
* Profile update
* Password change
* Account deletion
* User roles
* User status management

### Subscription Management

* Free and Premium subscription plans
* Current subscription information
* Subscription status
* Upgrade/downgrade support
* Monthly request limits
* Usage tracking
* Remaining request information

### AI Provider Management

Supports multiple AI provider types:

* OpenAI
* Anthropic Claude
* Google Gemini

Provider functionality includes:

* Add provider
* Update provider
* Delete provider
* Enable/disable provider
* Default provider selection
* Secure API key storage
* Provider health checks
* Provider-specific model configuration

### Chat API

* Send AI prompts
* Receive AI-generated responses
* Provider selection
* Model selection
* Conversation creation
* Conversation history
* Conversation ownership validation
* Message persistence
* API usage tracking
* Request logging
* Provider failure handling

### Web Search API

* AI-assisted web search
* Search history
* Recent searches
* Search suggestions
* External search provider integration
* AI-generated answers based on search results
* Search result source URLs
* Search usage tracking
* Search request logging

### Admin APIs

* Dashboard statistics
* User management
* Subscription management
* AI provider management
* API usage analytics
* Request logs
* System health monitoring
* PostgreSQL connectivity checks

---

## Technology Stack

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| NestJS            | Backend framework              |
| TypeScript        | Application language           |
| PostgreSQL        | Relational database            |
| Prisma ORM        | Database access and migrations |
| JWT               | Authentication                 |
| Passport          | Authentication strategy        |
| Swagger / OpenAPI | API documentation              |
| bcrypt            | Password hashing               |
| class-validator   | DTO validation                 |
| class-transformer | Request transformation         |
| Helmet            | HTTP security headers          |
| NestJS Throttler  | Rate limiting                  |
| Jest              | Automated testing              |
| Supertest         | HTTP/API testing               |

---

## Architecture

The application is organized around feature-based NestJS modules.

```text
Client / Chrome Extension
          |
          v
     REST API
          |
          v
       NestJS
          |
  +-------+--------+----------------+
  |       |        |                |
 Auth   Users   Subscriptions    Chat
  |       |        |                |
  +-------+--------+----------------+
          |
     Business Services
          |
  +-------+--------+----------------+
  |                |                |
 Prisma         Providers       Web Search
  |                |                |
  +----------------+----------------+
                   |
                   v
              PostgreSQL
```

The API uses a global `/api` prefix and URI-based API versioning.

Example:

```text
/api/v1/auth/login
/api/v1/chat
/api/v1/users/me
```

---

## Project Structure

The main application code is organized under `src/`:

```text
src/
├── common/
│   ├── encryption/
│   ├── filters/
│   ├── interceptors/
│   └── logger/
│
├── health/
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
└── main.ts

prisma/
└── schema.prisma

test/
```

Each feature module is responsible for its own controllers, services, DTOs, repositories, guards, and related business logic where applicable.

---

# Prerequisites

Before running the application, install:

* **Node.js**
* **npm**
* **PostgreSQL**

The project currently uses:

```text
Node.js 24+
npm 11+
PostgreSQL
```

Verify your installations:

```bash
node --version
npm --version
psql --version
```

---

# Environment Configuration

Create a local `.env` file in the project root.

Start from the provided example:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

The provided `.env.example` contains:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

DATABASE_URL="postgresql://echogpt:password@localhost:5432/echogpt_db?schema=public"

JWT_ACCESS_SECRET=replace_with_a_long_random_access_secret
JWT_REFRESH_SECRET=replace_with_a_long_random_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ENCRYPTION_KEY=replace_with_a_secure_32_character_key
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
TAVILY_API_KEY=
```

### Environment Variables

| Variable                  | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `PORT`                    | HTTP server port                                       |
| `NODE_ENV`                | Application environment                                |
| `CORS_ORIGIN`             | Allowed CORS origin(s)                                 |
| `DATABASE_URL`            | PostgreSQL connection string                           |
| `JWT_ACCESS_SECRET`       | Secret used to sign access tokens                      |
| `JWT_REFRESH_SECRET`      | Secret used to sign refresh tokens                     |
| `JWT_ACCESS_EXPIRES_IN`   | Access token expiration                                |
| `JWT_REFRESH_EXPIRES_IN`  | Refresh token expiration                               |
| `ENCRYPTION_KEY`          | Key used for encrypting sensitive provider credentials |
| `GOOGLE_SEARCH_API_KEY`   | Optional Google search API credential                  |
| `GOOGLE_SEARCH_ENGINE_ID` | Optional Google Custom Search engine ID                |
| `TAVILY_API_KEY`          | Tavily search API credential                           |

### Security Note

Never commit `.env` or real credentials to Git.

Use `.env.example` as the template for required configuration.

For production deployments, use a secure secrets-management mechanism or environment variables provided by the hosting platform.

---

# PostgreSQL Setup

Docker is **not required** for this project.

The backend can run against a normal local PostgreSQL installation.

Create a PostgreSQL database and user matching the credentials configured in `DATABASE_URL`.

For example:

```text
Database: echogpt_db
User: echogpt
Host: localhost
Port: 5432
```

A PostgreSQL connection string follows this format:

```text
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Example:

```env
DATABASE_URL="postgresql://echogpt:your_password@localhost:5432/echogpt_db?schema=public"
```

Make sure the PostgreSQL server is running before executing Prisma commands.

---

# Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project directory:

```bash
cd echogpt-backend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
copy .env.example .env
```

Update `.env` with your local PostgreSQL credentials and secure secrets.

---

# Database Setup and Migrations

The project uses **Prisma ORM** with PostgreSQL.

After configuring `DATABASE_URL`, apply the existing Prisma migrations:

```bash
npx prisma migrate deploy
```

For local development where new migrations are being created:

```bash
npx prisma migrate dev
```

Generate the Prisma Client:

```bash
npx prisma generate
```

The database schema is defined in:

```text
prisma/schema.prisma
```

Migration files are stored under:

```text
prisma/migrations/
```

### Important

Do not manually modify the production database schema when a Prisma migration can represent the change.

For schema changes during development:

```bash
npx prisma migrate dev --name <migration-name>
```

Commit the generated migration files to Git.

---

# Running the Application

## Development

Start the application in watch mode:

```bash
npm run start:dev
```

The default development server runs on:

```text
http://localhost:3000
```

## Normal Start

```bash
npm run start
```

## Production Build

Build the application:

```bash
npm run build
```

Start the compiled application:

```bash
npm run start:prod
```

The production command runs:

```text
node dist/main
```

---

# Swagger / OpenAPI Documentation

The project uses **Swagger/OpenAPI** for interactive API documentation.

After starting the application, open:

```text
http://localhost:3000/docs
```

Swagger documents the API endpoints including:

* HTTP methods
* Request bodies
* Request parameters
* Query parameters
* Path parameters
* Authentication requirements
* Successful responses
* Error responses
* DTO schemas
* Request/response examples

Protected endpoints use **Bearer JWT authentication**.

### Swagger Authentication

1. Register a user using the registration endpoint.
2. Login using the login endpoint.
3. Copy the returned access token.
4. Click **Authorize** in Swagger.
5. Enter the Bearer token.
6. Call protected endpoints.

The API itself uses the following versioned base path:

```text
/api/v1
```

Swagger UI is available separately at:

```text
/docs
```

---

# Authentication Flow

The authentication system uses short-lived access tokens and refresh tokens.

Typical flow:

```text
Register
   |
   v
Login
   |
   +----> Access Token
   |
   +----> Refresh Token
             |
             v
        Refresh Token
             |
             v
      New Access Token
```

### Registration

Creates:

* User
* Free subscription
* Initial account state

Passwords are hashed before persistence.

### Login

Valid credentials return authentication tokens.

Invalid credentials return a generic authentication error rather than exposing whether the email or password was incorrect.

### Protected Requests

Protected endpoints require:

```text
Authorization: Bearer <access_token>
```

### Refresh

The refresh endpoint can be used to obtain a new access token.

Refresh sessions are persisted and refresh-token rotation is supported.

### Logout

Logout invalidates the corresponding authenticated session/refresh token.

---

# API Modules

The backend is divided into the following primary API areas.

## Authentication

Responsible for:

* Registration
* Login
* Refresh
* Logout
* Current user information

---

## Users

Responsible for:

* User profile
* Profile updates
* Password changes
* Account deletion

User ownership and authentication are enforced for protected resources.

---

## Subscriptions

Responsible for:

* Current subscription
* Subscription status
* Plan information
* Upgrade/downgrade
* Usage limits
* Remaining requests

---

## AI Providers

Responsible for managing supported AI providers:

```text
OPENAI
ANTHROPIC
GOOGLE
```

Provider credentials are encrypted before storage.

Provider management includes:

* Create
* Update
* Delete
* Enable/disable
* Default provider selection
* Health checks

---

## Chat

Responsible for:

* Sending prompts
* Selecting AI providers
* Selecting models
* Creating conversations
* Retrieving conversations
* Updating conversations
* Deleting conversations
* Retrieving messages
* Persisting user and assistant messages

Chat usage and request information are recorded for monitoring and analytics.

---

## Web Search

Provides AI-assisted web search functionality.

Available functionality includes:

* Search query
* Search history
* Recent searches
* Search suggestions
* Search provider integration
* AI-generated answer based on retrieved search results
* Source URLs

Search requests are persisted and usage information is tracked.

---

## Admin

Administrative APIs provide:

* Dashboard statistics
* User management
* Subscription management
* AI provider management
* API usage analytics
* Request logs
* System health

Administrative endpoints require authentication and administrator authorization.

---

# Security

The application applies several security practices.

### Password Security

Passwords are hashed using:

```text
bcrypt
```

Plain-text passwords are never stored.

### JWT Authentication

Protected resources use JWT authentication.

Access and refresh tokens use separate secrets and expiration configurations.

### Refresh Token Security

Refresh sessions are persisted and refresh-token rotation is used to reduce the impact of token reuse.

### API Key Encryption

AI provider API keys are encrypted before being stored in the database.

### Role-Based Authorization

The application supports:

```text
USER
ADMIN
```

Administrative endpoints require the appropriate role.

### Input Validation

Global NestJS validation is enabled with:

* `whitelist`
* `forbidNonWhitelisted`
* `transform`

DTOs use `class-validator` constraints.

### HTTP Security Headers

Helmet is enabled to add common HTTP security headers.

### CORS

CORS is configured through:

```env
CORS_ORIGIN
```

### Rate Limiting

NestJS throttling is included to help protect API endpoints against excessive requests.

---

# Error Handling

The application uses a global HTTP exception filter to provide consistent API error handling.

Typical HTTP statuses include:

| Status | Meaning                             |
| ------ | ----------------------------------- |
| `400`  | Invalid request or validation error |
| `401`  | Authentication required/invalid     |
| `403`  | Insufficient permissions            |
| `404`  | Resource not found                  |
| `409`  | Conflict or business-rule violation |
| `429`  | Rate limit exceeded                 |
| `502`  | External AI/search provider failure |
| `503`  | Dependency/service unavailable      |
| `500`  | Unexpected server error             |

Sensitive internal error details are not exposed to API clients when an external provider fails.

---

# Validation and Rate Limiting

Request DTOs validate incoming data before it reaches business logic.

Examples include:

* Required fields
* String length
* UUID validation
* Enum validation
* Pagination parameters
* Date parameters
* Search query validation

The API also includes throttling support to limit excessive requests.

---

# Database Design

The application uses a normalized PostgreSQL schema managed through Prisma.

The schema includes entities for:

* Users
* Sessions
* Subscription Plans
* Subscriptions
* AI Providers
* Conversations
* Messages
* Web Searches
* API Usage Logs
* Request Logs

The Prisma schema is located at:

```text
prisma/schema.prisma
```

The database is designed to separate authentication/session data, subscription information, provider configuration, conversation data, search activity, and monitoring data.

---

# Testing

The project is configured with Jest and Supertest.

Available scripts include:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:cov
```

Debug:

```bash
npm run test:debug
```

End-to-end testing:

```bash
npm run test:e2e
```

Tests should cover critical authentication, authorization, ownership, subscription, provider, chat, and administrative flows.

---

# Code Quality

The project includes:

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

The codebase follows NestJS modular architecture and separates controllers, services, repositories, DTOs, guards, and infrastructure concerns where appropriate.

---

# Git Workflow

Feature development is organized using separate branches.

Example:

```text
main
 |
 +-- feature/auth-jwt
 |
 +-- feature/chat-api
 |
 +-- feature/web-search
 |
 +-- feature/admin-api
 |
 +-- docs/swagger-and-readme
```

Completed features are merged into `main` through feature branches.

This keeps the main branch stable while allowing individual features to be developed and reviewed independently.

---

# Postman

A Postman collection can be used as an optional alternative to Swagger for API testing.

Swagger is the primary API documentation source:

```text
http://localhost:3000/docs
```

When using Postman, authenticated requests should include:

```text
Authorization: Bearer <access_token>
```

---

# Docker

Docker is **optional** for this assignment.

The assignment specifies:

> Docker (Optional but recommended)

Therefore, the application does not require Docker to run.

The current development setup can use a locally installed PostgreSQL server.

Recommended local architecture:

```text
NestJS Application
       |
       v
     Prisma
       |
       v
Local PostgreSQL
```

The backend itself does not need to be containerized to satisfy the assignment requirements.

---

# Known Limitations

The following assignment bonus features are not required for the core implementation:

* Email verification
* Streaming chat responses
* Search result caching

These can be implemented as future enhancements without changing the core API architecture.

External AI and web-search functionality also depends on valid provider credentials configured through environment variables.

---

# Troubleshooting

## PostgreSQL connection error

Verify that PostgreSQL is running and that `DATABASE_URL` contains the correct:

* Username
* Password
* Host
* Port
* Database name

Example:

```env
DATABASE_URL="postgresql://echogpt:password@localhost:5432/echogpt_db?schema=public"
```

---

## Prisma migration error

First verify:

```bash
npx prisma generate
```

Then apply migrations:

```bash
npx prisma migrate deploy
```

For development migration changes:

```bash
npx prisma migrate dev
```

---

## Port already in use

If port `3000` is already occupied, change:

```env
PORT=3000
```

to another available port, for example:

```env
PORT=3001
```

Then restart the application.

---

## Swagger is not available

Make sure the application is running:

```bash
npm run start:dev
```

Then open:

```text
http://localhost:3000/docs
```

If the port was changed, use the configured port instead.

---

# Submission Information

This project is prepared according to the EchoGPT Backend REST API Development assignment requirements.

The submission includes:

* GitHub repository
* NestJS backend application
* PostgreSQL database schema
* Prisma ORM
* Database migration files
* JWT authentication
* Role-based authorization
* Swagger/OpenAPI documentation
* `.env.example`
* Authentication and session management
* User management
* Subscription management
* AI provider management
* Chat API
* Web Search API
* Admin APIs
* Usage tracking
* Request logging
* System health monitoring

### Local API

```text
http://localhost:3000
```

### Swagger

```text
http://localhost:3000/docs
```

### Versioned API Base Path

```text
http://localhost:3000/api/v1
```

---

## Quick Start

For a new developer, the shortest setup path is:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd echogpt-backend
npm install
copy .env.example .env
```

Configure `.env` with a valid PostgreSQL connection and secure secrets.

Then:

```bash
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Open:

```text
http://localhost:3000/docs
```

From Swagger:

1. Register a user.
2. Login.
3. Copy the access token.
4. Click **Authorize**.
5. Enter the Bearer token.
6. Test the protected APIs.

---

## License

This project is an assignment submission and is not intended for redistribution as a commercial product.
