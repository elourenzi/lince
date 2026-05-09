import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { setupWatcher } from './watcher';
import { setupLogTailer } from './logTailer';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const BASE_DIR =
  process.env.AGENT_DIR ||
  (process.platform === 'win32' ? 'C:/tmp/agent-handoff' : '/tmp/agent-handoff');

const LOG_FILE = path.join(BASE_DIR, 'logs', 'watcher.log');

app.get('/api/runs/:slug/result', (req, res) => {
  const { slug } = req.params;
  const runDir = path.join(BASE_DIR, 'runs', slug);
  const resultPath = ['codex-result.md', 'claude-result.md', 'transcript.md', 'result.md']
    .map(filename => path.join(runDir, filename))
    .find(candidate => fs.existsSync(candidate));
  if (resultPath) {
    res.type('text/plain').send(fs.readFileSync(resultPath, 'utf-8'));
  } else {
    res.status(404).json({ error: 'Result file not found' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

io.on('connection', (socket) => {
  console.log(`[ws] client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`[ws] client disconnected: ${socket.id}`));
});

setupWatcher(io, BASE_DIR);
setupLogTailer(io, LOG_FILE);

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] watching: ${BASE_DIR}`);
});
