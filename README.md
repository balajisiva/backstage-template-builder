# Backstage Template Builder

> **A Backstage plugin for visual template authoring**

[![Backstage Plugin](https://img.shields.io/badge/Backstage-Plugin-7C3AED)](https://backstage.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Visual authoring for Backstage scaffolder templates

## What this is

Backstage scaffolder templates are powerful, but difficult to author, review, and evolve over time.

Backstage Template Builder is a **Backstage frontend plugin** that provides a visual editor, execution flow view, and live YAML output for creating and maintaining scaffolder templates — without hiding the underlying configuration.

This plugin is designed for platform teams who want faster, safer iteration on templates while staying fully compatible with Backstage's native scaffolder.

## Key features

- **Visual template editor** — Create and edit scaffolder templates using structured forms instead of hand-editing YAML
- **Live YAML view** — Always see the generated YAML side-by-side to retain transparency and control
- **Template validation** — Validate templates at any time with clickable issues that navigate directly to problems
- **RBAC support** — Restrict access to platform engineers only using Backstage's permission system
- **Execution flow visualization** — Understand how scaffolder steps execute through a clear, step-by-step flow view
- **Action discovery** — Browse and add common scaffolder actions (fetch, publish, catalog, custom actions)
- **Preview experience** — See what the end-user form will look like before publishing the template
- **GitHub integration** — Load templates from GitHub repos with live search, push changes back with validation

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

**Note:** The plugin supports RBAC to ensure only authorized platform engineers can access it. See [RBAC Configuration](plugins/backstage-template-builder/RBAC.md) for setup instructions.

## Quick Look

**Create a new template**
![New Template](.github/assets/New_Template_Creation.png)

**Load existing templates from GitHub**
![Load Template](.github/assets/Load_Existing_Template.png)

## Deployment Options

**Choose your platform:**

### ⚡ For RHDH (Red Hat Developer Hub) - 2 Minute Setup

Use our pre-built dynamic plugin on Quay.io:
- **Plugin Image**: `quay.io/balajisivarh/backstage-template-builder:0.1.0`
- **Setup**: Config-only, no code changes
- **Guide**: See **[QUAY-DEPLOYMENT.md](./QUAY-DEPLOYMENT.md)**

### 📦 For Standard Backstage - Full Integration

Install as a workspace plugin:
- **Installation**: NPM or local workspace
- **Integration**: Code changes in App.tsx
- **Guide**: See **[BACKSTAGE-DEPLOYMENT.md](./BACKSTAGE-DEPLOYMENT.md)**

**Not sure which?** Check the **[Deployment Comparison Guide](./DEPLOYMENT-COMPARISON.md)**

---

## Installation

### Prerequisites

- An existing Backstage instance (v1.x or higher)
- Node.js 18+ and Yarn

### Quick Start (Standard Backstage)

1. **Copy the plugin to your Backstage monorepo:**

   ```bash
   cp -r plugins/backstage-template-builder <your-backstage-repo>/plugins/
   ```

2. **Add the plugin to your app's dependencies:**

   In `packages/app/package.json`:
   ```json
   {
     "dependencies": {
       "@internal/plugin-backstage-template-builder": "^0.1.0"
     }
   }
   ```

3. **Install dependencies:**

   ```bash
   cd <your-backstage-repo>
   yarn install
   ```

4. **Add the route to your app:**

   In `packages/app/src/App.tsx`:
   ```tsx
   import { TemplateBuilderPage } from '@internal/plugin-backstage-template-builder';

   // Inside <FlatRoutes>
   <Route path="/template-builder" element={<TemplateBuilderPage />} />
   ```

5. **Add to the sidebar (optional):**

   In `packages/app/src/components/Root/Root.tsx`:
   ```tsx
   import CodeIcon from '@material-ui/icons/Code';

   // Inside the menu section
   <SidebarItem icon={CodeIcon} to="/template-builder" text="Template Builder" />
   ```

6. **Start Backstage:**

   ```bash
   yarn dev
   ```

7. **Access the plugin:**

   Navigate to `http://localhost:3000/template-builder` (or click "Template Builder" in the sidebar)

### Deployment Guides

**Quick Reference:**
- **[QUAY-DEPLOYMENT.md](./QUAY-DEPLOYMENT.md)** - RHDH deployment (2-minute setup, config-only)
- **[BACKSTAGE-DEPLOYMENT.md](./BACKSTAGE-DEPLOYMENT.md)** - Standard Backstage installation
- **[DEPLOYMENT-COMPARISON.md](./DEPLOYMENT-COMPARISON.md)** - Platform comparison & decision guide
- **[RHDH-DEPLOYMENT.md](./RHDH-DEPLOYMENT.md)** - Technical details for RHDH dynamic plugins

**Additional Documentation:**
- [Plugin README](plugins/backstage-template-builder/README.md)
- [Integration Guide](plugins/backstage-template-builder/INTEGRATION.md)
- [RBAC Configuration](plugins/backstage-template-builder/RBAC.md) - Restrict access to platform engineers

## GitHub Integration

The plugin connects directly to GitHub to load and save templates. Users will need to provide a GitHub Personal Access Token:

**Classic Token (recommended for simplicity):**
- Scope: `repo` (Full control of private repositories)
- [Create a classic token](https://github.com/settings/tokens/new)

**Fine-grained Token (for more granular permissions):**
- Repository permissions:
  - Contents: Read and Write
  - Metadata: Read
- [Create a fine-grained token](https://github.com/settings/personal-access-tokens/new)

Tokens are stored in the browser's localStorage and persist across sessions. They are never sent to any backend server - all GitHub API calls are made directly from the browser.

## Usage

Once installed, users can:

1. **Create new templates** — Click "New" to start with a blank template
2. **Load from GitHub** — Import existing templates from repositories with live search
3. **Edit visually** — Use the tabbed interface to configure:
   - **Metadata** — Name, title, description, tags, owner
   - **Parameters** — Input fields with validation, UI widgets, and conditional logic
   - **Steps** — Scaffolder actions (fetch, publish, debug, custom)
   - **Output** — Links displayed after template execution
4. **Validate anytime** — Click "Validate" to check for errors, warnings, and issues; clickable results navigate directly to the problem
5. **Preview YAML** — See live YAML output and edit directly if needed
6. **Visualize flow** — View execution flow as a directed graph
7. **Preview end-user experience** — See what developers will see
8. **Save to GitHub** — Push templates back to repositories with pre-push validation

## Development

To develop the plugin locally:

```bash
cd plugins/backstage-template-builder
yarn install
yarn start
```

This will start the plugin in development mode at http://localhost:3000 using Backstage's dev utilities.

### Building

To build the plugin:

```bash
cd plugins/backstage-template-builder
yarn build
```

The build output will be in the `dist/` directory.

## Architecture

- **Frontend-only plugin** — No backend services required
- **State management** — React Context + useReducer
- **YAML generation** — js-yaml library
- **Template validation** — Client-side validation with smart navigation to issues
- **Drag-and-drop** — @dnd-kit for parameter and step reordering
- **UI components** — Radix UI primitives with Tailwind CSS
- **GitHub integration** — Direct API calls from the browser with live search (no proxy needed)

## Status

Early release / actively maintained

The plugin is functional and ready for use in Backstage instances. APIs and UI may evolve based on feedback.

Contributions, ideas, and feedback are welcome!

## Screenshots

### Visual Template Editor

Build templates using structured forms across four main sections:

**Metadata** - Define template identity, owner, and tags
![Template Metadata](.github/assets/Template_Meta_Data.png)

**Parameters** - Create input fields with validation and UI widgets
![Template Parameters](.github/assets/Template_Parameters.png)

**Steps** - Configure scaffolder actions with detailed inputs
![Template Steps](.github/assets/Template_Steps.png)

![Step Detail Editor](.github/assets/Template_Step_Detail.png)

**Output** - Define links shown after template execution
![Template Output](.github/assets/Template_Output.png)

### Execution Flow Visualization

See how your scaffolder steps execute in a visual flow diagram
![Flow View](.github/assets/Template_Flow_Visualization.png)

### End-User Preview

Preview what developers will see when using your template

**Form View**
![Template Preview Form](.github/assets/Template_Preview.png)

**Review Step**
![Template Preview Review](.github/assets/Template_Preview_Review.png)

**Completion**
![Template Preview Done](.github/assets/Template_Preview_Done.png)

## Troubleshooting

### Plugin not appearing in Backstage

1. **Verify installation:**
   ```bash
   # Check that the plugin is in your workspace
   ls plugins/backstage-template-builder

   # Verify it's listed in package.json
   grep "backstage-template-builder" packages/app/package.json
   ```

2. **Clear cache and rebuild:**
   ```bash
   yarn clean
   yarn install
   yarn dev
   ```

3. **Check browser console** for any error messages

### Build errors

If you get TypeScript compilation errors:

```bash
cd plugins/backstage-template-builder
rm -rf dist dist-types node_modules
yarn install
yarn build
```

### GitHub integration issues

- **"Resource not accessible"**: Token needs `repo` scope (Classic) or Contents R/W + Metadata R (Fine-grained)
- **Token not persisting**: Check that browser localStorage is enabled
- **CORS errors**: The plugin makes direct API calls to GitHub - ensure your browser allows this

## Roadmap

Potential future enhancements:
- Backend service integration for template validation
- Publish templates directly to Backstage catalog
- Multi-user collaboration features
- Migration to Material-UI for native Backstage styling
- Template versioning and change history
- Permission/RBAC integration

## Contributing

Contributions, ideas, and feedback are welcome!

Please open an issue to discuss larger changes before submitting a PR.

## License

MIT
