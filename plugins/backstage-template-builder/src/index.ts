import './styles.css';

export { templateBuilderPlugin, TemplateBuilderPage } from './plugin';
export { default as Description } from '@material-ui/icons/Description';
export { rootRouteRef } from './routes';

// Export permissions for RBAC configuration
export {
  templateBuilderUsePermission,
  templateBuilderCreatePermission,
  templateBuilderUpdatePermission,
  templateBuilderPermissions,
} from './permissions';

// Export PluginRoot for RHDH dynamic plugin
import { TemplateBuilderPage } from './plugin';
import Description from '@material-ui/icons/Description';

export const PluginRoot = {
  TemplateBuilderPage,
  Description,
};
