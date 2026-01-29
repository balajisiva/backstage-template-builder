

import React from 'react';
import { useTemplateStore } from '../../store/template-store';
import { getActionDefinition } from '../../lib/actions-catalog';
import {
  Download,
  Upload,
  Database,
  GitBranch,
  Bug,
  FolderOpen,
  Zap,
  Trash2,
  GripVertical,
  ArrowDown,
  Settings,
  ExternalLink,
  FileText,
  Plus,
  ChevronRight,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TemplateStep } from '../../types/template';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  fetch: <Download className="w-5 h-5" />,
  publish: <Upload className="w-5 h-5" />,
  catalog: <Database className="w-5 h-5" />,
  github: <GitBranch className="w-5 h-5" />,
  gitlab: <GitBranch className="w-5 h-5" />,
  debug: <Bug className="w-5 h-5" />,
  fs: <FolderOpen className="w-5 h-5" />,
  custom: <Zap className="w-5 h-5" />,
};

const CATEGORY_GRADIENT: Record<string, string> = {
  fetch: 'from-emerald-500/20 to-emerald-500/5',
  publish: 'from-blue-500/20 to-blue-500/5',
  catalog: 'from-purple-500/20 to-purple-500/5',
  github: 'from-orange-500/20 to-orange-500/5',
  gitlab: 'from-orange-500/20 to-orange-500/5',
  debug: 'from-yellow-500/20 to-yellow-500/5',
  fs: 'from-pink-500/20 to-pink-500/5',
  custom: 'from-zinc-500/20 to-zinc-500/5',
};

const CATEGORY_BORDER: Record<string, string> = {
  fetch: 'border-emerald-500/30',
  publish: 'border-blue-500/30',
  catalog: 'border-purple-500/30',
  github: 'border-orange-500/30',
  gitlab: 'border-orange-500/30',
  debug: 'border-yellow-500/30',
  fs: 'border-pink-500/30',
  custom: 'border-zinc-500/30',
};

const CATEGORY_TEXT: Record<string, string> = {
  fetch: 'text-emerald-400',
  publish: 'text-blue-400',
  catalog: 'text-purple-400',
  github: 'text-orange-400',
  gitlab: 'text-orange-400',
  debug: 'text-yellow-400',
  fs: 'text-pink-400',
  custom: 'text-zinc-400',
};

const CATEGORY_ACCENT: Record<string, string> = {
  fetch: 'bg-emerald-500',
  publish: 'bg-blue-500',
  catalog: 'bg-purple-500',
  github: 'bg-orange-500',
  gitlab: 'bg-orange-500',
  debug: 'bg-yellow-500',
  fs: 'bg-pink-500',
  custom: 'bg-zinc-500',
};

// The flow node for pipeline steps
function FlowStepNode({
  step,
  index,
  isSelected,
  onSelect,
  onDelete,
}: {
  step: TemplateStep;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  const actionDef = getActionDefinition(step.action);
  const category = actionDef?.category || 'custom';
  const inputKeys = Object.keys(step.input);

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        onClick={onSelect}
        className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden group ${
          isSelected
            ? `${CATEGORY_BORDER[category]} ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/5`
            : 'border-zinc-700/50 hover:border-zinc-600'
        }`}
      >
        {/* Gradient top accent */}
        <div className={`h-1 w-full ${CATEGORY_ACCENT[category]}`} />

        <div className={`bg-gradient-to-b ${CATEGORY_GRADIENT[category]} p-4`}>
          {/* Header row */}
          <div className="flex items-start gap-3">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className={`p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 ${CATEGORY_TEXT[category]}`}>
              {CATEGORY_ICONS[category]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Step {index + 1}
                </span>
                {step.if && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                    CONDITIONAL
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mt-0.5 truncate">{step.name}</h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{step.action}</p>
            </div>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Input preview pills */}
          {inputKeys.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 ml-[52px]">
              {inputKeys.slice(0, 4).map((key) => {
                const val = step.input[key];
                const displayVal =
                  typeof val === 'string'
                    ? val.length > 30
                      ? val.slice(0, 30) + '...'
                      : val
                    : typeof val === 'boolean'
                    ? String(val)
                    : JSON.stringify(val)?.slice(0, 20) + '...';
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 text-[10px] bg-zinc-900/50 border border-zinc-700/40 rounded-md px-2 py-0.5 text-zinc-400 max-w-[200px] truncate"
                  >
                    <span className="font-medium text-zinc-300">{key}:</span>
                    <span className="truncate">{displayVal}</span>
                  </span>
                );
              })}
              {inputKeys.length > 4 && (
                <span className="text-[10px] text-zinc-500 px-1.5 py-0.5">
                  +{inputKeys.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Conditional expression */}
          {step.if && (
            <div className="mt-2 ml-[52px] text-[10px] font-mono text-amber-400/70 bg-amber-500/5 border border-amber-500/10 rounded px-2 py-1 truncate">
              if: {step.if}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Drag overlay (ghost that follows mouse)
function DragOverlayNode({ step }: { step: TemplateStep }) {
  const actionDef = getActionDefinition(step.action);
  const category = actionDef?.category || 'custom';

  return (
    <div className={`rounded-xl border-2 ${CATEGORY_BORDER[category]} bg-zinc-900 shadow-2xl shadow-blue-500/10 p-4 w-[400px] opacity-90`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${CATEGORY_TEXT[category]} bg-zinc-800`}>
          {CATEGORY_ICONS[category]}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{step.name}</h3>
          <p className="text-xs text-zinc-500 font-mono">{step.action}</p>
        </div>
      </div>
    </div>
  );
}

// Connector arrow between steps
function FlowConnector({ hasConditional }: { hasConditional?: boolean }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className={`w-0.5 h-6 ${hasConditional ? 'bg-amber-500/30' : 'bg-zinc-700/60'}`} />
      <div className={`p-1 rounded-full ${hasConditional ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-zinc-800 border border-zinc-700/50'}`}>
        <ArrowDown className={`w-3 h-3 ${hasConditional ? 'text-amber-400' : 'text-zinc-500'}`} />
      </div>
      <div className={`w-0.5 h-6 ${hasConditional ? 'bg-amber-500/30' : 'bg-zinc-700/60'}`} />
    </div>
  );
}

export default function FlowView({ onSwitchToTab }: { onSwitchToTab: (tab: string) => void }) {
  const { state, dispatch } = useTemplateStore();
  const { template } = state;
  const { parameters, steps, output } = template.spec;
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = steps.findIndex((s) => s.id === active.id);
    const newIdx = steps.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const newOrder = [...steps];
    const [moved] = newOrder.splice(oldIdx, 1);
    newOrder.splice(newIdx, 0, moved);
    dispatch({ type: 'REORDER_STEPS', payload: newOrder });
  };

  const activeStep = activeId ? steps.find((s) => s.id === activeId) : null;

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-xl mx-auto py-8 px-4">
        {/* Start node: Metadata */}
        <div
          className="relative cursor-pointer rounded-xl border-2 border-zinc-700/50 bg-gradient-to-b from-zinc-800/80 to-zinc-900/50 p-4 transition-all hover:border-blue-500/30 group"
          onClick={() => onSwitchToTab('metadata')}
        >
          <div className="h-1 w-full bg-blue-500 absolute top-0 left-0 rounded-t-xl" />
          <div className="flex items-center gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Template</span>
              <h3 className="text-sm font-semibold text-zinc-100">{template.metadata.title || 'Untitled'}</h3>
              <p className="text-xs text-zinc-500">{template.metadata.description || 'No description'}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
          </div>
          {template.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 ml-[52px]">
              {template.metadata.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <FlowConnector />

        {/* Parameter steps */}
        <div
          className="relative cursor-pointer rounded-xl border-2 border-zinc-700/50 bg-gradient-to-b from-zinc-800/80 to-zinc-900/50 p-4 transition-all hover:border-indigo-500/30 group"
          onClick={() => onSwitchToTab('parameters')}
        >
          <div className="h-1 w-full bg-indigo-500 absolute top-0 left-0 rounded-t-xl" />
          <div className="flex items-center gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">User Input</span>
              <h3 className="text-sm font-semibold text-zinc-100">
                {parameters.length} Wizard Step{parameters.length !== 1 ? 's' : ''}
              </h3>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
          </div>
          {parameters.length > 0 && (
            <div className="space-y-1.5 mt-3 ml-[52px]">
              {parameters.map((p, i) => {
                const fieldCount = Object.keys(p.properties).length;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 text-xs bg-zinc-900/50 border border-zinc-700/40 rounded-lg px-2.5 py-1.5"
                  >
                    <span className="text-indigo-400 font-mono text-[10px] w-4">{i + 1}.</span>
                    <span className="text-zinc-300 font-medium truncate flex-1">{p.title}</span>
                    <span className="text-zinc-500 text-[10px]">
                      {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <FlowConnector />

        {/* Pipeline steps (draggable) */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div>
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  {idx > 0 && <FlowConnector hasConditional={!!step.if} />}
                  <FlowStepNode
                    step={step}
                    index={idx}
                    isSelected={step.id === state.selectedStepId}
                    onSelect={() => {
                      dispatch({ type: 'SET_TAB', payload: 'steps' });
                      dispatch({
                        type: 'SELECT_STEP',
                        payload: step.id === state.selectedStepId ? null : step.id,
                      });
                    }}
                    onDelete={() => dispatch({ type: 'DELETE_STEP', payload: step.id })}
                  />
                </React.Fragment>
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeStep ? <DragOverlayNode step={activeStep} /> : null}
          </DragOverlay>
        </DndContext>

        {steps.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-zinc-700/40 rounded-xl">
            <Zap className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm text-zinc-500">No pipeline steps</p>
            <button
              onClick={() => onSwitchToTab('steps')}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Go to Steps tab to add actions
            </button>
          </div>
        )}

        <FlowConnector />

        {/* Output node */}
        <div
          className="relative cursor-pointer rounded-xl border-2 border-zinc-700/50 bg-gradient-to-b from-zinc-800/80 to-zinc-900/50 p-4 transition-all hover:border-emerald-500/30 group"
          onClick={() => onSwitchToTab('output')}
        >
          <div className="h-1 w-full bg-emerald-500 absolute top-0 left-0 rounded-t-xl" />
          <div className="flex items-center gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Output</span>
              <h3 className="text-sm font-semibold text-zinc-100">
                {output.links.length} Link{output.links.length !== 1 ? 's' : ''}
              </h3>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          {output.links.length > 0 && (
            <div className="space-y-1 mt-3 ml-[52px]">
              {output.links.map((link, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs bg-zinc-900/50 border border-zinc-700/40 rounded-lg px-2.5 py-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-zinc-300 truncate">{link.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* End marker */}
        <div className="flex flex-col items-center pt-4">
          <div className="w-0.5 h-4 bg-zinc-700/40" />
          <div className="w-3 h-3 rounded-full bg-zinc-700 border-2 border-zinc-600" />
          <span className="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-wider font-medium">Done</span>
        </div>
      </div>
    </div>
  );
}
