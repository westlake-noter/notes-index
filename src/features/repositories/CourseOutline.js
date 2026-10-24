import React from 'react';
import styles from './outline.module.css';

function PageLink({entry, source}) {
  const url = new URL(source.url);
  url.hash = `page=${entry.page + source.pageOffset}`;
  return (
    <a className={styles.page} href={url.href} aria-label={`Open PDF at printed page ${entry.page}`}>
      {entry.page}
    </a>
  );
}

export default function CourseOutline({outline}) {
  const {title, titleId, source, chapters} = outline;
  return (
    <div className={styles.outline}>
      <h1 id={titleId}>{title}</h1>
      <p className={styles.meta}>{chapters.length} chapters · <a href={source.url}>{source.label}</a></p>
      <p className={styles.meta}>Printed page 1 is PDF page {source.pageOffset + 1}.</p>
      {chapters.map((chapter) => (
        <section className={styles.chapter} key={chapter.number}>
          <h2 id={chapter.id}>
            <span>{chapter.number}. {chapter.title}</span>
            <PageLink entry={chapter} source={source} />
          </h2>
          {chapter.entries.length > 0 && (
            <ol className={styles.entries}>
              {chapter.entries.map((entry) => (
                <li key={entry.number} style={{'--outline-depth': Math.min(entry.depth - 1, 3)}}>
                  <span className={styles.number}>{entry.number}</span>
                  <span>{entry.title}</span>
                  <PageLink entry={entry} source={source} />
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
    </div>
  );
}
