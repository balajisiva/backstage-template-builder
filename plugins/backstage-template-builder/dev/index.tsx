import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { templateBuilderPlugin, TemplateBuilderPage } from '../src/plugin';

createDevApp()
  .registerPlugin(templateBuilderPlugin)
  .addPage({
    element: <TemplateBuilderPage />,
    title: 'Template Builder',
    path: '/template-builder',
  })
  .render();
