import { useState, useEffect, useRef, useCallback } from 'react';
import type { Term, ViewMode } from '@/types/term';
import { TermCard } from './TermCard';
import { cn } from '@/lib/utils';

interface TermListProps {
  terms: Term[];
  view: ViewMode;
  query: string;
  onCategoryClick: (cat: string) => void;
  onSubcategoryClick: (sub: string) => void;
  onTermClick?: (term: Term) => void;
}

const BATCH_SIZE = 50;

export function TermList({
  terms,
  view,
  query,
  onCategoryClick,
  onSubcategoryClick,
  onTermClick,
}: TermListProps) {
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Reset display count when terms change
  useEffect(() => {
    setDisplayCount(BATCH_SIZE);
  }, [terms]);

  const displayedTerms = terms.slice(0, displayCount);
  const hasMore = displayCount < terms.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + BATCH_SIZE, terms.length));
      setIsLoading(false);
    }, 100);
  }, [isLoading, hasMore, terms.length]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  if (terms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--muted)]">
        <div className="text-5xl opacity-50">📭</div>
        <p className="mt-4 text-lg">没有匹配的术语</p>
        <p className="mt-1 text-sm">试试调整筛选条件或换个关键词</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      <div
        className={cn(
          'gap-3',
          view === 'grid' && 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          view === 'list' && 'flex flex-col max-w-3xl',
          view === 'compact' && 'flex flex-col'
        )}
      >
        {displayedTerms.map((term) => (
          <TermCard
            key={term.id}
            term={term}
            view={view}
            query={query}
            onCategoryClick={onCategoryClick}
            onSubcategoryClick={onSubcategoryClick}
            onTermClick={onTermClick}
          />
        ))}
      </div>

      {/* Load More */}
      <div ref={loadMoreRef} className="py-8 text-center">
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-2 text-sm text-[var(--ink)] transition-all hover:border-[var(--muted)] hover:shadow-sm disabled:opacity-50"
          >
            {isLoading ? '加载中…' : `加载更多 (${terms.length - displayCount} 条)`}
          </button>
        ) : (
          terms.length > 0 && (
            <p className="text-sm text-[var(--muted)]">
              — 已显示全部 {terms.length.toLocaleString()} 条 —
            </p>
          )
        )}
      </div>
    </div>
  );
}
