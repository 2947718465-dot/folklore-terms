import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { TermDetail } from '@/components/TermDetail';

function Home() {
  const { terms, isLoading, error, totalCount } = useTerms();
  const { state, updateState, resetState } = useUrlState();

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

  // Handlers
  const handleQueryChange = useCallback((q: string) => {
    updateState({ q });
  }, [updateState]);

  const handleViewChange = useCallback((view: 'grid' | 'list' | 'compact') => {
    updateState({ view });
  }, [updateState]);

  const handleSortChange = useCallback((sort: 'cn' | 'category') => {
    updateState({ sort });
  }, [updateState]);

  const handleCatSelect = useCallback((cat: string | null) => {
    updateState({ cat: cat || '', sub: '', t3: '' });
  }, [updateState]);

  const handleSubSelect = useCallback((sub: string | null) => {
    updateState({ sub: sub || '', t3: '' });
  }, [updateState]);

  const handleT3Select = useCallback((t3: string | null) => {
    updateState({ t3: t3 || '' });
  }, [updateState]);

  const handleReset = useCallback(() => {
    resetState();
  }, [resetState]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">加载失败</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--hover)]"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header totalCount={totalCount} onReset={handleReset} />

      <main className="pb-8">
        <Toolbar
          query={state.q}
          view={state.view}
          sort={state.sort}
          isDark={isDark}
          resultCount={filtered.length}
          totalCount={totalCount}
          onQueryChange={handleQueryChange}
          onViewChange={handleViewChange}
          onSortChange={handleSortChange}
          onThemeToggle={toggleTheme}
        />

        <div className="mb-3">
          <CategoryBar
            categories={categories}
            selectedCat={state.cat}
            onSelect={handleCatSelect}
          />
        </div>

        <div className="mb-3">
          <SubcategoryBar
            subcategories={state.cat ? subcategories[state.cat] || {} : {}}
            selectedSub={state.sub}
            onSelect={handleSubSelect}
          />
        </div>

        <div className="mb-3">
          <T3Bar
            t3categories={t3categories}
            selectedT3={state.t3}
            onSelect={handleT3Select}
          />
        </div>

        <Breadcrumb
          cat={state.cat}
          sub={state.sub}
          t3={state.t3}
          query={state.q}
          onCatClick={handleCatSelect}
          onSubClick={handleSubSelect}
        />

        <TermList
          terms={filtered}
          view={state.view}
          query={state.q}
          onCategoryClick={handleCatSelect}
          onSubcategoryClick={handleSubSelect}
        />
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename="/folklore-terms">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/term/:id" element={<TermDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
