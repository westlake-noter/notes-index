import React from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import useTableOfContents from './useTableOfContents';
import './styles.css';

export default function TableOfContents({className, toc, ...props}) {
  const {containerRef, blockRef, scrollRef} = useTableOfContents(toc);
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
            linkClassName="table-of-contents__link toc-highlight"
          />
        </div>
      </div>
    </nav>
  );
}
