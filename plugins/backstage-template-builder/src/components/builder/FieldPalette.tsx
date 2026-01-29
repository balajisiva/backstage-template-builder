

import React from 'react';
import { ParameterFieldType } from '../../types/template';
import { UI_FIELDS } from '../../lib/actions-catalog';
import { Type, Hash, ToggleLeft, List, Box, Grip } from 'lucide-react';

interface FieldTypeOption {
  type: ParameterFieldType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const FIELD_TYPES: FieldTypeOption[] = [
  { type: 'string', label: 'Text', icon: <Type className="w-4 h-4" />, description: 'Single-line text input' },
  { type: 'number', label: 'Number', icon: <Hash className="w-4 h-4" />, description: 'Numeric input' },
  { type: 'boolean', label: 'Boolean', icon: <ToggleLeft className="w-4 h-4" />, description: 'Checkbox toggle' },
  { type: 'array', label: 'Array', icon: <List className="w-4 h-4" />, description: 'List of items' },
  { type: 'object', label: 'Object', icon: <Box className="w-4 h-4" />, description: 'Nested properties' },
];

interface FieldPaletteProps {
  onAddField: (type: ParameterFieldType, uiField?: string) => void;
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Grip className="w-3.5 h-3.5 text-zinc-500" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Basic Types</h4>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {FIELD_TYPES.map((ft) => (
            <button
              key={ft.type}
              onClick={() => onAddField(ft.type)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/30 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-zinc-400 hover:text-blue-400 group"
              title={ft.description}
            >
              {ft.icon}
              <span className="text-[10px] font-medium">{ft.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Grip className="w-3.5 h-3.5 text-zinc-500" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Backstage Fields</h4>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {UI_FIELDS.map((uf) => (
            <button
              key={uf.field}
              onClick={() => onAddField('string', uf.field)}
              className="text-left p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/30 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group"
              title={uf.description}
            >
              <p className="text-[10px] font-semibold text-zinc-300 group-hover:text-purple-400 transition-colors truncate">{uf.label}</p>
              <p className="text-[9px] text-zinc-500 truncate">{uf.field}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
