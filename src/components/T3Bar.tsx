import { cn } from '@/lib/utils';

interface T3BarProps {
  t3categories: Record<string, number>;
  selectedT3: string;
  onSelect: (t3: string | null) => void;
}

export function T3Bar({ t3categories, selectedT3, onSelect }: T3BarProps) {
  const keys = Object.keys(t3categories).sort();
  if (keys.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'rounded-full border px-2 py-0.5 text-[11px] transition-all',
            !selectedT3
              ? 'border-[var(--muted)] bg-[var(--muted)] text-[var(--paper)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--ink)]'
          )}
        >
          全部
        </button>
        {keys.map(t3 => (
          <button
            key={t3}
            onClick={() => onSelect(t3)}
            className={cn(
              'rounded-full border px-2 py-0.5 text-[11px] transition-all',
              selectedT3 === t3
                ? 'border-[var(--muted)] bg-[var(--muted)] text-[var(--paper)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--ink)]'
            )}
          >
            {t3} ({t3categories[t3]})
          </button>
        ))}
      </div>
    </div>
  );
}
