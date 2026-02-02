// RHDH Dynamic Plugin Entry Point - Named export only
import React from 'react';

// IMPORTANT: Must be a NAMED export called PluginRoot (not default)
// This matches the importName in dynamic-plugins.override.yaml
export function PluginRoot() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#18181b',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎉 Template Builder Plugin Loaded!</h1>
        <p style={{ color: '#a1a1aa' }}>The RHDH dynamic plugin is working correctly.</p>
        <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>This is a test component.</p>
      </div>
    </div>
  );
}
