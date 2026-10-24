import React from 'react';
import AnimatedIcon from '@site/src/components/AnimatedIcon';
import styles from './documents.module.css';
import {documentViews} from './documents.mjs';

export default function RepositoryDocumentContent({repositories, repository, documentData, view, onSelect}) {
  const label = documentData?.label ?? documentViews.find(({value}) => value === view)?.label ?? 'README';
  const ready = documentData?.status === 'ready';
  const sourceUrl = ready ? documentData.sourceUrl : `https://github.com/${repository}`;
  return (
    <section className={styles.readme} aria-label={documentData?.local ? label : `Original repository ${label}`}>
      {repositories.length > 1 && !documentData?.local && (
        <label className={styles.repositorySelect}>
          Repository
          <select value={repository} onChange={(event) => onSelect(event.target.value)}>
            {repositories.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
      )}
      <div className={styles.source}>
        <div>
          <span className={styles.sourceName}>{documentData?.layout === 'outline' ? 'Course outline' : documentData?.path ?? label}</span>
          {documentData?.syncedAt && (
            <span>Last synced <time dateTime={documentData.syncedAt}>
              {new Date(documentData.syncedAt).toISOString().slice(0, 10)}
            </time>{documentData.stale ? ' · Cached copy' : ''}</span>
          )}
        </div>
        <a href={sourceUrl}><AnimatedIcon name="github" size={16} /> View on GitHub</a>
      </div>
      {ready ? (
        <div
          className={`theme-doc-markdown markdown ${styles.body} ${documentData?.layout === 'outline' ? styles.outline : ''}`}
          dangerouslySetInnerHTML={{__html: documentData.html}}
        />
      ) : (
        <p className={styles.empty}>
          {documentData?.status === 'missing'
            ? `This repository does not provide a separate ${label} file.`
            : `The ${label} document is not available in the saved snapshot yet.`}
          {' '}<a href={sourceUrl}>Open the repository on GitHub</a>.
        </p>
      )}
    </section>
  );
}
