import React from 'react';
import AnimatedIcon from '@site/src/components/AnimatedIcon';
import snapshot from '@site/src/data/repository-contributors.json';
import ContributorAvatars from './ContributorAvatars';
import styles from './styles.module.css';

const formatter = new Intl.NumberFormat('en', {notation: 'compact', maximumFractionDigits: 1});

export default function RepositoryContributors({repositories = []}) {
  if (!repositories.length) return null;
  return (
    <section className={styles.repositories} aria-label="Repositories and contributors">
      <h2>{repositories.length === 1 ? 'Repository' : 'Repositories'}</h2>
      {repositories.map((name) => {
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
            {users?.length > 0 && <ContributorAvatars users={users} limit={16} />}
          </div>
        );
      })}
    </section>
  );
}
