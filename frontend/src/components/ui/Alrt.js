// src/components/ui/Alrt.js
import React from 'react';
import { Bell, AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';

const Alrt = ({ type = 'info', message, onClose }) => {
  const M = {
    info: ['var(--skd)', 'var(--sk)', <Bell size={13} />],
    warning: ['var(--amd)', 'var(--am)', <AlertCircle size={13} />],
    success: ['var(--acd)', 'var(--ac)', <CheckCircle size={13} />],
    error: ['var(--crd)', 'var(--cr)', <XCircle size={13} />]
  };

  const [bg, fg, ic] = M[type] || M.info;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '10px 13px',
      background: bg,
      border: `1px solid ${fg}30`,
      borderRadius: 'var(--r2)',
      marginBottom: 13
    }}>
      <span style={{ color: fg, flexShrink: 0, marginTop: 1 }}>{ic}</span>
      <span style={{ fontSize: 12, color: fg, fontFamily: 'var(--fm)', flex: 1, lineHeight: 1.5 }}>
        {message}
      </span>
      {onClose && (
        <button onClick={onClose} style={{ color: fg, opacity: 0.6, padding: 2 }}>
          <X size={11} />
        </button>
      )}
    </div>
  );
};

export default Alrt;