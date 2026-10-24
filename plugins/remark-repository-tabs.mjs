import {renderReadme} from '../lib/github/documents.mjs';
import {documentViews} from '../src/features/repositories/documents.mjs';
import {compileOutline} from '../lib/course-outline.mjs';

export default function remarkRepositoryTabs({sources = {}, baseUrl = '/', sourceBase} = {}) {
  return async (_tree, file) => {
    const frontMatter = file.data.frontMatter;
    const tabs = frontMatter.repositoryTabs ?? [];
    if (!Array.isArray(tabs)) throw new Error('repositoryTabs must be an array');
    if (tabs.length && !frontMatter.githubRepositories?.length) {
      throw new Error('repositoryTabs requires a page linking to a GitHub repository');
    }
    const ids = new Set(documentViews.map(({value}) => value));
    frontMatter.repositoryTabDocuments = [];
    for (const tab of tabs) {
      if (!tab || typeof tab.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(tab.id) || ids.has(tab.id)
        || typeof tab.label !== 'string' || !tab.label.trim()
        || typeof tab.file !== 'string' || !Object.hasOwn(sources, tab.file)
        || tab.layout !== undefined) {
        throw new Error('Invalid repositoryTabs entry: use a unique id, label, and existing .md or .toc.json file under content/repository-tabs/; omit layout');
      }
      ids.add(tab.id);
      const source = {
        markdown: sources[tab.file],
        path: tab.file,
        sourceUrl: sourceBase ? new URL(tab.file, sourceBase).href : undefined,
        siteBaseUrl: baseUrl,
      };
      frontMatter.repositoryTabDocuments.push({
        id: tab.id, label: tab.label.trim(), path: tab.file,
        sourceUrl: source.sourceUrl, local: true, status: 'ready',
        ...(tab.file.endsWith('.toc.json')
          ? compileOutline(sources[tab.file], frontMatter.githubRepositories[0], tab.id)
          : await renderReadme(source, frontMatter.githubRepositories[0], tab.id)),
      });
    }
  };
}
