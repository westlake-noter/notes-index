import React from 'react';
import { useDocsSidebar } from '@docusaurus/plugin-content-docs/client';
import DocCardList from '@theme/DocCardList';

export default function AutoDocIndex({ subjects = false }) {
  const sidebar = useDocsSidebar();
  const items = subjects
    ? (sidebar?.items ?? []).filter((item) => item.type === 'category')
    : undefined;

  return <DocCardList items={items} className="auto-doc-index" />;
}
