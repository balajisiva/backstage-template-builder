

import React, { useState, useEffect, useCallback } from 'react';
import { useTemplateStore } from '../../store/template-store';
import { templateToYaml, yamlToTemplate } from '../../lib/yaml-utils';
import { validateTemplate, getIssueSummary, ValidationIssue } from '../../lib/template-validator';
import {
  GitHubUser,
  GitHubRepo,
  GitHubBranch,
  validateToken,
  setToken,
  clearToken,
  getToken,
  listRepos,
  listBranches,
  getFile,
  putFile,
  createBranch,
  parseGitHubUrl,
} from '../../lib/github-client';
import {
  GitBranch,
  Loader2,
  AlertCircle,
  Check,
  X,
  Search,
  Lock,
  Globe,
  ArrowDownToLine,
  ArrowUpFromLine,
  KeyRound,
  LogOut,
  ExternalLink,
  FolderTree,
  GitPullRequest,
  RefreshCw,
} from 'lucide-react';

type SyncMode = 'connect' | 'pull' | 'push';

interface GitHubSyncProps {
  mode: SyncMode;
  onClose: () => void;
}

export default function GitHubSync({ mode: initialMode, onClose }: GitHubSyncProps) {
  const { state, dispatch } = useTemplateStore();
  const [mode, setMode] = useState<SyncMode>(initialMode);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Repo selection
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  // Pull state
  const [filePath, setFilePath] = useState('template.yaml');
  const [pullUrl, setPullUrl] = useState('');

  // Push state
  const [commitMessage, setCommitMessage] = useState('');
  const [pushPath, setPushPath] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [useNewBranch, setUseNewBranch] = useState(false);
  const [existingSha, setExistingSha] = useState<string | undefined>();
  const [pushResult, setPushResult] = useState<{ commitUrl: string; fileUrl: string } | null>(null);

  // Validation state
  const [showValidation, setShowValidation] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [validationAccepted, setValidationAccepted] = useState(false);

  // Set smart default for push path based on template name
  useEffect(() => {
    if (!pushPath) {
      const name = state.template.metadata.name;
      setPushPath(name && name !== 'new-template' ? `${name}/template.yaml` : 'template.yaml');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check existing connection on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      setLoading(true);
      validateToken(token)
        .then((u) => {
          setUser(u);
          if (initialMode === 'connect') setMode('pull');
        })
        .catch(() => {
          clearToken();
          setError('Saved token is no longer valid. Please reconnect.');
        })
        .finally(() => setLoading(false));
    }
  }, [initialMode]);

  // Load repos when connected
  const loadRepos = useCallback(async (search?: string) => {
    if (!getToken()) return;
    try {
      const r = await listRepos(search || undefined);
      setRepos(r);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (user) loadRepos();
  }, [user, loadRepos]);

  // Load branches when repo selected
  useEffect(() => {
    if (selectedRepo) {
      listBranches(selectedRepo.owner.login, selectedRepo.name)
        .then((b) => {
          setBranches(b);
          setSelectedBranch(selectedRepo.default_branch);
        })
        .catch(() => setBranches([]));

      // For push, check if file already exists
      if (mode === 'push') {
        checkExistingFile();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo]);

  const checkExistingFile = async () => {
    if (!selectedRepo) return;
    try {
      const file = await getFile(selectedRepo.owner.login, selectedRepo.name, pushPath, selectedBranch || undefined);
      if (file.sha) {
        setExistingSha(file.sha);
      }
    } catch {
      setExistingSha(undefined);
    }
  };

  const handleConnect = async () => {
    if (!tokenInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const u = await validateToken(tokenInput.trim());
      setToken(tokenInput.trim());
      setUser(u);
      setTokenInput('');
      // Warn if classic token lacks repo scope
      if (u.scopes && !u.scopes.includes('repo')) {
        setError(
          'Warning: Your token may lack write permissions. For classic tokens, the "repo" scope is required. For fine-grained tokens, "Contents: Read and write" is needed. You can still try, but push may fail.'
        );
      }
      setMode(initialMode === 'connect' ? 'pull' : initialMode);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearToken();
    setUser(null);
    setRepos([]);
    setSelectedRepo(null);
    setBranches([]);
    setMode('connect');
  };

  const handleRepoSearch = async () => {
    if (!repoSearch.trim()) {
      loadRepos();
      return;
    }
    setLoading(true);
    try {
      const r = await listRepos(repoSearch.trim());
      setRepos(r);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // --- Pull ---
  const handlePullFromRepo = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setError(null);
    try {
      const file = await getFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        filePath,
        selectedBranch || undefined
      );
      if (!file.content) throw new Error('File has no content');
      const decoded = atob(file.content);
      const template = yamlToTemplate(decoded);
      dispatch({ type: 'SET_TEMPLATE', payload: template });
      setSuccess(`Pulled ${filePath} from ${selectedRepo.full_name}`);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePullFromUrl = async () => {
    if (!pullUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = parseGitHubUrl(pullUrl.trim());
      if (!parsed) throw new Error('Invalid GitHub URL');
      // Convert GitHub URL to raw content URL
      const rawUrl = pullUrl.trim()
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/', '/');

      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

      const content = await res.text();
      const template = yamlToTemplate(content);
      dispatch({ type: 'SET_TEMPLATE', payload: template });
      setSuccess('Template loaded successfully');
      setTimeout(onClose, 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // --- Push ---
  const handleValidateAndPush = () => {
    // Run validation
    const issues = validateTemplate(state.template);
    setValidationIssues(issues);
    setShowValidation(true);
    setValidationAccepted(false);
  };

  const handlePush = async () => {
    if (!selectedRepo) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowValidation(false);
    try {
      const yamlContent = templateToYaml(state.template);
      let targetBranch = selectedBranch;

      // Create new branch if requested
      if (useNewBranch && newBranch.trim()) {
        await createBranch(
          selectedRepo.owner.login,
          selectedRepo.name,
          newBranch.trim(),
          selectedBranch
        );
        targetBranch = newBranch.trim();
      }

      // Check if file exists on the target branch for sha
      let sha = existingSha;
      if (useNewBranch && newBranch.trim()) {
        // On a new branch, recheck sha
        try {
          const existingFile = await getFile(
            selectedRepo.owner.login,
            selectedRepo.name,
            pushPath,
            targetBranch
          );
          sha = existingFile.sha;
        } catch {
          sha = undefined;
        }
      }

      const message = commitMessage.trim() || `Update ${pushPath} via Backstage Template Builder`;
      const result = await putFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        pushPath,
        yamlContent,
        message,
        targetBranch,
        sha
      );

      setPushResult({
        commitUrl: result.commit.html_url,
        fileUrl: result.content.html_url,
      });
      setSuccess(`Pushed to ${selectedRepo.full_name}/${targetBranch}`);
      dispatch({ type: 'MARK_CLEAN' });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <GitBranch className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">GitHub Sync</h2>
              <p className="text-sm text-zinc-400">
                {mode === 'connect' && 'Connect your GitHub account'}
                {mode === 'pull' && 'Pull a template from GitHub'}
                {mode === 'push' && 'Push template to GitHub'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                <span className="text-sm text-zinc-300">{user.login}</span>
                <button
                  onClick={handleDisconnect}
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Mode tabs (when connected) */}
        {user && (
          <div className="px-5 pt-4">
            <div className="flex gap-1 bg-zinc-800 p-1 rounded-lg">
              <button
                onClick={() => { setMode('pull'); setError(null); setSuccess(null); setPushResult(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  mode === 'pull' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                Pull
              </button>
              <button
                onClick={() => { setMode('push'); setError(null); setSuccess(null); setPushResult(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  mode === 'push' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ArrowUpFromLine className="w-3.5 h-3.5" />
                Push
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Error / Success */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
              {(error.includes('Resource not accessible') || error.includes('Not Found') || error.includes('403')) && (
                <div className="ml-6 text-xs text-red-300/70 space-y-1">
                  <p className="font-medium">Your token is missing required permissions. Ensure you have:</p>
                  <ul className="list-disc ml-4 space-y-0.5">
                    <li><strong>Classic token:</strong> the <code className="bg-red-500/10 px-1 rounded">repo</code> scope</li>
                    <li><strong>Fine-grained token:</strong> <code className="bg-red-500/10 px-1 rounded">Contents: Read &amp; write</code> + repo access for this repository</li>
                  </ul>
                  <p>You may need to regenerate the token with correct permissions, then reconnect.</p>
                </div>
              )}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          )}

          {/* Loading state while validating token */}
          {!user && loading && (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="text-sm text-zinc-400">Connecting to GitHub...</span>
            </div>
          )}

          {/* Connect mode - show whenever not authenticated */}
          {!user && !loading && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Personal Access Token
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 font-mono"
                    />
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={loading || !tokenInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                    Connect
                  </button>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-zinc-300">Option A: Classic Token (recommended)</h3>
                <ol className="text-xs text-zinc-400 space-y-1 list-decimal ml-4">
                  <li>Go to <span className="text-blue-400 font-mono">GitHub Settings &rarr; Developer settings &rarr; Personal access tokens &rarr; Tokens (classic)</span></li>
                  <li>Click <span className="text-zinc-300">&quot;Generate new token (classic)&quot;</span></li>
                  <li>Select the <span className="text-amber-400 font-semibold">repo</span> scope (full control of private repositories)</li>
                  <li>Generate and paste the token above</li>
                </ol>

                <div className="border-t border-zinc-700/50 pt-3">
                  <h3 className="text-sm font-medium text-zinc-300">Option B: Fine-grained Token</h3>
                  <ol className="text-xs text-zinc-400 space-y-1 list-decimal ml-4">
                    <li>Go to <span className="text-blue-400 font-mono">GitHub Settings &rarr; Developer settings &rarr; Personal access tokens &rarr; Fine-grained tokens</span></li>
                    <li>Click <span className="text-zinc-300">&quot;Generate new token&quot;</span></li>
                    <li>Set <span className="text-zinc-300">Repository access</span> to <span className="text-amber-400">&quot;All repositories&quot;</span> or select specific repos</li>
                    <li>Under <span className="text-zinc-300">&quot;Repository permissions&quot;</span>:
                      <ul className="list-disc ml-4 mt-0.5 space-y-0.5">
                        <li><span className="text-amber-400 font-semibold">Contents</span>: Read and write</li>
                        <li><span className="text-amber-400 font-semibold">Metadata</span>: Read-only (usually auto-selected)</li>
                      </ul>
                    </li>
                    <li>Generate and paste the token above</li>
                  </ol>
                </div>

                <p className="text-xs text-zinc-500 border-t border-zinc-700/50 pt-2">
                  Your token is stored in your browser&apos;s local storage (persists across sessions) and is only sent to GitHub&apos;s API through our server proxy.
                </p>
              </div>
            </div>
          )}

          {/* Pull mode */}
          {mode === 'pull' && user && (
            <div className="space-y-4">
              {/* Quick URL pull */}
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Pull from URL
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pullUrl}
                    onChange={(e) => setPullUrl(e.target.value)}
                    placeholder="https://github.com/org/repo/blob/main/template.yaml"
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                  <button
                    onClick={handlePullFromUrl}
                    disabled={loading || !pullUrl.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm transition-colors"
                  >
                    Pull
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-700" />
                <span className="text-xs text-zinc-500">or browse repos</span>
                <div className="flex-1 h-px bg-zinc-700" />
              </div>

              {/* Repo browser */}
              {!selectedRepo ? (
                <RepoBrowser
                  repos={repos}
                  search={repoSearch}
                  onSearchChange={setRepoSearch}
                  onSearch={handleRepoSearch}
                  onSelect={setSelectedRepo}
                  loading={loading}
                />
              ) : (
                <div className="space-y-3">
                  <SelectedRepoHeader repo={selectedRepo} onDeselect={() => setSelectedRepo(null)} />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Branch</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                      >
                        {branches.map((b) => (
                          <option key={b.name} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">File Path</label>
                      <input
                        type="text"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        placeholder="template.yaml"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePullFromRepo}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
                    Pull Template
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Push mode */}
          {mode === 'push' && user && (
            <div className="space-y-4">
              {pushResult ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100">Pushed successfully!</h3>
                  </div>
                  <div className="space-y-2">
                    <a
                      href={pushResult.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-700/30 rounded-lg hover:border-blue-500/30 transition-colors group"
                    >
                      <FolderTree className="w-4 h-4 text-zinc-400 group-hover:text-blue-400" />
                      <span className="text-sm text-zinc-300 group-hover:text-blue-400">View file on GitHub</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500 ml-auto" />
                    </a>
                    <a
                      href={pushResult.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-700/30 rounded-lg hover:border-blue-500/30 transition-colors group"
                    >
                      <GitPullRequest className="w-4 h-4 text-zinc-400 group-hover:text-blue-400" />
                      <span className="text-sm text-zinc-300 group-hover:text-blue-400">View commit on GitHub</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500 ml-auto" />
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {/* Repo browser */}
                  {!selectedRepo ? (
                    <RepoBrowser
                      repos={repos}
                      search={repoSearch}
                      onSearchChange={setRepoSearch}
                      onSearch={handleRepoSearch}
                      onSelect={setSelectedRepo}
                      loading={loading}
                    />
                  ) : (
                    <div className="space-y-3">
                      <SelectedRepoHeader repo={selectedRepo} onDeselect={() => setSelectedRepo(null)} />

                      {/* File path - prominent */}
                      <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-lg p-3 space-y-1.5">
                        <label className="block text-sm font-medium text-zinc-200">
                          File Path
                        </label>
                        <input
                          type="text"
                          value={pushPath}
                          onChange={(e) => {
                            setPushPath(e.target.value);
                            setExistingSha(undefined);
                          }}
                          onBlur={checkExistingFile}
                          placeholder="templates/my-template/template.yaml"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                        />
                        <p className="text-[11px] text-zinc-500">
                          The path where the template file will be created or updated in the repo.
                          Use folders like <code className="text-zinc-400">templates/my-service/template.yaml</code>
                        </p>
                      </div>

                      {/* Branch */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Branch</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                        >
                          {branches.map((b) => (
                            <option key={b.name} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* New branch option */}
                      <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-lg p-3 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useNewBranch}
                            onChange={(e) => setUseNewBranch(e.target.checked)}
                            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-500 focus:ring-blue-500/40"
                          />
                          <span className="text-sm text-zinc-300">Create a new branch</span>
                        </label>
                        {useNewBranch && (
                          <input
                            type="text"
                            value={newBranch}
                            onChange={(e) => setNewBranch(e.target.value)}
                            placeholder="feature/update-template"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                          />
                        )}
                      </div>

                      {existingSha && (
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <p className="text-xs text-amber-400">
                            This file already exists and will be updated (overwritten).
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Commit Message</label>
                        <input
                          type="text"
                          value={commitMessage}
                          onChange={(e) => setCommitMessage(e.target.value)}
                          placeholder={`Update ${pushPath} via Backstage Template Builder`}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                        />
                      </div>

                      <button
                        onClick={handleValidateAndPush}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpFromLine className="w-4 h-4" />}
                        Validate & Push to GitHub
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {pushResult || success ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>

      {/* Validation Modal */}
      {showValidation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* Validation Header */}
            <div className="p-5 border-b border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Check className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">Template Validation</h2>
                  <p className="text-sm text-zinc-400">
                    Review potential issues before pushing to GitHub
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowValidation(false)}
                className="p-1 hover:bg-zinc-800 rounded transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Validation Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {(() => {
                const summary = getIssueSummary(validationIssues);
                return (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="text-2xl font-bold text-red-400">{summary.errors}</div>
                        <div className="text-xs text-red-300 mt-0.5">Errors</div>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <div className="text-2xl font-bold text-amber-400">{summary.warnings}</div>
                        <div className="text-xs text-amber-300 mt-0.5">Warnings</div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-400">{summary.infos}</div>
                        <div className="text-xs text-blue-300 mt-0.5">Info</div>
                      </div>
                    </div>

                    {/* Success message if no errors */}
                    {summary.total === 0 && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
                        <CircleCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-emerald-400">
                            No issues found!
                          </p>
                          <p className="text-xs text-emerald-300 mt-0.5">
                            Your template looks good and is ready to push.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Issues List */}
                    {validationIssues.length > 0 && (
                      <div className="space-y-2">
                        {validationIssues.map((issue, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              issue.severity === 'error'
                                ? 'bg-red-500/10 border-red-500/20'
                                : issue.severity === 'warning'
                                ? 'bg-amber-500/10 border-amber-500/20'
                                : 'bg-blue-500/10 border-blue-500/20'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <AlertCircle
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  issue.severity === 'error'
                                    ? 'text-red-400'
                                    : issue.severity === 'warning'
                                    ? 'text-amber-400'
                                    : 'text-blue-400'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-medium uppercase ${
                                      issue.severity === 'error'
                                        ? 'text-red-400'
                                        : issue.severity === 'warning'
                                        ? 'text-amber-400'
                                        : 'text-blue-400'
                                    }`}
                                  >
                                    {issue.severity}
                                  </span>
                                  {issue.location && (
                                    <span className="text-xs text-zinc-500 font-mono">
                                      {issue.location}
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-sm mt-1 ${
                                    issue.severity === 'error'
                                      ? 'text-red-200'
                                      : issue.severity === 'warning'
                                      ? 'text-amber-200'
                                      : 'text-blue-200'
                                  }`}
                                >
                                  {issue.message}
                                </p>
                                {issue.suggestion && (
                                  <p className="text-xs text-zinc-400 mt-1">
                                    💡 {issue.suggestion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Warning about errors */}
                    {summary.errors > 0 && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <p className="text-sm text-red-300">
                          <strong>⚠️ Critical issues detected.</strong> Your template has {summary.errors} error{summary.errors !== 1 ? 's' : ''} that may prevent it from working correctly. We recommend fixing these issues before pushing.
                        </p>
                      </div>
                    )}

                    {/* Accept checkbox */}
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={validationAccepted}
                          onChange={(e) => setValidationAccepted(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded bg-zinc-900 border-zinc-700 text-blue-500 focus:ring-blue-500/40"
                        />
                        <span className="text-sm text-zinc-300">
                          I understand that this validation is not exhaustive and does not test actual template execution.
                          {summary.errors > 0 && ' I want to proceed despite the errors listed above.'}
                        </span>
                      </label>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Validation Footer */}
            <div className="p-4 border-t border-zinc-700 flex justify-between">
              <button
                onClick={() => setShowValidation(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePush}
                disabled={!validationAccepted || loading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpFromLine className="w-4 h-4" />}
                Proceed with Push
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Subcomponents ---

function RepoBrowser({
  repos,
  search,
  onSearchChange,
  onSearch,
  onSelect,
  loading,
}: {
  repos: GitHubRepo[];
  search: string;
  onSearchChange: (s: string) => void;
  onSearch: () => void;
  onSelect: (r: GitHubRepo) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3">
        <Search className="w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="Search repositories..."
          className="flex-1 bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
        />
        {loading && <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />}
      </div>
      <div className="max-h-[300px] overflow-y-auto space-y-1">
        {repos.map((repo) => (
          <button
            key={repo.full_name}
            onClick={() => onSelect(repo)}
            className="w-full text-left p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
          >
            <div className="flex items-center gap-2">
              <img src={repo.owner.avatar_url} alt="" className="w-5 h-5 rounded" />
              <span className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 truncate">{repo.full_name}</span>
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

function SelectedRepoHeader({ repo, onDeselect }: { repo: GitHubRepo; onDeselect: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/30 rounded-lg">
      <img src={repo.owner.avatar_url} alt="" className="w-8 h-8 rounded" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-200 truncate">{repo.full_name}</p>
        <p className="text-xs text-zinc-500">Default branch: {repo.default_branch}</p>
      </div>
      <button onClick={onDeselect} className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
