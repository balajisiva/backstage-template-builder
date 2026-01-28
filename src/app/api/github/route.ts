import { NextRequest, NextResponse } from 'next/server';

// Proxy to GitHub API to avoid CORS issues
// Supports both unauthenticated reads and token-authenticated operations
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const token = request.headers.get('x-github-token');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Convert GitHub URL to raw content URL
    let rawUrl = url;
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com') && !url.includes('api.github.com')) {
      rawUrl = url
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/');
    }

    // If it's a repo URL without a specific file, try to list contents via API
    if (url.includes('github.com') && !url.includes('/blob/') && !url.match(/\.\w+$/)) {
      const apiUrl = convertToApiUrl(url);
      if (apiUrl) {
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'backstage-template-builder',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(apiUrl, { headers });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      }
    }

    const headers: Record<string, string> = {
      'User-Agent': 'backstage-template-builder',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(rawUrl, { headers });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${res.statusText}` },
        { status: res.status }
      );
    }

    const content = await res.text();
    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json(
      { error: `Fetch error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}

// POST: authenticated GitHub API operations (push, create file, etc.)
export async function POST(request: NextRequest) {
  const token = request.headers.get('x-github-token');
  if (!token) {
    return NextResponse.json({ error: 'Missing GitHub token' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'validate-token':
        return handleValidateToken(token);
      case 'list-repos':
        return handleListRepos(token, body);
      case 'get-file':
        return handleGetFile(token, body);
      case 'put-file':
        return handlePutFile(token, body);
      case 'list-branches':
        return handleListBranches(token, body);
      case 'create-branch':
        return handleCreateBranch(token, body);
      case 'get-repo':
        return handleGetRepo(token, body);
      case 'list-contents':
        return handleListContents(token, body);
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Request error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}

async function ghFetch(token: string, path: string, options?: RequestInit) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'backstage-template-builder',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || `GitHub API error: ${res.statusText}` },
      { status: res.status }
    );
  }
  return NextResponse.json(data);
}

async function handleValidateToken(token: string) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'backstage-template-builder',
    },
  });
  if (!res.ok) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  const user = await res.json();
  // Check scopes
  const scopes = res.headers.get('x-oauth-scopes') || '';
  return NextResponse.json({
    login: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
    scopes,
  });
}

async function handleListRepos(token: string, body: { page?: number; search?: string }) {
  const page = body.page || 1;
  const search = body.search;

  if (search) {
    return ghFetch(token, `/search/repositories?q=${encodeURIComponent(search)}+in:name&sort=updated&per_page=20&page=${page}`);
  }
  return ghFetch(token, `/user/repos?sort=updated&per_page=30&page=${page}&affiliation=owner,collaborator,organization_member`);
}

async function handleGetRepo(token: string, body: { owner: string; repo: string }) {
  return ghFetch(token, `/repos/${body.owner}/${body.repo}`);
}

async function handleGetFile(token: string, body: { owner: string; repo: string; path: string; ref?: string }) {
  const ref = body.ref ? `?ref=${encodeURIComponent(body.ref)}` : '';
  return ghFetch(token, `/repos/${body.owner}/${body.repo}/contents/${body.path}${ref}`);
}

async function handlePutFile(token: string, body: {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
  sha?: string;
}) {
  const payload: Record<string, unknown> = {
    message: body.message,
    content: Buffer.from(body.content).toString('base64'),
  };
  if (body.branch) payload.branch = body.branch;
  if (body.sha) payload.sha = body.sha;

  return ghFetch(token, `/repos/${body.owner}/${body.repo}/contents/${body.path}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

async function handleListBranches(token: string, body: { owner: string; repo: string }) {
  return ghFetch(token, `/repos/${body.owner}/${body.repo}/branches?per_page=50`);
}

async function handleCreateBranch(token: string, body: { owner: string; repo: string; branch: string; fromBranch?: string }) {
  // Get the SHA of the source branch
  const fromBranch = body.fromBranch || 'main';
  const refRes = await fetch(`https://api.github.com/repos/${body.owner}/${body.repo}/git/ref/heads/${fromBranch}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'backstage-template-builder',
    },
  });
  if (!refRes.ok) {
    return NextResponse.json({ error: `Could not find branch: ${fromBranch}` }, { status: 404 });
  }
  const refData = await refRes.json();
  const sha = refData.object.sha;

  return ghFetch(token, `/repos/${body.owner}/${body.repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${body.branch}`,
      sha,
    }),
  });
}

async function handleListContents(token: string, body: { owner: string; repo: string; path?: string; ref?: string }) {
  const path = body.path || '';
  const ref = body.ref ? `?ref=${encodeURIComponent(body.ref)}` : '';
  return ghFetch(token, `/repos/${body.owner}/${body.repo}/contents/${path}${ref}`);
}

function convertToApiUrl(url: string): string | null {
  const match = url.match(
    /github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+)\/?(.*)|\/?(.*))?\/?$/
  );
  if (!match) return null;

  const owner = match[1];
  const repo = match[2];
  const branch = match[3] || 'main';
  const path = match[4] || match[5] || '';

  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
}
