export interface WikipediaImage {
  url: string;
  title: string;
  description: string;
}

export async function searchTermImage(termCn: string, termEn?: string): Promise<WikipediaImage | null> {
  // Try Chinese Wikipedia first, then English
  const queries: string[] = [termCn];
  if (termEn) queries.push(termEn);

  for (const query of queries) {
    try {
      const result = await searchWikipedia(query, 'zh');
      if (result) return result;
    } catch {
      // Continue to next query
    }
  }

  // Try English Wikipedia
  for (const query of queries) {
    try {
      const result = await searchWikipedia(query, 'en');
      if (result) return result;
    } catch {
      // Continue
    }
  }

  return null;
}

async function searchWikipedia(query: string, lang: string): Promise<WikipediaImage | null> {
  const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': 'FolkloreTerms/1.0 (https://github.com/2947718465-dot/folklore-terms)',
    },
  });

  if (!response.ok) return null;

  const data = await response.json();

  if (data.thumbnail && data.thumbnail.source) {
    return {
      url: data.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
      title: data.title || query,
      description: data.extract || '',
    };
  }

  return null;
}

export async function searchMultipleImages(terms: { cn: string; en?: string }[]): Promise<Map<string, WikipediaImage>> {
  const results = new Map<string, WikipediaImage>();

  for (const term of terms.slice(0, 20)) {
    const image = await searchTermImage(term.cn, term.en);
    if (image) {
      results.set(term.cn, image);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
