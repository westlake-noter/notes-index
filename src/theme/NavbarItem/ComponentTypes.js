import React, {useContext} from 'react';
import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import AnimatedIcon from '@site/src/components/AnimatedIcon';
import NavbarExpansionContext from '@site/src/theme/Navbar/Layout/context';

function ExpandNavigation({mobile}) {
  const {compact, expand} = useContext(NavbarExpansionContext);
  if (mobile) return null;
  return (
    <button
      type="button"
      className="navbar__expand clean-btn"
      aria-label="Expand navigation"
      aria-expanded={!compact}
      title="Expand navigation"
      onClick={expand}
      disabled={!compact}>
      <AnimatedIcon name="expand" />
    </button>
  );
}

export default {...ComponentTypes, 'custom-expandNavigation': ExpandNavigation};
