import { themes as prismThemes } from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Westlake Noter',
  tagline: 'Course Notes Index',
  favicon: 'img/westlake-logo.svg',
  url: 'https://westlake-noter.github.io',
  baseUrl: '/notes-index/',
  organizationName: 'westlake-noter',
  projectName: 'notes-index',
  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },
  trailingSlash: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          breadcrumbs: true,
          editUrl: 'https://github.com/westlake-noter/notes-index/edit/main/',
          showLastUpdateTime: true,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: ['./src/css/custom.css', './src/css/glass.css'],
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Westlake Noter',
      logo: {
        alt: 'Westlake Noter',
        src: 'img/westlake-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'notesSidebar',
          position: 'left',
          label: 'Course Notes',
        },
        {
          type: 'docSidebar',
          sidebarId: 'toolsSidebar',
          position: 'left',
          label: 'Tools',
        },
        {
          href: 'https://github.com/westlake-noter/notes-index',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Index',
          items: [
            { label: 'Course Notes', to: '/' },
            { label: 'Tools', to: '/tools' },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Community Hub',
              href: 'https://github.com/westlake-noter/community',
            },
            {
              label: 'Join the Organization',
              href: 'https://github.com/westlake-noter/membership-application',
            },
          ],
        },
      ],
      copyright: `Westlake Noter · ${new Date().getFullYear()}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
