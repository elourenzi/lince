import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SystemState } from '../types';

const BACKEND_URL = 'http://localhost:3001';

export function useSocket() {
  const [state, setState] = useState<SystemState>({ inbox: [], running: [], done: [], failed: [] });
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('state', (data: SystemState) => setState(data));
    s.on('log:history', (lines: string[]) => setLogs(lines));
    s.on('log:lines', (newLines: string[]) =>
      setLogs(prev => [...prev, ...newLines].slice(-500))
    );
    return () => {
      s.disconnect();
    };
  }, []);

  return { state, logs, connected };
}
