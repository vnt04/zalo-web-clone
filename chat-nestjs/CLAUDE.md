# chat-nestjs — API

NestJS 9 + Socket.IO + TypeORM 0.2.37 on MySQL. Session-cookie auth via Passport local. Global route prefix `api`,
Swagger at `/api/docs`. See the repo root `CLAUDE.md` for how this package pairs with the SPA.

## Commands

```bash
yarn start:dev   # watch mode
yarn lint        # eslint --fix over src, apps, libs, test
yarn test        # jest, src/**/*.spec.ts
yarn test:cov    # coverage → ../coverage
yarn build       # nest build
```

Env is loaded by `ConfigModule` from `.env.development`, or `.env.production` when `ENVIRONMENT=PRODUCTION`.
`.env.example` lists every variable the code actually reads — keep it in sync when you add one.

## Module layout

One folder per domain under `src/`. A complete module looks like:

```
src/<feature>/
  <feature>.controller.ts     # or controllers/ when there is more than one
  <feature>.service.ts        # or services/
  <feature>.ts                # the I<Feature>Service interface — NOT the implementation
  <feature>.module.ts
  dtos/Create<Thing>.dto.ts   # PascalCase file names, class-validator decorators
  exceptions/<Name>.ts        # one HttpException subclass per file
  middlewares/                # only where route-level authorization is needed
  tests/<feature>.service.spec.ts
```

## Dependency injection is token-based

Services are **not** injected by class. Every provider is registered under a string token from the `Services` enum in
`src/utils/constants.ts`, and consumers inject the interface:

```ts
// module
providers: [{ provide: Services.MESSAGES, useClass: MessageService }],
exports:   [{ provide: Services.MESSAGES, useClass: MessageService }],  // only if other modules need it

// consumer
constructor(
  @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
) {}
```

Adding a service means adding its token to `Services` first. Same for routes: controllers take their path from the
`Routes` enum, never a string literal — `@Controller(Routes.CONVERSATIONS)`.

## Controller conventions

```ts
@SkipThrottle()                    // most read-heavy controllers opt out of the global throttler
@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticatedGuard)     // session guard from src/auth/utils/Guards.ts
export class ConversationsController {
  @Get()
  async getConversations(@AuthUser() { id }: User) { ... }
}
```

- `@AuthUser()` (`src/utils/decorators.ts`) pulls the logged-in `User` off the request. Do not read `req.user` directly.
- Route-level authorization (e.g. "is this user in this conversation?") goes in a middleware registered from the module's
  `configure(consumer)`, following `ConversationsModule` — not inline in the controller.
- Throw a named exception from `exceptions/`, not a bare `HttpException`.
- Validation is global (`ValidationPipe` in `main.ts`); rules belong on the DTO.

## Entities

`src/utils/typeorm/entities/`, re-exported from `src/utils/typeorm/index.ts` as both named exports and the default
`entities` array consumed by `TypeOrmModule.forRoot`. A new entity that is not added to that array is invisible to the
ORM. Remember `synchronize: true` — an entity change rewrites the live schema on the next boot.

TypeORM here is **0.2.37**: `getRepository()` global, `findOne(id)`, `@JoinColumn` semantics of the 0.2 line. Do not write
0.3.x-style repository code.

## Realtime

`src/gateway/` holds the Socket.IO gateway, the session-aware `WebsocketAdapter`, and `GatewaySessionManager` (the
userId → socket registry). Domain code does not emit to sockets directly: it emits an in-process event via `EventEmitter2`,
and an `@OnEvent` listener in `src/gateway/gateway.ts` or `src/events/` resolves the recipient's socket and emits to the
client under an `onSomethingHappened` name.

Existing code is inconsistent here — the gateway listens on raw strings (`@OnEvent('message.create')`) while the
friend-request flow uses the `ServerEvents` / `WebsocketEvents` enums in `src/utils/constants.ts`. Use the enums for new
events, and add both the internal and the client-facing name there.

## Tests

Jest + `@nestjs/testing`. Shared fixtures live in `src/__mocks__/index.ts` (`mockUser`, …). Existing specs are mostly
smoke-level ("should be defined"); new tests for new logic should assert real behaviour — arrange/act/assert, one
behaviour per test, mock collaborators through the same `Services` tokens the module uses.
