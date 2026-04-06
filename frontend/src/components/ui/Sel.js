// src/components/ui/Sel.js
import React from 'react';

const Sel = ({ label, options, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && (
      <label style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <select
      value={value || ''}
      onChange={onChange}
      style={{
        padding: '10px 12px',
        background: 'var(--bg3)',
        border: '1px solid var(--br)',
        borderRadius: 'var(--r2)',
        color: 'var(--t1)',
        fontSize: 13
      }}
      onFocus={e => e.target.style.borderColor = 'var(--brh)'}
      onBlur={e => e.target.style.borderColor = 'var(--br)'}
    >
      {options.map((o, i) => (
        <option key={i} value={o.v || o}>{o.l || o}</option>
      ))}
    </select>
  </div>
);

export default Sel;