// src/components/common/ToastProvider.js
import React, { useState, useCallback, createContext } from 'react';
import { CheckCircle, XCircle, Bell, AlertCircle, Loader } from 'lucide-react';

export const TC = createContext(null);

export const ToastProvider = ({ children }) => {
  const [ts, setTs] = useState([]);

  const add = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setTs(t => [...t, { id, msg, type }]);
    setTimeout(() => setTs(t => t.filter(x => x.id !== id)), 3800);
  }, []);

  const IC = {
    success: <CheckCircle size={13} />,
    error: <XCircle size={13} />,
    info: <Bell size={13} />,
    warning: <AlertCircle size={13} />,
    loading: <Loader size={13} className="spin" />
  };

  const CL = {
    success: ['var(--acd)', 'var(--ac)'],
    error: ['var(--crd)', 'var(--cr)'],
    info: ['var(--skd)', 'var(--sk)'],
    warning: ['var(--amd)', 'var(--am)'],
    loading: ['var(--vid)', 'var(--vi)']
  };

  return (
    <TC.Provider value={add}>
      {children}
      <div style={{ 
        position: 'fixed', 
        top: 18, 
        right: 18, 
        zIndex: 9999, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 8, 
        maxWidth: 360, 
        pointerEvents: 'none' 
      }}>
        {ts.map(t => {
          const [bg, fg] = CL[t.type] || CL.info;
          return (
            <div key={t.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '10px 14px',
              background: bg,
              border: `1px solid ${fg}40`,
              borderRadius: 'var(--r2)',
              animation: 'slideDown 0.3s ease',
              boxShadow: `0 4px 18px ${fg}20`
            }}>
              <span style={{ color: fg, flexShrink: 0 }}>{IC[t.type]}</span>
              <span style={{ fontSize: 12, fontFamily: 'var(--fm)', color: fg, lineHeight: 1.4 }}>{t.msg}</span>
            </div>
          );
        })}
      </div>
    </TC.Provider>
  );
};

export const useToast = () => React.useContext(TC);