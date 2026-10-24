import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchReadme, renderReadme, syncReadme, syncSupportingDocuments} from '../lib/github/documents.mjs';

const source = {
  path: 'docs/README.md',
  sourceUrl: 'https://github.com/owner/repo/blob/main/docs/README.md',
  rawUrl: 'https://raw.githubusercontent.com/owner/repo/main/docs/README.md',
};
const render = (markdown) => renderReadme({...source, markdown}, 'owner/repo');

test('fetches GitHub README metadata and decodes UTF-8 without sending a browser token', async () => {
  const fetchImpl = async (url, {headers}) => {
    assert.equal(url, 'https://api.github.com/repos/owner/repo/readme');
    assert.equal(headers.Authorization, 'Bearer test');
    return {ok: true, json: async () => ({
      path: source.path, html_url: source.sourceUrl, download_url: source.rawUrl,
      encoding: 'base64', content: Buffer.from('# Notes 数学').toString('base64'), sha: 'abc',
    })};
  };
  const result = await fetchReadme('owner/repo', {token: 'test', fetchImpl});
  assert.equal(result.markdown, '# Notes 数学');
  assert.equal(result.sourceUrl, source.sourceUrl);
});

test('distinguishes missing README from transient failures and rejects malformed responses', async () => {
  assert.equal(await fetchReadme('owner/repo', {
    fetchImpl: async () => ({status: 404}),
  }), null);
  await assert.rejects(fetchReadme('owner/repo', {
    fetchImpl: async () => ({ok: false, status: 403}),
  }), /403/);
  await assert.rejects(fetchReadme('owner/repo', {
    fetchImpl: async () => ({ok: true, json: async () => ({encoding: 'utf-8'})}),
  }), /Invalid/);
});

test('resolves relative links, images, HTML assets and references against the upstream README', async () => {
  const {html} = await render(`
[PDF](../notes/course.pdf)
[Root](/src/main.tex)
![Map](./images/map.png)
[Reference][ref]
[External](https://example.com)
<img src="../assets/logo.png" onerror="alert(1)">

[ref]: ./guide.md
`);
  assert.match(html, /href="https:\/\/github.com\/owner\/repo\/blob\/main\/notes\/course.pdf"/);
  assert.match(html, /href="https:\/\/github.com\/owner\/repo\/blob\/main\/src\/main.tex"/);
  assert.match(html, /src="https:\/\/raw.githubusercontent.com\/owner\/repo\/main\/docs\/images\/map.png"/);
  assert.match(html, /src="https:\/\/raw.githubusercontent.com\/owner\/repo\/main\/assets\/logo.png"/);
  assert.match(html, /href="https:\/\/github.com\/owner\/repo\/blob\/main\/docs\/guide.md"/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.doesNotMatch(html, /onerror/);
});

test('generates unique scoped headings and rewrites matching fragment links', async () => {
  const {html, toc} = await render('# Notes\n## Setup\n## Setup\n[Go](#setup-1)\n<a id="custom"></a>\n[Custom](#custom)');
  assert.deepEqual(toc.map(({id}) => id), [
    'readme-owner-repo-notes', 'readme-owner-repo-setup', 'readme-owner-repo-setup-1',
  ]);
  assert.match(html, /href="#readme-owner-repo-setup-1"/);
  assert.match(html, /id="readme-owner-repo-custom"/);
  assert.match(html, /href="#readme-owner-repo-custom"/);
});

test('sanitizes upstream HTML and escapes TOC labels rather than executing markup or MDX', async () => {
  const {html, toc} = await render(`
## &lt;img src=x onerror=alert(1)&gt;
<script>alert(1)</script>
<iframe src="https://example.com"></iframe>
<a href="javascript:alert(1)">Unsafe</a>
<div onclick="alert(1)">Content</div>
export const secret = 1;
`);
  assert.doesNotMatch(html, /<script|<iframe|onclick=|href="javascript:/);
  assert.match(toc[0].value, /&lt;img/);
  assert.match(html, /export const secret/);
});

test('supports GFM, fenced code and KaTeX in cached HTML', async () => {
  const {html} = await render('| A | B |\n| - | - |\n| 1 | 2 |\n\n```sh\nnpm run build\n```\n\n$x^2$');
  assert.match(html, /<table>/);
  assert.match(html, /language-sh/);
  assert.match(html, /class="katex"/);
});

test('preserves previous HTML and real sync time on failures, but clears a confirmed missing README', async () => {
  const previous = {status: 'ready', html: '<p>Saved</p>', syncedAt: '2026-10-20T00:00:00Z'};
  const failure = {fetchImpl: async () => { throw new Error('offline'); }};
  assert.deepEqual(await syncReadme('owner/repo', previous, failure), {...previous, stale: true});
  assert.deepEqual(await syncReadme('owner/repo', undefined, failure), {
    status: 'unavailable', syncedAt: null,
  });
  assert.equal((await syncReadme('owner/repo', previous, {
    fetchImpl: async () => ({status: 404}),
  })).status, 'missing');
});

test('discovers separate contributing/license files case-insensitively and prefers root files', async () => {
  const paths = [];
  const result = await syncSupportingDocuments('owner/repo', {}, {
    fetchImpl: async (url) => {
      paths.push(url);
      if (url.includes('git/trees/')) return {ok: true, json: async () => ({
        tree: ['docs/CONTRIBUTING.md', 'Contributing.md', 'LICENSE.txt']
          .map((path) => ({path, type: 'blob'})),
      })};
      const path = url.split('/contents/')[1];
      return {ok: true, json: async () => ({
        path, encoding: 'base64', content: Buffer.from('# Separate file').toString('base64'),
        sha: 'abc', html_url: `https://github.com/owner/repo/blob/main/${path}`,
        download_url: `https://raw.githubusercontent.com/owner/repo/main/${path}`,
      })};
    },
  });
  assert.equal(result.contributing.path, 'Contributing.md');
  assert.equal(result.license.path, 'LICENSE.txt');
  assert.match(result.contributing.html, /id="contributing-owner-repo-separate-file"/);
  assert.equal(paths.length, 3);
});

test('missing separate files stay missing; README headings are not extracted', async () => {
  const result = await syncSupportingDocuments('owner/repo', {}, {
    fetchImpl: async () => ({ok: true, json: async () => ({
      tree: [{path: 'README.md', type: 'blob'}],
    })}),
  });
  assert.equal(result.contributing.status, 'missing');
  assert.equal(result.license.status, 'missing');
  const {html} = await render('# Notes\n## Contributing\nOriginal section\n## License\nMIT');
  assert.match(html, />Contributing<\/h2>/);
  assert.match(html, /Original section/);
});

test('supporting files keep their own caches on incomplete file trees or fetch failures', async () => {
  const previous = {license: {status: 'ready', html: 'MIT', syncedAt: '2026-10-01'}};
  const result = await syncSupportingDocuments('owner/repo', previous, {
    fetchImpl: async () => ({ok: true, json: async () => ({tree: [], truncated: true})}),
  });
  assert.equal(result.license.html, 'MIT');
  assert.equal(result.license.syncedAt, '2026-10-01');
  assert.equal(result.license.stale, true);
  assert.equal(result.contributing.status, 'unavailable');
});
