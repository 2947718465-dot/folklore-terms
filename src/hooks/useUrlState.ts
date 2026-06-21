import { useState, useCallback, useEffect } from 'react';
import type { UrlState, ViewMode, SortMode } from '@/types/term';

function getUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get('q') || '',
    view: (params.get('view') as ViewMode) || 'list',
    sort: (params.get('sort') as SortMode) || 'cn',
    cat: params.get('cat') || '',
    sub: params.get('sub') || '',
    t3: params.get('t3') || '',
  };
}

function setUrlState(state: UrlState) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.view !== 'list') params.set('view', state.view);
  if (state.sort !== 'cn') params.set('sort', state.sort);
  if (state.cat) params.set('cat', state.cat);
  if (state.sub) params.set('sub', state.sub);
  if (state.t3) params.set('t3', state.t3);

  const queryString = params.toString();
  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;

  window.history.replaceState({}, '', newUrl);
}

export function useUrlState() {
  const [state, setState] = useState<UrlState>(getUrlState);

  useEffect(() => {
    setUrlState(state);
  }, [state]);

  const updateState = useCallback((updates: Partial<UrlState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      q: '',
      view: 'list',
      sort: 'cn',
      cat: '',
      sub: '',
      t3: '',
    });
  }, []);

  return { state, updateState, resetState };
}
