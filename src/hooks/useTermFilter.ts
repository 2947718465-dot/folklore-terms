import { useMemo } from 'react';
import type { Term, SortMode } from '@/types/term';

interface UseTermFilterResult {
  filtered: Term[];
  categories: Record<string, number>;
  subcategories: Record<string, Record<string, number>>;
  t3categories: Record<string, number>;
}

export function useTermFilter(
  terms: Term[],
  cat: string,
  sub: string,
  t3: string,
  sort: SortMode
): UseTermFilterResult {
  const filtered = useMemo(() => {
    let result = terms;

    if (cat) {
      result = result.filter(t => t.category === cat);
    }
    if (sub) {
      result = result.filter(t => t.subcategory === sub);
    }
    if (t3) {
      result = result.filter(t => t.subcategory3 === t3);
    }

    if (sort === 'cn') {
      result = [...result].sort((a, b) => a.cn.localeCompare(b.cn, 'zh'));
    } else if (sort === 'category') {
      result = [...result].sort((a, b) =>
        (a.category + a.subcategory + a.subcategory3).localeCompare(
          b.category + b.subcategory + b.subcategory3,
          'zh'
        )
      );
    }

    return result;
  }, [terms, cat, sub, t3, sort]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    terms.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [terms]);

  const subcategories = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    terms.forEach(t => {
      if (!counts[t.category]) counts[t.category] = {};
      counts[t.category][t.subcategory] = (counts[t.category][t.subcategory] || 0) + 1;
    });
    return counts;
  }, [terms]);

  const t3categories = useMemo(() => {
    if (!cat || !sub) return {};
    const counts: Record<string, number> = {};
    terms
      .filter(t => t.category === cat && t.subcategory === sub)
      .forEach(t => {
        counts[t.subcategory3] = (counts[t.subcategory3] || 0) + 1;
      });
    return counts;
  }, [terms, cat, sub]);

  return { filtered, categories, subcategories, t3categories };
}
