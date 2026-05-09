import { SpecFile, SystemState } from '../types';

interface Props {
  state: SystemState;
  connected: boolean;
  logs: string[];
}

function fmtTime(ms?: number): string {
  if (!ms) return '--:--';
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function newest(items: SpecFile[]): SpecFile | undefined {
  return [...items].sort((a, b) => b.mtime - a.mtime)[0];
}

export function StatusBar({ state, connected, logs }: Props) {
  const total = state.inbox.length + state.running.length + state.done.length + state.failed.length;
  const running = newest(state.running);
  const recent = running ?? newest([...state.done, ...state.failed, ...state.inbox]);
  const safeTotal = Math.max(total, 1);
  const donePct = (state.done.length / safeTotal) * 100;
  const failedPct = (state.failed.length / safeTotal) * 100;
  const runningPct = (state.running.length / safeTotal) * 100;
  const inboxPct = (state.inbox.length / safeTotal) * 100;
  const lastLog = logs[logs.length - 1];

  return (
    <div className="status-bar flex-shrink-0 border-b border-[#151515] px-5 py-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`status-orb ${connected ? 'status-orb-live' : 'status-orb-dead'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#555]">system</span>
            <span className={connected ? 'text-emerald-400 text-[10px]' : 'text-red-400 text-[10px]'}>
              {connected ? 'online' : 'offline'}
            </span>
            <span className="text-[#2f2f2f] text-[10px]">/</span>
            <span className="text-[10px] text-[#777] truncate">
              {running ? `running: ${running.title || running.id}` : recent ? `last: ${recent.title || recent.id}` : 'standing by'}
            </span>
          </div>
          <div className="mt-1 h-1 rounded-full overflow-hidden bg-[#141414] flex">
            <div className="bg-sky-500/70" style={{ width: `${inboxPct}%` }} />
            <div className="bg-amber-500/80" style={{ width: `${runningPct}%` }} />
            <div className="bg-emerald-500/70" style={{ width: `${donePct}%` }} />
            <div className="bg-red-500/75" style={{ width: `${failedPct}%` }} />
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[10px] tabular-nums">
          <span className="text-sky-400/75">inbox {state.inbox.length}</span>
          <span className="text-amber-400/80">running {state.running.length}</span>
          <span className="text-emerald-400/75">done {state.done.length}</span>
          <span className="text-red-400/75">failed {state.failed.length}</span>
        </div>
        <div className="hidden xl:block max-w-[360px] truncate text-[10px] text-[#3f3f3f]" title={lastLog}>
          {lastLog || `last activity ${fmtTime(recent?.mtime)}`}
        </div>
      </div>
    </div>
  );
}
