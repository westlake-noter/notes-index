import React, {useEffect, useRef} from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import {activeHeadingIds} from './active-headings.mjs';

const LINK_CLASS = 'table-of-contents__link toc-highlight';
const ACTIVE_CLASS = 'table-of-contents__link--active';

// Fumadocs observes all visible headings rather than selecting a single one.
function useVisibleHeadings(containerRef, toc) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const desktop = window.matchMedia('(min-width: 997px)');
    let observer;
    const links = [...container.querySelectorAll('a.table-of-contents__link')];
    const headings = links.flatMap((link) => {
      const id = decodeURIComponent(link.hash.slice(1));
      const element = document.getElementById(id);
      return element ? [{id, element, link}] : [];
    });
    const visible = new Set();
    const offset = (parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--ifm-navbar-height')) || 64) + 16;

    const update = () => {
      const active = new Set(activeHeadingIds(
        headings.map(({id, element}) => ({id, top: element.getBoundingClientRect().top})),
        visible,
        offset,
      ));
      for (const {id, link} of headings) {
        link.classList.toggle(ACTIVE_CLASS, active.has(id));
        link.dataset.active = String(active.has(id));
      }
    };
    const syncViewport = () => {
      observer?.disconnect();
      visible.clear();
      if (!desktop.matches) return;
      // Seed the highlight before the observer's asynchronous first callback.
      for (const {id, element} of headings) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom > offset && rect.top < window.innerHeight) visible.add(id);
      }
      update();
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        update();
      }, {threshold: 0, rootMargin: `-${offset}px 0px 0px 0px`});
      headings.forEach(({element}) => observer.observe(element));
    };
    syncViewport();
    desktop.addEventListener('change', syncViewport);
    return () => {
      observer?.disconnect();
      desktop.removeEventListener('change', syncViewport);
      for (const {link} of headings) {
        link.classList.remove(ACTIVE_CLASS);
        delete link.dataset.active;
      }
    };
  }, [containerRef, toc]);
}

// Adapted from Fumadocs toc/block.tsx (MIT). See THIRD_PARTY_NOTICES.md.
function useFollowingBlock(containerRef, blockRef, scrollRef, toc) {
  useEffect(() => {
    const container = containerRef.current;
    const block = blockRef.current;
    const scroll = scrollRef.current;
    if (!container || !block || !scroll) return undefined;

    const positions = new Map();
    let height = 0;
    let frame;
    block.removeAttribute('data-ready');
    block.style.clipPath = 'inset(0 0 100%)';

    const update = () => {
      const active = container.querySelectorAll(`a.${ACTIVE_CLASS}`);
      let top = -1;
      let bottom = -1;
      for (const anchor of active) {
        const pos = positions.get(anchor);
        if (!pos) continue;
        if (top === -1) top = pos[0];
        bottom = pos[1];
      }
      if (top === -1) {
        block.style.clipPath = 'inset(0 0 100%)';
        return;
      }

      block.style.clipPath = `inset(${top}px 0 ${height - bottom}px round 8px)`;
      if (!block.hasAttribute('data-ready')) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => block.setAttribute('data-ready', ''));
      }
      // Keep the current item inside the unfaded part of a long directory.
      const start = scroll.scrollTop;
      const end = start + scroll.clientHeight - 24;
      if (top < start || bottom > end) {
        scroll.scrollTo({
          top: top < start ? top : bottom - scroll.clientHeight + 24,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'instant'
            : 'smooth',
        });
      }
    };

    // As upstream, cache geometry on resize rather than reading it on scroll.
    const measure = () => {
      positions.clear();
      const origin = container.getBoundingClientRect().top;
      for (const anchor of container.getElementsByTagName('a')) {
        const rect = anchor.getBoundingClientRect();
        positions.set(anchor, [rect.top - origin, rect.bottom - origin]);
      }
      height = container.clientHeight;
      update();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(container);
    const activeChanges = new MutationObserver(update);
    activeChanges.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    measure();
    return () => {
      resize.disconnect();
      activeChanges.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [containerRef, blockRef, scrollRef, toc]);
}

export default function TOC({className, toc, ...props}) {
  const containerRef = useRef(null);
  const blockRef = useRef(null);
  const scrollRef = useRef(null);
  useVisibleHeadings(containerRef, toc);
  useFollowingBlock(containerRef, blockRef, scrollRef, toc);

  return (
    <nav className={clsx('glass-toc', className)} aria-label="On this page">
      <div className="glass-toc-title">On this page</div>
      <div className="glass-toc-scroll" ref={scrollRef}>
        <div className="glass-toc-tree" ref={containerRef}>
          <div className="glass-toc-block" ref={blockRef} aria-hidden="true" />
          <TOCItems
            {...props}
            toc={toc}
            className="table-of-contents glass-toc-list"
            linkClassName={LINK_CLASS}
          />
        </div>
      </div>
    </nav>
  );
}
