# chat-react — SPA

React 18 + Vite 5 + TypeScript (strict) + Redux Toolkit + SCSS Modules. Talks to `chat-nestjs` over REST and Socket.IO.
See the repo root `CLAUDE.md` for the cross-package contract.

## Commands

```bash
yarn dev     # vite, $WEB_PORT or 3000 — must stay in the API's CORS_ORIGIN allowlist
yarn build   # tsc -b && vite build — the only automated check in this package
yarn serve   # preview a build
```

There is **no test runner and no lint script here**. `src/__tests__/RegisterPage.spec.tsx`, `src/setupTests.ts`,
`src/reportWebVitals.ts` and `src/react-app-env.d.ts` are dead leftovers from Create React App; nothing runs them. Treat
`yarn build` as the gate, and say so plainly rather than implying tests passed.

Env comes from `.env.development` (committed, localhost-only values). Only `VITE_`-prefixed vars reach the browser.

## Layout

```
src/
  pages/          # route-level screens, one folder per area (conversations, group, friends, settings, calls)
  components/     # feature folders; a folder owns its index.module.scss
  guards/         # route guards used inside App.tsx routes
  store/          # RTK slices — flat files for older ones, folders for newer ones
  utils/
    api.ts        # every HTTP call in the app
    types.ts      # shared request/response types (mirrors the API)
    constants.ts  # static UI data (menu items, tabs)
    helpers.ts
    context/      # AuthContext, SocketContext, MessageMenuContext
    hooks/        # generic hooks + hooks/sockets/** for realtime listeners
    styles/       # legacy styled-components
```

Providers are composed once in `App.tsx`: Redux `store` → `AuthContext` → `SocketContext`. Routes are declared there too.

## HTTP

All requests go through `src/utils/api.ts` — one named exported function per endpoint, typed on both ends, using the shared
`axiosClient` and the shared `config` object (`{ withCredentials: true }`). **Omitting `config` means no session cookie is
sent and the call 401s.** Components never call axios directly.

axios is 0.27; error handling follows that version's shape.

## State

Redux Toolkit. A slice owns `createAsyncThunk`s that call the `api.ts` functions, and the reducer must be registered in
`src/store/index.ts` to exist. Newer slices live in a folder (`store/friends/friendsSlice.ts`), older ones are flat files —
put new ones in a folder. Typed dispatch is `useDispatch<AppDispatch>()`; selectors take `RootState`.

`serializableCheck` is disabled and `immer`'s `enableMapSet()` is called in `App.tsx`, so Maps/Sets in state are allowed.

## Realtime

One socket instance for the whole app, created in `utils/context/SocketContext.tsx` and read with `useContext(SocketContext)`.
Each server event gets its own hook under `utils/hooks/sockets/**`:

```ts
export function useXReceived() {
  const socket = useContext(SocketContext);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    socket.on('onXReceived', (payload: X) => dispatch(someAction(payload)));
    return () => { socket.off('onXReceived'); };   // always clean up
  }, []);
}
```

The event name string must match the `WebsocketEvents` value on the API side. Call the hook from the page/layout that needs
it — never register the same listener in two places, `socket.off(name)` removes all handlers for that event.

## Components & styles

Named exports, `React.FC<Props>` with a local `type Props = {...}`, one component per file, PascalCase filenames.

Two styling systems coexist:
- **SCSS Modules** — `index.module.scss` per component folder, imported as `import styles from "./index.module.scss"`.
  This is the pattern for new UI.
- **styled-components** — older shared primitives in `utils/styles/`. Still used by existing screens; leave them alone
  unless the task is specifically to migrate.

Icons come from `react-icons` and `akar-icons`; toasts from the `useToast` hook, not `react-toastify` directly.

## Gotchas

- `tsconfig.app.json` has `strict`, `noUnusedLocals` and `noUnusedParameters` on — an unused import fails `yarn build`.
- Several existing components call hooks after an early `return null`, which breaks the rules of hooks. Do not copy that
  shape into new components.
- Indentation is inconsistent across files (tabs in some, spaces in others). Match the file you are editing; do not
  reformat untouched lines.
