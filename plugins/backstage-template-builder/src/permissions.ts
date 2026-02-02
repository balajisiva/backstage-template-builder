import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Permission to access the Template Builder plugin
 *
 * By default, this permission should be granted to platform engineers only.
 */
export const templateBuilderUsePermission = createPermission({
  name: 'template.builder.use',
  attributes: {
    action: 'read',
  },
});

/**
 * Permission to create new templates
 */
export const templateBuilderCreatePermission = createPermission({
  name: 'template.builder.create',
  attributes: {
    action: 'create',
  },
});

/**
 * Permission to edit existing templates
 */
export const templateBuilderUpdatePermission = createPermission({
  name: 'template.builder.update',
  attributes: {
    action: 'update',
  },
});

/**
 * All Template Builder permissions
 */
export const templateBuilderPermissions = [
  templateBuilderUsePermission,
  templateBuilderCreatePermission,
  templateBuilderUpdatePermission,
];
