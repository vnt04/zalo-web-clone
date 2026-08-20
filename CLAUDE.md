# zalo-web-clone

Zalo PC clone: realtime chat over WebSocket. A NestJS API + a React SPA in one repo, but **two independent packages** — there is no workspace/monorepo tool. Install, run, and test each one separately.

| Path | Stack | Details |
|---|---|---|
| `chat-nestjs/` | NestJS 9, Socket.IO, TypeORM 0.2.x, MySQL | `chat-nestjs/CLAUDE.md` |
| `chat-react/` | React 18, Vite 5, Redux Toolkit, SCSS Modules | `chat-react/CLAUDE.md` |

Package manager: **yarn** (both packages). Dependencies are not installed in a fresh clone.

## Run it

```bash
# API — serves on $PORT, must be 8001 (the SPA and CORS assume it)
cd chat-nestjs && yarn install
cp .env.example .env.development   # then fill in real values
yarn start:dev                     # Swagger at http://localhost:8001/api/docs

# SPA — port 3000 (hardcoded in vite.config.ts, and the API only CORS-allows :3000)
cd chat-react && yarn install && yarn dev
```

MySQL must be reachable with the `MYSQL_DB_*` credentials before the API will boot. TypeORM runs with
`synchronize: true`, so the schema is created/altered from the entities on every start — there are no migrations.

## Verification gates

Run these before reporting work as done. Do not claim a check passed that you did not run.

| Package | Command | Notes |
|---|---|---|
| chat-nestjs | `yarn lint` | eslint + prettier, `--fix` is on by default |
| chat-nestjs | `yarn test` | jest, matches `src/**/*.spec.ts` |
| chat-nestjs | `yarn build` | `nest build` |
| chat-react | `yarn build` | `tsc -b && vite build` — **the only automated gate on the frontend** |

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
- **Two style systems coexist in the SPA**: `styled-components` (older code in `src/utils/styles/`) and SCSS Modules
  (`index.module.scss` next to the components). New UI follows the SCSS Module pattern; do not convert old code unasked.
- **`chat-react/` carries both `yarn.lock` and `package-lock.json`.** Use yarn; treat `package-lock.json` as stale.
- Secrets live in `chat-nestjs/.env.development` / `.env.production`, which are gitignored. Never print their contents or
  commit them; add new variables to `.env.example` instead.
- `console.log` calls are scattered through existing controllers, services and slices. That is the current state of the
  repo, not a licence to add more — do not leave new debug logging behind.

## Conventions

- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`). Existing history is looser; follow the
  convention for new commits.
- Do not commit or push unless asked.
- Backend files are 2-space, single-quote, prettier-enforced. Frontend files are inconsistent (tabs in some, 2-space in
  others) — match the file you are editing rather than reformatting it.
