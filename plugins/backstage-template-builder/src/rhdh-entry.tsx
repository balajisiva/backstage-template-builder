// RHDH Dynamic Plugin Entry Point
import React from 'react';

// Component definition
const TestComponent = () => {
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
      React.createElement('h1', { style: { fontSize: '2rem', marginBottom: '1rem' } }, '🎉 Template Builder!'),
      React.createElement('p', { style: { color: '#a1a1aa' } }, 'RHDH plugin loaded'),
      React.createElement('p', { style: { color: '#a1a1aa', marginTop: '1rem' } }, 'Test version')
    )
  );
};

// CRITICAL: Export the component itself, not the result of calling it
export const PluginRoot = TestComponent;

// Also try default export
export default TestComponent;
