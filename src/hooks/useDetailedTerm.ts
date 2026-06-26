import { useState, useEffect } from 'react';
import type { Term } from '@/types/term';

// Cache: one per chunk file
const chunkCache: Record<string, Record<string, string>> = {};
const pendingFetches: Record<string, Promise<Record<string, string>>> = {};

// Character-range heuristic for chunk key, matching the Python split_details.py logic.
// CJK Unified range roughly groups by pronunciation in Unicode ordering.
function getChunkKey(name: string): string {
  if (!name) return 'en';
  const c0 = name.codePointAt(0) || 0;
  // CJK Unified Ideographs & Extension A
  if ((c0 >= 0x4e00 && c0 <= 0x9fff) || (c0 >= 0x3400 && c0 <= 0x4dbf)) {
    // Use same modulo as the split script's fallback
    const idx = (c0 - 0x4e00) % 26;
    return String.fromCharCode(0x61 + idx); // 'a' through 'z'
  }
  return 'en';
}

async function loadChunk(key: string): Promise<Record<string, string>> {
  if (chunkCache[key]) return chunkCache[key];
  if (pendingFetches[key]) return pendingFetches[key];

  pendingFetches[key] = (async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL;
      const response = await fetch(`${baseUrl}details/${key}.json`);
      if (!response.ok) {
        chunkCache[key] = {};
        return {};
      }
      const data = await response.json();
      chunkCache[key] = data;
      return data;
    } catch {
      chunkCache[key] = {};
      return {};
    }
  })();

  return pendingFetches[key];
}

export function useDetailedTerm(term: Term | null) {
  const [detailed, setDetailed] = useState<string | null>(null);

  useEffect(() => {
    if (!term) {
      setDetailed(null);
      return;
    }

    let cancelled = false;

    async function fetchDetail() {
      const key = getChunkKey(term!.cn);
      try {
        const chunk = await loadChunk(key);
        if (!cancelled) {
          setDetailed(chunk[term!.cn] || null);
        }
      } catch {
        if (!cancelled) setDetailed(null);
      }
    }

    fetchDetail();

    return () => { cancelled = true; };
  }, [term?.cn]);

  return { detailed };
}
