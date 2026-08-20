---
description: Run the verification gates for whatever changed and report honestly
allowed-tools: Bash, Read, Glob, Grep
---

Run the checks that apply to the current changes and report the real result.

1. `git status --short` and `git diff --stat` to see which packages are touched.
2. If `chat-nestjs/` changed: `yarn lint`, `yarn test`, `yarn build` in that folder.
3. If `chat-react/` changed: `yarn build` in that folder. There is no test or lint script there — say that explicitly
   instead of implying the frontend is covered.
4. Also scan the diff for things the tooling will not catch:
   - new `console.log` / debug leftovers
   - secrets or credentials in tracked files; new env vars missing from `chat-nestjs/.env.example`
   - axios calls in `chat-react/src/utils/api.ts` missing the shared `config` (`withCredentials`)
   - `socket.on` without a matching `socket.off` cleanup
   - entity changes — flag them loudly, `synchronize: true` will rewrite the live schema on next boot

Report pass/fail per gate with the command output. If something failed, fix it or say precisely what is blocking.
