# ROOMLY Platform

This is the monorepo for the ROOMLY platform, a PG and co-living booking platform for the Indian market.

## Monorepo Structure

- `apps/web`: Next.js 15 App Router frontend
- `apps/api`: NestJS 10 backend
- `packages/database`: Prisma ORM + PostgreSQL schema
- `packages/types`: Shared TypeScript interfaces and DTOs
- `packages/utils`: Shared utility functions
- `packages/config`: Shared ESLint, Prettier, TypeScript configs

## Prerequisites

- Node.js (>= 20)
- pnpm (>= 9.x)
- Docker & Docker Compose (for local DB/Redis)

## Local Development Setup

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` at the root, and configure the necessary variables.
   ```bash
   cp .env.example .env
   ```

3. **Start Infrastructure**
   Start PostgreSQL and Redis locally using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. **Database Setup**
   Run Prisma migrations to create the database schema:
   ```bash
   pnpm --filter database run db:push
   ```

5. **Start Development Servers**
   Start both the Next.js and NestJS servers simultaneously:
   ```bash
   pnpm dev
   ```

   - **Web App**: http://localhost:3000
   - **API Server**: http://localhost:4000
   - **pgAdmin**: http://localhost:5050 (admin@roomly.in / admin)

## Scripts

- `pnpm build`: Build all apps and packages
- `pnpm dev`: Start all apps in development mode
- `pnpm lint`: Run ESLint across all apps and packages
- `pnpm typecheck`: Run TypeScript compilation check
- `pnpm test`: Run tests

## Tech Stack
- Next.js 15, Tailwind CSS, shadcn/ui
- NestJS 10
- PostgreSQL 16, Redis 7, Prisma 5
- Turborepo, pnpm workspaces
