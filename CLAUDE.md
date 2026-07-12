# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**swipe-n-rekt-be** is a NestJS 11 backend for a crypto sports betting platform. Users authenticate via Solana wallet, place USDC bets on live match propositions (e.g., "Goal in the next 5 minutes?"), and collect cNFT cards. Bets settle on-chain with Merkle proof verification.

## Common Commands

```bash
pnpm install              # Install dependencies
pnpm run build            # Build (nest build)
pnpm run start:dev        # Dev server with watch mode
pnpm run lint             # ESLint with auto-fix
pnpm run format           # Prettier format
pnpm run test             # Run all unit tests (jest)
pnpm run test -- --testPathPattern=auth  # Run tests for a specific module
pnpm run test:e2e         # E2E tests
pnpm run migration:run    # Run TypeORM migrations
pnpm run migration:gen --name=my_migration  # Generate migration from entity diff
npx tsc --noEmit          # Type-check without emitting
```

**⚠️ Known issue:** `migration:revert` script points to wrong path (`src/config/migration.config.ts` instead of `src/migration.config.ts`).

## Architecture

### Tech Stack
- **NestJS 11** + **TypeORM 1.x** + **PostgreSQL**
- **pnpm** package manager
- **JWT auth** (24h expiry) with Solana wallet-based login (walletAddress + nonce)
- API docs served at `/docs` via Scalar UI (`@scalar/nestjs-api-reference`)

### Module Structure (src/)
Seven domain modules registered in `AppModule`:
- **auth** — `POST /auth/login` (wallet auth, returns JWT)
- **user** — `GET /user/info` (authenticated user profile)
- **match** — `GET /match` (public, paginated, default status=live)
- **proposition** — `GET /proposition` (public, paginated by match_id)
- **bet** — `GET /bets` (authenticated, paginated user bets), `POST /bets` (place bet with transaction)
- **album** — `GET /album`, `GET /album/:id` (public, collectible albums)
- **card** — Entity-only module (no controller/service), cards belong to albums

### Key Patterns

**Response wrapper:** All endpoints return `ResponseWrapper` shape: `{ status: boolean, message?, error?, data, meta? }`. Response DTOs extend `ResponseWrapper` using `declare` to override the `data` type. Helper `buildMeta(page, limit, totalData)` in `app.utils.ts`.

**Authentication:** `JwtAuthGuard` (custom `CanActivate`) attaches `JwtPayload { sub, walletAddress }` to `request.user`. Use `AuthenticatedRequest` type from `src/auth/jwt-auth.guard.ts`. Protected endpoints use `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth()`.

**Repositories:** Custom repository classes extend TypeORM `Repository<Entity>` with `DataSource` injection via `super(Entity, dataSource.createEntityManager())`. However, most services use `@InjectRepository(Entity)` directly.

**Transactions:** Use `DataSource.createQueryRunner()` for manual transactions (see `BetService.createBet`). All reads within a transaction must use `queryRunner.manager` (not the injected repository) for proper isolation.

**DTO conventions:** Input and output DTOs live in `dtos/` per module. Input DTOs use `class-validator` decorators. Pagination query DTOs use `@Type(() => Number)` from `class-transformer` with optional `page` and `limit` fields.

**Config:** Custom `ConfigService` singleton in `app.config.ts` (not `@nestjs/config`). Validates required env vars on import. Provides `getTypeOrmConfig()`, `getJwtConfig()`, `getRedisConfig()`, `getS3Config()`.

### Required Environment Variables
`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET` — see `.env.example`.

## Code Style

- **Prettier:** single quotes, trailing commas
- **ESLint:** flat config, `no-explicit-any` off, `no-floating-promises` warn
- **TypeScript:** `strictNullChecks` on, `noImplicitAny` off, target ES2023, module nodenext
- Swagger decorators (`@ApiProperty`, `@ApiOperation`, etc.) on all endpoints and DTO fields
