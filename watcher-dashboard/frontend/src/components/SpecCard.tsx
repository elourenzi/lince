import { SpecFile } from '../types';

interface Props {
  spec: SpecFile;
  clickable: boolean;
  onClick?: () => void;
}

const TARGET_STYLES: Record<string, string> = {
  codex: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  claude: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
};

function estimateProgress(spec: SpecFile): number {
  if (spec.status === 'done') return 100;
  if (spec.status === 'failed') return 100;
  if (spec.status === 'inbox') return 0;

  const lines = spec.resultTail ?? [];
  const ageMs = Math.max(0, Date.now() - spec.mtime);
  const timeProgress = Math.min(96, 8 + Math.floor(ageMs / 900) * 5);
  const lineProgress = Math.min(96, 10 + lines.length * 2);
  if (lines.length === 0) return Math.max(8, timeProgress);

  const transcript = lines.join('\n').toLowerCase();
  let progress = Math.max(14, timeProgress, lineProgress);

  if (transcript.includes('user')) progress = Math.max(progress, 18);
  if (transcript.includes('vou abrir') || transcript.includes('get-content') || transcript.includes('read')) progress = Math.max(progress, 26);
  if (transcript.includes('exec') || transcript.includes('powershell') || transcript.includes('command')) progress = Math.max(progress, 42);
  if (transcript.includes('apply patch') || transcript.includes('patch: completed') || transcript.includes('diff --git')) progress = Math.max(progress, 62);
  if (transcript.includes('npm run build') || transcript.includes('test') || transcript.includes('verificar') || transcript.includes('confirmar')) progress = Math.max(progress, 78);
  if (transcript.includes('succeeded') || transcript.includes('✓') || transcript.includes('build')) progress = Math.max(progress, 86);
  if (transcript.includes('tokens used') || transcript.includes('criado e verificado') || transcript.includes('final')) progress = Math.max(progress, 98);

  return Math.min(progress, 98);
}

export function SpecCard({ spec, clickable, onClick }: Props) {
  const { frontmatter, id, resultTail } = spec;
  const title = spec.title || id;
  const preview = spec.preview || spec.content?.split(/\r?\n/).filter(Boolean).slice(0, 3).join(' ');
  const progress = estimateProgress(spec);
  const targetStyle = frontmatter.target
    ? TARGET_STYLES[frontmatter.target] ?? 'text-[#777] bg-[#1a1a1a] border-[#2a2a2a]'
    : 'text-[#777] bg-[#1a1a1a] border-[#2a2a2a]';

  return (
    <div
      onClick={onClick}
      className={[
        'bg-[#0a0a0a] border border-[#1a1a1a] rounded-md p-2.5 text-[11px] select-none',
        'transition-all duration-100',
        clickable ? 'cursor-pointer hover:border-[#2a2a2a] hover:bg-[#111]' : 'cursor-default',
      ].join(' ')}
    >
      <div className="text-[9px] text-[#383838] truncate mb-1" title={id}>{id}</div>
      <div className="font-medium text-[#d6d6d6] line-clamp-2 mb-1.5 leading-snug" title={title}>{title}</div>
      {preview && (
        <p className="text-[10px] text-[#666] line-clamp-3 leading-snug mb-2">
          {preview}
        </p>
      )}
      <div className="flex flex-wrap gap-1">
        {frontmatter.target && (
          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wide ${targetStyle}`}>
            {frontmatter.target}
          </span>
        )}
        {frontmatter.mode && (
          <span className="px-1.5 py-0.5 rounded border border-[#222] text-[9px] text-[#555] bg-[#111]">
            {frontmatter.mode}
          </span>
        )}
        {frontmatter.approved !== undefined && (
          <span className={`px-1.5 py-0.5 rounded border text-[9px] ${
            frontmatter.approved
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
          }`}>
            {frontmatter.approved ? '+ approved' : 'pending'}
          </span>
        )}
      </div>
      {spec.status === 'running' && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[9px] tabular-nums mb-1">
            <span className="text-amber-400/70">
              {resultTail?.length ? `${resultTail.length} transcript lines` : 'waiting transcript...'}
            </span>
            <span className="text-amber-300/80">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#19140a] overflow-hidden border border-amber-500/10">
            <div
              className="running-progress-fill h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      {clickable && <div className="mt-2 text-[9px] text-[#333]">open terminal</div>}
    </div>
  );
}
