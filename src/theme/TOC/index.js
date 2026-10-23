import React, {useEffect, useRef} from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';

const LINK_CLASS = 'table-of-contents__link toc-highlight';
const ACTIVE_CLASS = 'table-of-contents__link--active';

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
      if (top === -1) return;

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
            linkActiveClassName={ACTIVE_CLASS}
          />
        </div>
      </div>
    </nav>
  );
}
