

import React from 'react';
import { useTemplateStore } from '../../store/template-store';
import { OutputLink } from '../../types/template';
import { Plus, Trash2, ExternalLink, BookOpen } from 'lucide-react';

export default function OutputPanel() {
  const { state, dispatch } = useTemplateStore();
  const { links } = state.template.spec.output;

  const addLink = () => {
    const newLink: OutputLink = {
      title: 'New Link',
      url: '',
    };
    dispatch({ type: 'ADD_OUTPUT_LINK', payload: newLink });
  };

  const updateLink = (index: number, data: Partial<OutputLink>) => {
    dispatch({
      type: 'UPDATE_OUTPUT_LINK',
      payload: { index, data: { ...links[index], ...data } },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Template Output</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Define links shown to the user after template execution completes.
          </p>
        </div>
        <button
          onClick={addLink}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      <div className="space-y-3">
        {links.map((link, idx) => (
          <div
            key={idx}
            className="p-4 bg-zinc-800/50 border border-zinc-700/30 rounded-lg space-y-3"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="text-sm font-medium text-zinc-200 flex-1">{link.title || 'Untitled Link'}</span>
              <button
                onClick={() => dispatch({ type: 'DELETE_OUTPUT_LINK', payload: idx })}
                className="text-zinc-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateLink(idx, { title: e.target.value })}
                  placeholder="Open the Repository"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Icon</label>
                <input
                  type="text"
                  value={link.icon || ''}
                  onChange={(e) => updateLink(idx, { icon: e.target.value || undefined })}
                  placeholder="catalog, github, etc."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">URL</label>
              <input
                type="text"
                value={link.url || ''}
                onChange={(e) => updateLink(idx, { url: e.target.value || undefined })}
                placeholder="${{ steps.publish.output.remoteUrl }}"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Entity Ref</label>
              <input
                type="text"
                value={link.entityRef || ''}
                onChange={(e) => updateLink(idx, { entityRef: e.target.value || undefined })}
                placeholder="${{ steps.register.output.entityRef }}"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            </div>
          </div>
        ))}
      </div>

      {links.length === 0 && (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-700/50 rounded-lg">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <p className="text-sm">No output links defined.</p>
          <p className="text-xs mt-1">Add links that will be shown after template execution.</p>
        </div>
      )}
    </div>
  );
}
