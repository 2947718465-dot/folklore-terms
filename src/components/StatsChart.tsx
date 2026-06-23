import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
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
      .slice(0, 10)
      .map(([name, count]) => ({
        name: name.length > 15 ? name.substring(0, 12) + '...' : name,
        fullName: name,
        count,
        percent: Math.round((count / total) * 100),
      }));

    return { catData, topSubs, total };
  }, [terms]);

  return (
    <div className="space-y-6">
      {/* Category Distribution - Pie Chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">分类分布</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.catData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {stats.catData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()} 条`, '数量']}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {stats.catData.map((cat) => (
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
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Subcategories - Bar Chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">热门子分类</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topSubs} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fontSize: 11, fill: 'var(--muted)' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {stats.topSubs.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORIES[entry.fullName?.split(' › ')[0]]?.color || '#999'} fillOpacity={0.8} />
                ))}
              </Bar>
              <Tooltip
                formatter={(value) => [`${Number(value).toLocaleString()} 条`, '数量']}
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
