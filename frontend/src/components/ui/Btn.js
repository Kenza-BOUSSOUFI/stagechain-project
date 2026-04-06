// src/components/ui/Btn.js
import React from 'react';
import { Loader } from 'lucide-react';

const Btn = ({ children, v = 'primary', onClick, I: Icon, sm, disabled, loading, full, style }) => {
  const V = {
    primary: { background: 'var(--ac)', color: '#030f06', boxShadow: '0 3px 14px var(--acg)', fontWeight: 700 },
    secondary: { background: 'var(--bg3)', color: 'var(--t1)', border: '1px solid var(--brm)' },
    danger: { background: 'var(--crd)', color: 'var(--cr)', border: '1px solid rgba(245,56,75,0.3)' },
    ghost: { background: 'transparent', color: 'var(--t2)', border: '1px solid var(--br)' },
    amber: { background: 'var(--amd)', color: 'var(--am)', border: '1px solid rgba(245,166,35,0.3)' },
    sky: { background: 'var(--skd)', color: 'var(--sk)', border: '1px solid rgba(56,178,245,0.3)' },
    success: { background: 'var(--acd)', color: 'var(--ac)', border: '1px solid var(--brh)' }
  };

  const s = V[v] || V.primary;
  const dis = disabled || loading;

  return (
    <button
      onClick={!dis ? onClick : undefined}
      disabled={dis}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: sm ? '6px 12px' : '10px 17px',
        borderRadius: 'var(--r2)',
        fontSize: sm ? 11 : 13,
        fontFamily: 'var(--fu)',
        fontWeight: s.fontWeight || 600,
        transition: 'all 0.15s',
        opacity: dis ? 0.55 : 1,
        cursor: dis ? 'not-allowed' : 'pointer',
        width: full ? '100%' : undefined,
        ...s,
        ...style
      }}
      onMouseEnter={e => { if (!dis) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    >
      {loading ? <Loader size={sm ? 11 : 13} className="spin" /> : Icon && <Icon size={sm ? 11 : 13} />}
      {children}
    </button>
  );
};

export default Btn;