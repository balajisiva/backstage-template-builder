'use client';

import React, { useState } from 'react';
import { useTemplateStore } from '@/store/template-store';
import { Copy, Check, Download, Upload } from 'lucide-react';
import { yamlToTemplate } from '@/lib/yaml-utils';

export default function YamlPreview() {
  const { state, dispatch } = useTemplateStore();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(state.yamlPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([state.yamlPreview], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.template.metadata.name || 'template'}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportYaml = () => {
    setEditContent(state.yamlPreview);
    setIsEditing(true);
  };

  const handleApplyYaml = () => {
    try {
      const template = yamlToTemplate(editContent);
      dispatch({ type: 'SET_TEMPLATE', payload: template });
      setIsEditing(false);
    } catch (err) {
      alert('Invalid YAML: ' + (err as Error).message);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-zinc-700/50">
        <h3 className="text-sm font-semibold text-zinc-300">YAML Output</h3>
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <button
                onClick={handleApplyYaml}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors"
              >
                <Check className="w-3 h-3" />
                Apply
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleImportYaml}
                className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded transition-colors"
                title="Edit YAML directly"
              >
                <Upload className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded transition-colors"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full bg-zinc-950 p-4 text-xs text-emerald-300 font-mono focus:outline-none resize-none"
            spellCheck={false}
          />
        ) : (
          <pre className="p-4 text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
            {state.yamlPreview || 'Loading...'}
          </pre>
        )}
      </div>
    </div>
  );
}
