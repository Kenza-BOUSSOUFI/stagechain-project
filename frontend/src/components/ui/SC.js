// src/components/ui/SC.js
import React from 'react';
import Glass from './Glass';

const SC = ({ label, value, sub, color = 'ac', I: Icon }) => {
  const C = { ac: 'var(--ac)', am: 'var(--am)', sk: 'var(--sk)', cr: 'var(--cr)', vi: 'var(--vi)' };
  const fg = C[color] || C.ac;

  return (
    <Glass style={{ padding: '15px 17px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--fm)', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}
        </span>
        {Icon && (
          <div style={{ padding: 6, background: `${fg}15`, borderRadius: 7 }}>
            <Icon size={12} style={{ color: fg }} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 27, fontWeight: 800, color: fg, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 3 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--t2)' }}>{sub}</div>}
    </Glass>
  );
};

export default SC;