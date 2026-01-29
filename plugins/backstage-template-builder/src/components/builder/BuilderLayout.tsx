import React, { useState } from 'react';
import { useTemplateStore, BuilderTab } from '../../store/template-store';
import MetadataPanel from '../panels/MetadataPanel';
import ParametersPanel from '../panels/ParametersPanel';
import StepsPanel from '../panels/StepsPanel';
import OutputPanel from '../panels/OutputPanel';
import YamlPreview from '../panels/YamlPreview';
import FlowView from '../panels/FlowView';
import EndUserPreview from '../panels/EndUserPreview';
import GitHubLoader from './GitHubLoader';
import GitHubSync from './GitHubSync';
import SettingsModal from './SettingsModal';
import { createBlankTemplate } from '../../lib/yaml-utils';
import { isConnected } from '../../lib/github-client';
import {
  FileText,
  Settings,
  Workflow,
  ExternalLink,
  FolderGit2,
  FilePlus2,
  Code2,
  PanelRightOpen,
  PanelRightClose,
  Eye,
  GitFork,
  ArrowUpFromLine,
  GitBranch,
  Pencil,
  Check,
  X,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Settings2,
} from 'lucide-react';

type ViewMode = 'editor' | 'flow' | 'preview';

const TABS: { id: BuilderTab; label: string; icon: React.ReactNode }[] = [
  { id: 'metadata', label: 'Metadata', icon: <FileText className="w-4 h-4" /> },
  { id: 'parameters', label: 'Parameters', icon: <Settings className="w-4 h-4" /> },
  { id: 'steps', label: 'Steps', icon: <Workflow className="w-4 h-4" /> },
  { id: 'output', label: 'Output', icon: <ExternalLink className="w-4 h-4" /> },
];

export default function BuilderLayout() {
  const { state, dispatch } = useTemplateStore();
  const [showLoader, setShowLoader] = useState(false);
  const [showYaml, setShowYaml] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [syncMode, setSyncMode] = useState<'connect' | 'pull' | 'push' | null>(null);
  const [ghConnected, setGhConnected] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editName, setEditName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Check GitHub connection on mount
  React.useEffect(() => {
    setGhConnected(isConnected());
  }, [syncMode]);

  const handleNew = () => {
    if (state.isDirty && !confirm('You have unsaved changes. Create a new template?')) return;
    dispatch({ type: 'SET_TEMPLATE', payload: createBlankTemplate() });
  };

  const handleSwitchToTab = (tab: string) => {
    setViewMode('editor');
    dispatch({ type: 'SET_TAB', payload: tab as BuilderTab });
  };

  const handleStartEdit = () => {
    setEditTitle(state.template.metadata.title || '');
    setEditName(state.template.metadata.name);
    setIsEditingTitle(true);
  };

  const handleSaveEdit = () => {
    dispatch({
      type: 'UPDATE_METADATA',
      payload: {
        title: editTitle,
        name: editName,
      },
    });
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight">
                Backstage Template Builder
              </span>
              <span className="text-[10px] text-zinc-500 tracking-tight">
                Visual authoring for Backstage scaffolder templates
              </span>
            </div>
          </div>
          <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded-full">
            v1beta3
          </span>

          {/* Current template info */}
          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-zinc-700">
            {!isEditingTitle ? (
              <>
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-300 font-medium">
                    {state.template.metadata.title || 'Untitled'}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {state.template.metadata.name}
                  </span>
                </div>
                <button
                  onClick={handleStartEdit}
                  className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                  title="Edit template info"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {state.isDirty && (
                  <span className="text-xs text-amber-400 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">
                    Unsaved
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Template title"
                    className="text-sm text-zinc-300 font-medium bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 focus:outline-none focus:border-blue-500 w-48"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="template-name"
                    className="text-xs text-zinc-400 font-mono bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 focus:outline-none focus:border-blue-500 w-48"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveEdit}
                    className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'editor'
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              onClick={() => setViewMode('flow')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'flow'
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              Flow
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'preview'
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-700 mx-1" />

          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            New
          </button>
          <button
            onClick={() => setShowLoader(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            Load Template
          </button>

          {viewMode !== 'preview' && (
            <>
              <div className="w-px h-6 bg-zinc-700 mx-1" />
              <button
                onClick={() => setShowYaml(!showYaml)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
              >
                {showYaml ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
                YAML
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor mode */}
        {viewMode === 'editor' && (
          <>
            {/* Tab sidebar */}
            <nav className="w-48 shrink-0 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
              <div className="p-2 space-y-0.5 flex-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      state.activeTab === tab.id
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Bottom menu */}
              <div className="p-3 border-t border-zinc-800 space-y-1">
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                <a
                  href="https://github.com/balajisiva/backstage-template-builder#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Help</span>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
                <a
                  href="https://github.com/balajisiva/backstage-template-builder/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback or Bug Report</span>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </div>
            </nav>

            {/* Editor area */}
            <main className="flex-1 overflow-auto p-6">
              {state.activeTab === 'metadata' && <MetadataPanel />}
              {state.activeTab === 'parameters' && <ParametersPanel />}
              {state.activeTab === 'steps' && <StepsPanel />}
              {state.activeTab === 'output' && <OutputPanel />}
            </main>
          </>
        )}

        {/* Flow mode */}
        {viewMode === 'flow' && (
          <main className="flex-1 overflow-hidden bg-zinc-950 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[length:24px_24px]">
            <FlowView onSwitchToTab={handleSwitchToTab} />
          </main>
        )}

        {/* Preview mode */}
        {viewMode === 'preview' && (
          <main className="flex-1 overflow-hidden">
            <EndUserPreview />
          </main>
        )}

        {/* YAML preview */}
        {showYaml && viewMode !== 'preview' && (
          <aside className="w-[420px] shrink-0 border-l border-zinc-800 bg-zinc-950 flex flex-col">
            <YamlPreview onPush={() => setSyncMode('push')} />
          </aside>
        )}
      </div>

      {/* Loader modal */}
      {showLoader && <GitHubLoader onClose={() => setShowLoader(false)} />}

      {/* GitHub Sync modal */}
      {syncMode && <GitHubSync mode={syncMode} onClose={() => setSyncMode(null)} />}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onOpenGitHubSync={(mode) => {
            setShowSettings(false);
            setSyncMode(mode);
          }}
        />
      )}
    </div>
  );
}
