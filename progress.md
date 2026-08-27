Original prompt: 我们这个熊蛙棋之前用的联机方式很菜，并且更换棋子图标依赖玩家自己改url，我们可以来完善这个熊蛙棋游戏。你来设计构思并实现。除了我提的点，也可以进行其他优化。

## Direction

- Keep the existing React/CRA stack and replace the fragile gameplay shell incrementally.
- Use one shared, serializable rules engine for local play, AI, server validation, and tests.
- Replace seat-specific invite URLs with one room link, automatic seat assignment, visible connection state, revisioned snapshots, and reconnect tokens.
- Move piece appearance into an in-app theme editor backed by localStorage.
- Visual thesis: a modern match on a rain-washed forest table, with ink, moss, coral, and paper-white contrast.

## Progress

- Audited the legacy Redux and WebSocket flow.
- Generated a project background asset with a calm central play area.
- Added a serializable rules engine, capture validation, move labels, and alpha-beta AI.
- Added focused rule tests for legal moves, captures, four-piece blocking, and AI legality.
- Added a protocol-v2 WebSocket room server with automatic seats, spectators, revisions, reconnect tokens, presence, rematch votes, rate limits, and authoritative move validation.
- Replaced the legacy UI entrypoint with a responsive Canvas board, in-app piece themes, settings, local/AI timelines, online status, history, and accessible controls.
- Unit tests and the production build pass.
- Fixed the Windows/Node 24 dev launcher and removed the unused legacy CRA HTTP proxy that produced an invalid dev-server host allowlist.
- Desktop visual QA passed; adjusted the keyboard cursor so it appears only while the Canvas is focused.

## Verification

- Rule and AI tests pass (5/5).
- WebSocket protocol smoke test passes for seats, spectators, moves, stale revisions, disconnects, and reconnects.
- Production build completes successfully.
- Desktop and mobile browser QA pass without console errors, horizontal overflow, or overlapping UI.
- Two-client online play stays synchronized and pauses correctly when a player disconnects.

## Latest update

- Added an automatic end-of-game result modal with clear victory/failure state, winner, end reason, and context-appropriate restart/rematch actions.
- Browser QA verified local completion, AI failure state, modal restart behavior, and 390px mobile layout without console errors.
- `npm test -- --watchAll=false --runInBand`, `npm run test:server`, `npm run lint`, and `npm run build` pass; lint retains only pre-existing warnings.
