# Integration Guide

This document explains how to integrate the Backstage Template Builder plugin into your Backstage application.

## Plugin Structure

The plugin has been converted from a standalone Next.js app to a Backstage frontend plugin. The structure follows Backstage conventions:

```
plugins/backstage-template-builder/
├── package.json              # Plugin package with Backstage dependencies
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Plugin documentation
├── src/
│   ├── index.ts             # Main plugin export
│   ├── plugin.ts            # Plugin definition and registration
│   ├── routes.ts            # Route references
│   ├── components/          # All UI components (unchanged from Next.js app)
│   ├── lib/                 # Business logic (GitHub client updated)
│   ├── store/               # State management (unchanged)
│   └── types/               # TypeScript types (unchanged)
└── dev/
    └── index.tsx            # Standalone dev environment
```

## What Changed

### ✅ Kept As-Is (95% of code)
- All UI components in `components/builder/` and `components/panels/`
- State management (`store/template-store.ts`)
- YAML utilities (`lib/yaml-utils.ts`)
- Actions catalog (`lib/actions-catalog.ts`)
- TypeScript types (`types/template.ts`)
- All Tailwind CSS styling

### ⚙️ Modified
1. **Import paths** — Changed from Next.js `@/` aliases to relative imports
2. **Removed `'use client'`** directives (not needed in Backstage)
3. **GitHub client** (`lib/github-client.ts`) — Now calls GitHub API directly instead of Next.js API routes
4. **Plugin structure** — Added Backstage plugin registration files

### ➕ Added
1. `plugin.ts` — Backstage plugin definition
2. `routes.ts` — Route references
3. `index.ts` — Plugin exports
4. `components/TemplateBuilderPage/` — Thin wrapper component
5. `dev/index.tsx` — Standalone development setup
6. `package.json` — Backstage dependencies

## Integration Steps

### Option 1: Copy Plugin to Backstage Monorepo

If you have a Backstage monorepo:

1. Copy the entire `plugins/backstage-template-builder` folder to your Backstage repo's `plugins/` directory

2. In the root `package.json` of your Backstage monorepo, add to workspaces:
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

3. Run `yarn install` from the monorepo root

4. Add to `packages/app/package.json`:
   ```json
   {
     "dependencies": {
       "@internal/plugin-backstage-template-builder": "^0.1.0"
     }
   }
   ```

5. In `packages/app/src/App.tsx`:
   ```tsx
   import { TemplateBuilderPage } from '@internal/plugin-backstage-template-builder';

   // In your routes
   <Route path="/template-builder" element={<TemplateBuilderPage />} />
   ```

6. (Optional) Add to sidebar in `packages/app/src/components/Root/Root.tsx`:
   ```tsx
   import CodeIcon from '@material-ui/icons/Code';

   <SidebarItem icon={CodeIcon} to="/template-builder" text="Template Builder" />
   ```

### Option 2: Standalone Development

To develop the plugin in isolation:

```bash
cd plugins/backstage-template-builder
yarn install
yarn start
```

This runs the plugin at http://localhost:3000 using Backstage's dev utilities.

## GitHub API Considerations

The plugin now calls GitHub API directly from the browser. This means:

### ✅ Pros
- No backend service needed
- Simpler deployment
- Works immediately in any Backstage instance

### ⚠️ Potential Issues
- **CORS**: GitHub API should work, but if you encounter CORS issues, you may need to add a backend proxy
- **Rate limiting**: Direct API calls count against the user's GitHub rate limit
- **Token storage**: Tokens are stored in localStorage (consider using Backstage's identity/auth if needed)

### Future Enhancement: Backend Proxy

If you need to avoid CORS or rate limiting issues, you can create a Backstage backend plugin that proxies GitHub API calls. This would be a separate effort.

## Styling

The plugin uses Tailwind CSS (same as the original Next.js app). You may need to ensure Tailwind is configured in your Backstage app, or the styles are included in the plugin build.

If you prefer to use Backstage's Material-UI components instead, that would require additional refactoring.

## Next Steps

1. ✅ Plugin structure created
2. ✅ Components migrated
3. ✅ GitHub client updated
4. ⏭️ Test in standalone mode (`yarn start`)
5. ⏭️ Integrate into Backstage app
6. ⏭️ Test GitHub integration (token, loading, pushing)
7. ⏭️ (Optional) Add backend proxy if needed
8. ⏭️ (Optional) Migrate to Material-UI for consistent Backstage look

## Troubleshooting

### Import errors
Make sure all relative paths are correct. The plugin uses `../../` style imports instead of `@/` aliases.

### GitHub API errors
- Check that the token has correct scopes
- Verify CORS isn't blocking requests
- Check browser console for specific error messages

### Plugin not showing in Backstage
- Ensure the plugin is added to `packages/app/package.json`
- Run `yarn install` in the app directory
- Check that the route is added to `App.tsx`
- Restart the Backstage dev server

## Support

For issues or questions:
- GitHub Issues: https://github.com/balajisiva/backstage-template-builder/issues
- Backstage Discord: https://discord.gg/backstage
