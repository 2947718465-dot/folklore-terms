import { useState, useEffect } from 'react';
import type { Term } from '@/types/term';

// Cache for detailed data
let detailedCache: Record<string, string> | null = null;
let cachePromise: Promise<Record<string, string>> | null = null;

async function loadDetailedData(): Promise<Record<string, string>> {
  if (detailedCache) return detailedCache;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}terms.json`);
    const data = await response.json();
    // Build index: cn -> detailed
    const cache: Record<string, string> = {};
    data.forEach((item: [string, string, string, string, string, string, string?]) => {
      if (item[6]) {
        cache[item[0]] = item[6];
      }
    });
    detailedCache = cache;
    return cache;
  })();

  return cachePromise;
}

export function useDetailedTerm(term: Term | null) {
  const [detailed, setDetailed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!term) {
      setDetailed(null);
      return;
    }

    // If term already has detailed field (from cache), use it
    if (term.detailed) {
      setDetailed(term.detailed);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    loadDetailedData().then(cache => {
      if (!cancelled) {
        setDetailed(cache[term.cn] || null);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [term?.cn]);

  return { detailed, isLoading };
}
