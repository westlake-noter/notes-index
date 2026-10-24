import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import remarkRepositoryTabs from '../plugins/remark-repository-tabs.mjs';
import {loadLocalTabSources} from '../lib/local-repository-tabs.mjs';
import {documentViews, resolveDocumentView} from '../src/features/repositories/documents.mjs';

const filename = 'content/repository-tabs/guide.md';
const tab = {id: 'guide', label: 'Reading Guide', file: filename};
const sources = {[filename]: '# Guide\n\n## Sequence\n[Overview](/notes/)\n![Map](/img/map.png)\n[Sequence](#sequence)'};
const file = (tabs) => ({data: {frontMatter: {
  githubRepositories: ['owner/repo'], repositoryTabs: tabs,
}}});

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
