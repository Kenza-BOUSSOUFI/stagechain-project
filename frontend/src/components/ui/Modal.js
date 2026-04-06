// src/components/ui/Modal.js
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;

  return (
    <div 
      onClick={onClose} 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        style={{
          background: 'var(--bg4)',
          border: '1px solid var(--brm)',
          borderRadius: 'var(--r3)',
          padding: 28,
          maxWidth: wide ? 720 : 500,
          width: '100%',
          animation: 'fadeIn 0.2s ease',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{title}</h3>
          <button 
            onClick={onClose} 
            style={{ color: 'var(--t3)', padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cr)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;