import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Westlake Noter',
  tagline: '课程笔记索引',
  favicon: 'img/favicon.svg',
  url: 'https://westlake-noter.github.io',
  baseUrl: '/notes-index/',
  organizationName: 'westlake-noter',
  projectName: 'notes-index',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },
  trailingSlash: true,
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          breadcrumbs: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'Westlake Noter',
      logo: {
        alt: 'Westlake Noter',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'notesSidebar',
          position: 'left',
          label: '课程笔记',
        },
        {
          href: 'https://github.com/westlake-noter/notes-index',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '索引',
          items: [
            { label: '课程笔记', to: '/' },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: '社区协作中心',
              href: 'https://github.com/westlake-noter/community',
            },
            {
              label: '成员申请',
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
