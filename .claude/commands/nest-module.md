---
description: Scaffold a new NestJS feature module in this repo's conventions
argument-hint: <feature name, e.g. notifications>
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Create the `$ARGUMENTS` module under `chat-nestjs/src/`, mirroring `conversations/` (the most complete example).

Files:
```
src/$ARGUMENTS/
  $ARGUMENTS.module.ts
  $ARGUMENTS.controller.ts
  $ARGUMENTS.service.ts
  $ARGUMENTS.ts            # the I<Feature>Service interface only
  dtos/                    # PascalCase, class-validator
  exceptions/              # one HttpException subclass per file
  tests/$ARGUMENTS.service.spec.ts
```

Rules that differ from stock Nest scaffolding — get these right:
- Register the route in the `Routes` enum and the DI token in the `Services` enum (`src/utils/constants.ts`) first.
- Providers use `{ provide: Services.X, useClass: XService }`; consumers inject `@Inject(Services.X) private readonly x: IXService`.
- Controller carries `@UseGuards(AuthenticatedGuard)` and uses `@AuthUser()` for the current user.
- Import the new module into `src/app.module.ts`.
- Any entity goes in `src/utils/typeorm/entities/` and must be exported from `src/utils/typeorm/index.ts` — TypeORM is
  0.2.37, not 0.3.x.
- Do not use `nest g` — its output does not match these conventions.

Then run `yarn lint`, `yarn test` and `yarn build` in `chat-nestjs/`.
