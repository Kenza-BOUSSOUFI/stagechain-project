// src/components/ui/ML.js
import React from 'react';

const ML = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--br)' }}>
    <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </span>
    <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: color || 'var(--t1)' }}>
      {value}
    </span>
  </div>
);

export default ML;