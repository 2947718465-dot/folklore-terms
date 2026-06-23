import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Term } from '@/types/term';
import { CATEGORIES } from '@/types/term';

interface StatsChartProps {
  terms: Term[];
}

export function StatsChart({ terms }: StatsChartProps) {
  const stats = useMemo(() => {
    const cats: Record<string, number> = {};
    const subs: Record<string, number> = {};
    
    terms.forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + 1;
      const subKey = `${t.category} › ${t.subcategory}`;
      subs[subKey] = (subs[subKey] || 0) + 1;
    });

    const total = terms.length;
    const catData = Object.entries(cats)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
        color: CATEGORIES[name]?.color || '#999',
        icon: CATEGORIES[name]?.icon || '📚',
      }))
      .sort((a, b) => b.count - a.count);

    const topSubs = Object.entries(subs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }));

    return { catData, topSubs, total };
  }, [terms]);

  return (
    <div className="space-y-6">
      {/* Category Distribution */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">分类分布</h3>
        <div className="space-y-3">
          {stats.catData.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-3">
              <span className="text-lg">{cat.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-[var(--ink)]">{cat.name}</span>
                  <span className="text-xs text-[var(--muted)]">{cat.count.toLocaleString()} ({cat.percent}%)</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--hover)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Subcategories */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">热门子分类</h3>
        <div className="grid grid-cols-2 gap-2">
          {stats.topSubs.map((sub) => (
            <div key={sub.name} className="flex items-center justify-between p-2 rounded-lg bg-[var(--hover)]">
              <span className="text-xs text-[var(--ink)] truncate">{sub.name}</span>
              <span className="text-xs text-[var(--muted)]">{sub.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
