// Backstage Software Template data model

export interface TemplateMetadata {
  name: string;
  title: string;
  description: string;
  tags: string[];
  annotations?: Record<string, string>;
}

export interface TemplateSpec {
  owner: string;
  system: string;
  type: string;
  parameters: ParameterStep[];
  steps: TemplateStep[];
  output: TemplateOutput;
}

export interface BackstageTemplate {
  apiVersion: string;
  kind: 'Template';
  metadata: TemplateMetadata;
  spec: TemplateSpec;
}

// Parameter types
export interface ParameterStep {
  id: string; // internal tracking ID
  title: string;
  description?: string;
  required: string[];
  properties: Record<string, ParameterProperty>;
}

export type ParameterFieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ParameterProperty {
  title: string;
  type: ParameterFieldType;
  description?: string;
  default?: unknown;
  enum?: string[];
  enumNames?: string[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  uniqueItems?: boolean;
  items?: { type: string; enum?: string[] };
  // UI extensions
  'ui:field'?: string;
  'ui:widget'?: string;
  'ui:options'?: Record<string, unknown>;
  'ui:autofocus'?: boolean;
}

// Step types
export type StepActionCategory = 'fetch' | 'publish' | 'catalog' | 'github' | 'gitlab' | 'debug' | 'fs' | 'custom';

export interface TemplateStep {
  id: string;
  name: string;
  action: string;
  input: Record<string, unknown>;
  if?: string;
}

export interface TemplateOutput {
  links: OutputLink[];
}

export interface OutputLink {
  title: string;
  url?: string;
  icon?: string;
  entityRef?: string;
}

// Builder state types
export interface DragItem {
  id: string;
  type: 'parameter-step' | 'parameter-field' | 'template-step' | 'output-link';
}

// Catalog of available actions
export interface ActionDefinition {
  action: string;
  label: string;
  description: string;
  category: StepActionCategory;
  inputs: ActionInput[];
}

export interface ActionInput {
  name: string;
  label: string;
  type: 'string' | 'boolean' | 'array' | 'object';
  required?: boolean;
  description?: string;
  default?: unknown;
}

// UI Field catalog
export interface UIFieldDefinition {
  field: string;
  label: string;
  description: string;
  optionsSchema?: Record<string, unknown>;
}
