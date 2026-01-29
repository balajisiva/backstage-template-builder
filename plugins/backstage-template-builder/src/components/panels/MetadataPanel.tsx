

import React, { useState } from 'react';
import { useTemplateStore } from '../../store/template-store';
import { Tag, X } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export default function MetadataPanel() {
  const { state, dispatch } = useTemplateStore();
  const { metadata } = state.template;
  const { spec } = state.template;
  const [tagInput, setTagInput] = useState('');

  const update = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_METADATA', payload: { [field]: value } });
  };

  const updateAnnotation = (key: string, value: string) => {
    const annotations = { ...(metadata.annotations || {}) };
    if (value) {
      annotations[key] = value;
    } else {
      delete annotations[key];
    }
    dispatch({ type: 'UPDATE_METADATA', payload: { annotations } });
  };

  const version = metadata.annotations?.['backstage.io/template-version'] || '';

  const updateSpec = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_SPEC', payload: { [field]: value } });
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !metadata.tags.includes(tag)) {
      dispatch({ type: 'UPDATE_METADATA', payload: { tags: [...metadata.tags, tag] } });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    dispatch({
      type: 'UPDATE_METADATA',
      payload: { tags: metadata.tags.filter((t) => t !== tag) },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Template Metadata</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Configure the basic information about your Backstage software template.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Name (machine-readable)</label>
          <input
            type="text"
            value={metadata.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="my-service-template"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="My Service Template"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Version</label>
          <input
            type="text"
            value={version}
            onChange={(e) => updateAnnotation('backstage.io/template-version', e.target.value)}
            placeholder="1.0.0"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
        <textarea
          value={metadata.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Describe what this template creates..."
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1">
            Owner
            <Tooltip content="Team or user responsible for this template (e.g., 'team:platform' or 'user:jane')" />
          </label>
          <input
            type="text"
            value={spec.owner}
            onChange={(e) => updateSpec('owner', e.target.value)}
            placeholder="team:platform"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1">
            System
            <Tooltip content="Backstage system this template belongs to (helps organize templates in the catalog)" />
          </label>
          <input
            type="text"
            value={spec.system}
            onChange={(e) => updateSpec('system', e.target.value)}
            placeholder="backend-services"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 mb-1">
            Type
            <Tooltip content="Template category (service, website, library, documentation, etc.)" />
          </label>
          <select
            value={spec.type}
            onChange={(e) => updateSpec('type', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          >
            <option value="service">Service</option>
            <option value="website">Website</option>
            <option value="library">Library</option>
            <option value="documentation">Documentation</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Tags</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add a tag..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
          />
          <button
            onClick={addTag}
            className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {metadata.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-blue-200">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
