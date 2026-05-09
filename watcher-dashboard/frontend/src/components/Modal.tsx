import { useEffect, useState } from 'react';
import { SpecFile } from '../types';

interface Props {
  spec: SpecFile;
  onClose: () => void;
}

export function Modal({ spec, onClose }: Props) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const title = spec.title || spec.id;
  const content = spec.content || 'No task content available.';

  useEffect(() => {
    fetch(`/api/runs/${spec.id}/result`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.text();
      })
      .then(text => {
        setResult(text);
        setLoading(false);
      })
      .catch(() => {
        setError('No result file found for this run.');
        setLoading(false);
      });
  }, [spec.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div
        className="relative bg-[#0f0f0f] border border-[#222] rounded-xl w-full max-w-5xl max-h-[86vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-3.5 border-b border-[#1a1a1a] flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-[#d4d4d4]">{title}</p>
            <p className="text-[10px] text-[#444] mt-0.5">
              <span className={
                spec.status === 'done' ? 'text-emerald-400' :
                spec.status === 'failed' ? 'text-red-400' :
                spec.status === 'running' ? 'text-amber-400' :
                'text-sky-400'
              }>{spec.status}</span>
              {' . '}{spec.id}
              {spec.resultFile ? ` . ${spec.resultFile}` : ''}
              {spec.resultSize ? ` . ${(spec.resultSize / 1024).toFixed(1)}kb` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-[#888] transition-colors text-xl leading-none ml-4 mt-0.5">
            x
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 grid gap-4">
          <section>
            <p className="text-[10px] text-[#444] uppercase tracking-[0.15em] mb-2">requested task</p>
            <pre className="text-[11px] text-[#aaa] whitespace-pre-wrap break-words leading-relaxed font-mono bg-[#080808] border border-[#1a1a1a] rounded-lg p-3">
              {content}
            </pre>
          </section>
          <section>
            <p className="text-[10px] text-[#444] uppercase tracking-[0.15em] mb-2">agent transcript</p>
            {loading && <p className="text-[#444] text-sm animate-pulse">Loading...</p>}
            {error && spec.resultTail?.length === 0 && <p className="text-red-400 text-sm">{error}</p>}
            {result ? (
              <pre className="text-[11px] text-[#888] whitespace-pre-wrap break-words leading-relaxed font-mono bg-[#080808] border border-[#1a1a1a] rounded-lg p-3">{result}</pre>
            ) : spec.resultTail && spec.resultTail.length > 0 ? (
              <pre className="text-[11px] text-[#888] whitespace-pre-wrap break-words leading-relaxed font-mono bg-[#080808] border border-[#1a1a1a] rounded-lg p-3">{spec.resultTail.join('\n')}</pre>
            ) : (
              <p className="text-[#444] text-sm">No transcript yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
