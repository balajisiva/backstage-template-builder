# Quick Deployment Guide - Template Builder on RHDH

## Your Plugin is on Quay.io!

**Image**: `quay.io/balajisivarh/backstage-template-builder:0.1.0`

## Simple 2-Step Deployment

### Step 1: Make the Repository Public (Recommended for Testing)

Go to https://quay.io/repository/balajisivarh/backstage-template-builder?tab=settings and make it public so RHDH can pull it without credentials.

### Step 2: Add to Your RHDH Configuration

Add this to your `app-config.yaml`:

```yaml
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

That's it! RHDH will automatically pull and load the plugin.

## Alternative: Private Repository

If you want to keep it private, configure image pull secrets in your RHDH deployment:

```yaml
# In your Helm values or deployment config
imagePullSecrets:
  - name: quay-secret
```

Create the secret:
```bash
kubectl create secret docker-registry quay-secret \
  --docker-server=quay.io \
  --docker-username=balajisivarh+templatebuilder \
  --docker-password=YOUR_ROBOT_TOKEN
```

## Accessing the Plugin

After RHDH restarts, navigate to:
- **URL**: `https://your-rhdh-instance/template-builder`
- **Menu**: Look for "Template Builder" in the sidebar

## Updating the Plugin

To update the plugin:

1. **Push changes** to GitHub
2. **Rebuild** using the factory (or manually as we did)
3. **Push new version** to Quay:
   ```bash
   podman tag quay.io/balajisivarh/backstage-template-builder:0.1.0 \
              quay.io/balajisivarh/backstage-template-builder:0.2.0
   podman push quay.io/balajisivarh/backstage-template-builder:0.2.0
   ```
4. **Update** app-config.yaml to reference the new version
5. **Restart** RHDH

## Quick Rebuild Script

Save this to rebuild and push updates:

```bash
#!/bin/bash
# rebuild-plugin.sh

VERSION=${1:-0.1.0}

cd /Users/basivasu/Documents/backstage-template-builder

# Build container with plugin
mkdir -p /tmp/plugin-image
cp internal-plugin-backstage-template-builder-dynamic-${VERSION}.tgz /tmp/plugin-image/
cd /tmp/plugin-image

cat > Dockerfile <<EOF
FROM scratch
COPY internal-plugin-backstage-template-builder-dynamic-${VERSION}.tgz /
EOF

podman build --platform linux/amd64 \
  -t quay.io/balajisivarh/backstage-template-builder:${VERSION} .

# Push to Quay
podman push quay.io/balajisivarh/backstage-template-builder:${VERSION}

echo "✓ Plugin pushed to quay.io/balajisivarh/backstage-template-builder:${VERSION}"
```

Usage:
```bash
chmod +x rebuild-plugin.sh
./rebuild-plugin.sh 0.2.0
```

## Verification

Check your plugin is available:
```bash
podman search quay.io/balajisivarh/backstage-template-builder
```

View on Quay:
https://quay.io/repository/balajisivarh/backstage-template-builder
