// Adapted from Fumadocs's get-contributors.ts (MIT); see THIRD_PARTY_NOTICES.md.
export async function fetchContributors(repository, {token, fetchImpl = fetch} = {}) {
  const contributors = new Map();
  for (let page = 1; page <= 100; page += 1) {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetchImpl(
      `https://api.github.com/repos/${repository}/contributors?per_page=100&page=${page}`,
      {headers, signal: AbortSignal.timeout(15000)},
    );
    if (response.status === 204) return [...contributors.values()];
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
    const users = await response.json();
    if (!Array.isArray(users)) throw new Error('Invalid GitHub contributors response');
    for (const user of users) {
      if (user.type !== 'User' || !Number.isSafeInteger(user.id) || user.id <= 0
        || typeof user.login !== 'string' || !/^[a-z\d-]+$/i.test(user.login)) continue;
      contributors.set(user.id, {
        id: user.id,
        login: user.login,
        contributions: Number.isSafeInteger(user.contributions) ? user.contributions : 0,
      });
    }
    if (users.length < 100) {
      return [...contributors.values()].sort((a, b) => b.contributions - a.contributions);
    }
  }
  throw new Error('GitHub contributors pagination exceeded the safety limit');
}

// Fumadocs GithubInfo's repository statistics, fetched before the static build.
export async function fetchRepositoryInfo(repository, {token, fetchImpl = fetch} = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetchImpl(`https://api.github.com/repos/${repository}`, {
    headers, signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
  const data = await response.json();
  if (![data.stargazers_count, data.forks_count].every((n) => Number.isSafeInteger(n) && n >= 0)) {
    throw new Error('Invalid GitHub repository statistics');
  }
  return {stars: data.stargazers_count, forks: data.forks_count};
}
