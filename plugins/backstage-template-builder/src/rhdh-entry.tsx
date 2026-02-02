// RHDH Dynamic Plugin Entry Point
// Export a simple wrapper without permissions for RHDH

import React from 'react';
import { TemplateProvider } from './components/builder/TemplateProvider';
import BuilderLayout from './components/builder/BuilderLayout';
import './styles.css';

// Simple wrapper for RHDH - skip permission checks
// IMPORTANT: Must be a function component that returns JSX, not a JSX element
export function PluginRoot() {
  return (
    <TemplateProvider>
      <BuilderLayout />
    </TemplateProvider>
  );
}

export { rootRouteRef } from './routes';

// Also export the plugin and extension for OSS Backstage compatibility
export * from './plugin';
