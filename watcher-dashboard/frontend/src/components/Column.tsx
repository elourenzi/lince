import { SpecCard } from './SpecCard';
import { LynxLogo } from './LynxLogo';
import { SpecFile } from '../types';

interface Props {
  columnKey: 'inbox' | 'running' | 'done' | 'failed';
  label: string;
  accent: string;
  dot: string;
  specs: SpecFile[];
  clickable: boolean;
  onCardClick: (spec: SpecFile) => void;
}

function EmptyInbox() {
  return (
    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center select-none px-4">
      <div className="lynx-static-wrap mb-4" aria-hidden="true">
        <LynxLogo className="lynx-static-logo" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#8b8b8b] font-semibold">lince is watching</p>
    </div>
  );
}

function EmptyColumn({ columnKey }: Pick<Props, 'columnKey'>) {
  if (columnKey === 'inbox') return <EmptyInbox />;
  return <p className="text-[#252525] text-[10px] text-center py-8 select-none">-</p>;
}

export function Column({ columnKey, label, accent, dot, specs, clickable, onCardClick }: Props) {
  return (
    <div className="flex flex-col bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${accent}`}>{label}</span>
        </div>
        <span className="text-[10px] text-[#444] tabular-nums">{specs.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {specs.length === 0 ? (
          <EmptyColumn columnKey={columnKey} />
        ) : (
          specs.map(spec => (
            <SpecCard
              key={spec.id}
              spec={spec}
              clickable={clickable}
              onClick={clickable ? () => onCardClick(spec) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
