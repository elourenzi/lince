import { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { KanbanBoard } from './components/KanbanBoard';
import { LogViewer } from './components/LogViewer';
import { Modal } from './components/Modal';
import { StatusBar } from './components/StatusBar';
import { SpecFile } from './types';

export default function App() {
  const { state, logs, connected } = useSocket();
  const [selectedSpec, setSelectedSpec] = useState<SpecFile | null>(null);
  const totalActive = state.inbox.length + state.running.length;

  return (
    <div className="h-screen bg-[#0a0a0a] text-[#e2e2e2] flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-[#1a1a1a] px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="brand-mark-small" aria-hidden="true">
            <span />
          </div>
          <div className="leading-none">
            <span className="block text-[12px] font-semibold text-[#d8d8d8] uppercase tracking-[0.22em]">
              Lince
            </span>
            <span className="block text-[8px] text-[#4a5560] uppercase tracking-[0.18em] mt-1">
              agent watcher
            </span>
          </div>
          {totalActive > 0 && (
            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">
              {totalActive} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#444]">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span>{connected ? 'live' : 'disconnected'}</span>
        </div>
      </header>
      <StatusBar state={state} connected={connected} logs={logs} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-3">
          <KanbanBoard state={state} onCardClick={setSelectedSpec} />
        </div>
        <div className="flex-shrink-0 h-64 border-t border-[#1a1a1a]">
          <LogViewer logs={logs} running={state.running} />
        </div>
      </main>
      {selectedSpec && (
        <Modal spec={selectedSpec} onClose={() => setSelectedSpec(null)} />
      )}
    </div>
  );
}
