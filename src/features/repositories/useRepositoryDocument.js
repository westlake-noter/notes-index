import {useEffect} from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import snapshot from '@site/src/data/repository-documents.json';
import {documentViews, resolveDocumentView} from './documents.mjs';

export default function useRepositoryDocument(repositories, customDocuments = []) {
  const history = useHistory();
  const location = useLocation();
  const isBrowser = useIsBrowser();
  const views = [
    ...documentViews,
    ...customDocuments.map(({id, label}) => ({value: id, label})),
  ];
  // Static pages have no query string; keep the initial hydration identical.
  const {view, repository} = resolveDocumentView(
    repositories, isBrowser ? location.search : '', isBrowser ? location.hash : '', views,
  );
  useEffect(() => {
    if (!isBrowser || view === 'overview' || !location.hash) return undefined;
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return undefined; }
    // Query-selected headings do not exist in the static Overview HTML.
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [isBrowser, view, repository, location.hash]);
  const select = (nextView, nextRepository = repository) => {
    const search = new URLSearchParams(location.search);
    search.delete('view');
    search.delete('repo');
    if (nextView !== 'overview') {
      search.set('view', nextView);
      search.set('repo', nextRepository);
    }
    history.replace({...location, search: search.toString() ? `?${search}` : '', hash: ''});
  };
  return {
    view, views, repository,
    documentData: customDocuments.find(({id}) => id === view)
      ?? (view === 'readme' ? snapshot.repositories[repository]
        : snapshot.repositories[repository]?.documents?.[view]),
    selectView: (value) => select(value),
    selectRepository: (value) => select(view, value),
  };
}
