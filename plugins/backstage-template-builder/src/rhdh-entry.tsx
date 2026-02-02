// RHDH Dynamic Plugin Entry Point
import * as React from 'react';

// CRITICAL: Export must match what scalprum expects
// This will be lazy-loaded by the container
export function PluginRoot() {
  // Return a simple React element, not a component
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        backgroundColor: '#18181b',
        color: '#fff'
      }
    },
    React.createElement(
      'div',
      { style: { textAlign: 'center', padding: '2rem' } },
      React.createElement('h1', { style: { fontSize: '2rem', marginBottom: '1rem' } }, '🎉 Template Builder Works!'),
      React.createElement('p', { style: { color: '#a1a1aa' } }, 'RHDH dynamic plugin loaded successfully'),
      React.createElement('p', { style: { color: '#a1a1aa', marginTop: '1rem' } }, 'Version: 0.1.0')
    )
  );
}
