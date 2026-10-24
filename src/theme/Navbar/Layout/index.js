import React from 'react';
import OriginalNavbarLayout from '@theme-original/Navbar/Layout';
import {NavbarExpansionProvider} from '@site/src/features/navigation/Expansion';

export default function NavbarLayout(props) {
  return (
    <NavbarExpansionProvider>
      <OriginalNavbarLayout {...props} />
    </NavbarExpansionProvider>
  );
}
