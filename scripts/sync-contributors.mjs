import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {repositoriesFromTree} from '../lib/github-repositories.mjs';
import {fetchContributors, fetchRepositoryInfo} from '../lib/github-contributors.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'src/data/repository-contributors.json');
const parser = unified().use(remarkParse).use(remarkFrontmatter).use(remarkMdx)
  .use(remarkGfm).use(remarkMath);

async function collectRepositories(directory, repositories = new Set()) {
  const entries = await readdir(directory, {withFileTypes: true});
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectRepositories(filename, repositories);
    else if (/\.mdx?$/.test(entry.name)) {
      const tree = parser.parse(await readFile(filename, 'utf8'));
      repositoriesFromTree(tree).forEach((repository) => repositories.add(repository));
    }
  }
  return repositories;
}

let previous = {};
try {
  previous = JSON.parse(await readFile(output, 'utf8')).repositories ?? {};
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const repositories = {};
for (const repository of await collectRepositories(path.join(root, 'docs'))) {
  try {
    repositories[repository] = {
      ...previous[repository],
      contributors: await fetchContributors(repository, {token: process.env.GITHUB_TOKEN}),
      updatedAt: new Date().toISOString(),
    };
    console.log(`${repository}: ${repositories[repository].contributors.length} contributors`);
  } catch (error) {
    repositories[repository] = previous[repository] ?? {contributors: null, updatedAt: null};
    console.warn(`${repository}: ${error.message}; keeping the saved data or GitHub fallback link.`);
  }
  try {
    repositories[repository].info = await fetchRepositoryInfo(repository, {
      token: process.env.GITHUB_TOKEN,
    });
  } catch (error) {
    console.warn(`${repository}: repository statistics unavailable (${error.message}).`);
  }
}
await mkdir(path.dirname(output), {recursive: true});
await writeFile(output, `${JSON.stringify({repositories}, null, 2)}\n`);
