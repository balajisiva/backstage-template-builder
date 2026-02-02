// RHDH Dynamic Plugin Entry Point
// Export the plain React component as PluginRoot, NOT the Backstage extension

export { TemplateBuilderPage as PluginRoot } from './components/TemplateBuilderPage/TemplateBuilderPage';
export { rootRouteRef } from './routes';

// Also export the plugin and extension for OSS Backstage compatibility
export * from './plugin';
