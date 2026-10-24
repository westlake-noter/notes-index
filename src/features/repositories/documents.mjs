export const documentViews = [
  {value: 'overview', label: 'Overview'},
  {value: 'readme', label: 'README'},
  {value: 'contributing', label: 'Contributing'},
  {value: 'license', label: 'License'},
];

export function resolveDocumentView(repositories, search, hash, views = documentViews) {
  const params = new URLSearchParams(search);
  const fragmentView = [...views].sort((a, b) => b.value.length - a.value.length).find(({value}) =>
    value !== 'overview' && hash.startsWith(`#${value}-`))?.value;
  const view = fragmentView ?? (views.some(({value}) => value === params.get('view'))
    ? params.get('view') : 'overview');
  const repository = repositories.find((name) =>
    fragmentView && hash.startsWith(`#${fragmentView}-${name.replaceAll('/', '-')}-`))
    ?? (repositories.includes(params.get('repo')) ? params.get('repo') : repositories[0]);
  return {view, repository};
}
