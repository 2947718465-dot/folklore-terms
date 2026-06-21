import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import type { Term } from '@/types/term';
import { CATEGORIES } from '@/types/term';
import { cn } from '@/lib/utils';

export function TermDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [term, setTerm] = useState<Term | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTerm() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}terms.json`);
        if (!response.ok) throw new Error('Failed to load terms');
        const data = await response.json();
        const index = parseInt(id || '0', 10);
        if (index >= 0 && index < data.length) {
          const raw = data[index];
          setTerm({
            id: String(index),
            cn: raw[0],
            en: raw[1] || '',
            definition: raw[2] || '',
            category: raw[3],
            subcategory: raw[4],
            subcategory3: raw[5],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTerm();
  }, [id]);

  const handleCopy = async () => {
    if (!term) return;
    const text = `${term.cn}${term.en ? ` (${term.en})` : ''}\n${term.definition}\n\n——${term.category} › ${term.subcategory} › ${term.subcategory3}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
      </div>
    );
  }

  if (!term) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-[var(--muted)]">术语未找到</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--hover)]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </button>
      </div>
    );
  }

  const color = CATEGORIES[term.category]?.color || '#999';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--paper)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3 md:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <h1 className="flex-1 truncate text-sm font-medium text-[var(--ink)]">
            {term.cn}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {/* Image Placeholder */}
        <div className="mb-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div
            className="flex h-64 items-center justify-center"
            style={{ backgroundColor: `${color}10` }}
          >
            <div className="text-center">
              <div className="text-6xl opacity-30">📖</div>
              <p className="mt-2 text-sm text-[var(--muted)]">术语图片</p>
              <p className="text-xs text-[var(--muted)] opacity-50">
                可添加 {term.cn} 的相关图片
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
            {term.cn}
          </h1>
          {term.en && (
            <p className="mt-2 text-lg italic text-[var(--muted)]">
              {term.en}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {CATEGORIES[term.category]?.icon} {term.category}
          </span>
          <span className="text-[var(--muted)]">›</span>
          <span className="text-sm text-[var(--muted)]">{term.subcategory}</span>
          <span className="text-[var(--muted)]">›</span>
          <span className="text-sm text-[var(--muted)]">{term.subcategory3}</span>
        </div>

        {/* Definition */}
        <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--ink)]">释义</h2>
          <p className="leading-relaxed text-[var(--muted)]">
            {term.definition || '暂无详细释义'}
          </p>
        </div>

        {/* Related Info */}
        <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--ink)]">相关信息</h2>
          <dl className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-24 flex-shrink-0 text-sm font-medium text-[var(--ink)]">分类</dt>
              <dd className="text-sm text-[var(--muted)]">{term.category}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-24 flex-shrink-0 text-sm font-medium text-[var(--ink)]">子类</dt>
              <dd className="text-sm text-[var(--muted)]">{term.subcategory}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <dt className="w-24 flex-shrink-0 text-sm font-medium text-[var(--ink)]">细分</dt>
              <dd className="text-sm text-[var(--muted)]">{term.subcategory3}</dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
              copied
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--hover)]'
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? '已复制' : '复制术语'}
          </button>
          <a
            href={`https://www.baidu.com/s?wd=${encodeURIComponent(term.cn)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--hover)]"
          >
            <ExternalLink className="h-4 w-4" />
            百度搜索
          </a>
        </div>
      </main>
    </div>
  );
}
