---
description: Add a realtime Socket.IO event end-to-end, gateway through SPA hook
argument-hint: <what should happen in realtime>
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

Implement this realtime behaviour end-to-end: **$ARGUMENTS**

Follow the existing pattern — `friend-requests` and the call events are the reference implementations.

**Backend (`chat-nestjs/`)**
1. Add the internal event name to `ServerEvents` and the client-facing name to `WebsocketEvents` in
   `src/utils/constants.ts`. Client-facing names are `onSomethingHappened`.
2. Domain services do not touch sockets. They emit through `EventEmitter2` with the `ServerEvents` constant. (Older
   gateway listeners use raw strings like `'message.create'` — do not copy that, use the enum.)
3. A listener in `src/events/` (or `src/gateway/gateway.ts`) subscribes with `@OnEvent(...)`, resolves the target
   socket(s) through `GatewaySessionManager`, and emits under the `WebsocketEvents` name.
4. Emit to the specific recipient socket, not broadcast, unless the feature genuinely is a broadcast.

**Frontend (`chat-react/`)**
5. New hook in `src/utils/hooks/sockets/<area>/useXReceived.ts`: `useContext(SocketContext)`, `socket.on(...)` inside a
   `useEffect`, dispatch into the store, and **always** `socket.off(name)` in the cleanup.
6. The event string must match the `WebsocketEvents` value character for character.
7. Call the hook from exactly one place (the page or layout that owns the concern). Registering it twice double-fires;
   `socket.off(name)` removes every handler for that event.
8. Payload type goes in `src/utils/types.ts`, shared with the REST types.

Finish with the `/check` gates and report the real output.
