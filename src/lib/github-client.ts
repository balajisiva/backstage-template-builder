// Client-side GitHub API wrapper
// Token is stored in localStorage for persistence across sessions

const STORAGE_KEY = 'gh_pat';

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

async function ghPost<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Not connected to GitHub');

  const res = await fetch('/api/github', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-github-token': token,
    },
    body: JSON.stringify({ action, ...body }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || `GitHub API error: ${res.statusText}`);
  }
  return data;
}

export async function validateToken(token: string): Promise<GitHubUser> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch('/api/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-github-token': token,
      },
      body: JSON.stringify({ action: 'validate-token' }),
      signal: controller.signal,
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Invalid token');
    return data;
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
  const data = await ghPost<GitHubRepo[] | { items: GitHubRepo[] }>('list-repos', { search });
  // Search returns { items: [...] }, direct listing returns array
  if (Array.isArray(data)) return data;
  if ('items' in data) return data.items;
  return [];
}

export async function getRepo(owner: string, repo: string): Promise<GitHubRepo> {
  return ghPost<GitHubRepo>('get-repo', { owner, repo });
}

export async function getFile(
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<GitHubFileResult> {
  return ghPost<GitHubFileResult>('get-file', { owner, repo, path, ref });
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
  return ghPost<PushResult>('put-file', { owner, repo, path, content, message, branch, sha });
}

export async function listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  return ghPost<GitHubBranch[]>('list-branches', { owner, repo });
}

export async function createBranch(
  owner: string,
  repo: string,
  branch: string,
  fromBranch?: string
): Promise<unknown> {
  return ghPost('create-branch', { owner, repo, branch, fromBranch });
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
  return ghPost<GitHubContentItem[]>('list-contents', { owner, repo, path, ref });
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
