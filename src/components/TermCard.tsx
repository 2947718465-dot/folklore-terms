import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Bookmark } from 'lucide-react';
import type { Term, ViewMode } from '@/types/term';
import { CATEGORIES } from '@/types/term';
import { cn, highlight } from '@/lib/utils';

interface TermCardProps {
  term: Term;
  view: ViewMode;
  query: string;
  onCategoryClick: (cat: string) => void;
  onSubcategoryClick: (sub: string) => void;
  onTermClick?: (term: Term) => void;
}

export const TermCard = memo(function TermCard({
  term,
  view,
  query,
  onCategoryClick,
  onTermClick,
}: TermCardProps) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favs.includes(term.cn);
  });
  const color = CATEGORIES[term.category]?.color || '#999';
  const icon = CATEGORIES[term.category]?.icon || '📚';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${term.cn}${term.en ? ` (${term.en})` : ''}\n${term.definition}\n\n——${term.category} › ${term.subcategory} › ${term.subcategory3}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorited) {
      localStorage.setItem('favorites', JSON.stringify(favs.filter((f: string) => f !== term.cn)));
    } else {
      localStorage.setItem('favorites', JSON.stringify([...favs, term.cn]));
    }
    setFavorited(!favorited);
  };

  const handleClick = () => {
    onTermClick?.(term);
  };

  const cnHtml = query ? highlight(term.cn, query) : term.cn;
  const enHtml = query ? highlight(term.en, query) : term.en;
  const defHtml = query ? highlight(term.definition, query) : term.definition;

  if (view === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClick}
        className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors hover:bg-[var(--hover)] border-l-2"
        style={{ borderLeftColor: color }}
      >
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-[var(--ink)]">
          <span dangerouslySetInnerHTML={{ __html: cnHtml }} />
        </span>
        {term.en && (
          <span className="text-xs text-[var(--muted)] italic">
            <span dangerouslySetInnerHTML={{ __html: enHtml }} />
          </span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
      onClick={handleClick}
      className="group relative cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors"
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      {/* Header with icon and category */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '15', color }}>
            {term.category}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleFavorite}
            className={cn(
              'h-7 w-7 flex items-center justify-center rounded-md transition-all',
              favorited ? 'text-yellow-500' : 'text-[var(--muted)] hover:text-yellow-500'
            )}
            title="收藏"
          >
            <Bookmark className="h-4 w-4" fill={favorited ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              'h-7 w-7 flex items-center justify-center rounded-md transition-all',
              copied ? 'bg-green-500 text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'
            )}
            title="复制"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-[var(--ink)] mb-1 leading-snug">
        <span dangerouslySetInnerHTML={{ __html: cnHtml }} />
        {term.en && (
          <span className="ml-2 text-xs font-normal italic text-[var(--muted)]">
            <span dangerouslySetInnerHTML={{ __html: enHtml }} />
          </span>
        )}
      </h3>

      {/* Category path */}
      <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mb-2">
        <button
          onClick={(e) => { e.stopPropagation(); onCategoryClick(term.category); }}
          className="hover:text-[var(--accent)] transition-colors"
        >
          {term.subcategory}
        </button>
        <span className="text-[var(--border)]">›</span>
        <span>{term.subcategory3}</span>
      </div>

      {/* Definition */}
      <p className="text-sm leading-relaxed text-[var(--muted)] line-clamp-2">
        <span dangerouslySetInnerHTML={{ __html: defHtml }} />
      </p>
    </motion.article>
  );
});
