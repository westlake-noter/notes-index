import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const siteRoot = fileURLToPath(new URL('../', import.meta.url));

// Include source text in remark options so Docusaurus invalidates its MDX cache.
export function loadLocalTabSources(root = siteRoot) {
  const sources = {};
  const collect = (directory) => {
    let entries;
    try { entries = readdirSync(directory, {withFileTypes: true}); } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(filename);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relative = path.relative(root, filename).split(path.sep).join('/');
        sources[relative] = readFileSync(filename, 'utf8');
      }
    }
  };
  collect(path.join(root, 'content/repository-tabs'));
  return sources;
}
