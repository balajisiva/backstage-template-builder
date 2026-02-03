import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { templateBuilderPlugin, TemplateBuilderPage } from '../src';
import '../src/styles.css';

createDevApp()
  .registerPlugin(templateBuilderPlugin)
  .addPage({
    element: <TemplateBuilderPage />,
    title: 'Template Builder',
    path: '/template-builder',
  })
  .render();
