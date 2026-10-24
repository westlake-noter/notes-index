import React from 'react';
import clsx from 'clsx';
import NavbarNavLink from '@theme-original/NavbarItem/NavbarNavLink';
import AnimatedIcon from '@site/src/components/AnimatedIcon';
import styles from './styles.module.css';

const icons = { 'Course Notes': 'book', Tools: 'tools', GitHub: 'github' };

export default function NavigationLink({label, className, ...props}) {
  const icon = typeof label === 'string' ? icons[label] : undefined;
  const isGitHub = label === 'GitHub';
  return (
    <NavbarNavLink
      {...props}
      className={clsx(className, isGitHub && styles.github)}
      {...(isGitHub && {'aria-label': 'GitHub', title: 'GitHub'})}
      label={icon ? (
        <span className="animated-nav-label">
          <AnimatedIcon name={icon} size={18} />
          <span className={styles.label}>{label}</span>
        </span>
      ) : label}
    />
  );
}
