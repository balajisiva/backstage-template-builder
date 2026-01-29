import React from 'react';
import { TemplateProvider } from '../builder/TemplateProvider';
import BuilderLayout from '../builder/BuilderLayout';
import '../../styles.css';

export const TemplateBuilderPage = () => {
  return (
    <TemplateProvider>
      <BuilderLayout />
    </TemplateProvider>
  );
};
