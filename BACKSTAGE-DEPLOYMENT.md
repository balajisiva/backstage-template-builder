# Backstage Deployment Guide - Template Builder Plugin

This guide covers deploying the Template Builder plugin to a standard Backstage instance (not RHDH).

## Deployment Methods

### Method 1: Local Workspace Integration (Recommended for Development)

If you're developing a Backstage app alongside this plugin:

1. **Copy the plugin** to your Backstage monorepo:
   ```bash
   # From your Backstage app root
   cp -r /path/to/backstage-template-builder/plugins/backstage-template-builder \
         plugins/template-builder
   ```

2. **Add workspace** to root `package.json`:
   ```json
   {
     "workspaces": {
       "packages": [
         "packages/*",
         "plugins/*"
       ]
     }
   }
   ```

3. **Install plugin** in your app (`packages/app/package.json`):
   ```json
   {
     "dependencies": {
       "@internal/plugin-backstage-template-builder": "^0.1.0"
     }
   }
   ```

4. **Install dependencies**:
   ```bash
   yarn install
   ```

### Method 2: Standalone Package Installation

If the plugin is published to NPM or a private registry:

```bash
# From your Backstage app root
yarn workspace app add @internal/plugin-backstage-template-builder
```

### Method 3: Direct Git Installation

Install directly from GitHub:

```bash
# From your Backstage app root
yarn workspace app add https://github.com/balajisiva/backstage-template-builder#main
```

## Integration into Backstage App

### 1. Add the Route

Edit `packages/app/src/App.tsx`:

```tsx
import { TemplateBuilderPage } from '@internal/plugin-backstage-template-builder';

// Inside your <FlatRoutes> component
const routes = (
  <FlatRoutes>
    {/* ... existing routes ... */}

    {/* Template Builder */}
    <Route path="/template-builder" element={<TemplateBuilderPage />} />

    {/* ... other routes ... */}
  </FlatRoutes>
);
```

### 2. Add Navigation Menu Item

Edit `packages/app/src/components/Root/Root.tsx`:

```tsx
import BuildIcon from '@material-ui/icons/Build';

// Inside the sidebar
<SidebarItem icon={BuildIcon} to="template-builder" text="Template Builder" />
```

### 3. Optional: Add Permissions (if using RBAC)

Edit `packages/backend/src/plugins/permission.ts`:

```tsx
import { templateBuilderPermissions } from '@internal/plugin-backstage-template-builder';

// Add to your permission policy
class CustomPermissionPolicy implements PermissionPolicy {
  async handle(request: PolicyQuery): Promise<PolicyDecision> {
    if (request.permission.name === 'catalog.entity.create') {
      // Allow template creation
      return { result: AuthorizeResult.ALLOW };
    }
    // ... other permissions
  }
}
```

## Configuration

Add optional configuration to your `app-config.yaml`:

```yaml
# Optional: Configure default settings
templateBuilder:
  # GitHub integration (users provide PAT via UI)
  github:
    enabled: true

  # Custom actions catalog
  customActions:
    enabled: true

  # Default template metadata
  defaults:
    owner: 'default-team'
    system: 'default-system'
```

## Build and Run

### Development Mode

```bash
# Start the app in dev mode
yarn dev
```

The plugin will be available at `http://localhost:3000/template-builder`

### Production Build

```bash
# Build all packages
yarn build:all

# Or build specific packages
yarn workspace app build
yarn workspace @internal/plugin-backstage-template-builder build
```

### Running in Production

```bash
# Build backend and frontend
yarn build:all

# Start production server
yarn workspace backend start
```

## Plugin Features

Once installed, the Template Builder provides:

- **Visual Template Builder**: Drag-and-drop interface for creating Backstage templates
- **Live YAML Preview**: Real-time preview of generated template YAML
- **GitHub Integration**: Pull/push templates directly from/to GitHub
- **Custom Actions Manager**: Add and manage custom scaffolder actions
- **End-User Preview**: Simulate the template wizard as end users will see it
- **Flow View**: Visual pipeline diagram of template steps
- **Parameters Editor**: Build multi-step forms with Backstage UI extensions
- **Output Links**: Configure catalog links, documentation, dashboards

## Dependencies

The plugin requires these Backstage packages (already in peerDependencies):

```json
{
  "@backstage/core-components": "^0.14.0",
  "@backstage/core-plugin-api": "^1.9.0",
  "@backstage/plugin-catalog-react": "^1.11.0",
  "@backstage/catalog-model": "^1.4.0",
  "@backstage/theme": "^0.5.0"
}
```

These should already be in your Backstage app.

## TypeScript Configuration

If you're using TypeScript project references, add to root `tsconfig.json`:

```json
{
  "references": [
    {
      "path": "./plugins/template-builder"
    }
  ]
}
```

## Troubleshooting

### Module Not Found Errors

If you get module resolution errors:

```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn cache clean
yarn install
```

### Build Errors

Ensure TypeScript compilation works:

```bash
# From plugin directory
cd plugins/template-builder
yarn tsc

# From root
yarn tsc
```

### Plugin Not Appearing

1. Check the route is added to `App.tsx`
2. Check browser console for errors
3. Verify plugin is installed: `yarn why @internal/plugin-backstage-template-builder`

### GitHub Integration Issues

The plugin stores GitHub tokens in localStorage (client-side only). Ensure:
- CORS is configured if using a proxy
- GitHub PAT has required scopes: `repo` (Classic) or `Contents: Read/Write` (Fine-grained)

## Development Workflow

If you're actively developing the plugin:

1. **Make changes** to plugin source
2. **Rebuild plugin**:
   ```bash
   yarn workspace @internal/plugin-backstage-template-builder build
   ```
3. **Restart dev server**:
   ```bash
   yarn dev
   ```

For faster iteration, use watch mode:
```bash
# Terminal 1: Watch plugin
yarn workspace @internal/plugin-backstage-template-builder start

# Terminal 2: Run app
yarn workspace app start
```

## Publishing to NPM (Optional)

To make the plugin available via NPM:

1. **Update package.json**:
   ```json
   {
     "name": "@your-org/backstage-plugin-template-builder",
     "private": false,
     "publishConfig": {
       "access": "public"
     }
   }
   ```

2. **Build the plugin**:
   ```bash
   yarn workspace @internal/plugin-backstage-template-builder build
   ```

3. **Publish**:
   ```bash
   cd plugins/backstage-template-builder
   npm publish
   ```

4. **Install in other Backstage apps**:
   ```bash
   yarn workspace app add @your-org/backstage-plugin-template-builder
   ```

## Example Integration

Here's a complete example of integrating the plugin:

### packages/app/src/App.tsx
```tsx
import React from 'react';
import { Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import { CatalogEntityPage, CatalogIndexPage } from '@backstage/plugin-catalog';
import { TemplateBuilderPage } from '@internal/plugin-backstage-template-builder';
import { FlatRoutes } from '@backstage/core-app-api';

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route path="/template-builder" element={<TemplateBuilderPage />} />
    {/* ... other routes ... */}
  </FlatRoutes>
);

const App = () => <AppProvider>{routes}</AppProvider>;
export default App;
```

### packages/app/src/components/Root/Root.tsx
```tsx
import React from 'react';
import { Sidebar, SidebarItem } from '@backstage/core-components';
import HomeIcon from '@material-ui/icons/Home';
import BuildIcon from '@material-ui/icons/Build';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarItem icon={HomeIcon} to="/" text="Home" />
      <SidebarItem icon={CreateComponentIcon} to="create" text="Create" />
      <SidebarItem icon={BuildIcon} to="template-builder" text="Template Builder" />
      {/* ... other items ... */}
    </Sidebar>
    {children}
  </SidebarPage>
);
```

## Comparison: Backstage vs RHDH

| Feature | Backstage | RHDH |
|---------|-----------|------|
| **Installation** | NPM/Workspace | OCI Image on Quay |
| **Integration** | Code changes required | Config-only |
| **Build Time** | Compile into app | Runtime loading |
| **Updates** | Rebuild app | Restart RHDH |
| **Best For** | Custom Backstage apps | Red Hat Developer Hub |

## Resources

- **Plugin Source**: https://github.com/balajisiva/backstage-template-builder
- **Backstage Docs**: https://backstage.io/docs/plugins/
- **Template Spec**: https://backstage.io/docs/features/software-templates/
- **RHDH Version**: See `QUAY-DEPLOYMENT.md`

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/balajisiva/backstage-template-builder/issues
- **Backstage Discord**: https://discord.gg/backstage
