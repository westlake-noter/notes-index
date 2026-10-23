import React, {useEffect, useRef} from 'react';
import {useLocation} from '@docusaurus/router';
import Headroom from 'headroom.js';
import OriginalNavbarLayout from '@theme-original/Navbar/Layout';

export default function NavbarLayout(props) {
  const controller = useRef(null);
  const {pathname} = useLocation();

  useEffect(() => {
    const navbar = document.querySelector('.theme-layout-navbar');
    const left = navbar?.querySelector('.theme-layout-navbar-left');
    const right = navbar?.querySelector('.theme-layout-navbar-right');
    if (!navbar || !left || !right) return undefined;

    const desktop = window.matchMedia('(min-width: 997px)');
    const setCompact = (compact) => {
      navbar.classList.toggle('navbar--compact', compact);
      left.inert = compact;
    };
    const headroom = new Headroom(navbar, {
      offset: {down: 160, up: 80},
      tolerance: {down: 12, up: 6},
      onPin() {
        setCompact(false);
      },
      onUnpin() {
        setCompact(desktop.matches && !navbar.contains(document.activeElement));
      },
    });
    controller.current = headroom;
    headroom.init();

    const measure = () => {
      const padding = getComputedStyle(navbar);
      const width = right.getBoundingClientRect().width
        + parseFloat(padding.paddingLeft) + parseFloat(padding.paddingRight);
      navbar.style.setProperty('--navbar-compact-width', `${Math.ceil(width)}px`);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(right);
    const syncViewport = () => {
      headroom.pin();
      if (desktop.matches && !navbar.contains(document.activeElement)) {
        headroom.unfreeze();
      } else {
        headroom.freeze();
      }
      measure();
    };
    const onFocusIn = () => {
      headroom.pin();
      headroom.freeze();
    };
    const onFocusOut = (event) => {
      if (!navbar.contains(event.relatedTarget) && desktop.matches) headroom.unfreeze();
    };
    desktop.addEventListener('change', syncViewport);
    navbar.addEventListener('focusin', onFocusIn);
    navbar.addEventListener('focusout', onFocusOut);
    syncViewport();
    navbar.classList.add('navbar--scroll-ready');

    return () => {
      controller.current = null;
      resize.disconnect();
      desktop.removeEventListener('change', syncViewport);
      navbar.removeEventListener('focusin', onFocusIn);
      navbar.removeEventListener('focusout', onFocusOut);
      headroom.freeze();
      // Headroom initializes its scroll tracker after a 100ms delay.
      if (headroom.scrollTracker) headroom.destroy();
      else window.setTimeout(() => headroom.destroy(), 110);
      setCompact(false);
      navbar.classList.remove('navbar--scroll-ready');
      navbar.style.removeProperty('--navbar-compact-width');
    };
  }, []);

  useEffect(() => {
    controller.current?.pin();
  }, [pathname]);

  return <OriginalNavbarLayout {...props} />;
}
