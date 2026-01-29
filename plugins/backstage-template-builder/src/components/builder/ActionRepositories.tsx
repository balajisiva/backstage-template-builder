import React, { useState, useEffect } from 'react';
import {
  getActionRepositories,
  addActionRepository,
  removeActionRepository,
  refreshRepositoryActions,
  ActionRepository,
} from '../../lib/actions-catalog';
import { X, Plus, RefreshCw, Database, Trash2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ActionRepositoriesProps {
  onClose: () => void;
}

export default function ActionRepositories({ onClose }: ActionRepositoriesProps) {
  const [repositories, setRepositories] = useState<ActionRepository[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setRepositories(getActionRepositories());
  }, []);

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      setError('Repository URL is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const repo: ActionRepository = {
        url: newUrl.trim(),
        name: newName.trim() || new URL(newUrl.trim()).hostname,
        enabled: true,
      };

      addActionRepository(repo);
      setRepositories(getActionRepositories());
      setNewUrl('');
      setNewName('');
      setSuccess(`Added repository: ${repo.name}`);

      // Fetch actions from the new repository
      await refreshRepositoryActions();
      setSuccess(`Successfully fetched actions from ${repo.name}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (url: string) => {
    const repo = repositories.find(r => r.url === url);
    if (repo) {
      addActionRepository({ ...repo, enabled: !repo.enabled });
      setRepositories(getActionRepositories());
    }
  };

  const handleRemove = (url: string) => {
    if (confirm('Remove this action repository?')) {
      removeActionRepository(url);
      setRepositories(getActionRepositories());
      setSuccess('Repository removed');
    }
  };

  const handleRefreshAll = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await refreshRepositoryActions();
      setSuccess('Successfully refreshed all repositories');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Action Repositories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-zinc-400">
            Configure enterprise action repositories to auto-load custom scaffolder actions.
            Repositories should provide a JSON or YAML file with an array of action definitions.
          </p>

          {/* Status messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
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
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/actions.json"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Repository Name (optional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Enterprise Actions"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={loading || !newUrl.trim()}
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
                  onClick={handleRefreshAll}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh All
                </button>
              )}
            </div>

            {repositories.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
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
                      onClick={() => handleToggle(repo.url)}
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
                      onClick={() => handleRemove(repo.url)}
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
