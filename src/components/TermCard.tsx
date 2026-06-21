import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import type { Term, ViewMode } from '@/types/term';
import { CATEGORIES } from '@/types/term';
import { cn, highlight } from '@/lib/utils';

interface TermCardProps {
  term: Term;
  view: ViewMode;
  query: string;
  onCategoryClick: (cat: string) => void;
  onSubcategoryClick: (sub: string) => void;
}

export function TermCard({
  term,
  view,
  query,
  onCategoryClick,
  onSubcategoryClick,
}: TermCardProps) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const color = CATEGORIES[term.category]?.color || '#999';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${term.cn}${term.en ? ` (${term.en})` : ''}\n${term.definition}\n\n——${term.category} › ${term.subcategory} › ${term.subcategory3}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClick = () => {
    navigate(`/term/${term.id}`);
  };

  const cnHtml = query ? highlight(term.cn, query) : term.cn;
  const enHtml = query ? highlight(term.en, query) : term.en;
  const defHtml = query ? highlight(term.definition, query) : term.definition;

  return (
    <article
      onClick={handleClick}
      className={cn(
        'group relative cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-all hover:shadow-lg hover:-translate-y-0.5',
        view === 'compact' ? 'px-4 py-3' : 'px-5 py-4'
      )}
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
    >
      {/* Actions */}
      {view !== 'compact' && (
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-all hover:text-[var(--ink)]',
              copied && 'border-green-500 bg-green-500 text-white'
            )}
            title="复制"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}

      {/* Content */}
      <div className={cn(view === 'compact' ? '' : 'pr-10')}>
        <h3 className="text-base font-semibold text-[var(--ink)]">
          <span dangerouslySetInnerHTML={{ __html: cnHtml }} />
          {term.en && (
            <span className="ml-2 text-xs font-normal italic text-[var(--muted)]">
              <span dangerouslySetInnerHTML={{ __html: enHtml }} />
            </span>
          )}
        </h3>

        {view !== 'compact' && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <button
              onClick={(e) => { e.stopPropagation(); onCategoryClick(term.category); }}
              className="text-[var(--accent)] underline underline-offset-2 hover:opacity-70"
            >
              {term.category}
            </button>
            <span className="text-[var(--border)]">›</span>
            <button
              onClick={(e) => { e.stopPropagation(); onSubcategoryClick(term.subcategory); }}
              className="text-[var(--accent)] underline underline-offset-2 hover:opacity-70"
            >
              {term.subcategory}
            </button>
            <span className="text-[var(--border)]">›</span>
            <span>{term.subcategory3}</span>
          </div>
        )}

        {view !== 'compact' && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
            <span dangerouslySetInnerHTML={{ __html: defHtml }} />
          </p>
        )}
      </div>
    </article>
  );
}
