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

The original Tailwind utilities are translated to CSS selectors for the existing
Docusaurus components. Docusaurus continues to own routing, navigation, and the
mobile drawer; the Fumadocs React layout is not installed.

`src/theme/TOC/index.js` adapts the block TOC's resize-cached item positions and
animated `clip-path`. A class observer connects it to Docusaurus's existing
heading highlight instead of introducing a second scroll spy. The edge mask
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
