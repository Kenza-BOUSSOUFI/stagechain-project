// src/components/ui/Txta.js
import React from 'react';

const Txta = ({ label, placeholder, rows = 4, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && (
      <label style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <textarea
      placeholder={placeholder}
      rows={rows}
      value={value || ''}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '10px 12px',
        resize: 'vertical',
        background: 'var(--bg3)',
        border: '1px solid var(--br)',
        borderRadius: 'var(--r2)',
        color: 'var(--t1)',
        fontSize: 13,
        lineHeight: 1.6,
        transition: 'border-color 0.2s'
      }}
      onFocus={e => e.target.style.borderColor = 'var(--brh)'}
      onBlur={e => e.target.style.borderColor = 'var(--br)'}
    />
  </div>
);

export default Txta;