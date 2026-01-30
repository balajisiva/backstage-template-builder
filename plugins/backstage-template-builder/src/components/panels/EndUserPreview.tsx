

import React, { useState } from 'react';
import { useTemplateStore } from '../../store/template-store';
import { ParameterProperty } from '../../types/template';
import { getActionDefinition } from '../../lib/actions-catalog';
import {
  ChevronLeft,
  ChevronRight,
  Rocket,
  Check,
  ExternalLink,
  Loader2,
  CircleCheck,
  Download,
  Upload,
  Database,
  GitBranch,
  Bug,
  FolderOpen,
  Zap,
  AlertTriangle,
} from 'lucide-react';

const STEP_ICONS: Record<string, React.ReactNode> = {
  fetch: <Download className="w-4 h-4" />,
  publish: <Upload className="w-4 h-4" />,
  catalog: <Database className="w-4 h-4" />,
  github: <GitBranch className="w-4 h-4" />,
  gitlab: <GitBranch className="w-4 h-4" />,
  debug: <Bug className="w-4 h-4" />,
  fs: <FolderOpen className="w-4 h-4" />,
  custom: <Zap className="w-4 h-4" />,
};

type PreviewPhase = 'form' | 'review' | 'running' | 'complete';

function FormFieldPreview({
  fieldKey,
  property,
  isRequired,
  value,
  onChange,
}: {
  fieldKey: string;
  property: ParameterProperty;
  isRequired: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const uiField = property['ui:field'];
  const uiWidget = property['ui:widget'];

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-800 mb-1">
        {property.title || fieldKey}
        {isRequired && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {property.description && (
        <p className="text-xs text-zinc-500 mb-1.5">{property.description}</p>
      )}

      {/* Render different inputs based on type/widget/field */}
      {property.type === 'boolean' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-zinc-700">Enable</span>
        </label>
      ) : property.enum && property.enum.length > 0 ? (
        uiWidget === 'radio' ? (
          <div className="space-y-1.5">
            {property.enum.map((opt, i) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={fieldKey}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
                />
                <span className="text-sm text-zinc-700">
                  {property.enumNames?.[i] || opt}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          >
            <option value="">Select...</option>
            {property.enum.map((opt, i) => (
              <option key={opt} value={opt}>
                {property.enumNames?.[i] || opt}
              </option>
            ))}
          </select>
        )
      ) : uiWidget === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={property.default !== undefined ? String(property.default) : ''}
          className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-none"
        />
      ) : uiWidget === 'password' || uiField === 'Secret' ? (
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        />
      ) : uiField === 'EntityPicker' || uiField === 'OwnerPicker' ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 appearance-none"
          >
            <option value="">Search entities...</option>
            <option value="user:default/guest">user:default/guest</option>
            <option value="group:default/team-a">group:default/team-a</option>
          </select>
          <ChevronRight className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
        </div>
      ) : uiField === 'RepoUrlPicker' ? (
        <div className="space-y-2 border border-zinc-300 rounded-md p-3 bg-zinc-50">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-0.5">Host</label>
            <select className="w-full border border-zinc-300 rounded px-2 py-1.5 text-sm text-zinc-900 bg-white">
              <option>github.com</option>
              <option>gitlab.com</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-0.5">Owner</label>
              <input
                type="text"
                placeholder="organization"
                className="w-full border border-zinc-300 rounded px-2 py-1.5 text-sm text-zinc-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-0.5">Repository</label>
              <input
                type="text"
                placeholder="repo-name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-zinc-300 rounded px-2 py-1.5 text-sm text-zinc-900 bg-white"
              />
            </div>
          </div>
        </div>
      ) : (
        <input
          type={property.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={property.default !== undefined ? String(property.default) : ''}
          className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        />
      )}
    </div>
  );
}

export default function EndUserPreview() {
  const { state } = useTemplateStore();
  const { template } = state;
  const { parameters, steps, output } = template.spec;
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<PreviewPhase>('form');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [runningStep, setRunningStep] = useState(0);

  const totalFormSteps = parameters.length;
  const isLastFormStep = currentStep >= totalFormSteps - 1;

  const handleNext = () => {
    if (phase === 'form') {
      if (isLastFormStep) {
        setPhase('review');
      } else {
        setCurrentStep((s) => s + 1);
      }
    } else if (phase === 'review') {
      setPhase('running');
      // Simulate step execution
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i >= steps.length) {
          clearInterval(interval);
          setPhase('complete');
        } else {
          setRunningStep(i);
        }
      }, 800);
    }
  };

  const handleBack = () => {
    if (phase === 'review') {
      setPhase('form');
      setCurrentStep(totalFormSteps - 1);
    } else if (phase === 'form' && currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleReset = () => {
    setPhase('form');
    setCurrentStep(0);
    setFormValues({});
    setRunningStep(0);
  };

  const currentParamStep = parameters[currentStep];

  return (
    <div className="h-full flex flex-col bg-white text-zinc-900">
      {/* Simulated Backstage header */}
      <div className="bg-zinc-900 text-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center text-xs font-bold">B</div>
          <span className="font-medium text-sm">Backstage</span>
          <span className="text-zinc-400 text-sm">/</span>
          <span className="text-zinc-300 text-sm">Create</span>
          <span className="text-zinc-400 text-sm">/</span>
          <span className="text-zinc-100 text-sm font-medium">{template.metadata.title}</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-zinc-800"
        >
          Reset Preview
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Preview Mode - UI Simulation Only
            </p>
            <p className="text-xs text-amber-700 mt-1">
              This preview simulates the user interface and workflow. It does <strong>not</strong> validate template actions,
              test actual execution, or verify that steps are configured correctly. To fully test your template,
              push it to a Backstage instance and run it in a real environment.
            </p>
          </div>
        </div>
      </div>

      {/* Progress stepper */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 shrink-0">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          {parameters.map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <div className={`flex-1 h-0.5 ${i <= currentStep || phase !== 'form' ? 'bg-blue-500' : 'bg-zinc-300'}`} />}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    phase !== 'form'
                      ? 'bg-blue-500 text-white'
                      : i === currentStep
                      ? 'bg-blue-500 text-white'
                      : i < currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-300 text-zinc-500'
                  }`}
                >
                  {(phase !== 'form' || i < currentStep) ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === currentStep && phase === 'form' ? 'text-blue-600' : 'text-zinc-500'}`}>
                  {p.title}
                </span>
              </div>
            </React.Fragment>
          ))}
          {/* Review step */}
          {parameters.length > 0 && <div className={`flex-1 h-0.5 ${phase === 'review' || phase === 'running' || phase === 'complete' ? 'bg-blue-500' : 'bg-zinc-300'}`} />}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                phase === 'review'
                  ? 'bg-blue-500 text-white'
                  : phase === 'running' || phase === 'complete'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-300 text-zinc-500'
              }`}
            >
              {phase === 'running' || phase === 'complete' ? <Check className="w-3.5 h-3.5" /> : parameters.length + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${phase === 'review' ? 'text-blue-600' : 'text-zinc-500'}`}>
              Review
            </span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Form phase */}
          {phase === 'form' && currentParamStep && (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-1">{currentParamStep.title}</h2>
              {currentParamStep.description && (
                <p className="text-sm text-zinc-500 mb-6">{currentParamStep.description}</p>
              )}
              <div className="space-y-5">
                {Object.entries(currentParamStep.properties).map(([key, prop]) => (
                  <FormFieldPreview
                    key={key}
                    fieldKey={key}
                    property={prop}
                    isRequired={currentParamStep.required.includes(key)}
                    value={formValues[key] || ''}
                    onChange={(v) => setFormValues((prev) => ({ ...prev, [key]: v }))}
                  />
                ))}
              </div>
              {Object.keys(currentParamStep.properties).length === 0 && (
                <div className="text-center py-12 text-zinc-400">
                  <p className="text-sm">This step has no fields configured yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Form phase with no parameters */}
          {phase === 'form' && !currentParamStep && (
            <div className="text-center py-12 text-zinc-400">
              <p className="text-sm">No wizard steps configured.</p>
              <p className="text-xs mt-1">Add parameter steps in the builder to see the form preview.</p>
            </div>
          )}

          {/* Review phase */}
          {phase === 'review' && (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-1">Review & Create</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Review your inputs and click Create to start the scaffolding process.
              </p>
              <div className="space-y-4">
                {parameters.map((p) => (
                  <div key={p.id} className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-zinc-700 mb-2">{p.title}</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {Object.entries(p.properties).map(([key, prop]) => (
                        <div key={key}>
                          <span className="text-xs text-zinc-500">{prop.title || key}</span>
                          <p className="text-sm text-zinc-900 font-medium">
                            {formValues[key] || prop.default?.toString() || <span className="text-zinc-400 italic">empty</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Steps that will be executed:</h3>
                <ol className="space-y-1.5">
                  {steps.map((step, i) => {
                    const actionDef = getActionDefinition(step.action);
                    const category = actionDef?.category || 'custom';
                    return (
                      <li key={step.id} className="flex items-center gap-2 text-sm text-blue-700">
                        <span className="text-blue-400">{STEP_ICONS[category]}</span>
                        <span className="font-medium">{i + 1}.</span>
                        <span>{step.name}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}

          {/* Running phase */}
          {phase === 'running' && (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-6">Creating...</h2>
              <div className="space-y-3">
                {steps.map((step, i) => {
                  const actionDef = getActionDefinition(step.action);
                  const category = actionDef?.category || 'custom';
                  const isDone = i < runningStep;
                  const isCurrent = i === runningStep;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200'
                          : isCurrent
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <div className="shrink-0">
                        {isDone ? (
                          <CircleCheck className="w-5 h-5 text-emerald-500" />
                        ) : isCurrent ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-zinc-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDone ? 'text-emerald-800' : isCurrent ? 'text-blue-800' : 'text-zinc-500'}`}>
                          {step.name}
                        </p>
                        <p className={`text-xs font-mono ${isDone ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-zinc-400'}`}>
                          {step.action}
                        </p>
                      </div>
                      <span className="text-zinc-400">{STEP_ICONS[category]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete phase */}
          {phase === 'complete' && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CircleCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-900">Template created successfully!</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Your new component has been scaffolded and registered.
                </p>
              </div>

              {output.links.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">What&apos;s next?</h3>
                  {output.links.map((link, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group text-left"
                    >
                      <ExternalLink className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 group-hover:text-blue-700">{link.title}</p>
                        <p className="text-xs text-zinc-500 font-mono truncate">
                          {link.url || link.entityRef || 'No URL configured'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-zinc-400">
                    No output links configured. Add links in the Output tab.
                  </p>
                </div>
              )}

              {/* Simulated execution log */}
              <div className="mt-8 bg-zinc-900 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Execution Log</h4>
                <div className="space-y-1.5 font-mono text-xs">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <CircleCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-emerald-400">Step {i + 1}:</span>
                      <span className="text-zinc-300">{step.name}</span>
                      <span className="text-zinc-600">({step.action})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation bar */}
      {(phase === 'form' || phase === 'review') && (
        <div className="bg-white border-t border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={handleBack}
            disabled={phase === 'form' && currentStep === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="text-xs text-zinc-400">
            {phase === 'form'
              ? `Step ${currentStep + 1} of ${totalFormSteps}`
              : 'Review'}
          </div>
          <button
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              phase === 'review'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {phase === 'review' ? (
              <>
                <Rocket className="w-4 h-4" />
                Create
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
