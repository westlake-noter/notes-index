import React from 'react';
import NavbarNavLink from '@theme-original/NavbarItem/NavbarNavLink';
import AnimatedIcon from '@site/src/components/AnimatedIcon';

const icons = { 'Course Notes': 'book', Tools: 'tools', GitHub: 'github' };

export default function AnimatedNavbarNavLink({ label, ...props }) {
  const icon = typeof label === 'string' ? icons[label] : undefined;
  return (
    <NavbarNavLink
      {...props}
      label={icon ? (
        <span className="animated-nav-label">
          <AnimatedIcon name={icon} size={18} />
          <span>{label}</span>
        </span>
      ) : label}
    />
  );
}
