import { BackstageTemplate, TemplateStep } from '../types/template';
import { getActionDefinition } from './actions-catalog';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: ValidationSeverity;
  message: string;
  location?: string; // e.g., "metadata", "steps[0]", "parameters"
  suggestion?: string;
}

/**
 * Validates a Backstage template and returns a list of issues
 */
export function validateTemplate(template: BackstageTemplate): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Validate metadata
  validateMetadata(template, issues);

  // 2. Validate spec
  validateSpec(template, issues);

  // 3. Validate parameters
  validateParameters(template, issues);

  // 4. Validate steps
  validateSteps(template, issues);

  // 5. Validate output
  validateOutput(template, issues);

  // 6. Cross-validate parameter references
  validateParameterReferences(template, issues);

  return issues;
}

function validateMetadata(template: BackstageTemplate, issues: ValidationIssue[]): void {
  const { metadata } = template;

  // Required fields
  if (!metadata.name || metadata.name.trim() === '') {
    issues.push({
      severity: 'error',
      message: 'Template name is required',
      location: 'metadata.name',
      suggestion: 'Add a machine-readable name like "my-service-template"',
    });
  }

  if (!metadata.title || metadata.title.trim() === '') {
    issues.push({
      severity: 'error',
      message: 'Template title is required',
      location: 'metadata.title',
      suggestion: 'Add a human-readable title like "My Service Template"',
    });
  }

  if (!metadata.description || metadata.description.trim() === '') {
    issues.push({
      severity: 'warning',
      message: 'Template description is empty',
      location: 'metadata.description',
      suggestion: 'Add a description to help users understand what this template creates',
    });
  }

  // Name format validation
  if (metadata.name && !/^[a-z0-9-]+$/.test(metadata.name)) {
    issues.push({
      severity: 'warning',
      message: 'Template name should use lowercase letters, numbers, and hyphens only',
      location: 'metadata.name',
      suggestion: 'Use a name like "my-service-template" instead of "My Service Template"',
    });
  }
}

function validateSpec(template: BackstageTemplate, issues: ValidationIssue[]): void {
  const { spec } = template;

  // Owner validation
  if (!spec.owner || spec.owner.trim() === '') {
    issues.push({
      severity: 'warning',
      message: 'Template owner is not set',
      location: 'spec.owner',
      suggestion: 'Set an owner like "group:default/platform-team"',
    });
  } else if (spec.owner && !isValidEntityRef(spec.owner)) {
    issues.push({
      severity: 'warning',
      message: 'Owner does not follow entity ref format',
      location: 'spec.owner',
      suggestion: 'Use format like "group:default/team-name" or "user:default/username"',
    });
  }

  // System validation
  if (spec.system && !isValidEntityRef(spec.system)) {
    issues.push({
      severity: 'warning',
      message: 'System does not follow entity ref format',
      location: 'spec.system',
      suggestion: 'Use format like "system:default/backend-services"',
    });
  }

  // Type validation
  if (!spec.type) {
    issues.push({
      severity: 'info',
      message: 'Template type is not set (defaults to "service")',
      location: 'spec.type',
    });
  }
}

function validateParameters(template: BackstageTemplate, issues: ValidationIssue[]): void {
  const { parameters } = template.spec;

  if (parameters.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'Template has no parameter steps',
      location: 'spec.parameters',
      suggestion: 'Add at least one parameter step to collect user input',
    });
    return;
  }

  parameters.forEach((step, stepIndex) => {
    if (!step.title || step.title.trim() === '') {
      issues.push({
        severity: 'warning',
        message: `Parameter step ${stepIndex + 1} has no title`,
        location: `parameters[${stepIndex}]`,
        suggestion: 'Add a descriptive title for this step',
      });
    }

    const propertyCount = Object.keys(step.properties || {}).length;
    if (propertyCount === 0) {
      issues.push({
        severity: 'warning',
        message: `Parameter step "${step.title || stepIndex + 1}" has no fields`,
        location: `parameters[${stepIndex}]`,
        suggestion: 'Add at least one field to collect user input',
      });
    }

    // Validate required fields exist
    if (step.required && step.required.length > 0) {
      step.required.forEach(reqField => {
        if (!step.properties[reqField]) {
          issues.push({
            severity: 'error',
            message: `Required field "${reqField}" is not defined in properties`,
            location: `parameters[${stepIndex}].required`,
            suggestion: `Remove "${reqField}" from required or add it to properties`,
          });
        }
      });
    }
  });
}

function validateSteps(template: BackstageTemplate, issues: ValidationIssue[]): void {
  const { steps } = template.spec;

  if (steps.length === 0) {
    issues.push({
      severity: 'error',
      message: 'Template has no steps',
      location: 'spec.steps',
      suggestion: 'Add at least one step to define what the template does',
    });
    return;
  }

  steps.forEach((step, stepIndex) => {
    validateStep(step, stepIndex, issues);
  });
}

function validateStep(step: TemplateStep, stepIndex: number, issues: ValidationIssue[]): void {
  // Check if action exists in catalog
  const actionDef = getActionDefinition(step.action);

  if (!actionDef) {
    // Check if it looks like a custom action
    if (step.action.includes(':')) {
      issues.push({
        severity: 'warning',
        message: `Step "${step.name}" uses unknown action "${step.action}"`,
        location: `steps[${stepIndex}]`,
        suggestion: 'Make sure this custom action is installed in your Backstage instance',
      });
    } else {
      issues.push({
        severity: 'error',
        message: `Step "${step.name}" uses invalid action "${step.action}"`,
        location: `steps[${stepIndex}]`,
        suggestion: 'Choose a valid action from the action catalog',
      });
    }
    return;
  }

  // Validate required inputs
  const requiredInputs = actionDef.inputs.filter(input => input.required);
  requiredInputs.forEach(inputDef => {
    const inputValue = step.input[inputDef.name];
    if (inputValue === undefined || inputValue === null || inputValue === '') {
      issues.push({
        severity: 'error',
        message: `Step "${step.name}" is missing required input "${inputDef.name}"`,
        location: `steps[${stepIndex}].input`,
        suggestion: inputDef.description || `Provide a value for "${inputDef.name}"`,
      });
    }
  });

  // Warn about unknown inputs
  Object.keys(step.input).forEach(inputKey => {
    const isDefined = actionDef.inputs.some(input => input.name === inputKey);
    if (!isDefined) {
      issues.push({
        severity: 'warning',
        message: `Step "${step.name}" has unknown input "${inputKey}"`,
        location: `steps[${stepIndex}].input`,
        suggestion: `Remove "${inputKey}" or check the action documentation`,
      });
    }
  });
}

function validateOutput(template: BackstageTemplate, issues: ValidationIssue[]): void {
  const { output } = template.spec;

  if (!output || !output.links || output.links.length === 0) {
    issues.push({
      severity: 'info',
      message: 'Template has no output links',
      location: 'spec.output',
      suggestion: 'Consider adding output links to help users find their created resources',
    });
    return;
  }

  output.links.forEach((link, linkIndex) => {
    if (!link.url || link.url.trim() === '') {
      issues.push({
        severity: 'warning',
        message: `Output link ${linkIndex + 1} has no URL`,
        location: `output.links[${linkIndex}]`,
        suggestion: 'Add a URL or remove this output link',
      });
    }
  });
}

function validateParameterReferences(template: BackstageTemplate, issues: ValidationIssue[]): void {
  const { parameters, steps } = template.spec;

  // Collect all defined parameter names
  const definedParams = new Set<string>();
  parameters.forEach(step => {
    Object.keys(step.properties || {}).forEach(key => {
      definedParams.add(key);
    });
  });

  // Check parameter references in steps
  steps.forEach((step, stepIndex) => {
    const stepJson = JSON.stringify(step.input);
    const paramReferences = stepJson.match(/\$\{\{\s*parameters\.(\w+)\s*\}\}/g) || [];

    paramReferences.forEach(ref => {
      const match = ref.match(/parameters\.(\w+)/);
      if (match) {
        const paramName = match[1];
        if (!definedParams.has(paramName)) {
          issues.push({
            severity: 'error',
            message: `Step "${step.name}" references undefined parameter "${paramName}"`,
            location: `steps[${stepIndex}].input`,
            suggestion: `Add a parameter named "${paramName}" or fix the reference`,
          });
        }
      }
    });
  });

  // Check if parameters are actually used (info only)
  definedParams.forEach(paramName => {
    const allStepsJson = JSON.stringify(steps);
    const isUsed = allStepsJson.includes(`parameters.${paramName}`);
    if (!isUsed) {
      issues.push({
        severity: 'info',
        message: `Parameter "${paramName}" is defined but never used in steps`,
        location: 'parameters',
        suggestion: 'Consider removing unused parameters or reference it in a step',
      });
    }
  });
}

function isValidEntityRef(ref: string): boolean {
  // Valid formats: "kind:namespace/name" or "kind:name" (default namespace)
  return /^[a-z]+:[a-z0-9-]+(\/[a-z0-9-]+)?$/i.test(ref);
}

/**
 * Get a summary count of issues by severity
 */
export function getIssueSummary(issues: ValidationIssue[]): {
  errors: number;
  warnings: number;
  infos: number;
  total: number;
} {
  return {
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    infos: issues.filter(i => i.severity === 'info').length,
    total: issues.length,
  };
}
