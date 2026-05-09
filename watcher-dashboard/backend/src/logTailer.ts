import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';

export function setupLogTailer(io: Server, logPath: string): void {
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '');
  }
  let size = fs.statSync(logPath).size;
  const MAX_LINES = 300;
  io.on('connection', (socket) => {
    try {
      const content = fs.readFileSync(logPath, 'utf-8');
      const lines = content.split('\n').filter(Boolean).slice(-MAX_LINES);
      socket.emit('log:history', lines);
    } catch {
      /* ignore */
    }
  });
  fs.watch(logPath, () => {
    try {
      const stat = fs.statSync(logPath);
      if (stat.size < size) {
        size = 0;
      }
      if (stat.size > size) {
        const fd = fs.openSync(logPath, 'r');
        const buffer = Buffer.alloc(stat.size - size);
        fs.readSync(fd, buffer, 0, buffer.length, size);
        fs.closeSync(fd);
        size = stat.size;
        const newLines = buffer.toString('utf-8').split('\n').filter(Boolean);
        if (newLines.length > 0) {
          io.emit('log:lines', newLines);
        }
      }
    } catch {
      /* ignore */
    }
  });
}
