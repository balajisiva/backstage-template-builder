# RBAC Configuration for Template Builder

This document explains how to configure Role-Based Access Control (RBAC) for the Template Builder plugin to restrict access to platform engineers only.

## Overview

The Template Builder plugin uses Backstage's permission system to control access. By default, the plugin defines the following permissions:

- `template.builder.use` - Basic access to view and use the Template Builder
- `template.builder.create` - Permission to create new templates
- `template.builder.update` - Permission to edit existing templates

## Prerequisites

- Backstage permission framework must be enabled in your instance
- `@backstage/plugin-permission-backend` installed and configured
- `@backstage/plugin-permission-node` for policy configuration

## Configuration

### Step 1: Install Permission Backend Plugin

If you haven't already, install the permission backend plugin:

```bash
cd packages/backend
yarn add @backstage/plugin-permission-backend @backstage/plugin-permission-node
```

### Step 2: Configure Permission Policy

Create or update your permission policy in `packages/backend/src/plugins/permission.ts`:

```typescript
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';
import { templateBuilderPermissions } from '@internal/plugin-backstage-template-builder';

class CustomPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    // Check if this is a Template Builder permission
    if (templateBuilderPermissions.some(p => p.name === request.permission.name)) {
      // Option 1: Check if user is in platform-engineers group
      const userGroups = user?.identity.ownershipEntityRefs || [];
      if (userGroups.some(ref => ref === 'group:default/platform-engineers')) {
        return { result: AuthorizeResult.ALLOW };
      }

      // Option 2: Check if user has specific entity annotation
      // const userEntity = await catalogClient.getEntityByRef(user?.identity.userEntityRef);
      // if (userEntity?.metadata.annotations?.['backstage.io/role'] === 'platform-engineer') {
      //   return { result: AuthorizeResult.ALLOW };
      // }

      // Deny access by default
      return { result: AuthorizeResult.DENY };
    }

    // Allow all other permissions (customize as needed)
    return { result: AuthorizeResult.ALLOW };
  }
}

export default CustomPermissionPolicy;
```

### Step 3: Register Permission Backend

In `packages/backend/src/index.ts`, add:

```typescript
import permission from './plugins/permission';

// ...

async function main() {
  // ...
  const permissionEnv = useHotMemoize(module, () => createEnv('permission'));

  const apiRouter = Router();
  // ...
  apiRouter.use('/permission', await permission(permissionEnv));
  // ...
}
```

### Step 4: Create Platform Engineers Group

In your catalog, create a group for platform engineers:

**`catalog-info.yaml`:**
```yaml
apiVersion: backstage.io/v1alpha1
kind: Group
metadata:
  name: platform-engineers
  description: Platform Engineering team with access to Template Builder
spec:
  type: team
  profile:
    displayName: Platform Engineers
  children: []
  members:
    - user:default/jane.doe
    - user:default/john.smith
```

### Step 5: Assign Users to Group

Update user entities to include them in the platform-engineers group:

**`users.yaml`:**
```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: jane.doe
spec:
  profile:
    displayName: Jane Doe
    email: jane.doe@example.com
  memberOf:
    - platform-engineers
```

## Alternative Configuration Options

### Using Custom Annotations

Instead of groups, you can use entity annotations:

```typescript
// In permission policy
const userEntity = await catalogClient.getEntityByRef(user?.identity.userEntityRef);
if (userEntity?.metadata.annotations?.['company.com/template-builder'] === 'enabled') {
  return { result: AuthorizeResult.ALLOW };
}
```

Then annotate user entities:
```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: jane.doe
  annotations:
    company.com/template-builder: "enabled"
```

### Using External Authorization

For enterprise setups with external identity providers:

```typescript
// Check against external system
const hasAccess = await checkExternalPermission(user?.identity.userEntityRef, 'template-builder');
if (hasAccess) {
  return { result: AuthorizeResult.ALLOW };
}
```

## Testing RBAC

### Verify Permissions Work

1. **Test as authorized user:**
   - Log in as a user in the `platform-engineers` group
   - Navigate to `/template-builder`
   - You should see the Template Builder interface

2. **Test as unauthorized user:**
   - Log in as a regular user (not in platform-engineers group)
   - Navigate to `/template-builder`
   - You should see an "Access Denied" message

### Debug Permission Issues

Enable debug logging for permissions:

```typescript
// In app-config.yaml
backend:
  # ...

permission:
  enabled: true

# Enable debug logging
logging:
  level: debug
```

Check backend logs when accessing the plugin to see permission decisions.

## Red Hat Developer Hub (RHDH)

For RHDH installations, RBAC is configured differently. See the [RHDH RBAC documentation](https://access.redhat.com/documentation/en-us/red_hat_developer_hub/1.0/html/administration_guide_for_red_hat_developer_hub/rhdh-rbac) for details.

**Example RHDH RBAC policy:**

```yaml
# rbac-policy.csv
p, role:default/platform-engineer, template.builder.use, use, allow
p, role:default/platform-engineer, template.builder.create, create, allow
p, role:default/platform-engineer, template.builder.update, update, allow

g, user:default/jane.doe, role:default/platform-engineer
g, user:default/john.smith, role:default/platform-engineer
```

## Permissions Reference

| Permission | Action | Description |
|------------|--------|-------------|
| `template.builder.use` | `read` | Basic access to view and use the Template Builder UI |
| `template.builder.create` | `create` | Permission to create new templates |
| `template.builder.update` | `update` | Permission to edit existing templates |

## Troubleshooting

### Permission denied but user is in correct group

1. Check that the permission backend is properly configured
2. Verify the user's entity has the correct `memberOf` references
3. Check backend logs for permission evaluation details
4. Ensure the catalog has been refreshed after group changes

### Plugin doesn't enforce permissions

1. Verify `@backstage/plugin-permission-react` is installed
2. Check that the permission policy is returning decisions for Template Builder permissions
3. Ensure the permission backend route is properly registered

## Security Considerations

- **Principle of Least Privilege**: Only grant Template Builder access to users who need it
- **Audit Trail**: Consider implementing permission event logging
- **Regular Reviews**: Periodically review who has access and remove as needed
- **Token Storage**: The plugin stores GitHub tokens in browser localStorage - ensure users understand security implications
- **Sensitive Operations**: Consider requiring additional authentication for pushing templates to production repositories

## Further Reading

- [Backstage Permissions Documentation](https://backstage.io/docs/permissions/overview)
- [Writing Permission Policies](https://backstage.io/docs/permissions/writing-a-policy)
- [RBAC Best Practices](https://backstage.io/docs/permissions/plugin-authors/03-adding-a-resource-permission-check)
