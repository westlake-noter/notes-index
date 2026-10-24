import test from 'node:test';
import assert from 'node:assert/strict';
import {isSnapshotFresh, mergeSnapshots, snapshotMaxAgeMs, syncRepositories} from '../lib/github/sync.mjs';

const now = Date.now();
const timestamp = new Date(now).toISOString();
const contributor = {contributors: [], info: {stars: 0, forks: 0}, updatedAt: timestamp};
const document = {status: 'ready', html: '<h1>Notes</h1>', toc: [], syncedAt: timestamp};
const documents = {...document, documents: {
  contributing: {status: 'missing', syncedAt: timestamp},
  license: {status: 'missing', syncedAt: timestamp},
}};
const quiet = {log() {}, warn() {}};
const response = (data, status = 200) => ({ok: status < 400, status, async json() { return data; }});
const fetchImpl = async (url) => {
  if (url.includes('/contributors?')) return response([]);
  if (url.endsWith('/readme')) return response({
    encoding: 'base64', content: Buffer.from('# Notes').toString('base64'),
    path: 'README.md', sha: 'abc', html_url: 'https://github.com/owner/repo/blob/main/README.md',
    download_url: 'https://raw.githubusercontent.com/owner/repo/main/README.md',
  });
  if (url.includes('/git/trees/')) return response({tree: [], truncated: false});
  return response({stargazers_count: 0, forks_count: 0});
};

test('fresh snapshots require every document and endpoint family, not just a recent README', () => {
  assert.equal(isSnapshotFresh(contributor, documents, now), true);
  assert.equal(isSnapshotFresh(contributor, documents, now + snapshotMaxAgeMs), false);
  assert.equal(isSnapshotFresh(contributor, documents, now - 1), false);
  assert.equal(isSnapshotFresh({...contributor, stale: true}, documents, now), false);
  assert.equal(isSnapshotFresh({...contributor, info: undefined}, documents, now), false);
  assert.equal(isSnapshotFresh(contributor, {...documents, stale: true}, now), false);
  assert.equal(isSnapshotFresh(contributor, {...documents, documents: {}}, now), false);
  assert.equal(isSnapshotFresh(contributor, {...documents, status: 'unavailable'}, now), false);
});

test('fresh snapshots make no network calls; removed repositories are pruned', async () => {
  const result = await syncRepositories(['owner/repo'], {
    ...quiet, now,
    previousContributors: {'owner/repo': contributor, 'old/repo': contributor},
    previousDocuments: {'owner/repo': documents, 'old/repo': documents},
    fetchImpl: () => { throw new Error('must not fetch'); },
  });
  assert.deepEqual(Object.keys(result.contributors.repositories), ['owner/repo']);
  assert.equal(result.documents.repositories['owner/repo'], documents);
  assert.equal(result.contributors.repositories['owner/repo'], contributor);
});

test('force and expired snapshots refresh upstream; new repositories never need a manual force', async () => {
  for (const settings of [{force: true, now}, {now: now + snapshotMaxAgeMs}, {now}]) {
    let calls = 0;
    const result = await syncRepositories(['owner/repo'], {
      ...quiet, previousContributors: settings.force || settings.now !== now ? {'owner/repo': contributor} : {},
      previousDocuments: {'owner/repo': documents},
      ...settings, fetchImpl: async (url) => { calls++; return fetchImpl(url); },
    });
    assert.equal(calls, 4);
    assert.equal(result.documents.repositories['owner/repo'].status, 'ready');
    assert.equal(result.contributors.repositories['owner/repo'].info.stars, 0);
  }
});

test('repository concurrency is bounded and output stays sorted despite completion order', async () => {
  let active = 0;
  let peak = 0;
  const result = await syncRepositories(['z/repo', 'b/repo', 'a/repo', 'a/repo'], {
    ...quiet, concurrency: 2,
    fetchImpl: async (url) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setImmediate(resolve));
      active--;
      return fetchImpl(url);
    },
  });
  assert.ok(peak > 1 && peak <= 8, `peak request count: ${peak}`);
  assert.deepEqual(Object.keys(result.documents.repositories), ['a/repo', 'b/repo', 'z/repo']);
  assert.deepEqual(Object.keys(result.contributors.repositories), ['a/repo', 'b/repo', 'z/repo']);
  await assert.rejects(syncRepositories([], {concurrency: 0}), /Invalid sync concurrency/);
});

test('API failures keep old data and mark it stale so the next run retries', async () => {
  const result = await syncRepositories(['owner/repo'], {
    ...quiet, now, force: true,
    previousContributors: {'owner/repo': contributor},
    previousDocuments: {'owner/repo': documents},
    fetchImpl: async () => response({}, 503),
  });
  const savedContributors = result.contributors.repositories['owner/repo'];
  const savedDocuments = result.documents.repositories['owner/repo'];
  assert.equal(savedContributors.updatedAt, timestamp);
  assert.deepEqual(savedContributors.contributors, []);
  assert.equal(savedContributors.stale, true);
  assert.equal(savedDocuments.syncedAt, timestamp);
  assert.equal(savedDocuments.stale, true);
  assert.equal(isSnapshotFresh(savedContributors, savedDocuments, now), false);
  assert.equal(contributor.stale, undefined);
});

test('cache merging never overwrites newer committed data and repairs missing timestamps', () => {
  const older = {...contributor, updatedAt: '2020-01-01T00:00:00.000Z'};
  assert.equal(mergeSnapshots({repo: contributor}, {repo: older}, 'updatedAt').repo, contributor);
  assert.equal(mergeSnapshots({repo: older}, {repo: contributor}, 'updatedAt').repo, contributor);
  assert.equal(mergeSnapshots({repo: {updatedAt: null}}, {repo: contributor}, 'updatedAt').repo, contributor);
});
