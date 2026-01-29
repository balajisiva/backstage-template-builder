# Backstage Template Builder Plugin

A Backstage frontend plugin that provides a visual editor for creating and managing Backstage scaffolder templates.

## Features

- **Visual template editor** — Create and edit scaffolder templates using structured forms instead of hand-editing YAML
- **Live YAML view** — Always see the generated YAML side-by-side to retain transparency and control
- **Execution flow visualization** — Understand how scaffolder steps execute through a clear, step-by-step flow view
- **Action discovery** — Browse and add common scaffolder actions (fetch, publish, catalog, custom actions)
- **Preview experience** — See what the end-user form will look like before publishing the template
- **GitHub integration** — Load templates from GitHub and push changes back

## Installation

This plugin is designed to be installed in a Backstage monorepo.

### 1. Add the plugin to your Backstage app

In your `packages/app/package.json`, add the dependency:

```json
{
  "dependencies": {
    "@internal/plugin-backstage-template-builder": "^0.1.0"
  }
}
```

### 2. Add the route to your app

In `packages/app/src/App.tsx`, import and add the route:

```tsx
import { TemplateBuilderPage } from '@internal/plugin-backstage-template-builder';

// Inside <FlatRoutes>
<Route path="/template-builder" element={<TemplateBuilderPage />} />
```

### 3. Add to the sidebar (optional)

In `packages/app/src/components/Root/Root.tsx`:

```tsx
import CodeIcon from '@material-ui/icons/Code';

// Inside <SidebarPage>
<SidebarItem icon={CodeIcon} to="/template-builder" text="Template Builder" />
```

## Development

To run the plugin in isolation for development:

```bash
cd plugins/backstage-template-builder
yarn start
```

This will start the plugin in development mode at http://localhost:3000

## GitHub Integration

The plugin uses direct GitHub API calls for loading and pushing templates. Users need to provide a GitHub Personal Access Token with:

**Classic Token:**
- `repo` scope (full control of private repositories)

**Fine-grained Token:**
- Contents: Read and Write
- Metadata: Read

Tokens are stored in localStorage for persistence.

## Architecture

- **Frontend-only plugin** — No backend services required
- **State management** — React Context + useReducer
- **YAML generation** — js-yaml library
- **Drag-and-drop** — @dnd-kit
- **UI components** — Radix UI primitives with Tailwind CSS

## License

MIT
