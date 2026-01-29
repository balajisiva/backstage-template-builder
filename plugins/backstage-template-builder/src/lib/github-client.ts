// Client-side GitHub API wrapper
// Token is stored in localStorage for persistence across sessions

const STORAGE_KEY = 'gh_pat';
const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  scopes: string;
}

export interface GitHubRepo {
  full_name: string;
  name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  default_branch: string;
  private: boolean;
  html_url: string;
  updated_at: string;
}

export interface GitHubBranch {
  name: string;
  commit: { sha: string };
}

export interface GitHubFileResult {
  content?: string;
  sha?: string;
  name?: string;
  path?: string;
  encoding?: string;
  html_url?: string;
}

export interface PushResult {
  content: {
    name: string;
    path: string;
    sha: string;
    html_url: string;
  };
  commit: {
    sha: string;
    html_url: string;
  };
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isConnected(): boolean {
  return !!getToken();
}

async function ghFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Not connected to GitHub');

  const res = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `GitHub API error: ${res.statusText}`);
  }

  return res.json();
}

export async function validateToken(token: string): Promise<GitHubUser> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error('Invalid token');
    }

    const user = await res.json();
    const scopes = res.headers.get('X-OAuth-Scopes') || '';

    return {
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      scopes,
    };
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('Connection timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function listRepos(search?: string): Promise<GitHubRepo[]> {
  if (search) {
    const data = await ghFetch<{ items: GitHubRepo[] }>(`/search/repositories?q=${encodeURIComponent(search)}+user:@me&sort=updated&per_page=50`);
    return data.items;
  }
  return ghFetch<GitHubRepo[]>('/user/repos?sort=updated&per_page=50');
}

export async function getRepo(owner: string, repo: string): Promise<GitHubRepo> {
  return ghFetch<GitHubRepo>(`/repos/${owner}/${repo}`);
}

export async function getFile(
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<GitHubFileResult> {
  const refParam = ref ? `?ref=${encodeURIComponent(ref)}` : '';
  return ghFetch<GitHubFileResult>(`/repos/${owner}/${repo}/contents/${path}${refParam}`);
}

export async function putFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch?: string,
  sha?: string
): Promise<PushResult> {
  const body: Record<string, string> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
  };
  if (branch) body.branch = branch;
  if (sha) body.sha = sha;

  return ghFetch<PushResult>(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export async function listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  return ghFetch<GitHubBranch[]>(`/repos/${owner}/${repo}/branches?per_page=100`);
}

export async function createBranch(
  owner: string,
  repo: string,
  branch: string,
  fromBranch?: string
): Promise<unknown> {
  // Get the SHA of the source branch
  const sourceBranch = fromBranch || (await getRepo(owner, repo)).default_branch;
  const branchData = await ghFetch<GitHubBranch>(`/repos/${owner}/${repo}/git/ref/heads/${sourceBranch}`);

  // Create new branch
  return ghFetch(`/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: branchData.commit.sha,
    }),
  });
}

export interface GitHubContentItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  sha: string;
}

export async function listContents(
  owner: string,
  repo: string,
  path: string = '',
  ref?: string
): Promise<GitHubContentItem[]> {
  const refParam = ref ? `?ref=${encodeURIComponent(ref)}` : '';
  return ghFetch<GitHubContentItem[]>(`/repos/${owner}/${repo}/contents/${path}${refParam}`);
}

// Parse a GitHub URL into owner/repo/path parts
export function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string; path?: string } | null {
  const match = url.match(
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/(?:tree|blob)\/([^/]+)\/?(.*?))?(?:[?#].*)?$/
  );
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    branch: match[3],
    path: match[4],
  };
}
