// src/components/ui/Inp.js
import React from 'react';

const Inp = ({ label, placeholder, type = 'text', value, onChange, I: Icon, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {label && (
      <label style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon 
          size={13} 
          style={{ 
            position: 'absolute', 
            left: 11, 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--t3)', 
            pointerEvents: 'none' 
          }} 
        />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          padding: Icon ? '10px 12px 10px 32px' : '10px 12px',
          background: 'var(--bg3)',
          border: '1px solid var(--br)',
          borderRadius: 'var(--r2)',
          color: 'var(--t1)',
          fontSize: 13,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          opacity: disabled ? 0.5 : 1
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--brh)';
          e.target.style.boxShadow = '0 0 0 3px var(--acd)';
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--br)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  </div>
);

export default Inp;