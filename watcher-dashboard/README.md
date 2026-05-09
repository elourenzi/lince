# Watcher Dashboard

Realtime dashboard for markdown handoff specs under `C:/tmp/agent-handoff` on Windows or `/tmp/agent-handoff` elsewhere.

The board shows the markdown request title/preview directly in Inbox and Running cards. When a run writes
`runs/<slug>/codex-result.md`, `claude-result.md`, `transcript.md`, or `result.md`, the backend tails that file
and streams the latest transcript lines to the bottom live terminal.

## Structure

- `backend`: Express, Socket.IO, chokidar watcher, and log tailer.
- `frontend`: React, Vite, Tailwind, and Socket.IO client.

## Development

Install dependencies:

```powershell
cd C:\Users\elder.adm\Documents\workforme\watcher-dashboard\backend
npm install
cd ..\frontend
npm install
```

Run locally:

```powershell
cd C:\Users\elder.adm\Documents\workforme\watcher-dashboard\backend
npm run dev
```

In another terminal:

```powershell
cd C:\Users\elder.adm\Documents\workforme\watcher-dashboard\frontend
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:3001`.

## Docker

```powershell
docker compose up --build
```
