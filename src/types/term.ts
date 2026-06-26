export interface Term {
  id: string;
  cn: string;
  en: string;
  definition: string;
  detailed?: string;
  category: string;
  subcategory: string;
  subcategory3: string;
}

// Raw data format: [cn, en, definition, category, subcategory, t3]
// Extended format: [cn, en, definition, category, subcategory, t3, detailed?]
export type TermData = Array<[string, string, string, string, string, string, string?]>;

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortMode = 'cn' | 'category';

export interface UrlState {
  q: string;
  view: ViewMode;
  sort: SortMode;
  cat: string;
  sub: string;
  t3: string;
}

export interface CategoryInfo {
  name: string;
  icon: string;
  sealChar: string;
  color: string;
  count: number;
}

export const CATEGORIES: Record<string, { icon: string; sealChar: string; color: string }> = {
  '民俗事象': { icon: '🏛', sealChar: '俗', color: '#B8403D' },
  '学科概念': { icon: '📐', sealChar: '学', color: '#4B4D9E' },
  '理论术语': { icon: '📖', sealChar: '理', color: '#2E6DA4' },
  '研究关键词': { icon: '🔑', sealChar: '关', color: '#3D8B68' },
  '研究方法': { icon: '🔬', sealChar: '法', color: '#9B7B2C' },
  '学者与学术体制': { icon: '🎓', sealChar: '制', color: '#8B3A5E' },
};

export function rawToTerm(raw: [string, string, string, string, string, string, string?], index: number): Term {
  return {
    id: String(index),
    cn: raw[0],
    en: raw[1] || '',
    definition: raw[2] || '',
    detailed: raw[6] || undefined,
    category: raw[3],
    subcategory: raw[4],
    subcategory3: raw[5],
  };
}
