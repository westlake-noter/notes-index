import GithubSlugger from 'github-slugger';

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function compileOutline(text, repository, tabId) {
  const invalid = (message) => { throw new Error(`Invalid course outline: ${message}`); };
  let data;
  try { data = JSON.parse(text); } catch { invalid('expected valid JSON'); }
  if (!data || typeof data.title !== 'string' || !data.title.trim()
    || !Array.isArray(data.entries) || !data.entries.length) invalid('provide a title and entries');
  if (!data.source || typeof data.source.label !== 'string' || !data.source.label.trim()
    || typeof data.source.url !== 'string'
    || !Number.isSafeInteger(data.source.pageOffset) || data.source.pageOffset < 0) {
    invalid('provide a PDF source with label, HTTPS url, and nonnegative pageOffset');
  }
  let url;
  try { url = new URL(data.source.url); } catch { invalid('source URL is invalid'); }
  if (url.protocol !== 'https:' || url.username || url.password) invalid('source URL must use HTTPS without credentials');
  const slugger = new GithubSlugger();
  const id = (title) => `${tabId}-${repository.replaceAll('/', '-')}-${slugger.slug(title)}`;
  const titleId = id(data.title);
  const toc = [{id: titleId, value: escapeHtml(data.title), level: 1}];
  const seen = new Set();
  const chapters = [];
  for (const entry of data.entries) {
    if (!entry || typeof entry.number !== 'string' || !/^[1-9]\d*(?:\.[1-9]\d*)*$/.test(entry.number)
      || typeof entry.title !== 'string' || !entry.title.trim()
      || !Number.isSafeInteger(entry.page) || entry.page < 1
      || !Number.isSafeInteger(entry.page + data.source.pageOffset)
      || seen.has(entry.number)) invalid('each entry needs a unique number, title, and positive page');
    const parts = entry.number.split('.');
    const normalized = {number: entry.number, title: entry.title.trim(), page: entry.page, depth: parts.length - 1};
    if (parts.length === 1) {
      if (Number(entry.number) !== chapters.length + 1) invalid('chapters must be ordered from 1');
      normalized.id = id(`${entry.number}. ${normalized.title}`);
      chapters.push({...normalized, entries: []});
      toc.push({id: normalized.id, value: escapeHtml(`${entry.number}. ${normalized.title}`), level: 2});
    } else {
      const parent = parts.slice(0, -1).join('.');
      const chapter = chapters.at(-1);
      if (!seen.has(parent) || chapter?.number !== parts[0]) invalid(`missing or misplaced parent for ${entry.number}`);
      chapter.entries.push(normalized);
    }
    seen.add(entry.number);
  }
  return {
    outline: {title: data.title.trim(), titleId, source: data.source, chapters},
    toc,
  };
}
