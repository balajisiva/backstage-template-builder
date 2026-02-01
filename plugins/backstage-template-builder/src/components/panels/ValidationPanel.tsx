import React from 'react';
import { useTemplateStore } from '../../store/template-store';
import { ValidationIssue, getIssueSummary } from '../../lib/template-validator';
import { AlertCircle, Check, X } from 'lucide-react';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  onClear: () => void;
}

export default function ValidationPanel({ issues, onClear }: ValidationPanelProps) {
  const { dispatch } = useTemplateStore();
  const summary = getIssueSummary(issues);

  const handleIssueClick = (issue: ValidationIssue) => {
    // Parse location to navigate to the right tab
    if (!issue.location) return;

    const location = issue.location.toLowerCase();

    if (location.includes('metadata')) {
      dispatch({ type: 'SET_TAB', payload: 'metadata' });
    } else if (location.includes('parameter') || location.includes('field')) {
      dispatch({ type: 'SET_TAB', payload: 'parameters' });
      // Extract step or field info if possible
      const stepMatch = location.match(/step\s+(\d+)/i);
      if (stepMatch) {
        // Could select specific parameter step if we had the index
      }
    } else if (location.includes('step') || location.includes('action')) {
      dispatch({ type: 'SET_TAB', payload: 'steps' });
    } else if (location.includes('output')) {
      dispatch({ type: 'SET_TAB', payload: 'output' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Validation Results</h2>
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors"
            title="Clear validation results"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">{summary.errors}</div>
            <div className="text-xs text-red-300 mt-0.5">Errors</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-400">{summary.warnings}</div>
            <div className="text-xs text-amber-300 mt-0.5">Warnings</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{summary.infos}</div>
            <div className="text-xs text-blue-300 mt-0.5">Info</div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {summary.total === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-400">No issues found!</p>
              <p className="text-xs text-emerald-300 mt-0.5">
                Your template looks good.
              </p>
            </div>
          </div>
        ) : (
          <>
            {issues.map((issue, index) => (
              <button
                key={index}
                onClick={() => handleIssueClick(issue)}
                className={`w-full text-left p-4 rounded-lg border transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer ${
                  issue.severity === 'error'
                    ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15'
                    : issue.severity === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15'
                    : 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      issue.severity === 'error'
                        ? 'text-red-400'
                        : issue.severity === 'warning'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-bold uppercase ${
                          issue.severity === 'error'
                            ? 'text-red-400'
                            : issue.severity === 'warning'
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      {issue.location && (
                        <span className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded">
                          {issue.location}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        issue.severity === 'error'
                          ? 'text-red-200'
                          : issue.severity === 'warning'
                          ? 'text-amber-200'
                          : 'text-blue-200'
                      }`}
                    >
                      {issue.message}
                    </p>
                    {issue.suggestion && (
                      <p className="text-xs text-zinc-400 mt-2 bg-zinc-900/50 p-2 rounded">
                        💡 {issue.suggestion}
                      </p>
                    )}
                    {issue.location && (
                      <p className="text-xs text-zinc-500 mt-2">
                        Click to navigate to this issue
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
