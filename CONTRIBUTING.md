# Contributing

Thank you for helping maintain the Westlake Noter website.
Contributions can improve the course index, fix links, refine the interface,
or add tools when they are ready.

## Scope

- Put course descriptions, repository links, and reading instructions in the
  website's course pages, not in the project README.
- Keep website text, page titles, and navigation labels in English.
- Link to original course repositories instead of copying their contents here.
  Submit corrections to the lecture notes in the relevant source repository.
- Include only public course materials. Do not publish private repositories,
  credentials, or member information.
- Preserve existing page URLs when reorganizing files. Use an explicit `slug`
  when needed, and update any affected internal links.

## Development Setup

Use Node.js 22, matching CI. Create a branch for your changes; fork the repository
first if you do not have write access.

```sh
npm ci
npm start
```

Open `http://localhost:3000/notes-index/`.

## Repository Layout

```text
docs/
  notes/
    index.md
    <subject>/
      _category_.json
      index.md
      <course>.md
  tools/
    index.md
src/
  components/
  css/
    custom.css
    glass.css
  pages/
    index.js
    index.module.css
  theme/
static/img/
  campus-light.webp
  campus-dark.webp
sidebars.js
docusaurus.config.js
.github/workflows/pages.yml
```

`sidebars.js` scans the Notes and Tools directories automatically. You do not
need to register individual pages there.

The homepage lives at `/`; the course directory lives at `/notes/`. Edit
`src/pages/index.js` and its CSS module for the homepage skeleton. The campus
map uses `src/components/CampusMap` with Docusaurus `ThemedComponent` to follow
the selected theme. It shows a skeleton until the selected image is loaded and
decoded, and leaves a static placeholder if loading fails. When replacing
the maps, retain their attribution and keep both theme variants at matching
dimensions. The current WebP assets were converted from the user-supplied
3543 x 1476 PNG exports at quality 90 without resizing.

## Add or Update a Course

Create one Markdown page per course-note repository in
`docs/notes/<subject>/`. Use a descriptive, lowercase, hyphenated filename.

```md
---
title: New Course
description: A short summary of the course materials.
sidebar_position: 8
---

# New Course

Briefly describe the materials and their scope.

- Repository: [Repository name](https://github.com/OWNER/REPOSITORY)
- Contents: topics or chapters covered.
- Reading: where to find PDFs, releases, or build instructions.
```

Replace the example title, links, and content with verified information.
Do not claim that PDFs or releases exist without checking.
Use `description` for the directory card summary; `sidebar_label` is optional
when it should differ from the page title.

`sidebar_position` controls ordering within a subject. Omit it to use the default
ordering, or choose a position consistent with neighboring pages.

The sidebar and the existing subject directory update automatically. Do not
add a duplicate course list to the README or subject index.

## Repository Contributors

GitHub repository links in Markdown automatically add repository information
and contributors to the right-hand rail, below the table of contents when one
exists. On mobile they appear after the article. Repository, file, and release
links for the same repository are deduplicated. Bare URLs, reference links, and
static MDX `<a href="...">` links work too; code examples and GitHub profile links
do not create contributor sections.

The homepage displays a deduplicated preview of contributors across the linked
repositories. The display uses GitHub's commit-based contributor list, not a
complete list of authors, reviewers, or people who helped outside GitHub.
Repository links follow Fumadocs's compact GitHub Info presentation, including
stars and forks when available. Statistics and contributor lists are snapshots,
not live counters.

Pages builds run `npm run sync:contributors` using the workflow's read-only token
before building. Local `npm run build` and `npm start` use the saved snapshot in
`src/data/repository-contributors.json` and do not need network access.
To refresh it locally, run:

```sh
npm run sync:contributors
npm test
npm run build
```

An optional `GITHUB_TOKEN` environment variable raises the API rate limit.
Never commit a token. Failed requests retain the previous snapshot; new
repositories without data show a link to GitHub's contributors page instead.
Changes on external repositories become visible after the next sync and site
deployment; they do not update live in the visitor's browser.

## Add a Subject

Create `docs/notes/<subject>/` with `_category_.json`, an `index.md`, and its
course pages. Category metadata sets the display name and order:

```json
{
  "label": "Physics",
  "position": 4
}
```

Use an index page for the subject introduction and automatic course directory:

```md
---
title: Physics
slug: /notes/physics
---

# Physics

A brief introduction to this subject's materials.

<AutoDocIndex />
```

The home page uses `<AutoDocIndex subjects />` to discover subject categories.
There is no separate home-page list to maintain.

## Tools and MDX

Tools has its own automatically generated sidebar under `docs/tools/`.
It currently contains only a placeholder. When adding the first real tool,
update that introduction accordingly.

Use `.mdx` for interactive pages. Keep reusable React components in
`src/components/` and import them into the page:

```mdx
import MyTool from '@site/src/components/MyTool';

<MyTool />
```

The component must exist at the imported path. Browser APIs such as `window`
and `document` must not be accessed during server rendering. Access them from
effects or event handlers, or render browser-only components through
`@docusaurus/BrowserOnly`.

`Tabs` and `TabItem` are globally available without imports:

```mdx
<Tabs>
  <TabItem value="source" label="Source" default>
    LaTeX source files.
  </TabItem>
  <TabItem value="pdf" label="PDF">
    Compiled lecture notes.
  </TabItem>
</Tabs>
```

## Icons and Motion

Navigation, directory cards, and the theme toggle use Lucide-based icons from
the MIT-licensed [AnimateIcons](https://github.com/Avijit07x/animateicons)
React package. Import individual icons rather than the complete icon collection.
`src/components/AnimatedIcon/` connects them to their parent link or button for
hover, keyboard-focus, and click feedback without changing navigation behavior.

Keep animations short and interaction-triggered, and respect
`prefers-reduced-motion`. Test keyboard access, mobile menus, both color modes,
and reduced-motion mode when changing animated controls. The navigation logo
uses the supplied Westlake SVG with its original colors.

## Layout and Upstream Styles

`src/css/glass.css` adapts Fumadocs Glass color tokens and layout utilities to
Docusaurus. The upstream source paths, pinned commit, and MIT license are
recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Preserve that
attribution when changing derived styles.

Use the existing Docusaurus components for routing, navigation, and the mobile
drawer. The desktop sidebar wrapper only adds the shared `Logo` component.
Keep the logo transparent, preserve the two-state theme toggle, and check
sidebar scrolling and mobile navigation after layout changes.

The desktop `src/theme/TOC/` reuses Docusaurus heading detection and the
Fumadocs block highlight algorithm. Preserve the edge fade, keyboard focus,
reduced-motion behavior, and observer cleanup when editing it. The gray
surfaces use blue highlights with restrained orange accents drawn from the
supplied Westlake logo; keep orange text contrast-adjusted in both color modes.

The desktop navbar uses `headroom.js` for scroll direction, offset, and tolerance.
`src/theme/Navbar/Layout/` wraps the original layout without replacing navigation
or the mobile drawer. Downward scrolling contracts the surface toward the right
actions; upward scrolling, route changes, and navigation focus expand it.
Keep hidden left-hand links inert, respect reduced motion, and test both sides
of the 997px desktop breakpoint when editing this behavior.

## Math and Diagrams

KaTeX supports inline math with `$...$` and display math with `$$...$$`:

```md
For $f(x) = x^2$, the derivative is $f'(x) = 2x$.

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$
```

KaTeX styles and fonts are bundled locally; an external CDN is not required.
The `katex` override in `package.json` keeps the math plugins and Mermaid on
the same patched version. When upgrading these dependencies, test both formulas
and diagrams.

Use a `mermaid` code block for diagrams:

````md
```mermaid
flowchart LR
  Source[LaTeX source] --> Build[Compile]
  Build --> PDF[PDF notes]
```
````

Mermaid colors follow the website's light/dark mode.

## Edit Links and Update Dates

Each page's **Edit this page** link points to its source file in this repository.
**Last updated** reflects that file's Git history, not activity in the linked
course repository. Newly added files need a commit before a real Git update
date can be inferred.

Development mode may show a simulated date. Production builds use the actual
commit date, and CI fetches the full Git history for this purpose.

## Checks Before a Pull Request

Run:

```sh
npm run build
git diff --check
```

The build checks internal document links. Also check external repository,
release, and PDF links manually.

- Confirm the page appears in the correct section and directory.
- Check desktop and narrow mobile layouts for wrapping and overflow.
- Check light and dark modes when changing styles, formulas, or diagrams.
- Test keyboard navigation and state changes for interactive components.
- Keep generated output, `node_modules/`, credentials, and temporary test pages
  out of the pull request.

## Submit Changes

Open a pull request against `main` with a short description of the change and
the checks you ran. Include screenshots for visible interface changes and
mention any changed URLs. Keep unrelated changes in separate pull requests.

The GitHub Actions workflow checks production builds on pull requests and
deploys updates to `main`. Changes limited to root Markdown files, such as
`README.md` and `CONTRIBUTING.md`, skip this workflow on both pushes and pull
requests. Site pages in `docs/` still require a full Docusaurus build, even for
text-only edits. A commit that changes both repository documentation and site
files still triggers the workflow. Manual runs remain available through
**Actions > Build and Deploy Pages > Run workflow**.

CI reuses the npm download cache and Webpack's persistent compilation cache.
The Webpack cache is restored after `npm ci`, is separated by runner platform,
Node version, dependencies, and site configuration, and is refreshed for each
commit. Generated site output is rebuilt, not restored as the published artifact.
The first build after a dependency or configuration change starts with a cold
compilation cache; cache hits do not eliminate the build or deployment steps.

New runs cancel older builds for the same branch or pull request. Deployments
remain serialized and are not interrupted by newer builds. Before publishing,
the deployment job checks that its commit is still the latest commit on `main`;
stale runs and manual runs on other branches do not publish.

If branch protection later requires the build check, revisit these path filters:
a skipped workflow does not report a successful required check.

For root-documentation-only changes, check the Markdown links and code blocks
and run `git diff --check`; a local site build is optional.

Maintainers configure **Settings > Pages > Source**
as **GitHub Actions**. Site address settings live in `docusaurus.config.js`;
deployment configuration lives in `.github/workflows/pages.yml`.
