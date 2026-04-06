// src/components/common/Sidebar.js
import React from 'react';
import { useApp } from '../context/AppContext';
import RCFG from '../data/rcfg';
import NAV from '../data/nav';
import { Hexagon, Copy, ChevronRight, LogOut } from 'lucide-react';
import { useToast } from './ToastProvider'; 
const sw = w => w ? `${w.slice(0,6)}...${w.slice(-4)}` : '';

// 1. Zidna onLogout hna f l-props
const Sidebar = ({ view, setView, onLogout }) => {
  const { user } = useApp(); // 2. 7iydna logout mn hna hit kat-dkhol f sira3 m3a App.js
  const toast = useToast();

  if (!user) return null;

  const cfg = RCFG[user.role];
  const items = NAV[user.role] || [];

  const copyW = () => {
    navigator.clipboard?.writeText(user.wallet).catch(() => {});
    toast('Adresse copiée !', 'info');
  };

  return (
    <aside style={{ 
      width: 242, 
      flexShrink: 0, 
      background: 'var(--bg2)', 
      borderRight: '1px solid var(--br)', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      position: 'sticky', 
      top: 0, 
      overflow: 'hidden' 
    }}>
      {/* Header */}
      <div style={{ padding: '15px 13px 12px', borderBottom: '1px solid var(--br)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
          <div style={{ width: 29, height: 29, borderRadius: 8, background: 'var(--acd)', border: '1px solid var(--brh)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hexagon size={14} style={{ color: 'var(--ac)' }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em', lineHeight: 1 }}>Stage<span style={{ color: 'var(--ac)' }}>Chain</span></div>
            <div style={{ fontSize: 7, fontFamily: 'var(--fm)', color: 'var(--t3)', letterSpacing: '0.12em', marginTop: 2 }}>EMSI · Plateforme Stages</div>
          </div>
        </div>

        {/* User Info */}
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r2)', border: '1px solid var(--br)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px' }}>
            <div style={{ width: 23, height: 23, borderRadius: 6, background: `${cfg.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 800, color: cfg.color }}>
              {user.nom ? user.nom[0] : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nom}</div>
              <div style={{ fontSize: 9, fontFamily: 'var(--fm)', color: 'var(--t3)', marginTop: 1 }}>{cfg.label}</div>
            </div>
            <div className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ac)', flexShrink: 0 }} />
          </div>

          <button 
            onClick={copyW} 
            style={{ 
              width: '100%', 
              padding: '4px 9px', 
              borderTop: '1px solid var(--br)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 5, 
              fontSize: 9, 
              fontFamily: 'var(--fm)', 
              color: 'var(--t3)', 
              transition: 'all 0.15s',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bgh)'; e.currentTarget.style.color = 'var(--ac)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t3)'; }}
          >
            <Copy size={8} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sw(user.wallet)}</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 7px 0' }}>
        {items.map(item => {
          const active = view === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => setView(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 9px',
                borderRadius: 'var(--r2)',
                marginBottom: 2,
                background: active ? `${cfg.color}15` : 'transparent',
                border: active ? `1px solid ${cfg.color}30` : '1px solid transparent',
                color: active ? cfg.color : 'var(--t2)',
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                transition: 'all 0.14s',
                textAlign: 'left',
                cursor: 'pointer'
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bgh)'; e.currentTarget.style.color = 'var(--t1)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t2)'; } }}
            >
              <ChevronRight size={12} style={{ opacity: active ? 1 : 0, transition: 'opacity 0.2s' }} />
              <span style={{ flex: 1 }}>{item.l}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: cfg.color }} />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: 8, borderTop: '1px solid var(--br)' }}>
        <button 
          onClick={onLogout} // 3. Daba ghadi t-3iyt l logout dyal App.js nichan
          style={{
            width: '100%',
            padding: '7px 11px',
            borderRadius: 'var(--r2)',
            background: 'var(--crd)',
            border: '1px solid rgba(245,56,75,0.25)',
            color: 'var(--cr)',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,56,75,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--crd)'}
        >
          <LogOut size={12} />Déconnecter
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;