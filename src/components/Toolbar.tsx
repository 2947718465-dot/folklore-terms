import { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  LayoutGrid,
  List,
  AlignJustify,
  ArrowUpDown,
  Moon,
  Sun,
  HelpCircle,
} from 'lucide-react';
import type { ViewMode, SortMode } from '@/types/term';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  query: string;
  view: ViewMode;
  sort: SortMode;
  isDark: boolean;
  resultCount: number;
  totalCount: number;
  onQueryChange: (q: string) => void;
  onViewChange: (view: ViewMode) => void;
  onSortChange: (sort: SortMode) => void;
  onThemeToggle: () => void;
}

export function Toolbar({
  query,
  view,
  sort,
  isDark,
  resultCount,
  totalCount,
  onQueryChange,
  onViewChange,
  onSortChange,
  onThemeToggle,
}: ToolbarProps) {
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          inputRef.current?.focus();
          break;
        case 'Escape':
          onQueryChange('');
          inputRef.current?.blur();
          break;
        case 'd':
        case 'D':
          onThemeToggle();
          break;
        case 'g':
        case 'G':
          onViewChange('grid');
          break;
        case 'l':
        case 'L':
          onViewChange('list');
          break;
        case 'c':
        case 'C':
          onViewChange('compact');
          break;
        case 's':
        case 'S':
          e.preventDefault();
          onSortChange(sort === 'cn' ? 'category' : 'cn');
          break;
        case '?':
          e.preventDefault();
          setShowHelp(prev => !prev);
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onQueryChange, onViewChange, onSortChange, onThemeToggle, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="搜索术语、英文、定义…（按 / 聚焦）"
            className="h-10 w-full rounded-full border border-[var(--border)] bg-[var(--surface)] pl-10 pr-10 text-sm text-[var(--ink)] outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {[
              { mode: 'grid' as ViewMode, icon: LayoutGrid, label: '网格' },
              { mode: 'list' as ViewMode, icon: List, label: '列表' },
              { mode: 'compact' as ViewMode, icon: AlignJustify, label: '紧凑' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onViewChange(mode)}
                className={cn(
                  'flex h-8 items-center gap-1 px-2.5 text-xs transition-colors',
                  view === mode
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                )}
                title={label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <button
            onClick={() => onSortChange(sort === 'cn' ? 'category' : 'cn')}
            className="flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            title="切换排序"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{sort === 'cn' ? '名称' : '分类'}</span>
          </button>

          {/* Theme */}
          <button
            onClick={onThemeToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            title="切换主题"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Help */}
          <button
            onClick={() => setShowHelp(prev => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            title="快捷键帮助"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Result Info */}
      <div className="mt-2 text-sm text-[var(--muted)]">
        {query ? (
          <span>
            搜索 "<span className="text-[var(--ink)]">{query}</span>" ·{' '}
            <strong className="text-[var(--ink)]">{resultCount}</strong> 条结果
          </span>
        ) : (
          <span>
            共 <strong className="text-[var(--ink)]">{totalCount.toLocaleString()}</strong> 条术语
          </span>
        )}
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowHelp(false)}>
          <div className="mx-4 w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-[var(--ink)]">快捷键</h3>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <div className="flex justify-between">
                <span>搜索</span>
                <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1.5 py-0.5 text-xs">/</kbd>
              </div>
              <div className="flex justify-between">
                <span>清空搜索</span>
                <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1.5 py-0.5 text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between">
                <span>深色模式</span>
                <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1.5 py-0.5 text-xs">D</kbd>
              </div>
              <div className="flex justify-between">
                <span>网格视图</span>
                <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1.5 py-0.5 text-xs">G</kbd>
              </div>
              <div className="flex justify-between">
                <span>列表视图</span>
                <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1.5 py-0.5 text-xs">L</kbd>
              </div>
              <div className="flex justify-between">
                <span>紧凑视图</span>
                <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1.5 py-0.5 text-xs">C</kbd>
              </div>
              <div className="flex justify-between">
                <span>排序</span>
                <kbd className="rounded border border-[var(--border)] bg-[var(--hover)] px-1.5 py-0.5 text-xs">S</kbd>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 text-sm text-[var(--ink)] transition-colors hover:bg-[var(--hover)]"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
