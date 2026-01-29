import React, { useState, useEffect } from 'react';
import { X, Settings2, Database, GitBranch, FileText, Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isConnected, validateToken, clearToken } from '../../lib/github-client';
import {
  getActionRepositories,
  addActionRepository,
  removeActionRepository,
  refreshRepositoryActions,
  ActionRepository,
} from '../../lib/actions-catalog';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingsTab = 'github' | 'actions' | 'general';

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('github');
  const [ghConnected, setGhConnected] = useState(isConnected());
  const [ghToken, setGhToken] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Action Repositories state
  const [repositories, setRepositories] = useState<ActionRepository[]>([]);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [repoSuccess, setRepoSuccess] = useState<string | null>(null);

  useEffect(() => {
    setRepositories(getActionRepositories());
  }, []);

  const handleConnectGitHub = async () => {
    if (!ghToken.trim()) {
      setError('Token is required');
      return;
    }

    setValidating(true);
    setError(null);
    setSuccess(null);

    try {
      const user = await validateToken(ghToken.trim());
      if (user) {
        setGhConnected(true);
        setSuccess(`Connected as ${user.login}`);
        setGhToken('');
      } else {
        setError('Invalid token');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setValidating(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect from GitHub? You will need to re-enter your token.')) {
      clearToken();
      setGhConnected(false);
      setSuccess('Disconnected from GitHub');
    }
  };

  // Action Repositories handlers
  const handleAddRepo = async () => {
    if (!newRepoUrl.trim()) {
      setRepoError('Repository URL is required');
      return;
    }

    setRepoLoading(true);
    setRepoError(null);
    setRepoSuccess(null);

    try {
      const repo: ActionRepository = {
        url: newRepoUrl.trim(),
        name: newRepoName.trim() || new URL(newRepoUrl.trim()).hostname,
        enabled: true,
      };

      addActionRepository(repo);
      setRepositories(getActionRepositories());
      setNewRepoUrl('');
      setNewRepoName('');
      setRepoSuccess(`Added repository: ${repo.name}`);

      // Fetch actions from the new repository
      await refreshRepositoryActions();
      setRepoSuccess(`Successfully fetched actions from ${repo.name}`);
    } catch (err) {
      setRepoError((err as Error).message);
    } finally {
      setRepoLoading(false);
    }
  };

  const handleToggleRepo = (url: string) => {
    const repo = repositories.find(r => r.url === url);
    if (repo) {
      addActionRepository({ ...repo, enabled: !repo.enabled });
      setRepositories(getActionRepositories());
    }
  };

  const handleRemoveRepo = (url: string) => {
    if (confirm('Remove this action repository?')) {
      removeActionRepository(url);
      setRepositories(getActionRepositories());
      setRepoSuccess('Repository removed');
    }
  };

  const handleRefreshAllRepos = async () => {
    setRepoLoading(true);
    setRepoError(null);
    setRepoSuccess(null);

    try {
      await refreshRepositoryActions();
      setRepoSuccess('Successfully refreshed all repositories');
    } catch (err) {
      setRepoError((err as Error).message);
    } finally {
      setRepoLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-xl my-8 flex flex-col max-h-[75vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-zinc-700/50 bg-zinc-900/30">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'github'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            GitHub
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'actions'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            Action Repositories
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            General
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* GitHub Tab */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">GitHub Integration</h3>
                <p className="text-sm text-zinc-400">
                  Connect to GitHub to enable template synchronization with your repositories.
                </p>
              </div>

              {/* Status messages */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                  {success}
                </div>
              )}

              {!ghConnected ? (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      GitHub Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={ghToken}
                      onChange={(e) => setGhToken(e.target.value)}
                      placeholder="ghp_..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      disabled={validating}
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      Create a token at{' '}
                      <a
                        href="https://github.com/settings/tokens/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        github.com/settings/tokens
                      </a>{' '}
                      with <code className="text-zinc-400">repo</code> scope.
                    </p>
                  </div>
                  <button
                    onClick={handleConnectGitHub}
                    disabled={validating || !ghToken.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    {validating ? 'Connecting...' : 'Connect GitHub'}
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-400">Connected to GitHub</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        GitHub integration is active. Use the Load Template and Push buttons in the toolbar.
                      </p>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Configure enterprise action repositories to auto-load custom scaffolder actions.
                Repositories should provide a JSON or YAML file with an array of action definitions.
              </p>

              {/* Status messages */}
              {repoError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {repoError}
                </div>
              )}
              {repoSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {repoSuccess}
                </div>
              )}

              {/* Add new repository */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-zinc-300">Add Repository</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Repository URL
                    </label>
                    <input
                      type="text"
                      value={newRepoUrl}
                      onChange={(e) => setNewRepoUrl(e.target.value)}
                      placeholder="https://example.com/actions.json"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      disabled={repoLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Repository Name (optional)
                    </label>
                    <input
                      type="text"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="My Enterprise Actions"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      disabled={repoLoading}
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddRepo}
                  disabled={repoLoading || !newRepoUrl.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Repository
                </button>
              </div>

              {/* Repository list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-zinc-300">
                    Configured Repositories ({repositories.length})
                  </h3>
                  {repositories.length > 0 && (
                    <button
                      onClick={handleRefreshAllRepos}
                      disabled={repoLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${repoLoading ? 'animate-spin' : ''}`} />
                      Refresh All
                    </button>
                  )}
                </div>

                {repositories.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-700/50 rounded-lg">
                    No repositories configured. Add one above to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {repositories.map((repo) => (
                      <div
                        key={repo.url}
                        className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg"
                      >
                        <button
                          onClick={() => handleToggleRepo(repo.url)}
                          className="shrink-0"
                          title={repo.enabled ? 'Disable repository' : 'Enable repository'}
                        >
                          {repo.enabled ? (
                            <ToggleRight className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-zinc-600" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-200">
                            {repo.name}
                          </div>
                          <div className="text-xs text-zinc-500 truncate font-mono">
                            {repo.url}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveRepo(repo.url)}
                          className="shrink-0 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Remove repository"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Example format */}
              <details className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
                <summary className="text-sm font-medium text-zinc-400 cursor-pointer">
                  Expected Repository Format
                </summary>
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-zinc-500">
                    Your repository URL should return JSON or YAML in one of these formats:
                  </p>
                  <pre className="text-xs bg-zinc-900 border border-zinc-700 rounded p-3 overflow-x-auto text-zinc-300">
{`// Array format:
[
  {
    "action": "mycompany:deploy",
    "label": "Deploy to Production",
    "description": "Deploys the application",
    "category": "deploy",
    "inputs": [
      { "name": "environment", "type": "string", "required": true }
    ]
  }
]

// Or object format:
{
  "actions": [ /* same as above */ ]
}`}
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">General Settings</h3>
                <p className="text-sm text-zinc-400">
                  Application preferences and configurations.
                </p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">Template Version</p>
                      <p className="text-xs text-zinc-500">Scaffolder API version</p>
                    </div>
                    <span className="text-xs text-zinc-400 px-2 py-1 bg-zinc-700 rounded">
                      v1beta3
                    </span>
                  </div>
                  <div className="border-t border-zinc-700 pt-3">
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Clear All Settings
                    </button>
                    <p className="text-xs text-zinc-500 mt-1">
                      Removes all stored data including GitHub tokens and custom actions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
