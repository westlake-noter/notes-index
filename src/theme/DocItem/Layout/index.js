/*
 * Adapted from @docusaurus/theme-classic DocItem/Layout (MIT).
 * Copyright (c) Facebook, Inc. and its affiliates.
 * The original dependency includes its MIT license.
 */
import React from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import OriginalLayout from '@theme-original/DocItem/Layout';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import ContentVisibility from '@theme/ContentVisibility';
import RepositoryContributors from '@site/src/features/repositories';
import DocumentTabs from '@site/src/features/repositories/DocumentTabs';
import RepositoryDocumentContent from '@site/src/features/repositories/RepositoryDocumentContent';
import useRepositoryDocument from '@site/src/features/repositories/useRepositoryDocument';
import TOC from '@theme/TOC';
import TOCCollapsible from '@theme/TOCCollapsible';
import styles from './styles.module.css';

export default function DocItemLayout({children}) {
  const {frontMatter, metadata, toc} = useDoc();
  const repositories = frontMatter.githubRepositories ?? [];
  if (!repositories.length) return <OriginalLayout>{children}</OriginalLayout>;
  return <RepositoryDocument {...{frontMatter, metadata, toc, repositories}}>{children}</RepositoryDocument>;
}

function RepositoryDocument({children, frontMatter, metadata, toc, repositories}) {
  const {view, views, repository, documentData, selectView, selectRepository} =
    useRepositoryDocument(repositories, frontMatter.repositoryTabDocuments);
  const overview = view === 'overview';
  const activeToc = overview ? toc : (documentData?.toc ?? []);
  const showTOC = !frontMatter.hide_table_of_contents && activeToc.length > 0;
  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <article>
          <DocBreadcrumbs />
          <DocVersionBadge />
          <DocumentTabs view={view} views={views} onChange={selectView} />
          <div
            role="tabpanel"
            id="repository-document-panel"
            aria-labelledby={`repository-tab-${view}`}
            tabIndex={0}>
            {showTOC && (overview ? <DocItemTOCMobile /> : (
              <TOCCollapsible
                key={`${view}-${repository}`}
                toc={activeToc}
                minHeadingLevel={1}
                maxHeadingLevel={3}
                className={styles.readmeMobileToc}
              />
            ))}
            {overview ? <DocItemContent>{children}</DocItemContent> : (
              <>
                {!documentData?.toc?.some(({level}) => level === 1) && (
                  <h1>{view === 'readme' ? metadata.title
                    : views.find(({value}) => value === view)?.label}</h1>
                )}
                <RepositoryDocumentContent
                  {...{repositories, repository, documentData, view}}
                  onSelect={selectRepository}
                />
              </>
            )}
          </div>
          <div className={styles.mobileRepositories}>
            <RepositoryContributors repositories={repositories} />
          </div>
          {overview && <DocItemFooter />}
        </article>
        <DocItemPaginator />
      </div>
      <aside className={styles.aside} aria-label="Repository information">
        {showTOC && (overview ? <DocItemTOCDesktop /> : (
          <TOC key={`${view}-${repository}`} toc={activeToc} minHeadingLevel={1} maxHeadingLevel={3} />
        ))}
        <RepositoryContributors repositories={repositories} />
      </aside>
    </div>
  );
}
