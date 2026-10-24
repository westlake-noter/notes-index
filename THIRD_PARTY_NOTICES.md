# Third-Party Notices

## Fumadocs

The Glass appearance in `src/css/glass.css` adapts the neutral color tokens
and Glass layout utility styles from [Fumadocs](https://github.com/fuma-nama/fumadocs),
commit `4b1052413e20e2834337fe6a24a0ef108e9ebabf`:

- `packages/base-ui/css/lib/default-colors.css`
- `packages/base-ui/src/layouts/glass/index.tsx`
- `packages/base-ui/src/layouts/glass/slots/sidebar.tsx`
- `packages/base-ui/src/layouts/glass/slots/header.tsx`
- `packages/base-ui/src/layouts/glass/page/index.tsx`
- `packages/base-ui/src/components/toc/index.tsx`
- `packages/base-ui/src/components/toc/block.tsx`
- `packages/base-ui/src/components/github-info.tsx`
- `packages/core/src/toc.tsx`
- `apps/docs/app/(home)/page.tsx`
- `apps/docs/components/contributor-count.tsx`
- `apps/docs/lib/get-contributors.ts`

The original Tailwind utilities are translated to CSS selectors for the existing
Docusaurus components. Docusaurus continues to own routing, navigation, and the
mobile drawer; the Fumadocs React layout is not installed.

The homepage follows the upstream layered hero, inline action links, and
constrained follow-up sections, using native Docusaurus components instead of
Next.js. Its campus maps are user-supplied terraink.app exports, with visible
terraink.app and OpenStreetMap attribution retained on the page.

`src/features/repositories/` follows the upstream linked-avatar presentation,
sharing its avatar component between the homepage and document information rail.
`lib/github-contributors.mjs` adapts the upstream fetcher, adding pagination,
user deduplication, and static build-time snapshots. A remark plugin collects
repository links from each document; the browser never receives an API token
or makes GitHub API requests. Avatar images are loaded from GitHub's avatar CDN.
The repository link and compact star/fork statistics adapt `GithubInfo`; data
is fetched by the sync script rather than React Server Components. The native
Docusaurus document components are retained in an adapted MIT-licensed
DocItem/Layout to place this information in the right-hand rail.

`src/features/toc/useTableOfContents.js` adapts the block TOC's resize-cached item positions and
animated `clip-path`. Its desktop heading observer adapts Fumadocs core's
multi-anchor visibility and nearest-heading fallback. Docusaurus still renders
the filtered heading tree; its single-active-item observer is disabled for this
desktop TOC. A class observer expands the gradient across all active links. The edge mask
and fading active background are translated from the upstream TOC styles.

### MIT License

Copyright (c) 2023 Fuma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
