import { useState, useEffect } from 'react';
import type { Term } from '@/types/term';
import { rawToTerm } from '@/types/term';

interface UseTermsResult {
  terms: Term[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

export function useTerms(): UseTermsResult {
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTerms() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}terms.json`);
        if (!response.ok) throw new Error('Failed to load terms');
        const data = await response.json();
        const parsed: Term[] = data.map((raw: [string, string, string, string, string, string, string?], i: number) =>
          rawToTerm(raw, i)
        );
        setTerms(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    loadTerms();
  }, []);

  return {
    terms,
    isLoading,
    error,
    totalCount: terms.length,
  };
}
