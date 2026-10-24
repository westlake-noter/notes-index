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
import RepositoryContributors from '@site/src/components/RepositoryContributors';
import styles from './styles.module.css';

export default function DocItemLayout({children}) {
  const {frontMatter, metadata, toc} = useDoc();
  const repositories = frontMatter.githubRepositories ?? [];
  if (!repositories.length) return <OriginalLayout>{children}</OriginalLayout>;
  const showTOC = !frontMatter.hide_table_of_contents && toc.length > 0;
  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <article>
          <DocBreadcrumbs />
          <DocVersionBadge />
          {showTOC && <DocItemTOCMobile />}
          <DocItemContent>{children}</DocItemContent>
          <div className={styles.mobileRepositories}>
            <RepositoryContributors repositories={repositories} />
          </div>
          <DocItemFooter />
        </article>
        <DocItemPaginator />
      </div>
      <aside className={styles.aside} aria-label="Repository information">
        {showTOC && <DocItemTOCDesktop />}
        <RepositoryContributors repositories={repositories} />
      </aside>
    </div>
  );
}
