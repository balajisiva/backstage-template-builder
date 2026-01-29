

import React, { useState } from 'react';
import { useTemplateStore } from '../../store/template-store';
import { TemplateStep } from '../../types/template';
import { getAllActionsIncludingRepositories as getAllActions, getActionDefinition } from '../../lib/actions-catalog';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Database,
  GitBranch,
  Bug,
  FolderOpen,
  Zap,
  Search,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  fetch: <Download className="w-4 h-4" />,
  publish: <Upload className="w-4 h-4" />,
  catalog: <Database className="w-4 h-4" />,
  github: <GitBranch className="w-4 h-4" />,
  gitlab: <GitBranch className="w-4 h-4" />,
  debug: <Bug className="w-4 h-4" />,
  fs: <FolderOpen className="w-4 h-4" />,
  custom: <Zap className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  fetch: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  publish: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  catalog: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  github: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  gitlab: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  debug: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  fs: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  custom: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

function SortableStepItem({
  step,
  isSelected,
  onSelect,
  onDelete,
}: {
  step: TemplateStep;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const actionDef = getActionDefinition(step.action);
  const category = actionDef?.category || 'custom';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border transition-all ${
        isSelected
          ? 'bg-zinc-800 border-blue-500/30 ring-1 ring-blue-500/20'
          : 'bg-zinc-800/30 border-zinc-700/30 hover:border-zinc-600'
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer" onClick={onSelect}>
        <button {...attributes} {...listeners} className="cursor-grab text-zinc-500 hover:text-zinc-300">
          <GripVertical className="w-4 h-4" />
        </button>
        <span className={`p-1 rounded border ${CATEGORY_COLORS[category]}`}>
          {CATEGORY_ICONS[category]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">{step.name}</p>
          <p className="text-xs text-zinc-500 font-mono">{step.action}</p>
        </div>
        {step.if && (
          <span className="text-xs bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
            conditional
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {isSelected ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
      </div>
    </div>
  );
}

function StepDetailEditor({ step }: { step: TemplateStep }) {
  const { dispatch } = useTemplateStore();
  const actionDef = getActionDefinition(step.action);

  const updateStep = (data: Partial<TemplateStep>) => {
    dispatch({ type: 'UPDATE_STEP', payload: { id: step.id, data } });
  };

  const updateInput = (key: string, value: string) => {
    const input = { ...step.input };
    if (value === '') {
      delete input[key];
    } else {
      // Try parsing JSON for object/array types
      try {
        input[key] = JSON.parse(value);
      } catch {
        input[key] = value;
      }
    }
    updateStep({ input });
  };

  return (
    <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/30 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Step ID</label>
          <input
            type="text"
            value={step.id}
            onChange={(e) => updateStep({ id: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Step Name</label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => updateStep({ name: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Conditional (if)</label>
        <input
          type="text"
          value={step.if || ''}
          onChange={(e) => updateStep({ if: e.target.value || undefined })}
          placeholder="${{ parameters.skipStep !== true }}"
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Inputs</h4>
        {actionDef?.inputs.map((inputDef) => (
          <div key={inputDef.name}>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1">
              {inputDef.label}
              {inputDef.required && <span className="text-amber-400">*</span>}
            </label>
            {inputDef.description && (
              <p className="text-xs text-zinc-500 mb-1">{inputDef.description}</p>
            )}
            {inputDef.type === 'object' || inputDef.type === 'array' ? (
              <textarea
                value={typeof step.input[inputDef.name] === 'object' ? JSON.stringify(step.input[inputDef.name], null, 2) : (step.input[inputDef.name] as string) || ''}
                onChange={(e) => updateInput(inputDef.name, e.target.value)}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none"
              />
            ) : inputDef.type === 'boolean' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!step.input[inputDef.name]}
                  onChange={(e) => updateInput(inputDef.name, e.target.checked ? 'true' : '')}
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-blue-500 focus:ring-blue-500/40"
                />
                <span className="text-xs text-zinc-400">Enabled</span>
              </label>
            ) : (
              <input
                type="text"
                value={(step.input[inputDef.name] as string) || ''}
                onChange={(e) => updateInput(inputDef.name, e.target.value)}
                placeholder={inputDef.default !== undefined ? String(inputDef.default) : ''}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            )}
          </div>
        ))}
        {!actionDef && (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Raw Input (JSON)</label>
            <textarea
              value={JSON.stringify(step.input, null, 2)}
              onChange={(e) => {
                try { updateStep({ input: JSON.parse(e.target.value) }); } catch { /* ignore */ }
              }}
              rows={6}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/40 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StepsPanel() {
  const { state, dispatch } = useTemplateStore();
  const { steps } = state.template.spec;
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionPicker, setShowActionPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const addStep = (action: string) => {
    const actionDef = getActionDefinition(action);
    const newStep: TemplateStep = {
      id: action.replace(/[:.]/g, '-') + '-' + Date.now().toString(36),
      name: actionDef?.label || action,
      action,
      input: {},
    };
    dispatch({ type: 'ADD_STEP', payload: newStep });
    dispatch({ type: 'SELECT_STEP', payload: newStep.id });
    setShowActionPicker(false);
    setSearchTerm('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = steps.findIndex((s) => s.id === active.id);
    const newIdx = steps.findIndex((s) => s.id === over.id);
    const newOrder = [...steps];
    const [moved] = newOrder.splice(oldIdx, 1);
    newOrder.splice(newIdx, 0, moved);
    dispatch({ type: 'REORDER_STEPS', payload: newOrder });
  };

  const allActions = getAllActions();
  const filteredActions = allActions.filter(
    (a) =>
      a.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(filteredActions.map((a) => a.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Template Steps</h2>
        <button
          onClick={() => setShowActionPicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>

      {/* Action picker modal */}
      {showActionPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-zinc-700">
              <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3">
                <Search className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search actions..."
                  autoFocus
                  className="flex-1 bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {categories.map((cat) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`p-1 rounded ${CATEGORY_COLORS[cat]}`}>
                      {CATEGORY_ICONS[cat]}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-300 capitalize">{cat}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredActions
                      .filter((a) => a.category === cat)
                      .map((action) => (
                        <button
                          key={action.action}
                          onClick={() => addStep(action.action)}
                          className="text-left p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30 hover:border-zinc-600 hover:bg-zinc-800 transition-all"
                        >
                          <p className="text-sm font-medium text-zinc-200">{action.label}</p>
                          <p className="text-xs text-zinc-500 font-mono">{action.action}</p>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{action.description}</p>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
              {/* Custom action */}
              <div>
                <button
                  onClick={() => {
                    const action = prompt('Enter custom action name:');
                    if (action) addStep(action);
                  }}
                  className="w-full text-left p-3 rounded-lg bg-zinc-800/50 border border-dashed border-zinc-700/50 hover:border-zinc-600 transition-all"
                >
                  <p className="text-sm font-medium text-zinc-300">Custom Action</p>
                  <p className="text-xs text-zinc-500">Enter a custom action identifier</p>
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-700">
              <button
                onClick={() => { setShowActionPicker(false); setSearchTerm(''); }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steps list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={step.id}>
                {idx > 0 && (
                  <div className="flex items-center justify-center py-1">
                    <div className="w-px h-4 bg-zinc-700" />
                  </div>
                )}
                <SortableStepItem
                  step={step}
                  isSelected={step.id === state.selectedStepId}
                  onSelect={() =>
                    dispatch({
                      type: 'SELECT_STEP',
                      payload: step.id === state.selectedStepId ? null : step.id,
                    })
                  }
                  onDelete={() => dispatch({ type: 'DELETE_STEP', payload: step.id })}
                />
                {step.id === state.selectedStepId && <StepDetailEditor step={step} />}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-700/50 rounded-lg">
          <Zap className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <p className="text-sm">No steps defined yet.</p>
          <p className="text-xs mt-1">Steps define the actions your template will execute.</p>
        </div>
      )}
    </div>
  );
}
