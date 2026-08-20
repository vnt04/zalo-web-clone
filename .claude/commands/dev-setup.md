---
description: Bootstrap the repo for local development (deps, env, DB, both servers)
allowed-tools: Bash, Read, Edit, Glob, Grep
---

Get this working copy runnable from scratch. Work through the steps and report what is still missing at the end.

1. **Deps** — `cd chat-nestjs && yarn install`, then `cd chat-react && yarn install`. Use yarn, never npm
   (`chat-react/package-lock.json` is stale).
2. **Backend env** — if `chat-nestjs/.env.development` does not exist, copy `chat-nestjs/.env.example` to it. Never print
   or echo the contents of a real `.env.*` file. List which variables are still placeholders so the user can fill them in
   (`COOKIE_SECRET`, the `MYSQL_DB_*` block, and the `CLOUDINARY_*` block are the ones that block a working app).
3. **Frontend env** — `chat-react/.env.development` is committed and expects the API on `http://localhost:8001`. Confirm
   `PORT=8001` in the backend env.
4. **Database** — check MySQL is reachable on the configured host/port and that `MYSQL_DB_NAME` exists; create the empty
   database if it does not. TypeORM `synchronize: true` builds the tables on first boot, so no migration step exists.
5. **Verify** — `cd chat-nestjs && yarn build` and `cd chat-react && yarn build`. Report real output; do not paper over a
   failure.

Do not start long-running dev servers unless the user asks — tell them the two commands instead.
