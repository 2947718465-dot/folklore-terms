import { useState, useEffect, useCallback, useRef } from 'react';
import type { Term } from '@/types/term';
import { useTerms } from '@/hooks/useTerms';
import { useTermSearch } from '@/hooks/useTermSearch';
import { useTermFilter } from '@/hooks/useTermFilter';
import { useUrlState } from '@/hooks/useUrlState';
import { Header } from '@/components/Header';
import { Toolbar } from '@/components/Toolbar';
import { CategoryBar } from '@/components/CategoryBar';
import { SubcategoryBar } from '@/components/SubcategoryBar';
import { T3Bar } from '@/components/T3Bar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { TermList } from '@/components/TermList';
import { Footer } from '@/components/Footer';
import { LoadingState } from '@/components/LoadingState';

function App() {
  const { terms, isLoading, error, totalCount } = useTerms();
  const { state, updateState, resetState } = useUrlState();
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [detailed, setDetailed] = useState<string | null>(null);
  const scrollPosRef = useRef(0);

  // Theme
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  // Search
  const { results: searchResults } = useTermSearch(terms, state.q);

  // Filter
  const { filtered, categories, subcategories, t3categories } = useTermFilter(
    searchResults,
    state.cat,
    state.sub,
    state.t3,
    state.sort
  );

  // Load detailed definition when term selected
  useEffect(() => {
    if (!selectedTerm) { setDetailed(null); return; }
    fetch(`${import.meta.env.BASE_URL}terms-detailed.json`)
      .then(r => r.json())
      .then(d => setDetailed(d[String(selectedTerm.id)] || null))
      .catch(() => {});
  }, [selectedTerm]);

  // Restore scroll position when returning to list
  useEffect(() => {
    if (!selectedTerm && scrollPosRef.current > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosRef.current);
      });
    }
  }, [selectedTerm]);

  const handleQueryChange = useCallback((q: string) => updateState({ q }), [updateState]);
  const handleViewChange = useCallback((v: 'grid' | 'list' | 'compact') => updateState({ view: v }), [updateState]);
  const handleSortChange = useCallback((s: 'cn' | 'category') => updateState({ sort: s }), [updateState]);
  const handleCatSelect = useCallback((c: string | null) => updateState({ cat: c || '', sub: '', t3: '' }), [updateState]);
  const handleSubSelect = useCallback((s: string | null) => updateState({ sub: s || '', t3: '' }), [updateState]);
  const handleT3Select = useCallback((t: string | null) => updateState({ t3: t || '' }), [updateState]);
  const handleReset = useCallback(() => { resetState(); setSelectedTerm(null); }, [resetState]);

  const handleTermClick = useCallback((term: Term) => {
    scrollPosRef.current = window.scrollY;
    setSelectedTerm(prev => prev?.id === term.id ? null : term);
  }, []);

  if (isLoading) return <LoadingState />;

  if (error) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-red-500">加载失败</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{error}</p>
      </div>
    </div>
  );

  // Detail view
  if (selectedTerm) {
    return (
      <div className="min-h-screen">
        <Header totalCount={totalCount} onReset={handleReset} />
        <main className="mx-auto max-w-4xl px-4 py-6 md:px-6">
          <button onClick={() => setSelectedTerm(null)} className="mb-4 flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline">
            ← 返回列表
          </button>
          <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span className="rounded-full px-2 py-0.5" style={{background: {民俗事象:'#B8403D',学科概念:'#4B4D9E',理论术语:'#2E6DA4',研究关键词:'#3D8B68',研究方法:'#9B7B2C',学者与学术体制:'#8B3A5E'}[selectedTerm.category] || '#999', color: '#fff'}}>
                {selectedTerm.category}
              </span>
              <span>{selectedTerm.subcategory}</span>
              <span>›</span>
              <span>{selectedTerm.subcategory3}</span>
            </div>
            <h1 className="mb-1 text-2xl font-bold text-[var(--ink)]" style={{fontFamily:'var(--font-serif)'}}>{selectedTerm.cn}</h1>
            {selectedTerm.en && <p className="mb-4 text-sm italic text-[var(--muted)]">{selectedTerm.en}</p>}

            {detailed && (
              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--hover)] p-4">
                <h3 className="mb-2 text-sm font-semibold text-[var(--ink)]">详细释义</h3>
                <div className="text-sm leading-relaxed text-[var(--muted)] whitespace-pre-line">{detailed}</div>
              </div>
            )}

            <div className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              <h3 className="mb-1 font-semibold text-[var(--ink)]">简要释义</h3>
              {selectedTerm.definition}
            </div>
          </article>
        </main>
        <Footer />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen">
      <Header totalCount={totalCount} onReset={handleReset} />
      <main className="pb-8">
        <Toolbar query={state.q} view={state.view} sort={state.sort} isDark={isDark}
          resultCount={filtered.length} totalCount={totalCount}
          onQueryChange={handleQueryChange} onViewChange={handleViewChange}
          onSortChange={handleSortChange} onThemeToggle={toggleTheme} />
        <div className="mb-3"><CategoryBar categories={categories} selectedCat={state.cat} onSelect={handleCatSelect} /></div>
        <div className="mb-3"><SubcategoryBar subcategories={state.cat ? subcategories[state.cat] || {} : {}} selectedSub={state.sub} onSelect={handleSubSelect} /></div>
        <div className="mb-3"><T3Bar t3categories={t3categories} selectedT3={state.t3} onSelect={handleT3Select} /></div>
        <Breadcrumb cat={state.cat} sub={state.sub} t3={state.t3} query={state.q} onCatClick={handleCatSelect} onSubClick={handleSubSelect} />
        <TermList terms={filtered} view={state.view} query={state.q} onCategoryClick={handleCatSelect} onSubcategoryClick={handleSubSelect} onTermClick={handleTermClick} />
      </main>
      <Footer />
    </div>
  );
}

export default App;