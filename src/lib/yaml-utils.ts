import yaml from 'js-yaml';
import {
  BackstageTemplate,
  ParameterStep,
  ParameterProperty,
  TemplateStep,
  TemplateOutput,
  OutputLink,
} from '@/types/template';
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert internal template model to Backstage YAML
 */
export function templateToYaml(template: BackstageTemplate): string {
  const output = buildYamlObject(template);
  return yaml.dump(output, {
    lineWidth: 120,
    noRefs: true,
    quotingType: "'",
    forceQuotes: false,
  });
}

function buildYamlObject(template: BackstageTemplate): Record<string, unknown> {
  return {
    apiVersion: template.apiVersion,
    kind: template.kind,
    metadata: {
      name: template.metadata.name,
      title: template.metadata.title,
      description: template.metadata.description,
      ...(template.metadata.tags.length > 0 ? { tags: template.metadata.tags } : {}),
      ...(template.metadata.annotations && Object.keys(template.metadata.annotations).length > 0
        ? { annotations: template.metadata.annotations }
        : {}),
    },
    spec: {
      owner: template.spec.owner,
      ...(template.spec.system ? { system: template.spec.system } : {}),
      type: template.spec.type,
      parameters: template.spec.parameters.map(serializeParameterStep),
      steps: template.spec.steps.map(serializeStep),
      output: serializeOutput(template.spec.output),
    },
  };
}

function serializeParameterStep(step: ParameterStep): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(step.properties)) {
    properties[key] = serializeProperty(prop);
  }

  return {
    title: step.title,
    ...(step.description ? { description: step.description } : {}),
    ...(step.required.length > 0 ? { required: step.required } : {}),
    properties,
  };
}

function serializeProperty(prop: ParameterProperty): Record<string, unknown> {
  const result: Record<string, unknown> = {
    title: prop.title,
    type: prop.type,
  };
  if (prop.description) result.description = prop.description;
  if (prop.default !== undefined && prop.default !== '') result.default = prop.default;
  if (prop.enum && prop.enum.length > 0) result.enum = prop.enum;
  if (prop.enumNames && prop.enumNames.length > 0) result.enumNames = prop.enumNames;
  if (prop.pattern) result.pattern = prop.pattern;
  if (prop.minLength !== undefined) result.minLength = prop.minLength;
  if (prop.maxLength !== undefined) result.maxLength = prop.maxLength;
  if (prop.uniqueItems) result.uniqueItems = prop.uniqueItems;
  if (prop.items) result.items = prop.items;
  if (prop['ui:field']) result['ui:field'] = prop['ui:field'];
  if (prop['ui:widget']) result['ui:widget'] = prop['ui:widget'];
  if (prop['ui:options'] && Object.keys(prop['ui:options']).length > 0) {
    result['ui:options'] = prop['ui:options'];
  }
  if (prop['ui:autofocus']) result['ui:autofocus'] = prop['ui:autofocus'];
  return result;
}

function serializeStep(step: TemplateStep): Record<string, unknown> {
  const result: Record<string, unknown> = {
    id: step.id,
    name: step.name,
    action: step.action,
  };
  if (step.if) result.if = step.if;
  if (step.input && Object.keys(step.input).length > 0) {
    result.input = step.input;
  }
  return result;
}

function serializeOutput(output: TemplateOutput): Record<string, unknown> {
  if (!output.links || output.links.length === 0) return {};
  return {
    links: output.links.map((link: OutputLink) => {
      const result: Record<string, unknown> = { title: link.title };
      if (link.url) result.url = link.url;
      if (link.icon) result.icon = link.icon;
      if (link.entityRef) result.entityRef = link.entityRef;
      return result;
    }),
  };
}

/**
 * Parse a Backstage YAML template into our internal model
 */
export function yamlToTemplate(yamlContent: string): BackstageTemplate {
  const doc = yaml.load(yamlContent) as Record<string, unknown>;
  if (!doc || typeof doc !== 'object') {
    throw new Error('Invalid YAML content');
  }

  const metadata = doc.metadata as Record<string, unknown> || {};
  const spec = doc.spec as Record<string, unknown> || {};

  const parameters = parseParameters(spec.parameters);
  const steps = parseSteps(spec.steps as Record<string, unknown>[] || []);
  const output = parseOutput(spec.output as Record<string, unknown> || {});

  return {
    apiVersion: (doc.apiVersion as string) || 'scaffolder.backstage.io/v1beta3',
    kind: 'Template',
    metadata: {
      name: (metadata.name as string) || 'new-template',
      title: (metadata.title as string) || 'New Template',
      description: (metadata.description as string) || '',
      tags: (metadata.tags as string[]) || [],
      ...(metadata.annotations ? { annotations: metadata.annotations as Record<string, string> } : {}),
    },
    spec: {
      owner: (spec.owner as string) || 'my-team',
      system: (spec.system as string) || '',
      type: (spec.type as string) || 'service',
      parameters,
      steps,
      output,
    },
  };
}

function parseParameters(params: unknown): ParameterStep[] {
  if (!params) return [];

  // Parameters can be a single object or array
  const paramArray = Array.isArray(params) ? params : [params];

  return paramArray.map((step: Record<string, unknown>) => {
    const properties: Record<string, ParameterProperty> = {};
    const rawProps = (step.properties as Record<string, Record<string, unknown>>) || {};

    for (const [key, val] of Object.entries(rawProps)) {
      properties[key] = {
        title: (val.title as string) || key,
        type: (val.type as ParameterProperty['type']) || 'string',
        description: val.description as string,
        default: val.default,
        enum: val.enum as string[],
        enumNames: val.enumNames as string[],
        pattern: val.pattern as string,
        minLength: val.minLength as number,
        maxLength: val.maxLength as number,
        uniqueItems: val.uniqueItems as boolean,
        items: val.items as ParameterProperty['items'],
        'ui:field': val['ui:field'] as string,
        'ui:widget': val['ui:widget'] as string,
        'ui:options': val['ui:options'] as Record<string, unknown>,
        'ui:autofocus': val['ui:autofocus'] as boolean,
      };
    }

    return {
      id: uuidv4(),
      title: (step.title as string) || 'Step',
      description: step.description as string,
      required: (step.required as string[]) || [],
      properties,
    };
  });
}

function parseSteps(steps: Record<string, unknown>[]): TemplateStep[] {
  return steps.map((step) => ({
    id: (step.id as string) || uuidv4(),
    name: (step.name as string) || 'Unnamed Step',
    action: (step.action as string) || '',
    input: (step.input as Record<string, unknown>) || {},
    if: step.if as string,
  }));
}

function parseOutput(output: Record<string, unknown>): TemplateOutput {
  const links = (output.links as Record<string, unknown>[]) || [];
  return {
    links: links.map((link) => ({
      title: (link.title as string) || '',
      url: link.url as string,
      icon: link.icon as string,
      entityRef: link.entityRef as string,
    })),
  };
}

/**
 * Create a blank new template
 */
export function createBlankTemplate(): BackstageTemplate {
  return {
    apiVersion: 'scaffolder.backstage.io/v1beta3',
    kind: 'Template',
    metadata: {
      name: 'new-template',
      title: 'New Template',
      description: 'A new Backstage software template',
      tags: [],
    },
    spec: {
      owner: 'my-team',
      system: '',
      type: 'service',
      parameters: [
        {
          id: uuidv4(),
          title: 'Provide component information',
          required: [],
          properties: {},
        },
      ],
      steps: [],
      output: { links: [] },
    },
  };
}
