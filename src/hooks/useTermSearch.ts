import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Term } from '@/types/term';

interface UseTermSearchResult {
  results: Term[];
}

export function useTermSearch(terms: Term[], query: string): UseTermSearchResult {
  const fuse = useMemo(() => {
    return new Fuse(terms, {
      keys: [
        { name: 'cn', weight: 0.5 },
        { name: 'en', weight: 0.3 },
        { name: 'definition', weight: 0.1 },
        { name: 'category', weight: 0.05 },
        { name: 'subcategory', weight: 0.05 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 1,
      ignoreLocation: true,
    });
  }, [terms]);

  const results = useMemo(() => {
    if (!query.trim()) return terms;
    return fuse.search(query).map(result => result.item);
  }, [fuse, query, terms]);

  return { results };
}
