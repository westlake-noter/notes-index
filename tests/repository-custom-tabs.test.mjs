import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import remarkRepositoryTabs from '../plugins/remark-repository-tabs.mjs';
import {loadLocalTabSources} from '../lib/local-repository-tabs.mjs';
import {documentViews, resolveDocumentView} from '../src/features/repositories/documents.mjs';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const filename = 'content/repository-tabs/guide.md';
const tab = {id: 'guide', label: 'Reading Guide', file: filename};
const sources = {[filename]: '# Guide\n\n## Sequence\n[Overview](/notes/)\n![Map](/img/map.png)\n[Sequence](#sequence)'};
const file = (tabs) => ({data: {frontMatter: {
  githubRepositories: ['owner/repo'], repositoryTabs: tabs,
}}});

test('Quantum Mechanics TOC preserves all numbered entries and printed pages from release v1.0.0', async () => {
  const tabFile = 'content/repository-tabs/quantum-mechanics-toc.md';
  const sources = loadLocalTabSources();
  const tree = unified().use(remarkParse).use(remarkGfm).parse(sources[tabFile]);
  const text = (node) => node.value ?? node.children?.map(text).join('') ?? '';
  const headings = tree.children.filter((node) => node.type === 'heading' && node.depth === 2);
  assert.deepEqual(headings.map((node) => Number(text(node).split('.')[0])),
    Array.from({length: 18}, (_, i) => i + 1));
  const pages = tree.children.filter((node) =>
    node.type === 'paragraph' && text(node).startsWith('Printed page:'));
  assert.deepEqual(pages.map((node) => Number(text(node).match(/\d+/)[0])),
    [1, 1, 2, 2, 5, 5, 6, 6, 9, 11, 12, 13, 17, 21, 29, 32, 42, 44]);
  const entries = tree.children.filter((node) => node.type === 'table')
    .flatMap((table) => table.children.slice(1))
    .map((row) => row.children.map(text));
  assert.equal(entries.length, 36);
  assert.deepEqual(entries.map(([number, , page]) => `${number}:${page}`), [
    '4.1:2', '4.2:3', '8.1:7', '8.2:7', '8.3:8', '8.4:8', '8.5:8', '8.6:9',
    '12.1:14', '12.2:15', '12.3:16', '12.4:17',
    '13.1:17', '13.2:19', '13.2.1:19', '13.2.2:20',
    '14.1:21', '14.2:22', '14.3:23', '14.4:25', '14.5:27', '14.6:28', '14.7:28', '14.7.1:29',
    '15.1:29', '15.2:30', '15.3:32', '16.1:32', '16.2:34', '16.3:36', '16.4:38', '16.5:40',
    '17.1:42', '17.2:43', '17.3:43', '18.1:45',
  ]);
  const data = file([{id: 'toc', label: 'TOC', file: tabFile, layout: 'outline'}]);
  await remarkRepositoryTabs({sources})(null, data);
  assert.equal(data.data.frontMatter.repositoryTabDocuments[0].layout, 'outline');
  assert.equal(data.data.frontMatter.repositoryTabDocuments[0].toc.filter(({level}) => level === 2).length, 18);
  const overview = await readFile(new URL('../docs/notes/physics/quantum-mechanics.md', import.meta.url), 'utf8');
  assert.match(overview, /file: content\/repository-tabs\/quantum-mechanics-toc\.md/);
  assert.match(overview, /https:\/\/github\.com\/JieteXue\/quantum-mechanics-notes/);
});

test('FAA keeps both complete volume outlines in its configured TOC tab, outside Overview', async () => {
  const overview = await readFile(new URL('../docs/notes/math/fundamental-algebra-analysis.md', import.meta.url), 'utf8');
  const tabFile = 'content/repository-tabs/fundamental-algebra-analysis-toc.md';
  const localSources = loadLocalTabSources();
  assert.match(overview, /id: toc\n\s+label: TOC\n\s+file: content\/repository-tabs\/fundamental-algebra-analysis-toc\.md/);
  assert.doesNotMatch(overview, /## Volume I|Basic Logic|Language of Category Theory/);
  assert.match(overview, /## Instructors/);
  assert.match(overview, /## Overview/);
  const data = file([{id: 'toc', label: 'TOC', file: tabFile}]);
  await remarkRepositoryTabs({sources: localSources})(null, data);
  const [document] = data.data.frontMatter.repositoryTabDocuments;
  assert.equal(document.toc.filter(({level}) => level === 2).length, 2);
  assert.match(document.html, /Basic Logic/);
  assert.match(document.html, /Language of Category Theory/);
  assert.match(document.html, /Fourier transform/);
  assert.match(document.html, /toc-owner-repo-table-of-contents-2/);
});

test('renders declared custom tabs with scoped headings and deployment-aware local links', async () => {
  const data = file([tab]);
  await remarkRepositoryTabs({
    sources, baseUrl: '/notes-index/',
    sourceBase: 'https://github.com/owner/site/blob/main/',
  })(null, data);
  const [document] = data.data.frontMatter.repositoryTabDocuments;
  assert.equal(document.id, 'guide');
  assert.equal(document.label, 'Reading Guide');
  assert.equal(document.local, true);
  assert.equal(document.sourceUrl, 'https://github.com/owner/site/blob/main/content/repository-tabs/guide.md');
  assert.match(document.html, /id="guide-owner-repo-sequence"/);
  assert.match(document.html, /href="\/notes-index\/notes\/"/);
  assert.match(document.html, /src="\/notes-index\/img\/map.png"/);
  assert.match(document.html, /href="#guide-owner-repo-sequence"/);
});

test('rejects duplicate/reserved IDs, unknown files, invalid labels, and missing repository context', async () => {
  const transform = remarkRepositoryTabs({sources});
  for (const tabs of [
    [{...tab, id: 'readme'}], [tab, tab], [{...tab, id: undefined}],
    [{...tab, label: ''}], [{...tab, file: '../private.md'}],
    [{...tab, layout: 'unknown'}],
  ]) {
    await assert.rejects(transform(null, file(tabs)), /Invalid repositoryTabs/);
  }
  await assert.rejects(transform(null, file({})), /must be an array/);
  const data = file([tab]);
  data.data.frontMatter.githubRepositories = [];
  await assert.rejects(transform(null, data), /requires a page/);
});

test('custom tab URLs and scoped fragments resolve without changing builtin tab order', () => {
  const views = [...documentViews, {value: 'readme-guide', label: 'Guide'}];
  assert.equal(resolveDocumentView(['owner/repo'], '?view=readme-guide', '', views).view, 'readme-guide');
  assert.equal(resolveDocumentView(['owner/repo'], '', '#readme-guide-owner-repo-notes', views).view, 'readme-guide');
  assert.equal(documentViews.length, 4);
});

test('loads only local Markdown tab sources and reflects changes for MDX cache invalidation', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'repository-tabs-'));
  try {
    assert.deepEqual(loadLocalTabSources(root), {});
    await mkdir(path.join(root, 'content/repository-tabs'), {recursive: true});
    await writeFile(path.join(root, filename), '# First');
    await writeFile(path.join(root, 'content/repository-tabs/ignored.txt'), 'Skip');
    assert.deepEqual(loadLocalTabSources(root), {[filename]: '# First'});
    await writeFile(path.join(root, filename), '# Updated');
    assert.deepEqual(loadLocalTabSources(root), {[filename]: '# Updated'});
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});
