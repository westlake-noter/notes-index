import {fetchContributors, fetchRepositoryInfo} from './contributors.mjs';
import {syncReadme, syncSupportingDocuments} from './documents.mjs';

export const snapshotMaxAgeMs = 6 * 60 * 60 * 1000;

export function isSnapshotFresh(contributors, documents, now = Date.now(), maxAgeMs = snapshotMaxAgeMs) {
  const fresh = (value, field) => {
    const age = now - Date.parse(value?.[field]);
    return !value?.stale && Number.isFinite(age) && age >= 0 && age < maxAgeMs;
  };
  const documentFresh = (value) => ['ready', 'missing'].includes(value?.status) && fresh(value, 'syncedAt');
  return Array.isArray(contributors?.contributors) && Boolean(contributors.info)
    && fresh(contributors, 'updatedAt') && documentFresh(documents)
    && ['contributing', 'license'].every((type) => documentFresh(documents.documents?.[type]));
}

export function mergeSnapshots(committed = {}, cached = {}, field) {
  const result = {...committed};
  for (const [name, value] of Object.entries(cached)) {
    const timestamp = (item) => Number.isFinite(Date.parse(item?.[field])) ? Date.parse(item[field]) : -Infinity;
    if (!result[name] || timestamp(value) > timestamp(result[name])) result[name] = value;
  }
  return result;
}

export async function syncRepositories(names, {
  previousContributors = {}, previousDocuments = {}, force = false,
  now = Date.now(), maxAgeMs = snapshotMaxAgeMs, concurrency = 2,
  token, fetchImpl = fetch, log = console.log, warn = console.warn,
} = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('Invalid sync concurrency');
  const queue = [...new Set(names)].sort();
  const results = new Map();
  let cursor = 0;
  const worker = async () => {
    while (cursor < queue.length) {
      const name = queue[cursor++];
      const oldContributors = previousContributors[name];
      const oldDocuments = previousDocuments[name];
      if (!force && isSnapshotFresh(oldContributors, oldDocuments, now, maxAgeMs)) {
        results.set(name, {contributors: oldContributors, documents: oldDocuments});
        log(`${name}: reusing fresh snapshot`);
        continue;
      }
      const options = {token, fetchImpl};
      let contributors = {...oldContributors};
      let failed = false;
      const onError = (error) => warn(`${name}: ${error.message}; keeping saved data or fallback.`);
      // Bound concurrency across repositories; independent endpoint families run together.
      const [, , readme, supporting] = await Promise.all([
        fetchContributors(name, options).then((users) => {
          contributors.contributors = users;
          contributors.updatedAt = new Date(now).toISOString();
        }).catch((error) => {
          failed = true;
          contributors.contributors ??= null;
          contributors.updatedAt ??= null;
          onError(error);
        }),
        fetchRepositoryInfo(name, options).then((info) => {
          contributors.info = info;
        }).catch((error) => { failed = true; onError(error); }),
        syncReadme(name, oldDocuments, {...options, onError}),
        syncSupportingDocuments(name, oldDocuments?.documents, {...options, onError}),
      ]);
      if (failed) contributors.stale = true;
      else delete contributors.stale;
      results.set(name, {contributors, documents: {...readme, documents: supporting}});
      log(`${name}: refreshed repository snapshot`);
    }
  };
  await Promise.all(Array.from({length: Math.min(concurrency, queue.length)}, worker));
  // Preserve deterministic JSON order regardless of which request completes first.
  return {
    contributors: {repositories: Object.fromEntries(queue.map((name) => [name, results.get(name).contributors]))},
    documents: {repositories: Object.fromEntries(queue.map((name) => [name, results.get(name).documents]))},
  };
}
