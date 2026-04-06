// src/components/ui/Glass.js
import React from 'react';

const Glass = ({ children, style, glow }) => (
  <div style={{
    background: 'rgba(13,31,60,0.75)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${glow ? 'var(--brh)' : 'var(--br)'}`,
    borderRadius: 'var(--r3)',
    boxShadow: glow ? '0 0 24px var(--acg)' : 'none',
    padding: 22,
    ...style
  }}>
    {children}
  </div>
);

export default Glass;