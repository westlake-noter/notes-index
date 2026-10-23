# Westlake Noter

**[Visit the website](https://westlake-noter.github.io/notes-index/)**

This repository contains the Docusaurus source for the Westlake Noter website:
a subject-organized index of course-note repositories and a reserved space for
future tools.

Browse the website for course descriptions, repository links, and PDF access
instructions. This repository maintains the website, not the original lecture
notes; corrections to those notes belong in their source repositories.

## Project Overview

- **Course Notes:** subject and course pages with automatically generated navigation.
- **Tools:** a separate section, currently reserved for future additions.
- **Authoring:** Markdown and MDX, React components, KaTeX formulas, and Mermaid diagrams.
- **Appearance:** an English interface with GitHub-inspired styling; the initial
  color mode follows the system, with a persistent light/dark toggle.
- **Deployment:** GitHub Actions builds the site and publishes it to GitHub Pages.

## Local Development

Use Node.js 22, matching the deployment workflow.

```sh
npm ci
npm start
```

Open `http://localhost:3000/notes-index/`.

To check and preview a production build:

```sh
npm run build
npm run serve
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for adding course pages, organizing subjects,
writing MDX and formulas, testing changes, and opening pull requests.

The site content lives in `docs/notes/` and `docs/tools/`; shared components and
styles live in `src/`. Course details are maintained on the website rather than
duplicated in this README.
