# AGENTS.md

## Project purpose

This repository contains **Lince**, an agent watcher dashboard. The current application lives in `watcher-dashboard/` and monitors markdown handoff specs in an agent handoff directory.

The dashboard watches these status folders under the configured agent directory:

- `inbox/`
- `running/`
- `done/`
- `failed/`
- `runs/`

By default, the backend uses:

- Windows: `C:/tmp/agent-handoff`
- Other platforms: `/tmp/agent-handoff`

The base directory can be overridden with the `AGENT_DIR` environment variable.

## Architecture

### Backend

Path: `watcher-dashboard/backend`

Stack:

- Node.js 20+
- TypeScript
- Express
- Socket.IO
- chokidar
- gray-matter

Main files:

- `src/index.ts`: HTTP server, Socket.IO server, health endpoint, result endpoint, watcher bootstrap.
- `src/watcher.ts`: watches markdown specs and run result files, builds the live kanban state, emits `state` over Socket.IO.
- `src/logTailer.ts`: tails `logs/watcher.log`, emits `log:history` and `log:lines` over Socket.IO.
- `src/types.ts`: shared backend state/spec types.

Important backend behavior:

- `GET /api/health` returns `{ ok: true }`.
- `GET /api/runs/:slug/result` looks for the first existing file in `runs/<slug>/` among:
  - `codex-result.md`
  - `claude-result.md`
  - `transcript.md`
  - `result.md`
- The watcher emits a `SystemState` object with `inbox`, `running`, `done`, and `failed` arrays.
- Markdown frontmatter is parsed and preserved in `frontmatter`.
- The first markdown heading is used as the card title when present.

### Frontend

Path: `watcher-dashboard/frontend`

Stack:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Socket.IO client

Main files:

- `src/App.tsx`: page shell, Lince header, status bar, kanban board, log viewer, modal.
- `src/hooks/useSocket.ts`: connects to the backend and subscribes to `state`, `log:history`, and `log:lines`.
- `src/components/`: UI components for cards, kanban columns, modal, logs, and status.
- `src/types.ts`: frontend mirror of the backend data model.

Important frontend behavior:

- The socket backend URL is `import.meta.env.VITE_BACKEND_URL || window.location.origin`.
- In local Vite development, the frontend proxies API and Socket.IO traffic to the backend.
- The UI branding should continue using the name **Lince** and the subtitle **agent watcher** unless the user explicitly asks for a rename.

## Setup commands

Run backend:

```bash
cd watcher-dashboard/backend
npm install
npm run dev
```

Run frontend in another terminal:

```bash
cd watcher-dashboard/frontend
npm install
npm run dev
```

Expected local ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

Run with Docker Compose:

```bash
cd watcher-dashboard
docker compose up --build
```

## Build and validation

Before finishing code changes, make a best effort to run the relevant checks.

Backend:

```bash
cd watcher-dashboard/backend
npm run build
```

Frontend:

```bash
cd watcher-dashboard/frontend
npm run build
```

Full project smoke check:

```bash
cd watcher-dashboard
docker compose up --build
```

If dependencies are not installed, run `npm install` in each service folder first.

There are currently no explicit test scripts in the service `package.json` files. Do not invent a test command. Prefer TypeScript builds and, when possible, a manual smoke test through the UI.

## Coding rules

- Keep the project TypeScript-first.
- Preserve the existing split between `backend/` and `frontend/`.
- Do not move the application out of `watcher-dashboard/` unless specifically asked.
- Keep Socket.IO event names stable unless a migration is explicitly requested:
  - `state`
  - `log:history`
  - `log:lines`
- Keep the status model stable unless changing the workflow intentionally:
  - `inbox`
  - `running`
  - `done`
  - `failed`
- When adding fields to specs or state, update both backend and frontend types.
- Prefer small, focused changes over large rewrites.
- Avoid adding new dependencies unless they clearly reduce complexity.
- Do not commit generated folders such as `node_modules/` or `dist/`.
- Do not commit local `.env` files.

## File watching and handoff contract

The dashboard expects markdown files in the status folders and run output files in `runs/<slug>/`.

When changing watcher behavior, preserve these assumptions unless the task says otherwise:

- Status cards come from `.md` files in `inbox`, `running`, `done`, and `failed`.
- A card id is derived from the markdown filename without `.md`.
- Result files are searched inside `runs/<id>/`.
- The dashboard should tolerate missing directories and missing result files.
- The log file is `logs/watcher.log` under the configured `AGENT_DIR`.

## UI guidance

- Keep the UI dense and operational: this dashboard is meant for monitoring active agent work.
- Preserve dark theme styling unless the user requests a theme change.
- Keep live connection state visible.
- Keep running output/logs visible without requiring the user to open a modal.
- Cards should show useful markdown title/preview information directly on the board.

## Deployment notes

Docker Compose currently defines separate `backend` and `frontend` services.

- Backend exposes port `3001`.
- Frontend exposes port `3000` and depends on the backend.
- Backend receives `AGENT_DIR=/tmp/agent-handoff` in Docker.
- The Compose volume currently mounts `/tmp/agent-handoff` read-only into the backend container.

If a feature needs the backend to write to the handoff directory, call this out clearly because the current Compose mount is read-only.

## Pull request / final response checklist

When completing a task:

1. Summarize what changed.
2. Mention which validation commands were run.
3. If a command could not be run, explain why.
4. Mention any behavior that affects the handoff directory, Socket.IO events, Docker configuration, or public API endpoints.
5. Keep the final response concise and action-oriented.
