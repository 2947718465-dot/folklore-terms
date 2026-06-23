import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { TermDetail } from '@/components/TermDetail';
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

  const handleBack = useCallback(() => {
    setSelectedTerm(null);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosRef.current);
    });
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

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {selectedTerm ? (
          <TermDetail
            key="detail"
            term={selectedTerm}
            detailed={detailed}
            onBack={handleBack}
            allTerms={terms}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
