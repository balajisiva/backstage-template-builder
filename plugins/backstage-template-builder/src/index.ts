export { templateBuilderPlugin, TemplateBuilderPage } from './plugin';
export { rootRouteRef } from './routes';

// Export permissions for RBAC configuration
export {
  templateBuilderUsePermission,
  templateBuilderCreatePermission,
  templateBuilderUpdatePermission,
  templateBuilderPermissions,
} from './permissions';

// Export for RHDH dynamic plugin compatibility
export { DynamicPluginRoot as PluginRoot } from './DynamicPluginRoot';
