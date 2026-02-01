import { createContext, useContext } from 'react';
import {
  BackstageTemplate,
  ParameterStep,
  ParameterProperty,
  TemplateStep,
  OutputLink,
} from '../types/template';

export type BuilderTab = 'metadata' | 'parameters' | 'steps' | 'output' | 'validation';

export interface TemplateState {
  template: BackstageTemplate;
  activeTab: BuilderTab;
  selectedParameterStepId: string | null;
  selectedFieldKey: string | null;
  selectedStepId: string | null;
  isDirty: boolean;
  yamlPreview: string;
  loadingRepo: boolean;
  repoError: string | null;
}

export type TemplateAction =
  | { type: 'SET_TEMPLATE'; payload: BackstageTemplate }
  | { type: 'SET_TAB'; payload: BuilderTab }
  | { type: 'UPDATE_METADATA'; payload: Partial<BackstageTemplate['metadata']> }
  | { type: 'UPDATE_SPEC'; payload: Partial<BackstageTemplate['spec']> }
  | { type: 'ADD_PARAMETER_STEP'; payload: ParameterStep }
  | { type: 'UPDATE_PARAMETER_STEP'; payload: { id: string; data: Partial<ParameterStep> } }
  | { type: 'DELETE_PARAMETER_STEP'; payload: string }
  | { type: 'REORDER_PARAMETER_STEPS'; payload: ParameterStep[] }
  | { type: 'SELECT_PARAMETER_STEP'; payload: string | null }
  | { type: 'ADD_PARAMETER_FIELD'; payload: { stepId: string; key: string; property: ParameterProperty } }
  | { type: 'UPDATE_PARAMETER_FIELD'; payload: { stepId: string; key: string; property: ParameterProperty } }
  | { type: 'DELETE_PARAMETER_FIELD'; payload: { stepId: string; key: string } }
  | { type: 'RENAME_PARAMETER_FIELD'; payload: { stepId: string; oldKey: string; newKey: string } }
  | { type: 'SELECT_FIELD'; payload: string | null }
  | { type: 'TOGGLE_REQUIRED_FIELD'; payload: { stepId: string; key: string } }
  | { type: 'ADD_STEP'; payload: TemplateStep }
  | { type: 'UPDATE_STEP'; payload: { id: string; data: Partial<TemplateStep> } }
  | { type: 'DELETE_STEP'; payload: string }
  | { type: 'REORDER_STEPS'; payload: TemplateStep[] }
  | { type: 'SELECT_STEP'; payload: string | null }
  | { type: 'ADD_OUTPUT_LINK'; payload: OutputLink }
  | { type: 'UPDATE_OUTPUT_LINK'; payload: { index: number; data: OutputLink } }
  | { type: 'DELETE_OUTPUT_LINK'; payload: number }
  | { type: 'SET_YAML_PREVIEW'; payload: string }
  | { type: 'SET_LOADING_REPO'; payload: boolean }
  | { type: 'SET_REPO_ERROR'; payload: string | null }
  | { type: 'MARK_CLEAN' };

export function templateReducer(state: TemplateState, action: TemplateAction): TemplateState {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return { ...state, template: action.payload, isDirty: false };

    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'UPDATE_METADATA':
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          metadata: { ...state.template.metadata, ...action.payload },
        },
      };

    case 'UPDATE_SPEC':
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          spec: { ...state.template.spec, ...action.payload },
        },
      };

    case 'ADD_PARAMETER_STEP':
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          spec: {
            ...state.template.spec,
            parameters: [...state.template.spec.parameters, action.payload],
          },
        },
      };

    case 'UPDATE_PARAMETER_STEP': {
      const params = state.template.spec.parameters.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload.data } : p
      );
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          spec: { ...state.template.spec, parameters: params },
        },
      };
    }

    case 'DELETE_PARAMETER_STEP':
      return {
        ...state,
        isDirty: true,
        selectedParameterStepId: state.selectedParameterStepId === action.payload ? null : state.selectedParameterStepId,
        template: {
          ...state.template,
          spec: {
            ...state.template.spec,
            parameters: state.template.spec.parameters.filter((p) => p.id !== action.payload),
          },
        },
      };

    case 'REORDER_PARAMETER_STEPS':
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          spec: { ...state.template.spec, parameters: action.payload },
        },
      };

    case 'SELECT_PARAMETER_STEP':
      return { ...state, selectedParameterStepId: action.payload, selectedFieldKey: null };

    case 'ADD_PARAMETER_FIELD': {
      const stepIdx = state.template.spec.parameters.findIndex((p) => p.id === action.payload.stepId);
      if (stepIdx === -1) return state;
      const params = [...state.template.spec.parameters];
      params[stepIdx] = {
        ...params[stepIdx],
        properties: { ...params[stepIdx].properties, [action.payload.key]: action.payload.property },
      };
      return {
        ...state,
        isDirty: true,
        template: { ...state.template, spec: { ...state.template.spec, parameters: params } },
      };
    }

    case 'UPDATE_PARAMETER_FIELD': {
      const stepIdx = state.template.spec.parameters.findIndex((p) => p.id === action.payload.stepId);
      if (stepIdx === -1) return state;
      const params = [...state.template.spec.parameters];
      params[stepIdx] = {
        ...params[stepIdx],
        properties: { ...params[stepIdx].properties, [action.payload.key]: action.payload.property },
      };
      return {
        ...state,
        isDirty: true,
        template: { ...state.template, spec: { ...state.template.spec, parameters: params } },
      };
    }

    case 'DELETE_PARAMETER_FIELD': {
      const stepIdx = state.template.spec.parameters.findIndex((p) => p.id === action.payload.stepId);
      if (stepIdx === -1) return state;
      const params = [...state.template.spec.parameters];
      const newProps = { ...params[stepIdx].properties };
      delete newProps[action.payload.key];
      const newRequired = params[stepIdx].required.filter((r) => r !== action.payload.key);
      params[stepIdx] = { ...params[stepIdx], properties: newProps, required: newRequired };
      return {
        ...state,
        isDirty: true,
        selectedFieldKey: state.selectedFieldKey === action.payload.key ? null : state.selectedFieldKey,
        template: { ...state.template, spec: { ...state.template.spec, parameters: params } },
      };
    }

    case 'RENAME_PARAMETER_FIELD': {
      const { stepId, oldKey, newKey } = action.payload;
      if (oldKey === newKey) return state;
      const stepIdx = state.template.spec.parameters.findIndex((p) => p.id === stepId);
      if (stepIdx === -1) return state;
      const params = [...state.template.spec.parameters];
      const newProps = { ...params[stepIdx].properties };
      newProps[newKey] = newProps[oldKey];
      delete newProps[oldKey];
      const newRequired = params[stepIdx].required.map((r) => (r === oldKey ? newKey : r));
      params[stepIdx] = { ...params[stepIdx], properties: newProps, required: newRequired };
      return {
        ...state,
        isDirty: true,
        selectedFieldKey: state.selectedFieldKey === oldKey ? newKey : state.selectedFieldKey,
        template: { ...state.template, spec: { ...state.template.spec, parameters: params } },
      };
    }

    case 'SELECT_FIELD':
      return { ...state, selectedFieldKey: action.payload };

    case 'TOGGLE_REQUIRED_FIELD': {
      const stepIdx = state.template.spec.parameters.findIndex((p) => p.id === action.payload.stepId);
      if (stepIdx === -1) return state;
      const params = [...state.template.spec.parameters];
      const step = params[stepIdx];
      const isRequired = step.required.includes(action.payload.key);
      params[stepIdx] = {
        ...step,
        required: isRequired
          ? step.required.filter((r) => r !== action.payload.key)
          : [...step.required, action.payload.key],
      };
      return {
        ...state,
        isDirty: true,
        template: { ...state.template, spec: { ...state.template.spec, parameters: params } },
      };
    }

    case 'ADD_STEP':
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          spec: { ...state.template.spec, steps: [...state.template.spec.steps, action.payload] },
        },
      };

    case 'UPDATE_STEP': {
      const steps = state.template.spec.steps.map((s) =>
        s.id === action.payload.id ? { ...s, ...action.payload.data } : s
      );
      return {
        ...state,
        isDirty: true,
        template: { ...state.template, spec: { ...state.template.spec, steps } },
      };
    }

    case 'DELETE_STEP':
      return {
        ...state,
        isDirty: true,
        selectedStepId: state.selectedStepId === action.payload ? null : state.selectedStepId,
        template: {
          ...state.template,
          spec: {
            ...state.template.spec,
            steps: state.template.spec.steps.filter((s) => s.id !== action.payload),
          },
        },
      };

    case 'REORDER_STEPS':
      return {
        ...state,
        isDirty: true,
        template: { ...state.template, spec: { ...state.template.spec, steps: action.payload } },
      };

    case 'SELECT_STEP':
      return { ...state, selectedStepId: action.payload };

    case 'ADD_OUTPUT_LINK':
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          spec: {
            ...state.template.spec,
            output: {
              ...state.template.spec.output,
              links: [...state.template.spec.output.links, action.payload],
            },
          },
        },
      };

    case 'UPDATE_OUTPUT_LINK': {
      const links = [...state.template.spec.output.links];
      links[action.payload.index] = action.payload.data;
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          spec: { ...state.template.spec, output: { links } },
        },
      };
    }

    case 'DELETE_OUTPUT_LINK': {
      const links = state.template.spec.output.links.filter((_, i) => i !== action.payload);
      return {
        ...state,
        isDirty: true,
        template: {
          ...state.template,
          spec: { ...state.template.spec, output: { links } },
        },
      };
    }

    case 'SET_YAML_PREVIEW':
      return { ...state, yamlPreview: action.payload };

    case 'SET_LOADING_REPO':
      return { ...state, loadingRepo: action.payload };

    case 'SET_REPO_ERROR':
      return { ...state, repoError: action.payload };

    case 'MARK_CLEAN':
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

export interface TemplateContextValue {
  state: TemplateState;
  dispatch: React.Dispatch<TemplateAction>;
}

export const TemplateContext = createContext<TemplateContextValue | null>(null);

export function useTemplateStore() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplateStore must be used within TemplateProvider');
  return ctx;
}
