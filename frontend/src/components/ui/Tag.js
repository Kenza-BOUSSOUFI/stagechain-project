// src/components/ui/Tag.js
import React from 'react';

const Tag = ({ label, c = 'ac' }) => {
  const M = {
    ac: ['var(--acd)', 'var(--ac)'],
    am: ['var(--amd)', 'var(--am)'],
    cr: ['var(--crd)', 'var(--cr)'],
    sk: ['var(--skd)', 'var(--sk)'],
    vi: ['var(--vid)', 'var(--vi)'],
    mu: ['rgba(100,130,160,0.1)', 'var(--t2)']
  };

  const [bg, fg] = M[c] || M.ac;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 9,
      fontFamily: 'var(--fm)',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: bg,
      color: fg,
      border: `1px solid ${fg}40`
    }}>
      {label}
    </span>
  );
};

export default Tag;