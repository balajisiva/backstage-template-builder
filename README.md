# Backstage Template Builder

Visual authoring for Backstage scaffolder templates

## What this is

Backstage scaffolder templates are powerful, but difficult to author, review, and evolve over time.

Backstage Template Builder is a Backstage frontend plugin that provides a visual editor, execution flow view, and live YAML output for creating and maintaining scaffolder templates — without hiding the underlying configuration.

This plugin is designed for platform teams who want faster, safer iteration on templates while staying fully compatible with Backstage's native scaffolder.

## Key features

- **Visual template editor** — Create and edit scaffolder templates using structured forms instead of hand-editing YAML.
- **Live YAML view** — Always see the generated YAML side-by-side to retain transparency and control.
- **Execution flow visualization** — Understand how scaffolder steps execute through a clear, step-by-step flow view.
- **Action discovery** — Browse and add common scaffolder actions (fetch, publish, catalog, custom actions).
- **Preview experience** — See what the end-user form will look like before publishing the template.

## Why this exists

Most Backstage adoption challenges don't come from running templates — they come from authoring and maintaining them.

This plugin focuses on:
- Reducing YAML friction
- Making template behavior understandable
- Helping teams treat templates as long-lived products, not one-off files

## Who it's for

- Platform engineering teams
- Backstage administrators
- Architects and PMs defining golden paths
- Anyone responsible for maintaining scaffolder templates at scale

## Installation

This project is currently implemented as a standalone Next.js application.

**Prerequisites:**
- Node.js 18+
- npm, yarn, pnpm, or bun

**Run the development server:**

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

**Open the application in your browser:**

```
http://localhost:3000
```

## Status

Early / experimental

The plugin is actively evolving. APIs, UI, and behavior may change.

Feedback and contributions are welcome.

## Screenshots

(Add your existing screenshots here — they're a strength.)

## Contributing

Contributions, ideas, and feedback are welcome.

Please open an issue to discuss larger changes before submitting a PR.
