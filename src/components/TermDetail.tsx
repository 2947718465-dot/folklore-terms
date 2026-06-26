import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Bookmark } from 'lucide-react';
import type { Term } from '@/types/term';
import { CATEGORIES } from '@/types/term';
import { cn } from '@/lib/utils';

interface TermDetailProps {
  term: Term;
  detailed: string | null;
  onBack: () => void;
  allTerms: Term[];
  onTermClick?: (term: Term) => void;
}

export function TermDetail({ term, detailed, onBack, allTerms, onTermClick }: TermDetailProps) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favs.includes(term.cn);
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'favorites') {
        const favs = JSON.parse(e.newValue || '[]');
        setFavorited(favs.includes(term.cn));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [term.cn]);
  const color = CATEGORIES[term.category]?.color || '#999';

  const handleCopy = async () => {
    const text = `${term.cn}${term.en ? ` (${term.en})` : ''}\n${term.definition}\n\n——${term.category} › ${term.subcategory} › ${term.subcategory3}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorited) {
      localStorage.setItem('favorites', JSON.stringify(favs.filter((f: string) => f !== term.cn)));
    } else {
      localStorage.setItem('favorites', JSON.stringify([...favs, term.cn]));
    }
    setFavorited(!favorited);
  };

  // Find related terms from the detailed definition
  const relatedTerms = allTerms
    .filter(t => t.cn !== term.cn && t.category === term.category && t.subcategory === term.subcategory)
    .slice(0, 5);

  // Parse markdown-like detailed definition
  const renderDetailed = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="mb-2">
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-[var(--ink)]">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div
      className="min-h-screen"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavorite}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-lg transition-all',
                favorited ? 'text-yellow-500 bg-yellow-500/10' : 'text-[var(--muted)] hover:text-yellow-500'
              )}
            >
              <Bookmark className="h-4 w-4" fill={favorited ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-lg transition-all',
                copied ? 'bg-green-500 text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6">
        {/* Category badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: color + '15', color }}>
            {term.category}
          </span>
          <span className="text-sm text-[var(--muted)]">
            {term.subcategory} › {term.subcategory3}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[var(--ink)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          {term.cn}
        </h1>
        {term.en && (
          <p className="text-lg italic text-[var(--muted)] mb-6">{term.en}</p>
        )}

        {/* Brief definition */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 mb-6" style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">释义</h2>
          <p className="text-base leading-relaxed text-[var(--ink)]">{term.definition}</p>
        </div>

        {/* Detailed definition */}
        {detailed && (
          <div className="rounded-xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--surface)] to-[var(--hover)] p-6 mb-6">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">详细释义</h2>
            <div className="text-sm leading-relaxed text-[var(--ink)]">
              {renderDetailed(detailed)}
            </div>
          </div>
        )}

        {/* Related terms */}
        {relatedTerms.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">相关术语</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTerms.map(rt => (
                <button
                  key={rt.cn}
                  onClick={() => onTermClick?.(rt)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  {rt.cn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Copyright notice */}
        <div className="mt-8 pt-4 border-t border-[var(--border)] text-center text-[11px] text-[var(--muted)]">
          <p>中国民俗学术语库 © 2026 史骞升编撰 ·{' '}
            <a href="https://github.com/2947718465-dot/folklore-terms" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">开源共享</a>
          </p>
          <p className="mt-0.5 opacity-50">内容遵循 CC BY-NC 4.0 协议，转载或引用请注明出处</p>
        </div>
      </div>
    </div>
  );
}
