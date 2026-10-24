const reservedOwners = new Set([
  'about', 'account', 'apps', 'collections', 'contact', 'customer-stories',
  'enterprise', 'events', 'explore', 'features', 'issues', 'login', 'marketplace',
  'new', 'notifications', 'orgs', 'organizations', 'pricing', 'pulls', 'readme',
  'search', 'security', 'sessions', 'settings', 'site', 'sponsors', 'topics', 'users',
]);

export function repositoryFromUrl(value) {
  if (typeof value !== 'string') return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.hostname !== 'github.com'
    || url.username || url.password || url.port) return null;
  const [owner, rawName] = url.pathname.split('/').filter(Boolean);
  const name = rawName?.replace(/\.git$/i, '');
  if (!owner || !name || reservedOwners.has(owner.toLowerCase())
    || !/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(owner)
    || !/^[a-z\d_.-]+$/i.test(name) || /^\.+$/.test(name)) return null;
  return `${owner}/${name}`.toLowerCase();
}

function walk(node, visit) {
  visit(node);
  node.children?.forEach((child) => walk(child, visit));
}

export function repositoriesFromTree(tree) {
  const definitions = new Map();
  walk(tree, (node) => {
    if (node.type === 'definition') {
      definitions.set(node.identifier.toLowerCase(), node.url);
    }
  });
  const repositories = new Set();
  walk(tree, (node) => {
    let href;
    if (node.type === 'link') href = node.url;
    if (node.type === 'linkReference') href = definitions.get(node.identifier.toLowerCase());
    if (['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type)
      && node.name === 'a') {
      href = node.attributes?.find((attribute) => attribute.name === 'href')?.value;
    }
    const repository = repositoryFromUrl(href);
    if (repository) repositories.add(repository);
  });
  return [...repositories];
}
