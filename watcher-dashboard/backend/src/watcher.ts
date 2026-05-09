import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Server } from 'socket.io';
import { SpecFile, SystemState } from './types';

const WATCHED_DIRS = ['inbox', 'running', 'done', 'failed'] as const;
type StatusDir = typeof WATCHED_DIRS[number];
const MAX_TRANSCRIPT_LINES = 180;

function extractTitle(content: string, fallback: string): string {
  const heading = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(line => line.startsWith('#'));
  return heading ? heading.replace(/^#+\s*/, '').trim() : fallback;
}

function buildPreview(content: string): string {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('---'))
    .join(' ')
    .replace(/\s+/g, ' ')
    .slice(0, 260);
}

function findResultPath(baseDir: string, id: string): string | null {
  const runDir = path.join(baseDir, 'runs', id);
  const candidates = ['codex-result.md', 'claude-result.md', 'transcript.md', 'result.md'];
  for (const filename of candidates) {
    const candidate = path.join(runDir, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function readResultTail(baseDir: string, id: string): Pick<SpecFile, 'resultTail' | 'resultSize' | 'resultMtime' | 'resultFile'> {
  const resultPath = findResultPath(baseDir, id);
  if (!resultPath) return {};
  if (!fs.existsSync(resultPath)) return {};
  try {
    const stat = fs.statSync(resultPath);
    const maxBytes = 192 * 1024;
    const start = Math.max(0, stat.size - maxBytes);
    const fd = fs.openSync(resultPath, 'r');
    const buffer = Buffer.alloc(stat.size - start);
    fs.readSync(fd, buffer, 0, buffer.length, start);
    fs.closeSync(fd);
    const text = buffer.toString('utf-8');
    const lines = text.split(/\r?\n/).filter(Boolean).slice(-MAX_TRANSCRIPT_LINES);
    return { resultTail: lines, resultSize: stat.size, resultMtime: stat.mtimeMs, resultFile: path.basename(resultPath) };
  } catch {
    return {};
  }
}

function readSpec(baseDir: string, filePath: string, status: StatusDir): SpecFile | null {
  try {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(rawContent);
    const stat = fs.statSync(filePath);
    const filename = path.basename(filePath);
    const id = filename.replace(/\.md$/, '');
    const content = body.trim();
    return {
      id,
      filename,
      path: filePath,
      status,
      frontmatter,
      content,
      title: extractTitle(content, id),
      preview: buildPreview(content),
      ...readResultTail(baseDir, id),
      mtime: stat.mtimeMs,
    };
  } catch {
    return null;
  }
}

function buildState(baseDir: string): SystemState {
  const state: SystemState = { inbox: [], running: [], done: [], failed: [] };
  for (const dir of WATCHED_DIRS) {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const spec = readSpec(baseDir, path.join(dirPath, file), dir);
      if (spec) state[dir].push(spec);
    }
    state[dir].sort((a, b) => b.mtime - a.mtime);
  }
  return state;
}

export function setupWatcher(io: Server, baseDir: string): void {
  const watchPaths = [
    ...WATCHED_DIRS.map(d => path.join(baseDir, d)),
    path.join(baseDir, 'runs'),
  ];
  const emit = () => {
    const state = buildState(baseDir);
    io.emit('state', state);
  };
  emit();
  const watcher = chokidar.watch(watchPaths, {
    persistent: true,
    ignoreInitial: false,
    depth: 2,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });
  watcher
    .on('add', emit)
    .on('change', emit)
    .on('unlink', emit)
    .on('error', (err) => console.error('[watcher] error:', err));
}
