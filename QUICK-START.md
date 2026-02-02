# Quick Start Reference Card

## 🎯 Your Plugin is Ready!

The Template Builder plugin works on **both RHDH and standard Backstage**.

---

## ⚡ RHDH (Fastest - 2 Minutes)

Your plugin is already on Quay.io!

### Step 1: Make Repository Public
https://quay.io/repository/balajisivarh/backstage-template-builder?tab=settings

### Step 2: Add to app-config.yaml
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

### Step 3: Restart RHDH
Done! Access at `/template-builder`

**📖 Full Guide**: [QUAY-DEPLOYMENT.md](./QUAY-DEPLOYMENT.md)

---

## 📦 Standard Backstage (15-30 Minutes)

### Step 1: Install
```bash
# From your Backstage root
cp -r /path/to/backstage-template-builder/plugins/backstage-template-builder \
      plugins/template-builder

# Or install from npm
yarn workspace app add @internal/plugin-backstage-template-builder
```

### Step 2: Add Route (App.tsx)
```tsx
import { TemplateBuilderPage } from '@internal/plugin-backstage-template-builder';

<Route path="/template-builder" element={<TemplateBuilderPage />} />
```

### Step 3: Add Menu (Root.tsx)
```tsx
import BuildIcon from '@material-ui/icons/Build';

<SidebarItem icon={BuildIcon} to="template-builder" text="Template Builder" />
```

### Step 4: Run
```bash
yarn dev
```

**📖 Full Guide**: [BACKSTAGE-DEPLOYMENT.md](./BACKSTAGE-DEPLOYMENT.md)

---

## 📚 All Documentation

| Guide | Purpose |
|-------|---------|
| **[QUAY-DEPLOYMENT.md](./QUAY-DEPLOYMENT.md)** | RHDH quick setup (recommended) |
| **[BACKSTAGE-DEPLOYMENT.md](./BACKSTAGE-DEPLOYMENT.md)** | Backstage integration guide |
| **[DEPLOYMENT-COMPARISON.md](./DEPLOYMENT-COMPARISON.md)** | Compare options & choose |
| **[RHDH-DEPLOYMENT.md](./RHDH-DEPLOYMENT.md)** | Technical details (advanced) |
| **[README.md](./README.md)** | Project overview & features |

---

## 🔗 Important Links

- **Quay Repository**: https://quay.io/repository/balajisivarh/backstage-template-builder
- **GitHub Repository**: https://github.com/balajisiva/backstage-template-builder
- **Plugin Image**: `quay.io/balajisivarh/backstage-template-builder:0.1.0`

---

## 💡 Quick Decision Guide

**Use RHDH deployment if:**
- ✅ You're using Red Hat Developer Hub
- ✅ You want the fastest setup (2 minutes)
- ✅ You want config-only installation
- ✅ You want easy updates without rebuilds

**Use Backstage deployment if:**
- ✅ You're using standard Backstage
- ✅ You want full integration control
- ✅ You're developing a custom Backstage app
- ✅ You need to customize the plugin integration

---

## 🆘 Need Help?

1. **Quick Questions**: Check [DEPLOYMENT-COMPARISON.md](./DEPLOYMENT-COMPARISON.md)
2. **RHDH Issues**: See [QUAY-DEPLOYMENT.md](./QUAY-DEPLOYMENT.md) troubleshooting
3. **Backstage Issues**: See [BACKSTAGE-DEPLOYMENT.md](./BACKSTAGE-DEPLOYMENT.md) troubleshooting
4. **GitHub Issues**: https://github.com/balajisiva/backstage-template-builder/issues

---

**Ready to deploy? Pick your platform above and follow the guide!** 🚀
