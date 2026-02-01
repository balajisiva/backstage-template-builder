

import React, { useState } from 'react';
import { useTemplateStore } from '../../store/template-store';
import { ParameterProperty, ParameterStep, ParameterFieldType } from '../../types/template';
import { UI_FIELDS, UI_WIDGETS } from '../../lib/actions-catalog';
import { FieldPalette } from '../builder/FieldPalette';
import { Tooltip } from '../ui/Tooltip';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Asterisk,
  Settings2,
  Copy,
  Type,
  Hash,
  ToggleLeft,
  List,
  Box,
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KeyboardSensor } from '@dnd-kit/core';

const FIELD_TYPE_ICONS: Record<string, React.ReactNode> = {
  string: <Type className="w-3.5 h-3.5" />,
  number: <Hash className="w-3.5 h-3.5" />,
  boolean: <ToggleLeft className="w-3.5 h-3.5" />,
  array: <List className="w-3.5 h-3.5" />,
  object: <Box className="w-3.5 h-3.5" />,
};

function SortableParameterStep({
  step,
  isSelected,
  onSelect,
  onDelete,
}: {
  step: ParameterStep;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const fieldCount = Object.keys(step.properties).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
          : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:border-zinc-600'
      }`}
      onClick={onSelect}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-zinc-500 hover:text-zinc-300">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{step.title}</p>
        <p className="text-xs text-zinc-500">{fieldCount} field{fieldCount !== 1 ? 's' : ''}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function FieldEditor({
  stepId,
  fieldKey,
  property,
  isRequired,
}: {
  stepId: string;
  fieldKey: string;
  property: ParameterProperty;
  isRequired: boolean;
}) {
  const { state, dispatch } = useTemplateStore();
  const isSelected = state.selectedFieldKey === fieldKey;
  const [localKey, setLocalKey] = useState(fieldKey);

  const updateField = (updates: Partial<ParameterProperty>) => {
    dispatch({
      type: 'UPDATE_PARAMETER_FIELD',
      payload: { stepId, key: fieldKey, property: { ...property, ...updates } },
    });
  };

  const handleKeyBlur = () => {
    if (localKey !== fieldKey && localKey.trim()) {
      dispatch({
        type: 'RENAME_PARAMETER_FIELD',
        payload: { stepId, oldKey: fieldKey, newKey: localKey.trim() },
      });
    }
  };

  return (
    <div
      className={`rounded-lg border transition-all ${
        isSelected
          ? 'bg-zinc-800 border-blue-500/30'
          : 'bg-zinc-800/30 border-zinc-700/30 hover:border-zinc-600'
      }`}
    >
      {/* Field header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={() => dispatch({ type: 'SELECT_FIELD', payload: isSelected ? null : fieldKey })}
      >
        <span className="text-zinc-400">{FIELD_TYPE_ICONS[property.type] || FIELD_TYPE_ICONS.string}</span>
        <span className="text-sm font-medium text-zinc-200 flex-1">{property.title || fieldKey}</span>
        {isRequired && (
          <span className="text-xs bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
            required
          </span>
        )}
        <span className="text-xs text-zinc-500">{property.type}</span>
        {isSelected ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
      </div>

      {/* Expanded editor */}
      {isSelected && (
        <div className="px-3 pb-3 space-y-3 border-t border-zinc-700/30 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Field Key</label>
              <input
                type="text"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                onBlur={handleKeyBlur}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={property.title}
                onChange={(e) => updateField({ title: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
            <input
              type="text"
              value={property.description || ''}
              onChange={(e) => updateField({ description: e.target.value })}
              placeholder="Help text for this field"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
              <select
                value={property.type}
                onChange={(e) => updateField({ type: e.target.value as ParameterProperty['type'] })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Default Value</label>
              <input
                type="text"
                value={property.default !== undefined ? String(property.default) : ''}
                onChange={(e) => updateField({ default: e.target.value || undefined })}
                placeholder="Default value"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1">
                UI Field
                <Tooltip content="Backstage-specific UI components like EntityPicker, RepoUrlPicker, or OwnerPicker for advanced input handling" />
              </label>
              <select
                value={property['ui:field'] || ''}
                onChange={(e) => updateField({ 'ui:field': e.target.value || undefined })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              >
                <option value="">None</option>
                {UI_FIELDS.map((f) => (
                  <option key={f.field} value={f.field}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1">
                UI Widget
                <Tooltip content="Visual presentation for the field (password masking, textarea, radio buttons, etc.)" />
              </label>
              <select
                value={property['ui:widget'] || ''}
                onChange={(e) => updateField({ 'ui:widget': e.target.value || undefined })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              >
                <option value="">Default</option>
                {UI_WIDGETS.map((w) => (
                  <option key={w.widget} value={w.widget}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>

          {property.type === 'string' && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Enum Values (comma-separated)
              </label>
              <input
                type="text"
                value={property.enum?.join(', ') || ''}
                onChange={(e) => {
                  const vals = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                  updateField({ enum: vals.length > 0 ? vals : undefined });
                }}
                placeholder="option1, option2, option3"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            </div>
          )}

          {property.type === 'string' && (
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Pattern (regex)</label>
              <input
                type="text"
                value={property.pattern || ''}
                onChange={(e) => updateField({ pattern: e.target.value || undefined })}
                placeholder="^[a-z][a-z0-9-]*$"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_REQUIRED_FIELD', payload: { stepId, key: fieldKey } })}
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors ${
                isRequired ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-700/50 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <Asterisk className="w-3 h-3" />
              {isRequired ? 'Required' : 'Optional'}
            </button>
            <button
              onClick={() => dispatch({ type: 'DELETE_PARAMETER_FIELD', payload: { stepId, key: fieldKey } })}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-zinc-700/50 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete Field
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ParametersPanel() {
  const { state, dispatch } = useTemplateStore();
  const { parameters } = state.template.spec;
  const selectedStep = parameters.find((p) => p.id === state.selectedParameterStepId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addStep = () => {
    const newStep: ParameterStep = {
      id: uuidv4(),
      title: `Step ${parameters.length + 1}`,
      required: [],
      properties: {},
    };
    dispatch({ type: 'ADD_PARAMETER_STEP', payload: newStep });
    dispatch({ type: 'SELECT_PARAMETER_STEP', payload: newStep.id });
  };

  const addField = () => addFieldByType('string');

  const addFieldByType = (type: ParameterFieldType, uiField?: string) => {
    if (!selectedStep) return;
    const existingKeys = Object.keys(selectedStep.properties);
    let idx = existingKeys.length + 1;
    let key = uiField ? uiField.charAt(0).toLowerCase() + uiField.slice(1).replace(/Picker$/, '') : `field${idx}`;
    while (existingKeys.includes(key)) { idx++; key = `${key}${idx}`; }

    const property: ParameterProperty = {
      title: uiField ? uiField.replace(/([A-Z])/g, ' $1').trim() : `Field ${idx}`,
      type,
      ...(uiField ? { 'ui:field': uiField } : {}),
    };
    dispatch({
      type: 'ADD_PARAMETER_FIELD',
      payload: { stepId: selectedStep.id, key, property },
    });
    dispatch({ type: 'SELECT_FIELD', payload: key });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = parameters.findIndex((p) => p.id === active.id);
    const newIdx = parameters.findIndex((p) => p.id === over.id);
    const newOrder = [...parameters];
    const [moved] = newOrder.splice(oldIdx, 1);
    newOrder.splice(newIdx, 0, moved);
    dispatch({ type: 'REORDER_PARAMETER_STEPS', payload: newOrder });
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Step list sidebar */}
      <div className="w-64 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">Wizard Steps</h3>
          <button
            onClick={addStep}
            className="p-1 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
            title="Add wizard step"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={parameters.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {parameters.map((step) => (
                <SortableParameterStep
                  key={step.id}
                  step={step}
                  isSelected={step.id === state.selectedParameterStepId}
                  onSelect={() => dispatch({ type: 'SELECT_PARAMETER_STEP', payload: step.id })}
                  onDelete={() => dispatch({ type: 'DELETE_PARAMETER_STEP', payload: step.id })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {parameters.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-4">No steps yet. Add one to start.</p>
        )}
      </div>

      {/* Step detail editor */}
      <div className="flex-1 min-w-0">
        {selectedStep ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={selectedStep.title}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_PARAMETER_STEP',
                    payload: { id: selectedStep.id, data: { title: e.target.value } },
                  })
                }
                className="flex-1 bg-transparent text-lg font-semibold text-zinc-100 border-b border-transparent hover:border-zinc-700 focus:border-blue-500/40 focus:outline-none pb-0.5 transition-colors"
              />
            </div>
            <input
              type="text"
              value={selectedStep.description || ''}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_PARAMETER_STEP',
                  payload: { id: selectedStep.id, data: { description: e.target.value } },
                })
              }
              placeholder="Step description (optional)"
              className="w-full bg-zinc-800/50 border border-zinc-700/30 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            />

            {/* Fields */}
            <div className="flex items-center justify-between pt-2">
              <h4 className="text-sm font-medium text-zinc-300">Fields</h4>
              <button
                onClick={addField}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Field
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(selectedStep.properties).map(([key, prop]) => (
                <FieldEditor
                  key={key}
                  stepId={selectedStep.id}
                  fieldKey={key}
                  property={prop}
                  isRequired={selectedStep.required.includes(key)}
                />
              ))}
              {Object.keys(selectedStep.properties).length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-700/50 rounded-lg">
                  <Copy className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                  <p>No fields in this step yet.</p>
                  <p className="text-xs mt-1">Click a field type below or use &ldquo;Add Field&rdquo; above.</p>
                </div>
              )}
            </div>

            {/* Field palette */}
            <div className="pt-4 mt-4 border-t border-zinc-700/30">
              <FieldPalette onAddField={addFieldByType} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            Select a wizard step to edit its fields
          </div>
        )}
      </div>
    </div>
  );
}
