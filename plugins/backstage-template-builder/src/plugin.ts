import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const templateBuilderPlugin = createPlugin({
  id: 'backstage-template-builder',
  routes: {
    root: rootRouteRef,
  },
});

export const TemplateBuilderPage = templateBuilderPlugin.provide(
  createRoutableExtension({
    name: 'TemplateBuilderPage',
    component: () =>
      import('./components/TemplateBuilderPage').then(m => m.TemplateBuilderPage),
    mountPoint: rootRouteRef,
  }),
);
