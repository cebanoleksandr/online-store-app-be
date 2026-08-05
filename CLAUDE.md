# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev      # run with watch mode (primary dev loop)
npm run build           # nest build
npm run lint             # eslint --fix on src/apps/libs/test
npm run format            # prettier --write

npm run test              # unit tests (jest, rootDir: src, matches *.spec.ts)
npm run test:watch
npm run test:cov
npm run test:e2e          # e2e tests, config in test/jest-e2e.json

# single test file
npx jest path/to/file.spec.ts
```

Local infra (Postgres + Redis) is started via `docker-compose up -d`. Postgres runs on host port `5436` (container `nice_gadgets_db`), Redis on `6379`. Config is read from `.env` via `@nestjs/config` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `PORT`).

## Architecture

NestJS REST API ("nice_gadgets" online store backend) using TypeORM against Postgres, with a modules-per-domain layout under `src/`: `users`, `products`, `cart`, `orders`, `payments`, `favorites`, `auth`, `uploads`, `redis`. Each domain module follows the standard Nest triad (`*.module.ts`, `*.controller.ts`, `*.service.ts`) plus `dto/` and `entities/` subfolders where relevant.

- **`TypeOrmModule.forRootAsync`** in `app.module.ts` registers all entities centrally (`User`, `Product`, `CartItem`, `Order`, `OrderItem`, `Favorite`) and runs with `synchronize: true` — schema is derived directly from entity classes, there are no migration files.
- **Auth**: JWT-based (`@nestjs/passport` + `passport-jwt`), strategy in `auth/stratagies/jwt.strategy.ts` (note the misspelled directory name — matches existing convention, don't rename without updating imports). `JwtAuthGuard` (`auth/guards/jwt-auth.guard.ts`) protects routes; role-based access uses `RolesGuard` + the `@Roles(UserRole.ADMIN)` decorator (`auth/decorators/roles.decorator.ts`) — see `products.controller.ts` for the pattern (`@UseGuards(JwtAuthGuard, RolesGuard)` combined with `@Roles(...)`). `UserRole` enum lives in `users/entities/user.entity.ts`.
- **Redis**: `RedisModule`/`RedisService` wraps `ioredis`, exposing `getClient()`. Used by `CartModule` to back the shopping cart (cart state is not a TypeORM entity-only concern — check `cart.service.ts` before assuming Postgres is the source of truth for cart data).
- **Orders/Payments**: `PaymentsService` (`payments/payments.service.ts`) is currently a mock Stripe integration — it fabricates a checkout URL rather than calling the real Stripe API. `OrdersWebhookController` (`orders/orders-webhook.controller.ts`, route `POST /webhooks/orders/stripe`) simulates receiving a payment webhook and calls `OrdersService.updateOrderStatus`. Treat both as scaffolding for a future real integration, not production payment handling.
- **Static file serving**: `ServeStaticModule` serves the `uploads/` directory at `/uploads/`; `UploadsModule`/`UploadsController` handles file upload endpoints (multer-based).
- Some in-repo log/user-facing strings are written in Ukrainian (e.g. `payments.service.ts`, `orders-webhook.controller.ts`) — preserve this when editing nearby code unless asked to change it.
