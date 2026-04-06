// src/components/common/MMPopup.js
import React, { useState } from 'react';
import { Wallet, CheckCircle, Loader } from 'lucide-react';

const MMPopup = ({ wallet, onConfirm, onReject }) => {
  const [step, setStep] = useState(0);

  const confirm = () => {
    setStep(1);
    setTimeout(() => {
      setStep(2);
      setTimeout(onConfirm, 600);
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: 360,
        background: '#1a1f2e',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        animation: 'mmIn 0.3s ease',
        border: '1px solid rgba(255,255,255,0.07)'
      }}>
        {/* Header MetaMask */}
        <div style={{ background: '#f6851b', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 18 }}>🦊</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>MetaMask</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Ethereum Wallet · Hardhat local (31337)</div>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.2)', padding: '2px 7px', borderRadius: 99 }}>Local</div>
        </div>

        <div style={{ padding: 20 }}>
          {step === 0 && (
            <div className="fi">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--acd)', border: '2px solid var(--brh)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <Wallet size={20} style={{ color: 'var(--ac)' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Connexion StageChain</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>stagechain.emsi.ma</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: '11px 13px', marginBottom: 13 }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--fm)' }}>Wallet</div>
                <div style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'rgba(255,255,255,0.8)' }}>{wallet || '0x...'}</div>
              </div>

              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 16, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                · Voir votre adresse de compte<br/>
                · Accès à StageChain<br/>
                · Signature de transactions
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button 
                  onClick={onReject} 
                  style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,56,75,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  Annuler
                </button>
                <button 
                  onClick={confirm} 
                  style={{ padding: 10, borderRadius: 8, background: '#f6851b', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e07010'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f6851b'}
                >
                  Connecter
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }} className="fi">
              <Loader size={30} className="spin" style={{ color: '#f6851b', marginBottom: 12 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Vérification du wallet...</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Interrogation de la blockchain</div>
            </div>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }} className="fi">
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(0,240,160,0.15)', border: '2px solid var(--ac)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 11px' }}>
                <CheckCircle size={22} style={{ color: 'var(--ac)' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>Connecté !</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MMPopup;