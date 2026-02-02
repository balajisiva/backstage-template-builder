# Deployment Comparison - Template Builder Plugin

Quick reference for deploying the Template Builder plugin to different platforms.

## Choose Your Platform

### ✅ Using Red Hat Developer Hub (RHDH)?
**→ See [QUAY-DEPLOYMENT.md](./QUAY-DEPLOYMENT.md)**

- **Plugin Image**: `quay.io/balajisivarh/backstage-template-builder:0.1.0`
- **Installation**: Config-only, no code changes
- **Update Process**: Push new image, restart RHDH

### ✅ Using Standard Backstage?
**→ See [BACKSTAGE-DEPLOYMENT.md](./BACKSTAGE-DEPLOYMENT.md)**

- **Installation**: NPM or workspace integration
- **Integration**: Code changes in App.tsx and Root.tsx
- **Update Process**: Rebuild and redeploy app

## Quick Comparison

| Aspect | RHDH | Backstage |
|--------|------|-----------|
| **Installation** | `quay.io/balajisivarh/backstage-template-builder:0.1.0` | `yarn add @internal/plugin-backstage-template-builder` |
| **Configuration** | `app-config.yaml` only | Code changes + config |
| **Build Required** | No | Yes |
| **Hot Reload** | Restart RHDH | Rebuild app |
| **Deployment** | 2 minutes | 15-30 minutes |
| **Best For** | Production, enterprise | Custom Backstage apps |

## RHDH Deployment (Simplest)

```yaml
# app-config.yaml
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

**That's it!** Plugin loads at runtime from Quay.

## Backstage Deployment

1. **Install**:
   ```bash
   yarn workspace app add @internal/plugin-backstage-template-builder
   ```

2. **Add Route** (App.tsx):
   ```tsx
   import { TemplateBuilderPage } from '@internal/plugin-backstage-template-builder';

   <Route path="/template-builder" element={<TemplateBuilderPage />} />
   ```

3. **Add Menu** (Root.tsx):
   ```tsx
   import BuildIcon from '@material-ui/icons/Build';

   <SidebarItem icon={BuildIcon} to="template-builder" text="Template Builder" />
   ```

4. **Build and Run**:
   ```bash
   yarn dev
   ```

## Feature Compatibility

All features work on both platforms:

- ✅ Visual template builder
- ✅ Live YAML preview
- ✅ GitHub integration
- ✅ Custom actions manager
- ✅ End-user preview
- ✅ Flow view
- ✅ RBAC support (where available)

## Update Workflow

### RHDH
```bash
# 1. Rebuild plugin locally
cd /Users/basivasu/Documents/rhdh-factory-config
podman run ... --push-images

# 2. Or manually push
podman build -t quay.io/balajisivarh/backstage-template-builder:0.2.0
podman push quay.io/balajisivarh/backstage-template-builder:0.2.0

# 3. Update app-config.yaml version (if needed)
# 4. Restart RHDH
```

### Backstage
```bash
# 1. Update plugin code
# 2. Rebuild
yarn workspace @internal/plugin-backstage-template-builder build

# 3. Rebuild app
yarn workspace app build

# 4. Redeploy
```

## Migration Between Platforms

### From Backstage to RHDH
1. Deploy plugin to Quay (already done!)
2. Remove code changes from App.tsx and Root.tsx
3. Add dynamic plugin config to app-config.yaml
4. Restart RHDH

### From RHDH to Backstage
1. Install plugin via NPM/workspace
2. Add code changes to App.tsx and Root.tsx
3. Remove dynamic plugin config
4. Rebuild and deploy

## Recommendation

| Use Case | Recommended Platform | Reason |
|----------|---------------------|--------|
| **Enterprise/Production** | RHDH | Easier updates, no rebuilds |
| **Quick Testing** | RHDH | 2-minute setup |
| **Custom Backstage App** | Backstage | More control, static integration |
| **Plugin Development** | Backstage | Faster iteration with hot reload |
| **Multiple Instances** | RHDH | Update once, applies everywhere |

## Common Questions

**Q: Can I use the RHDH version in regular Backstage?**
A: No, they use different plugin systems. Use the source plugin for Backstage.

**Q: Do I need both deployment methods?**
A: No, choose based on your platform (RHDH or Backstage).

**Q: Can I switch between them?**
A: Yes! The same source code supports both. Just deploy differently.

**Q: Which is easier?**
A: RHDH deployment is simpler - just config, no code changes.

**Q: Which gives me more control?**
A: Backstage deployment - you can customize the integration code.

## Links

- **RHDH Deployment**: [QUAY-DEPLOYMENT.md](./QUAY-DEPLOYMENT.md)
- **Backstage Deployment**: [BACKSTAGE-DEPLOYMENT.md](./BACKSTAGE-DEPLOYMENT.md)
- **RHDH Technical Details**: [RHDH-DEPLOYMENT.md](./RHDH-DEPLOYMENT.md)
- **Plugin Source**: https://github.com/balajisiva/backstage-template-builder
- **Quay Repository**: https://quay.io/repository/balajisivarh/backstage-template-builder
