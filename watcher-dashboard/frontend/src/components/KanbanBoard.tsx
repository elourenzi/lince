import { Column } from './Column';
import { SpecFile, SystemState } from '../types';

interface Props {
  state: SystemState;
  onCardClick: (spec: SpecFile) => void;
}

const COLUMNS = [
  { key: 'inbox' as const, label: 'Inbox', accent: 'text-sky-400', dot: 'bg-sky-500', clickable: true },
  { key: 'running' as const, label: 'Running', accent: 'text-amber-400', dot: 'bg-amber-500 animate-pulse', clickable: true },
  { key: 'done' as const, label: 'Done', accent: 'text-emerald-400', dot: 'bg-emerald-500', clickable: true },
  { key: 'failed' as const, label: 'Failed', accent: 'text-red-400', dot: 'bg-red-500', clickable: true },
] as const;

export function KanbanBoard({ state, onCardClick }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2.5 h-full" style={{ minHeight: '280px' }}>
      {COLUMNS.map(col => (
        <Column
          key={col.key}
          columnKey={col.key}
          label={col.label}
          accent={col.accent}
          dot={col.dot}
          specs={state[col.key]}
          clickable={col.clickable}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
