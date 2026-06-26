import Fuse from 'fuse.js';
import type { Term } from '@/types/term';

let fuse: Fuse<Term> | null = null;

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'init') {
    const terms: Term[] = payload.terms;
    fuse = new Fuse(terms, {
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
    self.postMessage({ type: 'ready' });
  }

  if (type === 'search') {
    const { query, terms } = payload;
    if (!fuse) {
      self.postMessage({ type: 'results', results: terms });
      return;
    }
    if (!query.trim()) {
      self.postMessage({ type: 'results', results: terms });
      return;
    }
    const results = fuse.search(query).map(result => result.item);
    self.postMessage({ type: 'results', results });
  }
};
