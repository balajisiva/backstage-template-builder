import React, { useState } from 'react';
import { X, Settings2, Database, GitBranch, FileText } from 'lucide-react';
import ActionRepositoriesContent from './ActionRepositoriesContent';
import { isConnected, validateToken, disconnectGitHub } from '../../lib/github-client';

interface SettingsModalProps {
  onClose: () => void;
  onOpenGitHubSync: (mode: 'connect' | 'pull' | 'push') => void;
}

type SettingsTab = 'github' | 'actions' | 'general';

export default function SettingsModal({ onClose, onOpenGitHubSync }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('github');
  const [ghConnected, setGhConnected] = useState(isConnected());
  const [ghToken, setGhToken] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      disconnectGitHub();
      setGhConnected(false);
      setSuccess('Disconnected from GitHub');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-3xl my-8 flex flex-col max-h-[85vh]">
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
                  Connect to GitHub to load and push templates to your repositories.
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
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-400">Connected to GitHub</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        You can now load and push templates to your repositories.
                      </p>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenGitHubSync('pull');
                      }}
                      className="flex-1 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
                    >
                      Load Template
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenGitHubSync('push');
                      }}
                      className="flex-1 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                    >
                      Push Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <ActionRepositoriesContent />
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
