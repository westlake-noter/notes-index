import React from 'react';
import Link from '@docusaurus/Link';
import snapshot from '@site/src/data/repository-contributors.json';
import ContributorAvatars from './ContributorAvatars';
import styles from './styles.module.css';

export default function CommunityContributors() {
  const users = new Map();
  Object.values(snapshot.repositories).forEach((repository) => {
    repository.contributors?.forEach((user) => users.set(user.id, user));
  });
  if (!users.size) return null;
  return (
    <section className={styles.community} aria-labelledby="community-contributors">
      <div className={styles.communityHeading}>
        <div>
          <h2 id="community-contributors">Contributors</h2>
          <p>The people behind our shared notes.</p>
        </div>
        <Link to="/notes/">Explore their notes</Link>
      </div>
      <ContributorAvatars
        users={[...users.values()].sort((a, b) => a.login.localeCompare(b.login))}
        limit={48}
      />
    </section>
  );
}
