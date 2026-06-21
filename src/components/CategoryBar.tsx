import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/types/term';

interface CategoryBarProps {
  categories: Record<string, number>;
  selectedCat: string;
  onSelect: (cat: string | null) => void;
}

export function CategoryBar({ categories, selectedCat, onSelect }: CategoryBarProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
            !selectedCat
              ? 'border-transparent bg-[var(--accent)] text-white shadow-md'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--muted)] hover:shadow-sm'
          )}
        >
          全部
        </button>
        {Object.entries(CATEGORIES).map(([name, { icon, color }]) => {
          const count = categories[name] || 0;
          const isActive = selectedCat === name;
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                isActive
                  ? 'border-transparent text-white shadow-md'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--muted)] hover:shadow-sm'
              )}
              style={isActive ? { backgroundColor: color } : undefined}
            >
              {icon} {name}
              <span className="ml-1 text-xs opacity-70">{count.toLocaleString()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
