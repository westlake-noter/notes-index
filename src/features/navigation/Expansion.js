import React, {createContext, useContext} from 'react';
import AnimatedIcon from '@site/src/components/AnimatedIcon';
import useNavbarExpansion from './useNavbarExpansion';

const ExpansionContext = createContext({compact: false, expand: () => {}});

export function NavbarExpansionProvider({children}) {
  const expansion = useNavbarExpansion();
  return <ExpansionContext.Provider value={expansion}>{children}</ExpansionContext.Provider>;
}

export function ExpandNavigation({mobile}) {
  const {compact, expand} = useContext(ExpansionContext);
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
