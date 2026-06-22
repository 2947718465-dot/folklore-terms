import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, ExternalLink, Search, Loader2 } from 'lucide-react';
import type { Term } from '@/types/term';
import { CATEGORIES } from '@/types/term';
import { cn } from '@/lib/utils';
import { searchTermImage, type WikipediaImage } from '@/lib/wikipedia';

export function TermDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [term, setTerm] = useState<Term | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState<WikipediaImage | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadTerm() {
      try {
        const [termsRes, detailedRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}terms.json`),
          fetch(`${import.meta.env.BASE_URL}terms-detailed.json`),
        ]);
        if (!termsRes.ok) throw new Error('Failed to load terms');
        const data = await termsRes.json();
        const detailed = await detailedRes.json();
        const index = parseInt(id || '0', 10);
        if (index >= 0 && index < data.length) {
          const raw = data[index];
          setTerm({
            id: String(index),
            cn: raw[0],
            en: raw[1] || '',
            definition: raw[2] || '',
            detailed: detailed[String(index)] || undefined,
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

  // Search for image when term loads
  useEffect(() => {
    if (!term) return;

    async function loadImage() {
      setImageLoading(true);
      setImageError(false);
      try {
        const result = await searchTermImage(term!.cn, term!.en);
        if (result) {
          setImage(result);
        }
      } catch {
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    }

    loadImage();
  }, [term]);

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
        {/* Image */}
        <div className="mb-8 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {imageLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
              <span className="ml-2 text-sm text-[var(--muted)]">搜索图片中...</span>
            </div>
          ) : image && !imageError ? (
            <div className="relative">
              <img
                src={image.url}
                alt={term.cn}
                className="h-64 w-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-sm text-white/80">图片来源：维基百科</p>
              </div>
            </div>
          ) : (
            <div
              className="flex h-64 flex-col items-center justify-center"
              style={{ backgroundColor: `${color}10` }}
            >
              <Search className="h-12 w-12 opacity-20" style={{ color }} />
              <p className="mt-2 text-sm text-[var(--muted)]">暂无图片</p>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(term.cn)}&tbm=isch`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-[var(--accent)] hover:underline"
              >
                在 Google 搜索图片
              </a>
            </div>
          )}
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

        {/* Brief Definition */}
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="mb-3 text-lg font-semibold text-[var(--ink)]">释义</h2>
          <p className="leading-relaxed text-[var(--muted)]">
            {term.definition || '暂无释义'}
          </p>
        </div>

        {/* Detailed Definition */}
        {term.detailed && (
          <div className="mb-8 rounded-xl border border-[var(--accent)]/20 bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-lg font-semibold text-[var(--ink)]">详细释义</h2>
            <div className="prose prose-sm max-w-none leading-relaxed text-[var(--muted)]">
              {term.detailed.split('\n').map((line, i) => {
                // 处理 **加粗** 标记
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={i} className={i > 0 ? 'mt-3' : ''}>
                    {parts.map((part, j) => 
                      j % 2 === 1 ? <strong key={j} className="text-[var(--ink)]">{part}</strong> : part
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Wikipedia Description */}
        {image?.description && !term.detailed && (
          <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="mb-3 text-lg font-semibold text-[var(--ink)]">维基百科</h2>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {image.description}
            </p>
          </div>
        )}

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
