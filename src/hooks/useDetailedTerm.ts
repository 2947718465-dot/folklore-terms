import { useState, useEffect, useRef } from 'react';
import type { Term } from '@/types/term';

// Cache: one per chunk file
const chunkCache: Record<string, Record<string, string>> = {};
const pendingFetches: Record<string, Promise<Record<string, string>>> = {};

export function getChunkKey(name: string): string {
  if (!name) return 'en';
  const c0 = name.codePointAt(0) || 0;
  // CJK Unified Ideographs & Extension A
  if ((c0 >= 0x4e00 && c0 <= 0x9fff) || (c0 >= 0x3400 && c0 <= 0x4dbf)) {
    const idx = (c0 - 0x4e00) % 26;
    return String.fromCharCode(0x61 + idx); // 'a' through 'z'
  }
  return 'en';
}

async function loadChunk(key: string): Promise<Record<string, string>> {
  if (chunkCache[key]) return chunkCache[key];
  if (key in pendingFetches) return pendingFetches[key];

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

// Preload chunks in background — call this when a list of terms is rendered.
// Chunks are deduplicated and fetched with low priority so they don't block the UI.
export function preloadChunks(keys: string[]) {
  const unique = [...new Set(keys)];
  for (const key of unique) {
    if (!chunkCache[key] && !(key in pendingFetches)) {
      loadChunk(key);
    }
  }
}

export function useDetailedTerm(term: Term | null) {
  const [detailed, setDetailed] = useState<string | null>(() => term?.detailed || null);
  const prevTermRef = useRef<string | null>(null);

  useEffect(() => {
    const termCn = term?.cn ?? null;

    // Skip if term hasn't changed
    if (termCn === prevTermRef.current) return;
    prevTermRef.current = termCn;

    if (!term) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [term, term?.cn]);

  return { detailed };
}
