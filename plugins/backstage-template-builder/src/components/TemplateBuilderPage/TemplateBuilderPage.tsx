import React from 'react';
import { TemplateProvider } from '../builder/TemplateProvider';
import { BuilderLayout } from '../builder/BuilderLayout';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { templateBuilderUsePermission } from '../../permissions';
import { ShieldAlert, Lock } from 'lucide-react';
import '../../styles.css';

const PermissionDenied = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
      <div className="max-w-md text-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Access Denied</h1>
        <p className="text-zinc-400 mb-6">
          You don't have permission to access the Template Builder.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-zinc-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-zinc-300 font-medium mb-2">
                This plugin is restricted to platform engineers
              </p>
              <p className="text-xs text-zinc-500">
                If you believe you should have access, please contact your Backstage administrator
                to grant you the <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">template.builder.use</code> permission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplateBuilderPage = () => {
  return (
    <RequirePermission
      permission={templateBuilderUsePermission}
      errorPage={<PermissionDenied />}
    >
      <TemplateProvider>
        <BuilderLayout />
      </TemplateProvider>
    </RequirePermission>
  );
};
