# Installing as RHDH Dynamic Plugin (Official Method)

This guide follows the official Red Hat Developer Hub documentation for installing third-party plugins as dynamic plugins.

## Prerequisites

- Red Hat Developer Hub 1.5 or higher
- Node.js 18+ and Yarn
- Access to RHDH local-plugins directory

## Step 1: Clone the Repository

```bash
git clone https://github.com/balajisiva/backstage-template-builder.git
cd backstage-template-builder/plugins/backstage-template-builder
```

## Step 2: Install Dependencies

```bash
yarn install

# Install React dependencies needed for the build
yarn add -D react react-dom react-router-dom
```

## Step 3: Export as Dynamic Plugin

Use the official Red Hat Developer Hub CLI to export the plugin:

```bash
npx @red-hat-developer-hub/cli@latest plugin export \
  --no-generate-module-federation-assets \
  --embed-package @types/js-yaml \
  --embed-package @types/uuid \
  --clean
```

This command will:
- Generate scalprum assets in `dist-dynamic/dist-scalprum/`
- Create a modified `package.json` for dynamic loading
- Embed type packages to avoid dependency conflicts
- Output is in the `dist-dynamic/` directory

**Expected output:**
```
✓ Packing main package to dist-dynamic/package.json
✓ Generating dynamic frontend plugin assets
✓ Created 27+ code-split chunks in dist-scalprum/static/
✓ Generated plugin-manifest.json and configSchema.json
```

## Step 4: Copy to RHDH Local Plugins

```bash
# Copy the exported plugin
cp -r dist-dynamic <path-to-rhdh>/local-plugins/backstage-template-builder

# Set permissions for container access
chmod -R 777 <path-to-rhdh>/local-plugins/backstage-template-builder
```

## Step 5: Configure Dynamic Plugin

Create or update `<rhdh-path>/configs/dynamic-plugins/dynamic-plugins.override.yaml`:

```yaml
# Dynamic plugins override configuration
includes:
  - dynamic-plugins.default.yaml
  - /dynamic-plugins-root/dynamic-plugins.extensions.yaml

plugins:
  # Backstage Template Builder Plugin
  - package: ./local-plugins/backstage-template-builder
    disabled: false
    pluginConfig:
      dynamicPlugins:
        frontend:
          internal.plugin-backstage-template-builder:
            dynamicRoutes:
              - path: /template-builder
                importName: PluginRoot
                menuItem:
                  icon: code
                  text: Template Builder
```

## Step 6: Restart RHDH

```bash
cd <path-to-rhdh>
docker compose down
docker compose up -d
```

## Step 7: Verify Installation

1. **Check logs for successful loading:**
   ```bash
   docker logs rhdh | grep "template-builder"
   ```

   Expected output:
   ```
   Loaded dynamic frontend plugin '@internal/plugin-backstage-template-builder-dynamic'
   ```

2. **Access the plugin:**
   - URL: `http://localhost:7007/template-builder`
   - Menu: Look for "Template Builder" in the RHDH sidebar

## Troubleshooting

### Plugin not loading

1. **Check RHDH logs:**
   ```bash
   docker logs rhdh 2>&1 | grep -i error
   ```

2. **Verify plugin structure:**
   ```bash
   ls -la <rhdh-path>/local-plugins/backstage-template-builder/
   ```

   Should contain:
   - `dist-scalprum/` directory
   - `package.json`
   - `README.md`

3. **Verify permissions:**
   ```bash
   chmod -R 777 <rhdh-path>/local-plugins/backstage-template-builder
   ```

### Export fails

1. **Ensure React dependencies are installed:**
   ```bash
   yarn add -D react react-dom react-router-dom
   ```

2. **Clean and retry:**
   ```bash
   rm -rf dist-dynamic
   npx @red-hat-developer-hub/cli@latest plugin export --clean
   ```

### Configuration not picked up

1. **Verify override file exists:**
   ```bash
   ls -la configs/dynamic-plugins/dynamic-plugins.override.yaml
   ```

2. **Check YAML syntax:**
   Ensure proper indentation and no tabs

3. **Restart containers:**
   ```bash
   docker compose down
   docker compose up -d
   ```

### 404 Error or Plugin Not Rendering

**IMPORTANT:** The `importName` in your configuration **must match** the exposed module name in the plugin's scalprum config.

This plugin exposes `PluginRoot` (not `TemplateBuilderPage`). Your configuration must use:

```yaml
dynamicRoutes:
  - path: /template-builder
    importName: PluginRoot  # ✅ Correct - matches scalprum exposedModules
    menuItem:
      icon: code
      text: Template Builder
```

**Incorrect configuration:**
```yaml
importName: TemplateBuilderPage  # ❌ Wrong - will cause 404
```

To verify the exposed module name, check the plugin's `package.json`:
```bash
cat local-plugins/backstage-template-builder/package.json | grep -A 3 "scalprum"
```

After fixing the configuration, clear Docker volumes and restart:
```bash
docker compose down
docker volume rm rhdh-local_dynamic-plugins-root
docker compose up -d
```

## What Gets Generated

The export process creates:

```
dist-dynamic/
├── dist/                           # Standard Backstage build
│   ├── index.esm.js
│   ├── plugin.esm.js
│   └── ...
├── dist-scalprum/                  # RHDH scalprum bundle
│   ├── internal.plugin-*.js        # Main plugin bundle
│   ├── plugin-manifest.json        # Plugin metadata
│   ├── configSchema.json           # Config schema
│   └── static/                     # Code-split chunks
│       ├── 956.*.chunk.js          # Component chunks
│       ├── 861.*.chunk.js
│       └── ...
├── package.json                    # Modified for dynamic loading
└── README.md                       # Plugin documentation
```

## References

- [Red Hat Developer Hub Documentation](https://docs.redhat.com/en/documentation/red_hat_developer_hub/1.8/html/installing_and_viewing_plugins_in_red_hat_developer_hub/assembly-third-party-plugins)
- [RHDH Plugin Export Utilities](https://github.com/redhat-developer/rhdh-plugin-export-utils)
- [Building Dynamic Plugins for Developer Hub](https://developers.redhat.com/articles/2025/11/20/how-build-your-dynamic-plug-ins-developer-hub)
- [Dynamic Plugins Factory](https://developers.redhat.com/articles/2026/01/15/introducing-dynamic-plug-ins-factory-developer-hub)

## Support

For RHDH-specific issues:
- Red Hat Customer Portal: https://access.redhat.com/support
- RHDH Documentation: https://docs.redhat.com/en/documentation/red_hat_developer_hub/

For plugin issues:
- GitHub Issues: https://github.com/balajisiva/backstage-template-builder/issues
