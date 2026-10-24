import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import AnimatedIcon from '@site/src/components/AnimatedIcon';
import snapshot from '@site/src/data/repository-contributors.json';
import styles from './styles.module.css';

const formatter = new Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 1});

function Avatar({user}) {
  const [failed, setFailed] = useState(false);
  return (
    <a
      className={styles.avatar}
      href={`https://github.com/${encodeURIComponent(user.login)}`}
      title={user.login}
      aria-label={`${user.login} on GitHub`}
    >
      {failed ? <span aria-hidden="true">{user.login.slice(0, 1).toUpperCase()}</span> : (
        <img
          src={`https://avatars.githubusercontent.com/u/${user.id}?s=80`}
          alt=""
          width="36"
          height="36"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </a>
  );
}

function Avatars({users, limit}) {
  return (
    <div className={styles.avatars}>
      {users.slice(0, limit).map((user) => <Avatar key={user.id} user={user} />)}
    </div>
  );
}

export default function RepositoryContributors({repositories = [], all = false}) {
  if (all) {
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
        <Avatars
          users={[...users.values()].sort((a, b) => a.login.localeCompare(b.login))}
          limit={48}
        />
      </section>
    );
  }

  const names = repositories;
  if (!names.length) return null;
  return (
    <section className={styles.repositories} aria-label="Repositories and contributors">
      <h2>{names.length === 1 ? 'Repository' : 'Repositories'}</h2>
      {names.map((name) => {
        const users = snapshot.repositories[name]?.contributors;
        const info = snapshot.repositories[name]?.info;
        const url = `https://github.com/${name}`;
        return (
          <div className={styles.repository} key={name}>
            <a className={styles.repositoryLink} href={url}>
              <span className={styles.repositoryName}>
                <AnimatedIcon name="github" size={16} />
                <span>{name}</span>
              </span>
              {info && (
                <span className={styles.statistics}>
                  <span title="Stars" aria-label={`${info.stars} stars`}>
                    <AnimatedIcon name="star" size={12} /> {formatter.format(info.stars)}
                  </span>
                  <span title="Forks" aria-label={`${info.forks} forks`}>
                    <AnimatedIcon name="fork" size={12} /> {formatter.format(info.forks)}
                  </span>
                </span>
              )}
            </a>
            <div className={styles.contributorsHeading}>
              <span>Contributors</span>
              <a
                className={styles.viewAll}
                href={`${url}/graphs/contributors`}
                aria-label={`View all contributors to ${name} on GitHub`}
              >{users ? users.length : 'View on GitHub'}</a>
            </div>
            {users?.length > 0 && <Avatars users={users} limit={16} />}
          </div>
        );
      })}
    </section>
  );
}
