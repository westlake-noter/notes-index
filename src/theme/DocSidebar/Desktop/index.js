import React from 'react';
import OriginalDocSidebarDesktop from '@theme-original/DocSidebar/Desktop';
import Logo from '@theme/Logo';

export default function DocSidebarDesktop(props) {
  return (
    <div className="glass-sidebar">
      <Logo
        className="glass-sidebar-brand"
        imageClassName="navbar__logo"
        titleClassName="navbar__title"
      />
      <OriginalDocSidebarDesktop {...props} />
    </div>
  );
}
