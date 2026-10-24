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
content/
  repository-tabs/
    <custom-tab>.md
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
  features/
    navigation/
    repositories/
    toc/
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

### Code Boundaries

- `src/features/navigation/`: navbar links, expansion controls, scroll state,
  and the browser lifecycle hook. Pure scroll rules live in `scroll-state.mjs`.
- `src/features/toc/`: heading visibility, following highlight, and TOC rendering.
- `src/features/repositories/`: document repository information and the homepage
  contributor section, sharing `ContributorAvatars` and one CSS module.
- `src/theme/`: Docusaurus adapters and document/sidebar placement. Keep feature
  behavior in `features/`, not in theme registration files.
- `src/components/`: standalone reusable visuals such as icons and the campus map.
- `src/css/`: shared typography, color tokens, and Glass layout selectors;
  feature-specific styles stay beside their components.
- `lib/`, `plugins/`, and `scripts/`: GitHub/Markdown processing, the remark
  integration, and the build-time snapshot command respectively.

Import feature entry points from pages and theme adapters. Do not import a
theme adapter from a feature; use native `@theme-original` components when
wrapping Docusaurus, or native primitives such as `@theme/TOCItems`. Keep pure
rules independent of React so `npm test` can cover them directly.

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

Pages builds run `npm run sync:repositories` using the workflow's read-only token
before building. Local `npm run build` and `npm start` use saved snapshots in
`src/data/repository-contributors.json` and `src/data/repository-documents.json`
and do not need network access to GitHub's API.
To refresh it locally, run:

```sh
npm run sync:repositories
npm test
npm run build
```

An optional `GITHUB_TOKEN` environment variable raises the API rate limit.
Never commit a token. Failed requests retain the previous snapshot; new
repositories without data show a link to GitHub's contributors page instead.
Changes on external repositories become visible after the next sync and site
deployment; they do not update live in the visitor's browser.

### Repository Documents

Pages linking to repositories have four tabs: Overview, README, Contributing,
and License. Overview remains the default and
contains our curated course introduction. README displays the upstream document
without duplicating it in the Overview. Keep detailed build steps and file
listings upstream; keep the course summary and reading guidance in the Overview.

The README tab includes its original path, source link, and actual last sync
date. For pages linking to multiple repositories, a select control chooses the
document. All tabs share repository statistics and contributors; desktop and
mobile tables of contents follow the selected content. `?view=readme&repo=owner/name`
(or `view=contributing` / `view=license`) and scoped heading fragments preserve
the selected document after refreshing.

`lib/github-documents.mjs` fetches the default README through GitHub's REST API,
renders GFM and KaTeX with unified, and caches sanitized HTML and its heading
tree. Relative links point to GitHub files and relative images to raw files.
README HTML is sanitized before trusted KaTeX output is added; it is never
compiled as MDX or executed as JavaScript. Some embedded widgets and custom
HTML are deliberately removed. Images still load from their original hosts.

Contributing and License display separate upstream files, discovered at the
repository root or under `.github/` or `docs/`, with case-insensitive filenames.
Root files take precedence. README's existing contribution/license sections
remain untouched; they are never extracted into the other tabs. Missing
independent files get their own empty state. Each document has its own cache,
sync timestamp, source link, and scoped heading IDs.

### Custom Document Tabs

Use custom tabs for locally maintained material such as a detailed course
outline, reading guide, or exercises. Overview is the main course Markdown;
README, Contributing, and License come from the linked upstream repository.
Do not edit the generated snapshots to add local content.

All paths below are relative to this repository's root.

1. Create the tab's content file, for example
   `content/repository-tabs/new-course-exercises.md`:

   ```md
   # Exercises

   ## Chapter 1

   Practice problems and references for this chapter.

   ## Chapter 2

   Additional exercises.
   ```

2. Open the corresponding course page under `docs/notes/<subject>/`.
   Add `repositoryTabs` inside its existing YAML frontmatter (the block between
   the first pair of `---` lines), not in the article body. Keep the page's
   existing title, sidebar settings, repository link, and other content.
   A complete minimal page looks like this:

   ```md
   ---
   title: New Course
   description: Course notes and exercises.
   sidebar_position: 8
   repositoryTabs:
     - id: exercises
       label: Exercises
       file: content/repository-tabs/new-course-exercises.md
   ---

   # New Course

   A short course introduction.

   - Repository: [Course notes](https://github.com/OWNER/REPOSITORY)
   ```

3. To add more tabs, append entries to the same `repositoryTabs` list.
   Each entry needs an `id`, `label`, and `file`:

   ```yaml
   repositoryTabs:
     - id: exercises
       label: Exercises
       file: content/repository-tabs/new-course-exercises.md
     - id: reading-guide
       label: Reading Guide
       file: content/repository-tabs/new-course-reading-guide.md
   ```

   Create every referenced file before building. `id` is the URL identifier
   (for example, `?view=exercises`); `label` is the visible English tab name;
   `file` is the exact, case-sensitive path from the repository root, not a
   path relative to the course page.

   For a PDF-style course outline, optionally add `layout: outline` to that
   entry. Use numbered `##` chapter headings, followed by `Printed page: **1**.`,
   and Markdown tables with Section / Topic / Printed Page columns for
   subsections. This compact layout aligns page numbers without repeated
   visible table headers. See
   [Quantum Mechanics](docs/notes/physics/quantum-mechanics.md) and
   [its outline](content/repository-tabs/quantum-mechanics-toc.md) for the
   complete format. Omit `layout` for normal Markdown presentation.

4. Run `npm start` to preview the course page and select the new tab.
   If the server is already running, stop and restart it after changing
   local tab files or their declarations. Check that the content, right-hand
   table of contents, and a refresh with `?view=exercises` all work.
   Also check a narrow mobile viewport.

5. Before submitting a pull request, run:

   ```sh
   npm test
   npm run build
   git diff --check
   ```

   Include both the course page configuration and its new content files in
   the pull request. No changes to React, `sidebars.js`, or generated JSON
   are needed; local tabs do not require `npm run sync:repositories`.

Tabs append after the four built-in tabs, in declaration order. Reorder the
list to reorder custom tabs. IDs must start with a lowercase letter, contain
only lowercase letters, numbers, and hyphens, and be unique within the page.
Do not use the reserved IDs `overview`, `readme`, `contributing`, or `license`.
Keep IDs stable after publishing so existing links continue to work.
The course page must link to at least one GitHub repository.

Use `.md` files under `content/repository-tabs/`; these are tab content, not
standalone routes or sidebar pages. Use ordinary Markdown, GFM tables, and
KaTeX math, not MDX imports, React components, or interactive Mermaid blocks.
HTML is sanitized and JavaScript is not executed.
Local Markdown shares the sanitized GFM/KaTeX renderer and dynamic TOC. Its
headings have scoped anchors, and `?view=reading-guide` survives refresh.
Use site-root links such as `/notes/math/` and `/img/example.png`; the renderer
adds the deployed `baseUrl`. Full external URLs remain unchanged. Custom
documents have a source link to this site's repository and no GitHub sync date.
Their content is shared across the page's repositories, not fetched per repo.

`plugins/remark-repository-tabs.mjs` embeds the documents at build time.
`loadLocalTabSources()` includes source text in remark options so production
MDX caches invalidate when the files change. Restart `npm start` after creating
or changing these local tab files, since their sources are loaded with the site
configuration. `npm run build` always picks up the latest local files.

Working example:
[Fundamental Algebra and Analysis](docs/notes/math/fundamental-algebra-analysis.md)
declares a **TOC** tab backed by
[its local outline](content/repository-tabs/fundamental-algebra-analysis-toc.md).
Both volume outlines live there; Overview keeps the course introduction.

If the build reports `Invalid repositoryTabs`, check for a reserved or
duplicate ID, an empty label, or a missing content file. If it reports
`repositoryTabs requires a page linking to a GitHub repository`, add a real
repository link to the course page. If the preview still shows old content,
restart `npm start`; changing tab sources does not hot-reload them.

On a transient fetch failure, keep the saved README and its original sync time,
marked as a cached copy. A confirmed missing README gets an explicit empty
state; unsynced repositories link to GitHub instead. `npm run sync:contributors`
remains an alias for the combined sync command.

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

The desktop `src/features/toc/` reuses Docusaurus's heading tree and Fumadocs's
multi-anchor observer and block highlight algorithm. All headings visible below
the navbar are highlighted together; when none are visible, the nearest heading
remains active. The desktop single-item Docusaurus highlight is disabled so it
cannot overwrite this range. Preserve the edge fade, keyboard focus,
reduced-motion behavior, and observer cleanup when editing it. The gray
surfaces use blue highlights with restrained orange accents drawn from the
supplied Westlake logo; keep orange text contrast-adjusted in both color modes.

`src/theme/Navbar/Layout/` wraps the original layout without replacing navigation
or the mobile drawer. Away from the page top, scrolling in either direction
contracts the surface toward the right actions. The expand button opens it
until the next actual page scroll; returning to the top opens it automatically.
Within 160px of the top, an already expanded navbar stays open while scrolling
upward, avoiding a collapse/expand flash. Downward scrolling still contracts it,
and this buffer never opens an already compact navbar.
The button uses Docusaurus's custom navbar item API. Scroll state is tested in
`tests/navbar-scroll.test.mjs`; no scroll-direction dependency is needed.
The implementation lives in `src/features/navigation/`; theme files only connect
the provider, links, and custom item to Docusaurus. The desktop GitHub action is
an icon-only 32px link with a tooltip and accessible name; the mobile drawer
retains its text label.
Only keyboard activation of the expand button moves focus to the first
navigation link. Pointer activation must not focus another link or trigger its
focus animation. Check both input methods after a fresh page load.
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
