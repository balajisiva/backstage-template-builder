

import React, { useState, useEffect, useCallback } from 'react';
import { useTemplateStore } from '../../store/template-store';
import { yamlToTemplate } from '../../lib/yaml-utils';
import {
  getToken,
  listRepos,
  listContents,
  listBranches,
  parseGitHubUrl,
  getFile,
  getRepo,
  GitHubRepo,
  GitHubBranch,
  GitHubContentItem,
} from '../../lib/github-client';
import {
  GitBranch,
  Loader2,
  AlertCircle,
  ExternalLink,
  FolderGit2,
  Folder,
  FileText,
  ChevronRight,
  ArrowLeft,
  Search,
  Lock,
  Globe,
  Star,
  X,
} from 'lucide-react';

interface RepoTemplate {
  name: string;
  path: string;
  url: string;
}

const SAMPLE_REPOS: { label: string; url: string }[] = [
  {
    label: 'Red Hat Developer Hub Templates',
    url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates',
  },
];

const SAMPLE_TEMPLATES: RepoTemplate[] = [
  { name: 'Go Backend', path: 'templates/github/go-backend/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/github/go-backend/template.yaml' },
  { name: 'Node.js Backend', path: 'templates/github/nodejs-backend/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/github/nodejs-backend/template.yaml' },
  { name: 'Quarkus Backend', path: 'templates/github/quarkus-backend/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/github/quarkus-backend/template.yaml' },
  { name: 'Spring Boot Backend', path: 'templates/github/spring-boot-backend/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/github/spring-boot-backend/template.yaml' },
  { name: 'Register Component', path: 'templates/github/register-component/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/github/register-component/template.yaml' },
  { name: 'TechDocs', path: 'templates/github/techdocs/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/github/techdocs/template.yaml' },
  { name: 'ArgoCD', path: 'templates/github/argocd/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/github/argocd/template.yaml' },
  { name: 'Backstage System', path: 'templates/github/backstage-system/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/github/backstage-system/template.yaml' },
  { name: 'Python Backend (GitLab)', path: 'templates/gitlab/python-backend/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/gitlab/python-backend/template.yaml' },
  { name: '.NET Frontend (Azure)', path: 'templates/azure/dotnet-frontend/template.yaml', url: 'https://github.com/redhat-developer/red-hat-developer-hub-software-templates/blob/main/templates/azure/dotnet-frontend/template.yaml' },
];

const RECENT_REPOS_KEY = 'recent_template_repos';

function getRecentRepos(): { owner: string; repo: string; fullName: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_REPOS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentRepo(owner: string, repo: string) {
  const recent = getRecentRepos().filter((r) => r.fullName !== `${owner}/${repo}`);
  recent.unshift({ owner, repo, fullName: `${owner}/${repo}` });
  localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(recent.slice(0, 5)));
}

export function GitHubLoader({ onClose }: { onClose: () => void }) {
  const { dispatch } = useTemplateStore();
  const [mode, setMode] = useState<'samples' | 'url' | 'browse'>('samples');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConnected = !!getToken();

  const loadTemplate = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      // Convert GitHub URL to raw content URL
      const rawUrl = url
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/');

      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

      const content = await res.text();
      const template = yamlToTemplate(content);
      dispatch({ type: 'SET_TEMPLATE', payload: template });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateFromContent = async (owner: string, repo: string, path: string, ref?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('GitHub not connected');

      const data = await getFile(owner, repo, path, ref);
      if (data.error) throw new Error(data.error);
      if (!data.content) throw new Error('File has no content');
      const decoded = atob(data.content);
      const template = yamlToTemplate(decoded);
      dispatch({ type: 'SET_TEMPLATE', payload: template });
      saveRecentRepo(owner, repo);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    loadTemplate(repoUrl.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="p-5 border-b border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FolderGit2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Load Template</h2>
                <p className="text-sm text-zinc-400">Import from a GitHub repository or select a sample</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setMode('samples')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                mode === 'samples'
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Samples
            </button>
            <button
              onClick={() => setMode('url')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                mode === 'url'
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              From URL
            </button>
            <button
              onClick={() => setMode('browse')}
              className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                mode === 'browse'
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Browse Repo
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {mode === 'samples' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                {SAMPLE_REPOS.map((repo) => (
                  <a
                    key={repo.url}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-zinc-400 hover:text-blue-400 transition-colors"
                  >
                    <GitBranch className="w-3 h-3" />
                    {repo.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.path}
                    onClick={() => loadTemplate(tmpl.url)}
                    disabled={loading}
                    className="text-left p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all disabled:opacity-50 group"
                  >
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">
                      {tmpl.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate">{tmpl.path}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'url' && (
            <div className="space-y-4">
              <form onSubmit={handleUrlSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    GitHub URL to template.yaml
                  </label>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/org/repo/blob/main/template.yaml"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                    disabled={loading}
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Paste a direct link to a template.yaml file on GitHub
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading || !repoUrl.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-4 h-4" />
                      Load Template
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-zinc-700/50">
                <h4 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                  Or paste YAML directly
                </h4>
                <PasteYamlArea onClose={onClose} />
              </div>
            </div>
          )}

          {mode === 'browse' && (
            <RepoBrowser
              isConnected={isConnected}
              loading={loading}
              onLoadTemplate={loadTemplateFromContent}
            />
          )}
        </div>

        <div className="p-4 border-t border-zinc-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-zinc-800 p-4 rounded-xl flex items-center gap-3 shadow-xl">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-sm text-zinc-200">Loading template...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Browse Repo Component ---

function RepoBrowser({
  isConnected,
  onLoadTemplate,
}: {
  isConnected: boolean;
  loading: boolean;
  onLoadTemplate: (owner: string, repo: string, path: string, ref?: string) => void;
}) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [contents, setContents] = useState<GitHubContentItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const recentRepos = getRecentRepos();

  const loadRepos = useCallback(async (search?: string) => {
    if (!getToken()) return;
    setLoading(true);
    try {
      const r = await listRepos(search || undefined);
      setRepos(r);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected) loadRepos();
  }, [isConnected, loadRepos]);

  const handleSelectRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setCurrentPath('');
    setLoading(true);
    try {
      const [branchList, contentList] = await Promise.all([
        listBranches(repo.owner.login, repo.name),
        listContents(repo.owner.login, repo.name, '', repo.default_branch),
      ]);
      setBranches(branchList);
      setSelectedBranch(repo.default_branch);
      setContents(contentList);
    } catch {
      setContents([]);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepoFromUrl = async () => {
    if (!repoUrl.trim()) return;
    const parsed = parseGitHubUrl(repoUrl.trim());
    if (!parsed) return;
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      const data = await getRepo(parsed.owner, parsed.repo);
      await handleSelectRepo(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = async (path: string) => {
    if (!selectedRepo) return;
    setLoading(true);
    setCurrentPath(path);
    try {
      const items = await listContents(selectedRepo.owner.login, selectedRepo.name, path, selectedBranch);
      setContents(items);
    } catch {
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = async (branch: string) => {
    setSelectedBranch(branch);
    if (!selectedRepo) return;
    setLoading(true);
    setCurrentPath('');
    try {
      const items = await listContents(selectedRepo.owner.login, selectedRepo.name, '', branch);
      setContents(items);
    } catch {
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    navigateToPath(parts.join('/'));
  };

  const isTemplateFile = (name: string) =>
    name === 'template.yaml' || name === 'template.yml';

  if (!isConnected) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="inline-flex p-4 bg-zinc-800/50 rounded-full">
          <FolderGit2 className="w-10 h-10 text-zinc-500" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-300">GitHub Connection Required</p>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            To browse repositories, you need to connect your GitHub account first. Close this modal and click the <strong className="text-zinc-400">&quot;Connect GitHub&quot;</strong> or <strong className="text-zinc-400">&quot;Pull&quot;</strong> button in the top bar.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedRepo) {
    return (
      <div className="space-y-4">
        {/* Repo URL input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectRepoFromUrl()}
            placeholder="https://github.com/org/templates-repo"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          />
          <button
            onClick={handleSelectRepoFromUrl}
            disabled={loading || !repoUrl.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm transition-colors"
          >
            Open
          </button>
        </div>

        {/* Recent repos */}
        {recentRepos.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1.5">
              <Star className="w-3 h-3" /> Recently Used
            </h4>
            <div className="space-y-1">
              {recentRepos.map((r) => (
                <button
                  key={r.fullName}
                  onClick={() => {
                    setRepoUrl(`https://github.com/${r.fullName}`);
                    // Auto-open
                    setLoading(true);
                    const token = getToken();
                    if (!token) return;
                    getRepo(r.owner, r.repo)
                      .then((data) => {
                        handleSelectRepo(data);
                      })
                      .catch(() => {
                        // silent error
                      })
                      .finally(() => setLoading(false));
                  }}
                  className="w-full text-left p-2 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-sm text-zinc-300 hover:text-blue-400 font-mono"
                >
                  {r.fullName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-xs text-zinc-500">or search your repos</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadRepos(repoSearch.trim() || undefined)}
            placeholder="Search repositories..."
            className="flex-1 bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
        </div>

        {/* Repo list */}
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {repos.map((repo) => (
            <button
              key={repo.full_name}
              onClick={() => handleSelectRepo(repo)}
              className="w-full text-left p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
            >
              <div className="flex items-center gap-2">
                <img src={repo.owner.avatar_url} alt="" className="w-5 h-5 rounded" />
                <span className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 truncate">
                  {repo.full_name}
                </span>
                {repo.private ? (
                  <Lock className="w-3 h-3 text-zinc-500 shrink-0" />
                ) : (
                  <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
                )}
              </div>
              {repo.description && (
                <p className="text-xs text-zinc-500 mt-1 truncate ml-7">{repo.description}</p>
              )}
            </button>
          ))}
          {repos.length === 0 && !loading && (
            <p className="text-sm text-zinc-500 text-center py-4">No repositories found. Try searching.</p>
          )}
        </div>
      </div>
    );
  }

  // Repo selected — show file browser
  return (
    <div className="space-y-3">
      {/* Repo header */}
      <div className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/30 rounded-lg">
        <img src={selectedRepo.owner.avatar_url} alt="" className="w-6 h-6 rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-200 truncate">{selectedRepo.full_name}</p>
        </div>
        <select
          value={selectedBranch}
          onChange={(e) => handleBranchChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none"
        >
          {branches.map((b) => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>
        <button
          onClick={() => { setSelectedRepo(null); setContents([]); setCurrentPath(''); }}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Change
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs">
        <button
          onClick={() => navigateToPath('')}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {selectedRepo.name}
        </button>
        {currentPath && currentPath.split('/').filter(Boolean).map((part, i, arr) => (
          <React.Fragment key={i}>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <button
              onClick={() => navigateToPath(arr.slice(0, i + 1).join('/'))}
              className={i === arr.length - 1 ? 'text-zinc-300' : 'text-blue-400 hover:text-blue-300 transition-colors'}
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Navigation */}
      {currentPath && (
        <button
          onClick={navigateUp}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
      )}

      {/* File listing */}
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-sm text-zinc-400">Loading...</span>
        </div>
      ) : (
        <div className="max-h-[350px] overflow-y-auto space-y-0.5">
          {/* Directories first, then files */}
          {[...contents]
            .sort((a, b) => {
              if (a.type === 'dir' && b.type !== 'dir') return -1;
              if (a.type !== 'dir' && b.type === 'dir') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  if (item.type === 'dir') {
                    navigateToPath(item.path);
                  } else if (isTemplateFile(item.name)) {
                    onLoadTemplate(selectedRepo.owner.login, selectedRepo.name, item.path, selectedBranch);
                  }
                }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                  isTemplateFile(item.name)
                    ? 'bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                    : item.type === 'dir'
                      ? 'bg-zinc-800/20 border border-transparent hover:bg-zinc-800/50 hover:border-zinc-700/30'
                      : 'bg-zinc-800/20 border border-transparent hover:bg-zinc-800/30 opacity-60'
                }`}
                disabled={item.type === 'file' && !isTemplateFile(item.name)}
              >
                {item.type === 'dir' ? (
                  <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                ) : isTemplateFile(item.name) ? (
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <FileText className="w-4 h-4 text-zinc-600 shrink-0" />
                )}
                <span className={`text-sm ${
                  isTemplateFile(item.name)
                    ? 'text-emerald-300 font-medium'
                    : item.type === 'dir'
                      ? 'text-zinc-200'
                      : 'text-zinc-500'
                }`}>
                  {item.name}
                </span>
                {isTemplateFile(item.name) && (
                  <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Load
                  </span>
                )}
                {item.type === 'dir' && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto" />
                )}
              </button>
            ))}
          {contents.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">Empty directory</p>
          )}
        </div>
      )}
    </div>
  );
}

function PasteYamlArea({ onClose }: { onClose: () => void }) {
  const { dispatch } = useTemplateStore();
  const [yamlContent, setYamlContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    try {
      setError(null);
      const template = yamlToTemplate(yamlContent);
      dispatch({ type: 'SET_TEMPLATE', payload: template });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={yamlContent}
        onChange={(e) => setYamlContent(e.target.value)}
        placeholder="Paste your template.yaml content here..."
        rows={8}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        onClick={handleApply}
        disabled={!yamlContent.trim()}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-xs font-medium transition-colors"
      >
        Import YAML
      </button>
    </div>
  );
}
