

import React, { useState, useEffect } from 'react';
import { ActionDefinition, ActionInput, StepActionCategory } from '../../types/template';
import {
  getCustomActions,
  addCustomAction,
  removeCustomAction,
  saveCustomActions,
} from '../../lib/actions-catalog';
import {
  Plus,
  Trash2,
  X,
  Zap,
  Download,
  AlertCircle,
  Loader2,
  Settings2,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import yaml from 'js-yaml';

const CATEGORIES: { value: StepActionCategory; label: string }[] = [
  { value: 'fetch', label: 'Fetch' },
  { value: 'publish', label: 'Publish' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'debug', label: 'Debug' },
  { value: 'fs', label: 'Filesystem' },
  { value: 'custom', label: 'Custom' },
];

interface CustomActionsManagerProps {
  onClose: () => void;
}

export default function CustomActionsManager({ onClose }: CustomActionsManagerProps) {
  const [actions, setActions] = useState<ActionDefinition[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  useEffect(() => {
    setActions(getCustomActions());
  }, []);

  const handleRemove = (actionId: string) => {
    removeCustomAction(actionId);
    setActions(getCustomActions());
  };

  const handleAdd = (action: ActionDefinition) => {
    addCustomAction(action);
    setActions(getCustomActions());
    setShowAddForm(false);
  };

  const handleImport = (imported: ActionDefinition[]) => {
    const existing = getCustomActions();
    const merged = [...existing];
    for (const a of imported) {
      const idx = merged.findIndex((m) => m.action === a.action);
      if (idx >= 0) {
        merged[idx] = a;
      } else {
        merged.push(a);
      }
    }
    saveCustomActions(merged);
    setActions(getCustomActions());
    setShowImport(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <Settings2 className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Custom Actions</h2>
              <p className="text-sm text-zinc-400">
                Manage custom scaffolder actions for your organization
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Actions list */}
          {actions.length === 0 && !showAddForm && !showImport && (
            <div className="text-center py-8 space-y-3">
              <Zap className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="text-sm text-zinc-400">No custom actions defined yet</p>
              <p className="text-xs text-zinc-500">
                Add custom scaffolder actions that your Backstage instance provides.
              </p>
            </div>
          )}

          {actions.length > 0 && (
            <div className="space-y-1">
              {actions.map((action) => (
                <div key={action.action} className="rounded-lg border border-zinc-700/30 bg-zinc-800/30">
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-zinc-800/60 rounded-lg transition-colors"
                    onClick={() => setExpandedAction(expandedAction === action.action ? null : action.action)}
                  >
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{action.label}</p>
                      <p className="text-xs text-zinc-500 font-mono">{action.action}</p>
                    </div>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded capitalize">
                      {action.category}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(action.action); }}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {expandedAction === action.action ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  {expandedAction === action.action && (
                    <div className="px-3 pb-3 pt-1 border-t border-zinc-700/30">
                      <p className="text-xs text-zinc-400 mb-2">{action.description}</p>
                      {action.inputs.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Inputs</p>
                          {action.inputs.map((input) => (
                            <div key={input.name} className="flex items-center gap-2 text-xs">
                              <span className="text-zinc-300 font-mono">{input.name}</span>
                              <span className="text-zinc-600">({input.type})</span>
                              {input.required && <span className="text-amber-400">*</span>}
                              {input.description && (
                                <span className="text-zinc-500 truncate">— {input.description}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Form */}
          {showAddForm && (
            <AddActionForm
              onAdd={handleAdd}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Import */}
          {showImport && (
            <ImportActions
              onImport={handleImport}
              onCancel={() => setShowImport(false)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-700 flex items-center gap-2">
          {!showAddForm && !showImport && (
            <>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Action
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Import
              </button>
            </>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Add Action Form ---

function AddActionForm({
  onAdd,
  onCancel,
}: {
  onAdd: (action: ActionDefinition) => void;
  onCancel: () => void;
}) {
  const [actionId, setActionId] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<StepActionCategory>('custom');
  const [inputs, setInputs] = useState<ActionInput[]>([]);

  const addInput = () => {
    setInputs([...inputs, { name: '', label: '', type: 'string' }]);
  };

  const updateInput = (idx: number, field: keyof ActionInput, value: unknown) => {
    const updated = [...inputs];
    updated[idx] = { ...updated[idx], [field]: value };
    setInputs(updated);
  };

  const removeInput = (idx: number) => {
    setInputs(inputs.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!actionId.trim() || !label.trim()) return;
    onAdd({
      action: actionId.trim(),
      label: label.trim(),
      description: description.trim(),
      category,
      inputs: inputs.filter((i) => i.name.trim()),
    });
  };

  return (
    <div className="space-y-4 bg-zinc-800/50 rounded-lg border border-zinc-700/30 p-4">
      <h3 className="text-sm font-semibold text-zinc-200">Add Custom Action</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Action ID <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            value={actionId}
            onChange={(e) => setActionId(e.target.value)}
            placeholder="acme:service:create"
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Label <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Create Acme Service"
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Creates a new service in the Acme platform"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as StepActionCategory)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Inputs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400">Action Inputs</label>
          <button
            onClick={addInput}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Input
          </button>
        </div>
        {inputs.map((input, idx) => (
          <div key={idx} className="flex items-start gap-2 bg-zinc-900/50 rounded p-2">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input
                type="text"
                value={input.name}
                onChange={(e) => updateInput(idx, 'name', e.target.value)}
                placeholder="paramName"
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
              <input
                type="text"
                value={input.label}
                onChange={(e) => updateInput(idx, 'label', e.target.value)}
                placeholder="Label"
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
              <select
                value={input.type}
                onChange={(e) => updateInput(idx, 'type', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none"
              >
                <option value="string">string</option>
                <option value="boolean">boolean</option>
                <option value="array">array</option>
                <option value="object">object</option>
              </select>
            </div>
            <label className="flex items-center gap-1 text-xs text-zinc-500 pt-1">
              <input
                type="checkbox"
                checked={!!input.required}
                onChange={(e) => updateInput(idx, 'required', e.target.checked)}
                className="w-3 h-3 rounded bg-zinc-900 border-zinc-700 text-blue-500"
              />
              Req
            </label>
            <button
              onClick={() => removeInput(idx)}
              className="p-1 text-zinc-500 hover:text-red-400 transition-colors mt-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!actionId.trim() || !label.trim()}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-sm font-medium transition-colors"
        >
          Add Action
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// --- Import Actions ---

function ImportActions({
  onImport,
  onCancel,
}: {
  onImport: (actions: ActionDefinition[]) => void;
  onCancel: () => void;
}) {
  const [importMode, setImportMode] = useState<'url' | 'paste'>('paste');
  const [url, setUrl] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseActions = (content: string): ActionDefinition[] => {
    // Try JSON first
    try {
      const data = JSON.parse(content);
      const arr = Array.isArray(data) ? data : data.actions || [data];
      return arr.map(validateAction).filter(Boolean) as ActionDefinition[];
    } catch {
      // Try YAML
      try {
        const data = yaml.load(content) as Record<string, unknown>;
        const arr = Array.isArray(data) ? data : (data as Record<string, unknown>).actions || [data];
        return (arr as Record<string, unknown>[]).map(validateAction).filter(Boolean) as ActionDefinition[];
      } catch {
        throw new Error('Could not parse as JSON or YAML');
      }
    }
  };

  const validateAction = (raw: Record<string, unknown>): ActionDefinition | null => {
    if (!raw.action || typeof raw.action !== 'string') return null;
    return {
      action: raw.action as string,
      label: (raw.label as string) || (raw.name as string) || raw.action as string,
      description: (raw.description as string) || '',
      category: (raw.category as StepActionCategory) || 'custom',
      inputs: Array.isArray(raw.inputs)
        ? (raw.inputs as Record<string, unknown>[]).map((i) => ({
            name: (i.name as string) || '',
            label: (i.label as string) || (i.name as string) || '',
            type: ((i.type as string) || 'string') as ActionInput['type'],
            required: !!i.required,
            description: i.description as string,
          }))
        : [],
    };
  };

  const handleImportFromUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const content = data.content || '';
      const actions = parseActions(content);
      if (actions.length === 0) throw new Error('No valid actions found in the file');
      onImport(actions);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromPaste = () => {
    setError(null);
    try {
      const actions = parseActions(pasteContent);
      if (actions.length === 0) throw new Error('No valid actions found');
      onImport(actions);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4 bg-zinc-800/50 rounded-lg border border-zinc-700/30 p-4">
      <h3 className="text-sm font-semibold text-zinc-200">Import Custom Actions</h3>

      <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
        <button
          onClick={() => setImportMode('paste')}
          className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
            importMode === 'paste' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Paste JSON/YAML
        </button>
        <button
          onClick={() => setImportMode('url')}
          className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
            importMode === 'url' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          From URL
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {importMode === 'paste' && (
        <div className="space-y-3">
          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder={`Paste JSON or YAML, e.g.:\n[\n  {\n    "action": "acme:deploy",\n    "label": "Deploy to Acme",\n    "description": "Deploys service",\n    "category": "custom",\n    "inputs": [\n      { "name": "env", "label": "Environment", "type": "string", "required": true }\n    ]\n  }\n]`}
            rows={10}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportFromPaste}
              disabled={!pasteContent.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-xs font-medium transition-colors"
            >
              Import
            </button>
            <button onClick={onCancel} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {importMode === 'url' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              URL to actions definition file (JSON or YAML)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/org/repo/blob/main/custom-actions.json"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportFromUrl}
              disabled={loading || !url.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white disabled:text-zinc-400 rounded-lg text-xs font-medium transition-colors"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Fetch & Import
            </button>
            <button onClick={onCancel} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900/50 rounded p-3 space-y-1">
        <p className="text-xs font-medium text-zinc-400">Expected format</p>
        <p className="text-xs text-zinc-500">
          JSON or YAML array of actions, each with: <code className="text-zinc-400">action</code> (id),{' '}
          <code className="text-zinc-400">label</code>, <code className="text-zinc-400">description</code>,{' '}
          <code className="text-zinc-400">category</code>, and{' '}
          <code className="text-zinc-400">inputs</code> (array of name/label/type/required).
        </p>
      </div>
    </div>
  );
}
