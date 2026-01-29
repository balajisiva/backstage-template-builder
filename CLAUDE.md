# Backstage Template Builder - Claude Code Context

## Project Overview
A **visual builder for Backstage.io software templates** built with Next.js 16 (App Router), TypeScript, and Tailwind CSS. Users can visually create, edit, and manage Backstage scaffolder templates (`scaffolder.backstage.io/v1beta3`) with drag-and-drop, live YAML preview, GitHub sync, and end-user preview.

## Tech Stack
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict)
- **Tailwind CSS** (dark theme)
- **@dnd-kit/core + @dnd-kit/sortable** for drag-and-drop
- **js-yaml** for YAML parse/serialize
- **uuid** for ID generation
- **lucide-react** for icons

## Dev Server
```bash
npx next dev --port 3000
```

## Architecture

### Core Data Flow
`TemplateProvider` (React Context) → `useReducer` state → components dispatch actions → YAML auto-generated on state change

### Key Files

**Types & Models:**
- `src/types/template.ts` — Core TypeScript types: `BackstageTemplate`, `ParameterStep`, `ParameterProperty`, `TemplateStep`, `TemplateOutput`, `ActionDefinition`, etc. Metadata supports `annotations?: Record<string, string>` for template versioning.

**State Management:**
- `src/store/template-store.ts` — React `useReducer` with 25+ action types. Context provider via `TemplateContext`. Key actions: `SET_TEMPLATE`, `UPDATE_METADATA`, `UPDATE_SPEC`, `ADD_STEP`, `REORDER_STEPS`, `SET_TAB`, `MARK_CLEAN`, etc.

**Data Utilities:**
- `src/lib/yaml-utils.ts` — `templateToYaml()`, `yamlToTemplate()`, `createBlankTemplate()`. Handles annotations, parameter steps with `ui:` extensions, steps with inputs, output links.
- `src/lib/actions-catalog.ts` — `BUILT_IN_ACTIONS` (20+ Backstage scaffolder actions), `UI_FIELDS`, `UI_WIDGETS`. Custom actions support: `getCustomActions()`, `saveCustomActions()`, `addCustomAction()`, `removeCustomAction()`, `getAllActions()` (merges built-in + custom from localStorage).
- `src/lib/github-client.ts` — Client-side GitHub API wrapper. Token stored in **localStorage** (`gh_pat` key). Functions: `validateToken`, `listRepos`, `getFile`, `putFile`, `listBranches`, `createBranch`, `listContents`, `parseGitHubUrl`. All calls go through `/api/github` proxy. `validateToken` has 10s timeout.

**API Route:**
- `src/app/api/github/route.ts` — Next.js API route proxying GitHub REST API to avoid CORS. GET: fetches raw files. POST: authenticated operations (`validate-token`, `list-repos`, `get-file`, `put-file`, `list-branches`, `create-branch`, `list-contents`, `get-repo`).

**Layout & Navigation:**
- `src/app/page.tsx` — Entry point: `TemplateProvider` > `BuilderLayout`
- `src/app/layout.tsx` — Root layout with Geist fonts, dark `<html>` class
- `src/app/globals.css` — Dark theme, custom scrollbar styles
- `src/components/builder/BuilderLayout.tsx` — Main layout. Three view modes: Editor | Flow | Preview. Header buttons: New, Load Template, Custom Actions, Connect GitHub / Pull / Push, YAML toggle. Editor has tab sidebar (Metadata, Parameters, Steps, Output).

**Panels (Editor Mode):**
- `src/components/panels/MetadataPanel.tsx` — Name, title, **version** (stored as annotation `backstage.io/template-version`), description, owner, system, type, tags
- `src/components/panels/ParametersPanel.tsx` — Wizard steps with dnd-kit drag-drop reorder. FieldEditor with inline editing. FieldPalette for quick add.
- `src/components/panels/StepsPanel.tsx` — Pipeline steps with searchable action picker modal (uses `getAllActions()` for built-in + custom). StepDetailEditor with typed inputs. Drag-drop reorder.
- `src/components/panels/OutputPanel.tsx` — Output links editor (title, icon, url, entityRef)
- `src/components/panels/YamlPreview.tsx` — Live YAML output with copy, download, direct edit mode

**Visual Views:**
- `src/components/panels/FlowView.tsx` — Visual pipeline flow diagram. Color-coded nodes per action category. Arrow connectors. Drag-drop reorder. Click-through to editor.
- `src/components/panels/EndUserPreview.tsx` — Simulated Backstage wizard. Multi-step form, EntityPicker/RepoUrlPicker simulation, review phase, running animation, completion screen.

**GitHub Integration:**
- `src/components/builder/GitHubLoader.tsx` — Load Template modal with 3 tabs: Samples (10 Red Hat templates), From URL, **Browse Repo** (directory tree browser with breadcrumbs, branch selector, template.yaml highlighting, recently used repos in localStorage).
- `src/components/builder/GitHubSync.tsx` — Full sync modal (Connect/Pull/Push). PAT input with Classic/Fine-grained token instructions. Pull from URL or repo browser. Push with prominent file path, branch selection, new branch creation, commit message.

**Custom Actions:**
- `src/components/builder/CustomActionsManager.tsx` — Modal to manage custom scaffolder actions. Add manually (action ID, label, description, category, inputs). Import from URL or paste JSON/YAML. Persisted in localStorage.
- `src/components/builder/FieldPalette.tsx` — Click-to-add palette for basic types + Backstage UI fields

**Other:**
- `src/components/builder/TemplateProvider.tsx` — Context provider, auto-updates YAML preview on template changes

## Key Design Decisions
1. **localStorage** for GitHub token persistence (key: `gh_pat`) and custom actions (key: `custom_actions`) and recent repos (key: `recent_template_repos`)
2. **All GitHub API calls proxied** through `/api/github` Next.js route to avoid CORS
3. **dnd-kit** for drag-drop (not HTML5 drag) for better UX
4. **Dark theme** throughout (zinc-900/950 backgrounds)
5. **Backstage v1beta3 only** — the only currently supported scaffolder API version
6. Template version stored as `metadata.annotations['backstage.io/template-version']` (Backstage-idiomatic)

## Common Issues & Fixes History
- **GitHub "Resource not accessible"**: Token needs `repo` scope (Classic) or Contents R/W + Metadata R (Fine-grained)
- **Push path**: Smart default `{template-name}/template.yaml`, prominent full-width field
- **Empty push modal**: Fixed by showing connect form whenever `!user && !loading`
- **Token persistence**: Changed from `sessionStorage` to `localStorage`
- **Spinning connect button**: Added 10s timeout to `validateToken`, error message on stale token
