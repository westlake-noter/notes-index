import test from 'node:test';
import assert from 'node:assert/strict';
import {fetchContributors, fetchRepositoryInfo} from '../lib/github/contributors.mjs';

const user = (id, contributions = 1) => ({
  id, login: `user-${id}`, type: 'User', contributions,
});
const response = (users) => new Response(JSON.stringify(users));

test('paginates, deduplicates users, excludes bots and sorts contributions', async () => {
  const calls = [];
  const first = Array.from({length: 100}, (_, i) => user(i + 1));
  const result = await fetchContributors('owner/repo', {
    token: 'test-token',
    fetchImpl: async (url, options) => {
      calls.push({url, options});
      return response(calls.length === 1 ? first : [
        user(1, 20), user(101, 10), {...user(102), type: 'Bot'},
        {...user(103), login: 'service[bot]'}, {login: 'anonymous'}, {...user(104), id: -1},
      ]);
    },
  });
  assert.equal(calls.length, 2);
  assert.match(calls[1].url, /page=2$/);
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token');
  assert.equal(result.length, 101);
  assert.deepEqual(result.slice(0, 2).map((entry) => entry.id), [1, 101]);
});

test('handles empty repositories and omits authorization without a token', async () => {
  const result = await fetchContributors('owner/empty', {
    fetchImpl: async (_url, options) => {
      assert.equal(options.headers.Authorization, undefined);
      return new Response(null, {status: 204});
    },
  });
  assert.deepEqual(result, []);
});

test('does not return partial data when a later page fails', async () => {
  let page = 0;
  await assert.rejects(fetchContributors('owner/repo', {
    fetchImpl: async () => ++page === 1
      ? response(Array.from({length: 100}, (_, i) => user(i + 1)))
      : new Response(null, {status: 429}),
  }), /HTTP 429/);
});

test('rejects malformed API payloads', async () => {
  await assert.rejects(fetchContributors('owner/repo', {
    fetchImpl: async () => response({message: 'not a user list'}),
  }), /Invalid GitHub/);
});

test('fetches repository stars and forks, including real zero values', async () => {
  const info = await fetchRepositoryInfo('owner/repo', {
    token: 'test-token',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.github.com/repos/owner/repo');
      assert.equal(options.headers.Authorization, 'Bearer test-token');
      return response({stargazers_count: 0, forks_count: 3});
    },
  });
  assert.deepEqual(info, {stars: 0, forks: 3});
});

test('does not fabricate repository statistics on missing or malformed data', async () => {
  await assert.rejects(fetchRepositoryInfo('owner/repo', {
    fetchImpl: async () => new Response(null, {status: 404}),
  }), /HTTP 404/);
  await assert.rejects(fetchRepositoryInfo('owner/repo', {
    fetchImpl: async () => response({}),
  }), /Invalid GitHub repository/);
});
