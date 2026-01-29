import { ActionDefinition, UIFieldDefinition } from '@/types/template';

export const BUILT_IN_ACTIONS: ActionDefinition[] = [
  // Fetch actions
  {
    action: 'fetch:template',
    label: 'Fetch Template',
    description: 'Downloads a skeleton directory and templates variables into files',
    category: 'fetch',
    inputs: [
      { name: 'url', label: 'Template URL', type: 'string', required: true, description: 'Relative or absolute URL to the template skeleton' },
      { name: 'targetPath', label: 'Target Path', type: 'string', description: 'Target path within the workspace' },
      { name: 'values', label: 'Template Values', type: 'object', description: 'Key-value pairs for template variables' },
      { name: 'copyWithoutTemplating', label: 'Copy Without Templating', type: 'array', description: 'Glob patterns of files to copy without processing' },
      { name: 'copyWithoutRender', label: 'Copy Without Render', type: 'array', description: 'Glob patterns of files to copy without rendering' },
    ],
  },
  {
    action: 'fetch:plain',
    label: 'Fetch Plain',
    description: 'Downloads content as-is without templating',
    category: 'fetch',
    inputs: [
      { name: 'url', label: 'Source URL', type: 'string', required: true, description: 'URL to fetch content from' },
      { name: 'targetPath', label: 'Target Path', type: 'string', description: 'Target path within the workspace' },
    ],
  },
  {
    action: 'fetch:plain:file',
    label: 'Fetch Plain File',
    description: 'Downloads a single file without templating',
    category: 'fetch',
    inputs: [
      { name: 'url', label: 'File URL', type: 'string', required: true },
      { name: 'targetPath', label: 'Target Path', type: 'string', required: true },
    ],
  },
  // Publish actions
  {
    action: 'publish:github',
    label: 'Publish to GitHub',
    description: 'Creates a new GitHub repository and pushes workspace content',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true, description: 'e.g. github.com?owner=org&repo=name' },
      { name: 'description', label: 'Description', type: 'string', description: 'Repository description' },
      { name: 'defaultBranch', label: 'Default Branch', type: 'string', default: 'main' },
      { name: 'allowedHosts', label: 'Allowed Hosts', type: 'array', description: 'List of allowed Git hosts' },
      { name: 'repoVisibility', label: 'Visibility', type: 'string', description: 'public, private, or internal' },
      { name: 'protectDefaultBranch', label: 'Protect Default Branch', type: 'boolean', default: true },
    ],
  },
  {
    action: 'publish:github:pull-request',
    label: 'GitHub Pull Request',
    description: 'Creates a pull request with workspace content to an existing repo',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'title', label: 'PR Title', type: 'string', required: true },
      { name: 'description', label: 'PR Description', type: 'string' },
      { name: 'branchName', label: 'Branch Name', type: 'string', required: true },
      { name: 'targetBranchName', label: 'Target Branch', type: 'string', default: 'main' },
    ],
  },
  {
    action: 'publish:gitlab',
    label: 'Publish to GitLab',
    description: 'Creates a new GitLab repository and pushes workspace content',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string' },
      { name: 'defaultBranch', label: 'Default Branch', type: 'string', default: 'main' },
      { name: 'repoVisibility', label: 'Visibility', type: 'string' },
    ],
  },
  {
    action: 'publish:gitlab:merge-request',
    label: 'GitLab Merge Request',
    description: 'Creates a merge request to an existing repo',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'title', label: 'MR Title', type: 'string', required: true },
      { name: 'description', label: 'MR Description', type: 'string' },
      { name: 'branchName', label: 'Branch Name', type: 'string', required: true },
      { name: 'targetBranchName', label: 'Target Branch', type: 'string', default: 'main' },
    ],
  },
  // Catalog actions
  {
    action: 'catalog:register',
    label: 'Register in Catalog',
    description: 'Registers entities from a catalog-info.yaml into the software catalog',
    category: 'catalog',
    inputs: [
      { name: 'repoContentsUrl', label: 'Repo Contents URL', type: 'string', required: true, description: 'URL to the repo contents, usually from publish step output' },
      { name: 'catalogInfoPath', label: 'Catalog Info Path', type: 'string', required: true, default: '/catalog-info.yaml' },
      { name: 'optional', label: 'Optional', type: 'boolean', default: false },
    ],
  },
  {
    action: 'catalog:write',
    label: 'Write Catalog Info',
    description: 'Writes a catalog-info.yaml file to the workspace',
    category: 'catalog',
    inputs: [
      { name: 'filePath', label: 'File Path', type: 'string', default: 'catalog-info.yaml' },
      { name: 'entity', label: 'Entity Definition', type: 'object', required: true },
    ],
  },
  {
    action: 'catalog:fetch',
    label: 'Fetch from Catalog',
    description: 'Returns entity or entities from the catalog',
    category: 'catalog',
    inputs: [
      { name: 'entityRef', label: 'Entity Reference', type: 'string', required: true },
      { name: 'optional', label: 'Optional', type: 'boolean', default: false },
    ],
  },
  // GitHub-specific actions
  {
    action: 'github:actions:dispatch',
    label: 'Dispatch GitHub Action',
    description: 'Dispatches a GitHub Actions workflow',
    category: 'github',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'workflowId', label: 'Workflow ID', type: 'string', required: true },
      { name: 'branchOrTagName', label: 'Branch or Tag', type: 'string', required: true },
    ],
  },
  {
    action: 'github:issues:create',
    label: 'Create GitHub Issue',
    description: 'Creates a GitHub issue',
    category: 'github',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'title', label: 'Issue Title', type: 'string', required: true },
      { name: 'body', label: 'Issue Body', type: 'string' },
      { name: 'labels', label: 'Labels', type: 'array' },
      { name: 'assignees', label: 'Assignees', type: 'array' },
    ],
  },
  // Debug actions
  {
    action: 'debug:log',
    label: 'Debug Log',
    description: 'Writes a message to the scaffolder log',
    category: 'debug',
    inputs: [
      { name: 'message', label: 'Message', type: 'string', required: true },
      { name: 'listWorkspace', label: 'List Workspace', type: 'boolean', default: false },
    ],
  },
  {
    action: 'debug:wait',
    label: 'Debug Wait',
    description: 'Pauses execution for a specified duration',
    category: 'debug',
    inputs: [
      { name: 'seconds', label: 'Seconds', type: 'string', description: 'Number of seconds to wait' },
    ],
  },
  // Filesystem actions
  {
    action: 'fs:delete',
    label: 'Delete Files',
    description: 'Deletes files or directories from the workspace',
    category: 'fs',
    inputs: [
      { name: 'files', label: 'Files', type: 'array', required: true, description: 'List of files/dirs to delete' },
    ],
  },
  {
    action: 'fs:rename',
    label: 'Rename Files',
    description: 'Renames files or directories in the workspace',
    category: 'fs',
    inputs: [
      { name: 'files', label: 'Files', type: 'object', required: true, description: 'Map of old name to new name' },
    ],
  },
  // More GitHub actions
  {
    action: 'github:webhook:create',
    label: 'Create GitHub Webhook',
    description: 'Creates a webhook for a GitHub repository',
    category: 'github',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'webhookUrl', label: 'Webhook URL', type: 'string', required: true },
      { name: 'events', label: 'Events', type: 'array', description: 'List of webhook events' },
      { name: 'active', label: 'Active', type: 'boolean', default: true },
    ],
  },
  {
    action: 'github:repo:create',
    label: 'Create GitHub Repository',
    description: 'Creates a GitHub repository without pushing content',
    category: 'github',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string' },
      { name: 'access', label: 'Access', type: 'string', description: 'Repository visibility' },
    ],
  },
  {
    action: 'github:environment:create',
    label: 'Create GitHub Environment',
    description: 'Creates a deployment environment in GitHub',
    category: 'github',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'name', label: 'Environment Name', type: 'string', required: true },
      { name: 'deploymentBranchPolicy', label: 'Branch Policy', type: 'object' },
    ],
  },
  {
    action: 'github:repo:push',
    label: 'Push to GitHub Repository',
    description: 'Pushes content to an existing GitHub repository',
    category: 'github',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'branchName', label: 'Branch Name', type: 'string', default: 'main' },
      { name: 'commitMessage', label: 'Commit Message', type: 'string', required: true },
    ],
  },
  // GitLab actions
  {
    action: 'gitlab:projectVariable:create',
    label: 'Create GitLab Project Variable',
    description: 'Creates a CI/CD variable in GitLab project',
    category: 'gitlab',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'key', label: 'Variable Key', type: 'string', required: true },
      { name: 'value', label: 'Variable Value', type: 'string', required: true },
      { name: 'variableType', label: 'Type', type: 'string', description: 'env_var or file' },
      { name: 'masked', label: 'Masked', type: 'boolean', default: false },
      { name: 'protected', label: 'Protected', type: 'boolean', default: false },
    ],
  },
  {
    action: 'gitlab:projectAccessToken:create',
    label: 'Create GitLab Project Token',
    description: 'Creates a project access token in GitLab',
    category: 'gitlab',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'name', label: 'Token Name', type: 'string', required: true },
      { name: 'scopes', label: 'Scopes', type: 'array', required: true },
      { name: 'accessLevel', label: 'Access Level', type: 'string', default: '40' },
    ],
  },
  // Bitbucket actions
  {
    action: 'publish:bitbucket',
    label: 'Publish to Bitbucket',
    description: 'Creates a Bitbucket repository and pushes content',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string' },
      { name: 'defaultBranch', label: 'Default Branch', type: 'string', default: 'main' },
      { name: 'repoVisibility', label: 'Visibility', type: 'string' },
    ],
  },
  {
    action: 'publish:bitbucketCloud',
    label: 'Publish to Bitbucket Cloud',
    description: 'Publishes to Bitbucket Cloud',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string' },
      { name: 'repoVisibility', label: 'Visibility', type: 'string' },
    ],
  },
  {
    action: 'publish:bitbucketServer',
    label: 'Publish to Bitbucket Server',
    description: 'Publishes to Bitbucket Server/Data Center',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string' },
      { name: 'defaultBranch', label: 'Default Branch', type: 'string', default: 'main' },
    ],
  },
  // Azure DevOps actions
  {
    action: 'publish:azure',
    label: 'Publish to Azure DevOps',
    description: 'Creates an Azure DevOps repository and pushes content',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string' },
      { name: 'defaultBranch', label: 'Default Branch', type: 'string', default: 'main' },
    ],
  },
  // Gerrit actions
  {
    action: 'publish:gerrit',
    label: 'Publish to Gerrit',
    description: 'Publishes to a Gerrit repository',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string' },
      { name: 'defaultBranch', label: 'Default Branch', type: 'string', default: 'master' },
    ],
  },
  {
    action: 'publish:gerrit:review',
    label: 'Create Gerrit Review',
    description: 'Creates a review/change in Gerrit',
    category: 'publish',
    inputs: [
      { name: 'repoUrl', label: 'Repository URL', type: 'string', required: true },
      { name: 'branch', label: 'Target Branch', type: 'string', required: true },
      { name: 'commitMessage', label: 'Commit Message', type: 'string', required: true },
    ],
  },
  // Utility/Community actions (Roadie HQ)
  {
    action: 'roadiehq:utils:zip',
    label: 'Zip Files',
    description: 'Creates a zip archive of specified files',
    category: 'utilities',
    inputs: [
      { name: 'path', label: 'Source Path', type: 'string', required: true },
      { name: 'outputPath', label: 'Output Path', type: 'string', required: true },
    ],
  },
  {
    action: 'roadiehq:utils:jsonata',
    label: 'JSONata Transform',
    description: 'Transforms JSON using JSONata expressions',
    category: 'utilities',
    inputs: [
      { name: 'data', label: 'Input Data', type: 'object', required: true },
      { name: 'expression', label: 'JSONata Expression', type: 'string', required: true },
    ],
  },
  {
    action: 'roadiehq:utils:serialize:yaml',
    label: 'Serialize to YAML',
    description: 'Converts data to YAML format',
    category: 'utilities',
    inputs: [
      { name: 'data', label: 'Input Data', type: 'object', required: true },
      { name: 'path', label: 'Output Path', type: 'string', required: true },
    ],
  },
  {
    action: 'roadiehq:utils:serialize:json',
    label: 'Serialize to JSON',
    description: 'Converts data to JSON format',
    category: 'utilities',
    inputs: [
      { name: 'data', label: 'Input Data', type: 'object', required: true },
      { name: 'path', label: 'Output Path', type: 'string', required: true },
    ],
  },
  {
    action: 'roadiehq:utils:fs:parse',
    label: 'Parse File',
    description: 'Parses a file (JSON/YAML) into an object',
    category: 'utilities',
    inputs: [
      { name: 'path', label: 'File Path', type: 'string', required: true },
      { name: 'parser', label: 'Parser', type: 'string', description: 'json or yaml' },
    ],
  },
  {
    action: 'roadiehq:utils:fs:append',
    label: 'Append to File',
    description: 'Appends content to a file',
    category: 'utilities',
    inputs: [
      { name: 'path', label: 'File Path', type: 'string', required: true },
      { name: 'content', label: 'Content', type: 'string', required: true },
    ],
  },
  {
    action: 'roadiehq:utils:fs:replace',
    label: 'Replace in File',
    description: 'Replaces content in a file using regex',
    category: 'utilities',
    inputs: [
      { name: 'files', label: 'Files', type: 'array', required: true },
      { name: 'find', label: 'Find Pattern', type: 'string', required: true },
      { name: 'replaceWith', label: 'Replace With', type: 'string', required: true },
    ],
  },
  // HTTP actions
  {
    action: 'http:backstage:request',
    label: 'HTTP Request',
    description: 'Makes an HTTP request',
    category: 'utilities',
    inputs: [
      { name: 'method', label: 'Method', type: 'string', required: true, description: 'GET, POST, PUT, DELETE' },
      { name: 'path', label: 'Path', type: 'string', required: true },
      { name: 'headers', label: 'Headers', type: 'object' },
      { name: 'body', label: 'Body', type: 'object' },
    ],
  },
];

export const UI_FIELDS: UIFieldDefinition[] = [
  { field: 'EntityPicker', label: 'Entity Picker', description: 'Searchable dropdown that queries the Backstage catalog' },
  { field: 'RepoUrlPicker', label: 'Repo URL Picker', description: 'Repository URL selector with host/owner/repo fields' },
  { field: 'RepoBranchPicker', label: 'Branch Picker', description: 'Branch selector with autocompletion' },
  { field: 'RepoOwnerPicker', label: 'Repo Owner Picker', description: 'Repository owner selector' },
  { field: 'OwnerPicker', label: 'Owner Picker', description: 'Catalog-based user/group picker' },
  { field: 'Secret', label: 'Secret Input', description: 'Masked input for sensitive values' },
];

export const UI_WIDGETS = [
  { widget: 'textarea', label: 'Text Area', description: 'Multi-line text input' },
  { widget: 'password', label: 'Password', description: 'Masked password input' },
  { widget: 'radio', label: 'Radio Buttons', description: 'Radio button group' },
  { widget: 'select', label: 'Select Dropdown', description: 'Dropdown select' },
  { widget: 'checkboxes', label: 'Checkboxes', description: 'Checkbox group' },
  { widget: 'hidden', label: 'Hidden', description: 'Hidden field' },
];

// --- Custom actions persistence (localStorage) ---

const CUSTOM_ACTIONS_KEY = 'custom_actions';

export function getCustomActions(): ActionDefinition[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_ACTIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCustomActions(actions: ActionDefinition[]) {
  localStorage.setItem(CUSTOM_ACTIONS_KEY, JSON.stringify(actions));
}

export function addCustomAction(action: ActionDefinition) {
  const existing = getCustomActions();
  const idx = existing.findIndex((a) => a.action === action.action);
  if (idx >= 0) {
    existing[idx] = action;
  } else {
    existing.push(action);
  }
  saveCustomActions(existing);
}

export function removeCustomAction(actionId: string) {
  const existing = getCustomActions().filter((a) => a.action !== actionId);
  saveCustomActions(existing);
}

/** Returns all actions: built-in + custom */
export function getAllActions(): ActionDefinition[] {
  return [...BUILT_IN_ACTIONS, ...getCustomActions()];
}

export function getActionsByCategory(category: string): ActionDefinition[] {
  return getAllActions().filter(a => a.category === category);
}

export function getActionDefinition(action: string): ActionDefinition | undefined {
  return getAllActions().find(a => a.action === action);
}

// --- Action Repository URLs (for enterprise action catalogs) ---

const ACTION_REPOS_KEY = 'action_repository_urls';
const REPO_ACTIONS_CACHE_KEY = 'action_repository_cache';

export interface ActionRepository {
  url: string;
  name: string;
  enabled: boolean;
}

export function getActionRepositories(): ActionRepository[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(ACTION_REPOS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveActionRepositories(repos: ActionRepository[]) {
  localStorage.setItem(ACTION_REPOS_KEY, JSON.stringify(repos));
}

export function addActionRepository(repo: ActionRepository) {
  const existing = getActionRepositories();
  const idx = existing.findIndex((r) => r.url === repo.url);
  if (idx >= 0) {
    existing[idx] = repo;
  } else {
    existing.push(repo);
  }
  saveActionRepositories(existing);
}

export function removeActionRepository(url: string) {
  const existing = getActionRepositories().filter((r) => r.url !== url);
  saveActionRepositories(existing);
}

export function getRepositoryActionsCache(): Record<string, ActionDefinition[]> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(REPO_ACTIONS_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveRepositoryActionsCache(cache: Record<string, ActionDefinition[]>) {
  localStorage.setItem(REPO_ACTIONS_CACHE_KEY, JSON.stringify(cache));
}

export async function fetchActionsFromRepository(url: string): Promise<ActionDefinition[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

    const contentType = res.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await res.json();
    } else {
      // Assume YAML
      const text = await res.text();
      const YAML = await import('js-yaml');
      data = YAML.load(text);
    }

    // Support both array of actions and object with actions property
    const actions = Array.isArray(data) ? data : (data.actions || []);

    // Validate and normalize actions
    return actions.filter((a: any) => a.action && a.label).map((a: any) => ({
      action: a.action,
      label: a.label,
      description: a.description || '',
      category: a.category || 'custom',
      inputs: a.inputs || [],
    }));
  } catch (error) {
    console.error(`Failed to fetch actions from ${url}:`, error);
    return [];
  }
}

export async function refreshRepositoryActions() {
  const repos = getActionRepositories().filter(r => r.enabled);
  const cache: Record<string, ActionDefinition[]> = {};

  for (const repo of repos) {
    const actions = await fetchActionsFromRepository(repo.url);
    cache[repo.url] = actions;
  }

  saveRepositoryActionsCache(cache);
  return cache;
}

export function getRepositoryActions(): ActionDefinition[] {
  const cache = getRepositoryActionsCache();
  return Object.values(cache).flat();
}

/** Returns all actions: built-in + custom + repository actions */
export function getAllActionsIncludingRepositories(): ActionDefinition[] {
  return [...BUILT_IN_ACTIONS, ...getCustomActions(), ...getRepositoryActions()];
}
