

import React, { useReducer, useEffect, useCallback } from 'react';
import {
  TemplateContext,
  TemplateState,
  templateReducer,
} from '../../store/template-store';
import { createBlankTemplate, templateToYaml } from '../../lib/yaml-utils';

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const blank = createBlankTemplate();
  const initialState: TemplateState = {
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

  return (
    <TemplateContext.Provider value={{ state, dispatch }}>
      {children}
    </TemplateContext.Provider>
  );
}
