import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveDocumentView} from '../src/features/repositories/documents.mjs';

const repositories = ['owner/first', 'owner/second'];

test('defaults to Overview and validates requested views and repositories', () => {
  assert.deepEqual(resolveDocumentView(repositories, '', ''), {
    view: 'overview', repository: 'owner/first',
  });
  assert.deepEqual(resolveDocumentView(repositories, '?view=invalid&repo=unknown/repo', ''), {
    view: 'overview', repository: 'owner/first',
  });
});

test('refreshable URLs select README, Contributing, and License for the requested repository', () => {
  for (const view of ['readme', 'contributing', 'license']) {
    assert.deepEqual(resolveDocumentView(repositories, `?view=${view}&repo=owner%2Fsecond`, ''), {
      view, repository: 'owner/second',
    });
  }
});

test('scoped document anchors select the matching tab and repository', () => {
  assert.deepEqual(resolveDocumentView(repositories, '', '#license-owner-second-mit'), {
    view: 'license', repository: 'owner/second',
  });
  assert.deepEqual(resolveDocumentView(repositories, '?view=license', '#readme-owner-first-notes'), {
    view: 'readme', repository: 'owner/first',
  });
  assert.equal(resolveDocumentView(repositories, '', '#overview').view, 'overview');
});
