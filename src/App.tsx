import { useState, useEffect, useCallback, useRef } from 'react';
import type { Term } from '@/types/term';
import { useTerms } from '@/hooks/useTerms';
import { useWorkerSearch } from '@/hooks/useWorkerSearch';
import { useTermFilter } from '@/hooks/useTermFilter';
import { useUrlState } from '@/hooks/useUrlState';
import { useDetailedTerm } from '@/hooks/useDetailedTerm';
import { Header } from '@/components/Header';
import { Toolbar } from '@/components/Toolbar';
import { CategoryBar } from '@/components/CategoryBar';
import { SubcategoryBar } from '@/components/SubcategoryBar';
import { T3Bar } from '@/components/T3Bar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { TermList } from '@/components/TermList';
import { TermDetail } from '@/components/TermDetail';
import { StatsChart } from '@/components/StatsChart';
import { Footer } from '@/components/Footer';
import { LoadingState } from '@/components/LoadingState';
import { HelpModal, useWelcomeModal } from '@/components/HelpModal';

function App() {
  const { terms, isLoading, error, totalCount } = useTerms();
  const { state, updateState, resetState } = useUrlState();
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showWelcome, closeWelcome] = useWelcomeModal();
  const scrollPosRef = useRef(0);

  // Protection: disable right-click, dev tools shortcuts, and iframe embedding
  useEffect(() => {
    // Prevent iframe embedding (clickjacking protection)
    if (window.self !== window.top) {
      window.top!.location.href = window.self.location.href;
    }

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

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

  // Search (using Web Worker for non-blocking search)
  const { results: searchResults } = useWorkerSearch(terms, state.q);

  // Filter
  const { filtered, categories, subcategories, t3categories } = useTermFilter(
    searchResults,
    state.cat,
    state.sub,
    state.t3,
    state.sort
  );

  const { detailed } = useDetailedTerm(selectedTerm);

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
  }, []);

  // Restore scroll position when returning from detail view
  useEffect(() => {
    if (!selectedTerm && scrollPosRef.current > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosRef.current);
        });
      });
    }
  }, [selectedTerm]);

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
      {selectedTerm ? (
        <TermDetail
          term={selectedTerm}
          detailed={detailed}
          onBack={handleBack}
          allTerms={terms}
          onTermClick={handleTermClick}
        />
      ) : (
        <div>
          <Header totalCount={totalCount} onReset={handleReset} onHelp={() => setShowHelp(true)} />
            <main className="pb-8">
              <Toolbar query={state.q} view={state.view} sort={state.sort} isDark={isDark}
                resultCount={filtered.length} totalCount={totalCount}
                onQueryChange={handleQueryChange} onViewChange={handleViewChange}
                onSortChange={handleSortChange} onThemeToggle={toggleTheme} />
              
              {/* Stats Chart - show when no search/filter */}
              {!state.q && !state.cat && !state.sub && !state.t3 && (
                <div className="mb-6 mx-4 md:mx-6">
                  <StatsChart terms={terms} />
                </div>
              )}
              
              <div className="mb-3"><CategoryBar categories={categories} selectedCat={state.cat} onSelect={handleCatSelect} /></div>
              <div className="mb-3"><SubcategoryBar subcategories={state.cat ? subcategories[state.cat] || {} : {}} selectedSub={state.sub} onSelect={handleSubSelect} /></div>
              <div className="mb-3"><T3Bar t3categories={t3categories} selectedT3={state.t3} onSelect={handleT3Select} /></div>
              <Breadcrumb cat={state.cat} sub={state.sub} t3={state.t3} query={state.q} onCatClick={handleCatSelect} onSubClick={handleSubSelect} />
              <TermList terms={filtered} view={state.view} query={state.q} onSubcategoryClick={handleSubSelect} onTermClick={handleTermClick} />
            </main>
            <Footer />
          </div>
        )}


      {/* Welcome modal — auto-show on first visit */}
      <HelpModal show={showWelcome} onClose={closeWelcome} />

      {/* Help modal — manually triggered from header */}
      <HelpModal show={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default App;
