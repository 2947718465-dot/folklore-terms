import { BookOpen, ExternalLink } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  onReset: () => void;
}

export function Header({ totalCount, onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--paper)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-lg font-semibold text-[var(--ink)] transition-opacity hover:opacity-70"
        >
          <BookOpen className="h-5 w-5 text-[var(--accent)]" />
          <span className="hidden sm:inline">民俗学术语库</span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-[var(--muted)]">
            {totalCount.toLocaleString()} 条术语
          </span>
          <a
            href="https://github.com/2947718465-dot/folklore-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-all hover:border-[var(--muted)] hover:text-[var(--ink)]"
            title="GitHub"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
