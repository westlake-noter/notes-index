import test from 'node:test';
import assert from 'node:assert/strict';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {repositoryFromUrl, repositoriesFromTree} from '../lib/github-repositories.mjs';
import remarkRepositoryContributors from '../plugins/remark-repository-contributors.mjs';

const parser = unified().use(remarkParse).use(remarkFrontmatter).use(remarkMdx)
  .use(remarkGfm).use(remarkMath);

test('normalizes repository, file, release and query links to one repository', () => {
  for (const url of [
    'https://github.com/Owner/Notes',
    'https://github.com/owner/notes.git',
    'https://github.com/owner/notes/blob/main/main.pdf',
    'https://github.com/owner/notes/releases/latest?download=1#assets',
  ]) assert.equal(repositoryFromUrl(url), 'owner/notes');
});

test('ignores profiles, GitHub site pages, lookalike domains and unsafe URLs', () => {
  for (const url of [
    'https://github.com/owner', 'https://github.com/orgs/westlake-noter',
    'https://github.com/topics/math', 'https://github.com/settings/profile',
    'https://github.com.evil.test/owner/repo', 'javascript:alert(1)',
    'https://token@github.com/owner/repo', 'https://github.com/owner/..',
    'https://example.com/owner/repo', '/local/page', null,
  ]) assert.equal(repositoryFromUrl(url), null);
});

test('extracts Markdown, references and static MDX anchors, ignoring code', () => {
  const tree = parser.parse(`
---
title: Repository links
---
[Course](https://github.com/Owner/Notes)
[PDF](https://github.com/owner/notes/blob/main/main.pdf)
[Other course][other]
<a href="https://github.com/owner/fourth/releases">Releases</a>
<a href={dynamicHref}>Dynamic</a>
\`https://github.com/owner/ignored-inline\`

\`\`\`md
[Code](https://github.com/owner/ignored-code)
\`\`\`

[other]: https://github.com/owner/second
[unused]: https://github.com/owner/ignored-reference
`);
  assert.deepEqual(repositoriesFromTree(tree), [
    'owner/notes', 'owner/second', 'owner/fourth',
  ]);
});

test('recognizes autolinks in a plain Markdown tree', () => {
  const tree = unified().use(remarkParse).parse('<https://github.com/owner/third>');
  assert.deepEqual(repositoriesFromTree(tree), ['owner/third']);
});

test('recognizes bare GitHub URLs and links inside GFM tables', () => {
  const tree = parser.parse(`
https://github.com/owner/bare

| Course |
| --- |
| [Notes](https://github.com/owner/table) |
`);
  assert.deepEqual(repositoriesFromTree(tree), ['owner/bare', 'owner/table']);
});

test('accepts the site math syntax without parsing TeX braces as JSX expressions', () => {
  const tree = parser.parse(String.raw`
$\{x \in \mathbb{R}\}$

$$
\frac{1}{2} + \sum_{i=1}^{n} x_i
$$

[Notes](https://github.com/owner/math-notes)
`);
  assert.deepEqual(repositoriesFromTree(tree), ['owner/math-notes']);
});

test('stores deduplicated repository metadata without adding anything to the article', () => {
  const tree = parser.parse('[A](https://github.com/owner/notes)\n[B](https://github.com/owner/notes/releases)');
  const before = structuredClone(tree);
  const file = {data: {frontMatter: {title: 'Notes'}}};
  remarkRepositoryContributors()(tree, file);
  assert.deepEqual(file.data.frontMatter.githubRepositories, ['owner/notes']);
  assert.equal(file.data.frontMatter.title, 'Notes');
  assert.deepEqual(tree, before);
});

test('leaves pages without repository links unchanged', () => {
  const tree = parser.parse('# Tools\n\nNo tools have been added yet.');
  const before = structuredClone(tree);
  const file = {data: {frontMatter: {}}};
  remarkRepositoryContributors()(tree, file);
  assert.deepEqual(tree, before);
  assert.deepEqual(file.data.frontMatter.githubRepositories, []);
});
