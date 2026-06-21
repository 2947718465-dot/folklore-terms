import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  cat: string;
  sub: string;
  t3: string;
  query: string;
  onCatClick: (cat: string) => void;
  onSubClick: (sub: string) => void;
}

export function Breadcrumb({ cat, sub, t3, query, onCatClick, onSubClick }: BreadcrumbProps) {
  if (!cat && !query) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-2 md:px-6">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-[var(--muted)]">
        <button
          onClick={() => onCatClick('')}
          className="text-[var(--accent)] hover:underline"
        >
          全部
        </button>

        {cat && (
          <>
            <ChevronRight className="h-3 w-3 text-[var(--border)]" />
            <button
              onClick={() => onCatClick(cat)}
              className="text-[var(--accent)] hover:underline"
            >
              {cat}
            </button>
          </>
        )}

        {sub && (
          <>
            <ChevronRight className="h-3 w-3 text-[var(--border)]" />
            <button
              onClick={() => onSubClick(sub)}
              className="text-[var(--accent)] hover:underline"
            >
              {sub}
            </button>
          </>
        )}

        {t3 && (
          <>
            <ChevronRight className="h-3 w-3 text-[var(--border)]" />
            <span className="font-medium text-[var(--ink)]">{t3}</span>
          </>
        )}

        {query && (
          <>
            <span className="text-[var(--border)]">·</span>
            <span className="text-[var(--ink)]">"{query}"</span>
          </>
        )}
      </nav>
    </div>
  );
}
