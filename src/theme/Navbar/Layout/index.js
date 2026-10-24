import React, {useEffect, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import OriginalNavbarLayout from '@theme-original/Navbar/Layout';
import NavbarExpansionContext from './context';
import {updateNavbarState} from './scroll-state.mjs';

export default function NavbarLayout(props) {
  const controller = useRef(null);
  const [compact, setCompactState] = useState(false);
  const {pathname} = useLocation();

  useEffect(() => {
    const navbar = document.querySelector('.theme-layout-navbar');
    const left = navbar?.querySelector('.theme-layout-navbar-left');
    const right = navbar?.querySelector('.theme-layout-navbar-right');
    if (!navbar || !left || !right) return undefined;

    const desktop = window.matchMedia('(min-width: 997px)');
    const setCompact = (compact) => {
      navbar.classList.toggle('navbar--compact', compact);
      setCompactState(compact);
      if (compact && left.contains(document.activeElement)) {
        // Do not leave keyboard focus inside the newly inert navigation.
        const button = right.querySelector('.navbar__expand');
        if (button) {
          button.disabled = false;
          button.focus({preventScroll: true});
        }
      }
      left.inert = compact;
    };
    let state;
    const sync = (options = {}) => {
      state = updateNavbarState(state, {
        scrollY: window.scrollY,
        desktop: desktop.matches,
        ...options,
      });
      setCompact(state.compact);
      if (options.expand) {
        left.querySelector('.navbar__link')?.focus({preventScroll: true});
      }
    };
    controller.current = sync;
    const onScroll = () => sync();
    window.addEventListener('scroll', onScroll, {passive: true});

    const measure = () => {
      const padding = getComputedStyle(navbar);
      const width = right.getBoundingClientRect().width
        + parseFloat(padding.paddingLeft) + parseFloat(padding.paddingRight);
      navbar.style.setProperty('--navbar-compact-width', `${Math.ceil(width)}px`);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(right);
    const syncViewport = () => {
      sync({reset: true});
      measure();
    };
    desktop.addEventListener('change', syncViewport);
    syncViewport();
    navbar.classList.add('navbar--scroll-ready');

    return () => {
      controller.current = null;
      resize.disconnect();
      desktop.removeEventListener('change', syncViewport);
      window.removeEventListener('scroll', onScroll);
      setCompact(false);
      navbar.classList.remove('navbar--scroll-ready');
      navbar.style.removeProperty('--navbar-compact-width');
    };
  }, []);

  useEffect(() => {
    controller.current?.({reset: true});
  }, [pathname]);

  return (
    <NavbarExpansionContext.Provider value={{
      compact,
      expand: () => controller.current?.({expand: true}),
    }}>
      <OriginalNavbarLayout {...props} />
    </NavbarExpansionContext.Provider>
  );
}
