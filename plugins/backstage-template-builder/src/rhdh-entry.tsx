// RHDH Dynamic Plugin Entry Point - Minimal test version
import React from 'react';

// Simplest possible component to test plugin loading
export default function PluginRoot() {
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

// Also export as named export for compatibility
export { PluginRoot };
