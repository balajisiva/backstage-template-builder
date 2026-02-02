

import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import {
  TemplateContext,
  TemplateState,
  templateReducer,
} from '../../store/template-store';
import { createBlankTemplate, templateToYaml, yamlToTemplate } from '../../lib/yaml-utils';

const STORAGE_KEY = 'backstage_template_builder_draft';

function loadSavedTemplate(): TemplateState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return parsed;
  } catch {
    return null;
  }
}

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const blank = createBlankTemplate();
  const savedState = loadSavedTemplate();

  const initialState: TemplateState = savedState || {
    template: blank,
    activeTab: 'metadata',
    selectedParameterStepId: blank.spec.parameters[0]?.id ?? null,
    selectedFieldKey: null,
    selectedStepId: null,
    isDirty: false,
    yamlPreview: '',
    loadingRepo: false,
    repoError: null,
  };

  const [state, dispatch] = useReducer(templateReducer, initialState);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const updateYaml = useCallback(() => {
    try {
      const yml = templateToYaml(state.template);
      dispatch({ type: 'SET_YAML_PREVIEW', payload: yml });
    } catch {
      // ignore serialization errors during editing
    }
  }, [state.template]);

  useEffect(() => {
    updateYaml();
  }, [updateYaml]);

  // Auto-save to localStorage with debouncing
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to save template to localStorage:', err);
      }
    }, 500); // Debounce for 500ms

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  return (
    <TemplateContext.Provider value={{ state, dispatch }}>
      {children}
    </TemplateContext.Provider>
  );
}
