# zalo-web-clone

Zalo PC clone: realtime chat over WebSocket. A NestJS API + a React SPA in one repo, but **two independent packages** — there is no workspace/monorepo tool. Install, run, and test each one separately.

| Path | Stack | Details |
|---|---|---|
| `chat-nestjs/` | NestJS 9, Socket.IO, TypeORM 0.2.x, MySQL | `chat-nestjs/CLAUDE.md` |
| `chat-react/` | React 18, Vite 5, Redux Toolkit, SCSS Modules | `chat-react/CLAUDE.md` |

Package manager: **yarn** (both packages). Dependencies are not installed in a fresh clone.

## Run it — docker (default)

```bash
cp .env.example .env    # host ports and credentials for the whole stack
docker compose up --build
```

Brings up MySQL, the API and the SPA together. SPA on `http://localhost:3100`, Swagger on
`http://localhost:8001/api/docs`, MySQL published on `3307`. Those defaults dodge ports that other local stacks
commonly hold (`3000`, `3306`); change them in `.env` and every service follows.

Source is bind-mounted and both dev servers watch, so edits hot-reload. `node_modules` lives in a named volume, not on
the host — **after changing `package.json` you must rebuild the volume**, or the container keeps the old dependencies:

```bash
docker compose down
docker volume rm zalo-web-clone_api-node-modules   # or _web-node-modules
docker compose up --build
```

`docker compose down -v` also drops `mysql-data`, i.e. the whole database.

## Run it — native

Still supported; needs a MySQL you provide yourself.

```bash
# API — serves on $PORT, must be 8001 (the SPA's .env.development assumes it)
cd chat-nestjs && yarn install
cp .env.example .env.development   # then fill in real values
yarn start:dev                     # Swagger at http://localhost:8001/api/docs

# SPA — port 3000 unless WEB_PORT says otherwise
cd chat-react && yarn install && yarn dev
```

TypeORM runs with `synchronize: true`, so the schema is created/altered from the entities on every start — there are no
migrations. Under docker the database is created for you; natively you must create it before the API will boot.

## Verification gates

Run these before reporting work as done. Do not claim a check passed that you did not run.

Under docker, prefix with `docker compose exec api` / `docker compose exec web`.

| Package | Command | State |
|---|---|---|
| chat-nestjs | `yarn lint` | ✅ passes — eslint + prettier, `--fix` is on by default, 22 warnings are expected |
| chat-nestjs | `yarn build` | ✅ passes — `nest build` |
| chat-react | `yarn build` | ✅ passes — `tsc -b && vite build`, the only gate in that package |
| chat-nestjs | `yarn test` | ✅ passes — jest, 11/11 suites |

`yarn test` was broken for a long time (9/11 suites failing) and was fixed on `fix/production-blockers`. It is a real
gate now — a red suite means you broke something. Two distinct causes were at play, worth knowing before you add specs:
most were `nest g` boilerplate that never got the repository and `Services.*` providers their subject injects, and the
two friend-request specs had additionally drifted from the code (asserting `email` after the app moved to `phoneNumber`,
and `rejects.toThrow` without `await`, which asserts nothing).

Shared fixtures live in `src/__mocks__/index.ts` — `mockUser` and `mockRepository()`. Reach for `mockRepository()` rather
than hand-rolling a repository stub per spec.

`chat-react` runs `strict`, `noUnusedLocals` and `noUnusedParameters`, so an unused import or an unused destructured
setter fails the build. For a deliberately unused callback parameter, prefix it with `_` rather than deleting it.

`chat-react` has **no test and no lint script**. Do not run `yarn test` there; it will fail. `src/__tests__/RegisterPage.spec.tsx`
and `setupTests.ts` are leftovers from the pre-Vite Create React App setup — no runner is wired up to them.

## How the two halves connect

- **Base URL**: SPA reads `VITE_API_URL` (`http://localhost:8001/api`). The API sets a global `api` prefix in `src/main.ts`.
- **Auth**: session cookie `CHAT_APP_SESSION_ID`, Passport local strategy, sessions persisted to MySQL via `connect-typeorm`.
  Every axios call in `chat-react/src/utils/api.ts` must pass `{ withCredentials: true }` (the shared `config` object) or it
  will be unauthenticated. Same for the socket connection.
- **Realtime**: Socket.IO. SPA connects once in `chat-react/src/utils/context/SocketContext.tsx` using `VITE_WEBSOCKET_URL`;
  the API side is `chat-nestjs/src/gateway/` with a custom `WebsocketAdapter` that reuses the HTTP session for socket auth.
- **Uploads**: multipart `FormData` from the SPA → Multer → Cloudinary (avatars/banners/attachments).

## Adding a feature end-to-end

Most changes here are a vertical slice. Touch the layers in this order and keep the names consistent across both packages:

1. `chat-nestjs/src/utils/typeorm/entities/` — entity, then export it from `entities/index.ts`
2. `chat-nestjs/src/<feature>/dtos/` — request DTO with `class-validator` decorators
3. `chat-nestjs/src/<feature>/<feature>.ts` — the service interface (`I<Feature>Service`)
4. service → controller → module wiring (see `chat-nestjs/CLAUDE.md`, the DI is token-based, not class-based)
5. `chat-react/src/utils/types.ts` — mirror the response shape
6. `chat-react/src/utils/api.ts` — one exported axios function
7. `chat-react/src/store/<feature>/` — slice + thunks, then register the reducer in `src/store/index.ts`
8. component under `chat-react/src/components/<feature>/`

Use `/api-endpoint` and `/socket-event` for guided versions of this.

## Gotchas

- **TypeORM is 0.2.37, not 0.3.x.** The global `getRepository()` still exists and `findOne(id)` takes a bare id.
  Code written against 0.3 API docs will not compile.
- **`synchronize: true`** means an entity edit rewrites the live schema on next boot. Renaming a column drops data.
- **Swagger is pinned to `@nestjs/swagger` 5.2.1** while Nest itself is 9 — do not upgrade one without the other.
- **axios is 0.27** — error shape and config differ from axios 1.x.
- **The SPA styles with SCSS Modules only** — `index.module.scss` next to each component folder, plus the shared mixin
  partial `src/utils/styles/_zalo.scss`. `styled-components` was removed; do not reintroduce it.
- **Colours come from the `--zl-*` custom properties in `src/index.css`**, never hardcoded hex. Dark mode swaps those
  values under `:root[data-theme="dark"]`; `AppPage` stamps `data-theme` from the settings slice. A literal hex in a
  component means that element will not follow the theme.
- **`chat-react/` carries both `yarn.lock` and `package-lock.json`.** Use yarn; treat `package-lock.json` as stale.
- **`CORS_ORIGIN` only works from the real environment.** The `@WebSocketGateway` decorator in `src/gateway/gateway.ts`
  is evaluated at import time, before `ConfigModule` reads `.env.development` — so a value set in that file reaches the
  REST CORS but not the socket gateway. Docker passes it as a process env var, which both honour. Both call
  `getCorsOrigins()` in `src/utils/cors.ts`.
- Secrets live in `chat-nestjs/.env.development` / `.env.production` and the root `.env` (docker), all gitignored. Never
  print their contents or commit them; add new variables to the matching `.env.example` instead.
- `console.log` calls are scattered through existing controllers, services and slices. That is the current state of the
  repo, not a licence to add more — do not leave new debug logging behind.

## Conventions

- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`). Existing history is looser; follow the
  convention for new commits.
- Do not commit or push unless asked.
- Backend files are 2-space, single-quote, prettier-enforced. Frontend files are inconsistent (tabs in some, 2-space in
  others) — match the file you are editing rather than reformatting it.
