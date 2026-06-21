import { cn } from '@/lib/utils';

interface SubcategoryBarProps {
  subcategories: Record<string, number>;
  selectedSub: string;
  onSelect: (sub: string | null) => void;
}

export function SubcategoryBar({ subcategories, selectedSub, onSelect }: SubcategoryBarProps) {
  const keys = Object.keys(subcategories).sort();
  if (keys.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'rounded-full border px-2.5 py-1 text-xs transition-all',
            !selectedSub
              ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--ink)]'
          )}
        >
          全部子类
        </button>
        {keys.map(sub => (
          <button
            key={sub}
            onClick={() => onSelect(sub)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs transition-all',
              selectedSub === sub
                ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--ink)]'
            )}
          >
            {sub} ({subcategories[sub]})
          </button>
        ))}
      </div>
    </div>
  );
}
