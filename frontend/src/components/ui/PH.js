// src/components/ui/PH.js
import React from 'react';

const PH = ({ title, subtitle, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
    <div>
      {subtitle && (
        <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--ac)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 5 }}>
          {subtitle}
        </div>
      )}
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        {title}
      </h1>
    </div>
    {children && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{children}</div>}
  </div>
);

export default PH;