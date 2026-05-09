import { useEffect, useRef } from 'react';
import { SpecFile } from '../types';

interface Props {
  logs: string[];
  running: SpecFile[];
}

function getLineColor(line: string): string {
  const l = line.toLowerCase();
  if (l.includes('error') || l.includes('failed') || l.includes('fatal')) return 'text-red-400';
  if (l.includes('warn')) return 'text-amber-400';
  if (l.includes('done') || l.includes('success') || l.includes('completed')) return 'text-emerald-400';
  if (l.includes('running') || l.includes('started') || l.includes('picked')) return 'text-sky-400';
  return 'text-[#444]';
}

function getTranscriptColor(line: string): string {
  const trimmed = line.trim().toLowerCase();
  if (trimmed === 'user') return 'text-sky-300';
  if (trimmed === 'codex' || trimmed === 'assistant' || trimmed === 'claude') return 'text-purple-300';
  if (trimmed === 'exec' || trimmed === 'apply patch') return 'text-amber-300';
  if (trimmed.includes('error') || trimmed.includes('failed') || trimmed.includes('exited 1')) return 'text-red-300';
  if (trimmed.includes('succeeded') || trimmed.includes('completed') || trimmed.includes('done')) return 'text-emerald-300';
  return 'text-[#6b6b6b]';
}

export function LogViewer({ logs, running }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const active = running[0];
  const transcript = active?.resultTail ?? [];
  const activeTitle = active ? active.title || active.id : '';
  const activePreview = active ? active.preview || active.content?.slice(0, 260) || '' : '';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, transcript.length, active?.id]);

  return (
    <div className="terminal-grid h-full bg-[#080808]">
      <section className="min-w-0 min-h-0 flex flex-col border-r border-[#1a1a1a]">
        <div className="px-4 py-1.5 border-b border-[#1a1a1a] flex items-center gap-3 flex-shrink-0">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#1e1e1e]" />)}
          </div>
          <span className="text-[9px] text-[#444] uppercase tracking-[0.15em]">live transcript</span>
          {active && <span className="text-[9px] text-amber-400/70 truncate">{activeTitle}</span>}
          <span className="ml-auto text-[9px] text-[#2a2a2a] tabular-nums">{transcript.length} lines</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {!active ? (
            <span className="text-[#222] text-[11px]">no agent running right now...</span>
          ) : transcript.length === 0 ? (
            <div>
              <p className="text-[#555] text-[11px] mb-1">Task picked up, waiting for transcript output...</p>
              <p className="text-[#333] text-[11px] whitespace-pre-wrap">{activePreview}</p>
            </div>
          ) : (
            transcript.map((line, i) => (
              <div key={`${active.id}-${i}`} className={`text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-words ${getTranscriptColor(line)}`}>
                {line}
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </section>
      <section className="min-w-0 min-h-0 flex flex-col">
        <div className="px-4 py-1.5 border-b border-[#1a1a1a] flex items-center gap-3 flex-shrink-0">
        <div className="flex gap-1">
          {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#1e1e1e]" />)}
        </div>
        <span className="text-[9px] text-[#333] uppercase tracking-[0.15em]">watcher.log</span>
        <span className="ml-auto text-[9px] text-[#2a2a2a] tabular-nums">{logs.length} lines</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {logs.length === 0 ? (
            <span className="text-[#222] text-[11px]">awaiting log entries...</span>
          ) : (
            logs.map((line, i) => (
              <div key={i} className={`text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-all ${getLineColor(line)}`}>
                {line}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
