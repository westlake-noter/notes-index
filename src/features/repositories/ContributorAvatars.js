import React, {useState} from 'react';
import styles from './styles.module.css';

function Avatar({user}) {
  const [failed, setFailed] = useState(false);
  return (
    <a
      className={styles.avatar}
      href={`https://github.com/${encodeURIComponent(user.login)}`}
      title={user.login}
      aria-label={`${user.login} on GitHub`}>
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

export default function ContributorAvatars({users, limit}) {
  return (
    <div className={styles.avatars}>
      {users.slice(0, limit).map((user) => <Avatar key={user.id} user={user} />)}
    </div>
  );
}
