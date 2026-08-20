---
description: Add a REST endpoint end-to-end, API through SPA, following repo conventions
argument-hint: <what the endpoint should do>
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Implement this endpoint as a full vertical slice: **$ARGUMENTS**

Read the two package `CLAUDE.md` files first, then follow the existing conventions exactly — copy the shape of the
closest existing feature (`conversations`, `messages`, `friends`) rather than inventing a new one.

**Backend (`chat-nestjs/`)**
1. Add the route to the `Routes` enum and any new service token to the `Services` enum in `src/utils/constants.ts`.
2. DTO in `src/<feature>/dtos/` with `class-validator` decorators (validation is global, it belongs on the DTO).
3. Declare the method on the `I<Feature>Service` interface in `src/<feature>/<feature>.ts`, then implement it.
4. Controller method: `@Controller(Routes.X)` + `@UseGuards(AuthenticatedGuard)`, `@AuthUser()` for the current user,
   named exceptions from `exceptions/` — never a bare `HttpException`.
5. Wire the provider in the module with the `{ provide: Services.X, useClass: XService }` token form, and export it if
   another module consumes it. Route-level authorization goes in a middleware registered from `configure(consumer)`.
6. New/changed entity → export it from `src/utils/typeorm/index.ts`, and warn the user that `synchronize: true` will
   alter the live schema.

**Frontend (`chat-react/`)**
7. Mirror the request/response types in `src/utils/types.ts`.
8. One exported function in `src/utils/api.ts` using `axiosClient` and the shared `config` object — without it the
   session cookie is not sent and the call 401s.
9. If it feeds state: a thunk in the relevant slice under `src/store/`, and register the reducer in `src/store/index.ts`.
10. Wire the UI only if the task asks for it.

Finish with the `/check` gates for both packages and report the real output.
