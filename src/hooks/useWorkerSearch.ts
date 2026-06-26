import { useState, useEffect, useRef } from 'react';
import type { Term } from '@/types/term';

interface UseWorkerSearchResult {
  results: Term[];
  isReady: boolean;
}

export function useWorkerSearch(terms: Term[], query: string): UseWorkerSearchResult {
  const workerRef = useRef<Worker | null>(null);
  const [results, setResults] = useState<Term[]>(terms);
  const isReadyRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const termsRef = useRef(terms);

  useEffect(() => {
    termsRef.current = terms;
  }, [terms]);

  useEffect(() => {
    isReadyRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(false);
    const worker = new Worker(
      new URL('../workers/search.worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, results: searchResults } = e.data;
      if (type === 'ready') {
        isReadyRef.current = true;
        setIsReady(true);
      }
      if (type === 'results') {
        setResults(searchResults);
      }
    };

    // Initialize worker with terms
    if (terms.length > 0) {
      worker.postMessage({ type: 'init', payload: { terms } });
    }

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [terms]);

  useEffect(() => {
    if (!workerRef.current || !isReadyRef.current) return;
    workerRef.current.postMessage({
      type: 'search',
      payload: { query, terms: termsRef.current },
    });
  }, [query, isReady]);

  return { results, isReady };
}
