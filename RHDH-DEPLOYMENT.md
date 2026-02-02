# RHDH Dynamic Plugin Deployment Guide

## Overview

The Template Builder plugin has been successfully converted to an RHDH (Red Hat Developer Hub) dynamic plugin using the official [rhdh-dynamic-plugin-factory](https://github.com/redhat-developer/rhdh-dynamic-plugin-factory).

## Build Output

- **Package**: `internal-plugin-backstage-template-builder-dynamic-0.1.0.tgz` (1.5 MB)
- **Integrity**: `internal-plugin-backstage-template-builder-dynamic-0.1.0.tgz.integrity`
- **Plugin Name**: `internal.plugin-backstage-template-builder`
- **Version**: `0.1.0`

## Deployment Options

### Option 1: URL-based Installation (Recommended for Testing)

1. **Host the plugin package** on a web server accessible to your RHDH instance:
   ```bash
   # Example: Using a simple HTTP server
   python3 -m http.server 8000
   ```

2. **Configure RHDH** to load the plugin by editing your `app-config.yaml`:
   ```yaml
   dynamicPlugins:
     frontend:
       internal.plugin-backstage-template-builder:
         dynamicRoutes:
           - path: /template-builder
             importName: TemplateBuilderPage
         menuItems:
           - title: Template Builder
             text: Template Builder
             icon: build
   ```

3. **Add the plugin package URL** to your dynamic plugins configuration:
   ```yaml
   dynamicPlugins:
     plugins:
       - package: 'http://localhost:8000/internal-plugin-backstage-template-builder-dynamic-0.1.0.tgz'
         disabled: false
   ```

### Option 2: Container Registry (Production)

1. **Push to a container registry** (the factory can build OCI images):
   ```bash
   # Re-run the factory with --push-images flag
   # First, configure your registry credentials
   podman login quay.io

   # Then run factory with push enabled
   cd /Users/basivasu/Documents/rhdh-factory-config
   podman run --rm \
     -v "$(pwd):/config:z" \
     -v "$HOME/.docker/config.json:/root/.docker/config.json:z" \
     quay.io/rhdh-community/dynamic-plugins-factory:latest \
     --config-dir /config \
     --repo-path /source \
     --workspace-path . \
     --output-dir /output \
     --push-images
   ```

2. **Configure RHDH** to pull from the registry:
   ```yaml
   dynamicPlugins:
     plugins:
       - package: 'oci://quay.io/your-org/internal-plugin-backstage-template-builder:0.1.0'
         disabled: false
   ```

### Option 3: Local File Mount (Development)

1. **Copy the plugin to RHDH's dynamic plugins directory**:
   ```bash
   # If running RHDH locally
   mkdir -p /path/to/rhdh/dynamic-plugins
   cp internal-plugin-backstage-template-builder-dynamic-0.1.0.tgz \
      /path/to/rhdh/dynamic-plugins/
   ```

2. **Configure RHDH** to load from local file:
   ```yaml
   dynamicPlugins:
     plugins:
       - package: 'file:///dynamic-plugins/internal-plugin-backstage-template-builder-dynamic-0.1.0.tgz'
         disabled: false
   ```

## Plugin Configuration

After deploying the plugin, configure it in your `app-config.yaml`:

```yaml
# Template Builder Plugin Configuration
templateBuilder:
  # Optional: Configure custom actions catalog
  customActions:
    enabled: true

  # Optional: GitHub integration
  github:
    # Users will provide their own PAT via the UI
    # No server-side configuration required

# Add to the app routes
dynamicPlugins:
  frontend:
    internal.plugin-backstage-template-builder:
      dynamicRoutes:
        - path: /template-builder
          importName: TemplateBuilderPage
          menuItem:
            text: Template Builder
            icon: build
```

## Rebuilding the Plugin

To rebuild the dynamic plugin after making changes:

1. **Commit changes** to the GitHub repository:
   ```bash
   git add .
   git commit -m "Update plugin"
   git push
   ```

2. **Run the factory** again:
   ```bash
   cd /Users/basivasu/Documents/rhdh-factory-config
   podman run --rm \
     -v "$(pwd):/config:z" \
     -v "$HOME/rhdh-plugin-build:/output:z" \
     quay.io/rhdh-community/dynamic-plugins-factory:latest \
     --config-dir /config \
     --repo-path /source \
     --workspace-path . \
     --output-dir /output
   ```

3. **New package** will be in `~/rhdh-plugin-build/`

## Factory Configuration Files

The factory uses these configuration files in `/Users/basivasu/Documents/rhdh-factory-config/`:

### source.json
```json
{
  "repo": "https://github.com/balajisiva/backstage-template-builder",
  "repo-ref": "main"
}
```

### plugins-list.yaml
```yaml
# Template Builder plugin with embedded dependencies
plugins/backstage-template-builder: --embed-package @types/js-yaml --embed-package @types/uuid
```

## Features

The dynamic plugin includes:

- **Visual Template Builder**: Drag-and-drop interface for creating Backstage templates
- **Live YAML Preview**: Real-time preview of template YAML
- **GitHub Integration**: Pull/push templates to/from GitHub repositories
- **Custom Actions**: Support for custom scaffolder actions
- **End-User Preview**: Simulated Backstage wizard for testing templates
- **Flow View**: Visual pipeline diagram of template steps
- **RBAC Support**: Permission-aware template management

## Permissions

The plugin respects Backstage RBAC permissions:

- `catalog.entity.create`: Required to create new templates
- `catalog.entity.delete`: Required to delete templates
- `catalog.entity.read`: Required to view templates

Configure these in your RHDH permission policy.

## Troubleshooting

### Plugin Not Loading

1. Check RHDH logs for errors:
   ```bash
   kubectl logs -f deployment/rhdh-server
   ```

2. Verify the plugin package is accessible from RHDH

3. Check that the plugin name matches in `app-config.yaml`

### Rebuild Errors

If the factory fails:

1. Check that all RHDH-specific files are committed to GitHub:
   - `plugins/backstage-template-builder/src/rhdh-entry.ts`
   - `plugins/backstage-template-builder/src/DynamicPluginRoot.tsx`
   - `plugins/backstage-template-builder/src/rhdh-dynamic-wrapper.tsx`

2. Verify the repository structure is a valid Backstage workspace

3. Check factory logs for specific error messages

## Resources

- [RHDH Dynamic Plugin Factory](https://github.com/redhat-developer/rhdh-dynamic-plugin-factory)
- [RHDH Documentation](https://docs.redhat.com/en/documentation/red_hat_developer_hub)
- [Backstage Plugin Development](https://backstage.io/docs/plugins/)
