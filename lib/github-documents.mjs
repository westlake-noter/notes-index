import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import GithubSlugger from 'github-slugger';
import {visit} from 'unist-util-visit';
import {toText} from 'hast-util-to-text';

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

async function fetchGitHub(repository, endpoint, {token, fetchImpl = fetch} = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetchImpl(`https://api.github.com/repos/${repository}/${endpoint}`, {
    headers, signal: AbortSignal.timeout(15000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
  return response.json();
}

async function fetchDocument(repository, endpoint, options) {
  const data = await fetchGitHub(repository, endpoint, options);
  if (!data) return null;
  if (data.encoding !== 'base64' || typeof data.content !== 'string'
    || typeof data.path !== 'string' || !data.path || typeof data.sha !== 'string'
    || !data.html_url?.startsWith('https://github.com/')
    || !data.download_url?.startsWith('https://raw.githubusercontent.com/')) {
    throw new Error('Invalid GitHub README response');
  }
  return {
    markdown: Buffer.from(data.content, 'base64').toString('utf8'),
    path: data.path,
    sha: data.sha,
    sourceUrl: data.html_url,
    rawUrl: data.download_url,
  };
}

export function fetchReadme(repository, options) {
  return fetchDocument(repository, 'readme', options);
}

export async function renderReadme(source, repository, document = 'readme') {
  const slugger = new GithubSlugger();
  const prefix = `${document}-${repository.replaceAll('/', '-')}-`;
  const toc = [];
  const anchors = new Map();
  const fragments = [];
  const transform = () => (tree) => {
    visit(tree, 'element', (node) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        const value = toText(node);
        const slug = slugger.slug(value);
        const id = `${prefix}${slug}`;
        anchors.set(slug, id);
        if (node.properties.id) {
          anchors.set(node.properties.id.replace(/^user-content-/, ''), id);
        }
        node.properties.id = id;
        toc.push({id, value: escapeHtml(value), level: Number(node.tagName.slice(1))});
      } else if (node.properties.id) {
        const original = String(node.properties.id).replace(/^user-content-/, '');
        const id = `${prefix}${original}`;
        anchors.set(original, id);
        node.properties.id = id;
      }
      for (const property of ['href', 'src', 'poster']) {
        const value = node.properties[property];
        if (typeof value !== 'string' || !value) continue;
        if (property === 'href' && value.startsWith('#')) {
          fragments.push({node, value});
        } else if (!/^[a-z][a-z\d+.-]*:|^\/\//i.test(value)) {
          if (source.siteBaseUrl) {
            const base = `https://local.invalid${source.siteBaseUrl}`;
            const resolved = new URL(value.startsWith('/') ? value.slice(1) : value, base);
            node.properties[property] = `${resolved.pathname}${resolved.search}${resolved.hash}`;
            continue;
          }
          const base = property === 'href' ? source.sourceUrl : source.rawUrl;
          // GitHub treats leading slashes as repository-relative in Markdown.
          const repositoryRoot = base.slice(0, -source.path.length);
          node.properties[property] = new URL(
            value.startsWith('/') ? value.slice(1) : value,
            value.startsWith('/') ? repositoryRoot : base,
          ).href;
        }
      }
    });
    for (const {node, value} of fragments) {
      let fragment;
      try { fragment = decodeURIComponent(value.slice(1)); } catch { fragment = value.slice(1); }
      node.properties.href = anchors.has(fragment)
        ? `#${anchors.get(fragment)}`
        : source.sourceUrl ? `${source.sourceUrl}${value}` : value;
    }
  };
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath)
    .use(remarkRehype, {allowDangerousHtml: true}).use(rehypeRaw)
    .use(rehypeSanitize)
    .use(transform)
    // Sanitize upstream HTML before adding trusted KaTeX markup.
    .use(rehypeKatex).use(rehypeStringify);
  return {html: String(await processor.process(source.markdown)), toc};
}

export async function syncSupportingDocuments(repository, previous = {}, options = {}) {
  const types = ['contributing', 'license'];
  const unavailable = (type) => previous[type]
    ? {...previous[type], stale: true}
    : {status: 'unavailable', syncedAt: null};
  let tree;
  try {
    const data = await fetchGitHub(repository, 'git/trees/HEAD?recursive=1', options);
    if (!Array.isArray(data?.tree) || data.truncated) throw new Error('Incomplete repository file tree');
    tree = data.tree;
  } catch (error) {
    options.onError?.(error);
    return Object.fromEntries(types.map((type) => [type, unavailable(type)]));
  }
  const documents = {};
  for (const type of types) {
    const pattern = type === 'contributing'
      ? /^(?:\.github\/|docs\/)?contributing(?:\.(?:md|markdown|txt|rst))?$/i
      : /^(?:\.github\/|docs\/)?licen[cs]e(?:\.(?:md|markdown|txt|rst))?$/i;
    const entry = tree.filter((item) => item.type === 'blob' && pattern.test(item.path))
      .sort((a, b) => a.path.split('/').length - b.path.split('/').length
        || a.path.localeCompare(b.path))[0];
    if (!entry) {
      documents[type] = {status: 'missing', syncedAt: new Date().toISOString()};
      continue;
    }
    try {
      const source = await fetchDocument(repository,
        `contents/${entry.path.split('/').map(encodeURIComponent).join('/')}`, options);
      if (!source) throw new Error('Document disappeared during sync');
      documents[type] = {
        status: 'ready', ...await renderReadme(source, repository, type),
        sourceUrl: source.sourceUrl, path: source.path, sha: source.sha,
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      options.onError?.(error);
      documents[type] = unavailable(type);
    }
  }
  return documents;
}

export async function syncReadme(repository, previous, options = {}) {
  try {
    const source = await fetchReadme(repository, options);
    if (!source) return {status: 'missing', syncedAt: new Date().toISOString()};
    const rendered = await renderReadme(source, repository);
    return {
      status: 'ready', ...rendered,
      sourceUrl: source.sourceUrl, path: source.path, sha: source.sha,
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    options.onError?.(error);
    return previous
      ? {...previous, stale: true}
      : {status: 'unavailable', syncedAt: null};
  }
}
