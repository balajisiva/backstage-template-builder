# Installing Backstage Template Builder in RHDH

There are two ways to use this plugin with Red Hat Developer Hub (RHDH):

## Option 1: Standard Backstage Plugin Integration (Recommended)

If you're running RHDH from source or building a custom RHDH image:

### Step 1: Clone the Plugin

```bash
git clone https://github.com/balajisiva/backstage-template-builder.git
cd backstage-template-builder
```

### Step 2: Copy Plugin to Your RHDH Instance

```bash
# Copy the plugin folder to your RHDH plugins directory
cp -r plugins/backstage-template-builder <your-rhdh-source>/plugins/
```

### Step 3: Add Plugin Dependency

In your RHDH app's `packages/app/package.json`:

```json
{
  "dependencies": {
    "@internal/plugin-backstage-template-builder": "^0.1.0"
  }
}
```

### Step 4: Configure the Route

In `packages/app/src/App.tsx`:

```tsx
import { TemplateBuilderPage } from '@internal/plugin-backstage-template-builder';

// Inside <FlatRoutes>
<Route path="/template-builder" element={<TemplateBuilderPage />} />
```

### Step 5: Add to Sidebar (Optional)

In `packages/app/src/components/Root/Root.tsx`:

```tsx
import CodeIcon from '@material-ui/icons/Code';

// Inside <SidebarPage>
<SidebarItem icon={CodeIcon} to="/template-builder" text="Template Builder" />
```

### Step 6: Install and Build

```bash
cd <your-rhdh-source>
yarn install
yarn build
```

### Step 7: Run RHDH

```bash
yarn dev
# or
yarn start
```

Access the plugin at: `http://localhost:7007/template-builder`

## Option 2: Dynamic Plugin (Advanced - Requires Scalprum Build)

**Note:** This method requires packaging the plugin with RHDH's scalprum module federation system. This is not currently supported by the standard Backstage CLI.

For RHDH dynamic plugins, you would need to:

1. Use RHDH's plugin build system to create a scalprum-compatible package
2. Package as a dynamic plugin with proper metadata
3. Configure in `dynamic-plugins.yaml`

**This approach is currently being explored and will be documented once available.**

## Option 3: Use in Backstage (Not RHDH Specific)

This plugin works out-of-the-box with standard Backstage instances. Follow the main [README.md](../../../README.md) installation instructions.

## Troubleshooting

### Plugin not appearing in RHDH

1. **Verify installation:**
   ```bash
   # Check plugin is in workspace
   ls plugins/backstage-template-builder

   # Verify package.json dependency
   grep "backstage-template-builder" packages/app/package.json
   ```

2. **Clear cache and rebuild:**
   ```bash
   yarn clean
   yarn install
   yarn build
   ```

3. **Check RHDH logs** for any errors loading the plugin

### Build errors

If you encounter TypeScript errors:

```bash
cd plugins/backstage-template-builder
rm -rf dist dist-types node_modules
yarn install
yarn build
```

## Support

For RHDH-specific issues:
- Red Hat Customer Portal: https://access.redhat.com/support
- RHDH Documentation: https://docs.redhat.com/en/documentation/red_hat_developer_hub/

For plugin issues:
- GitHub Issues: https://github.com/balajisiva/backstage-template-builder/issues
