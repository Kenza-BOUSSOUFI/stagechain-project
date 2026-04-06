// src/components/pages/AboutPage.js
import React from 'react';
import { Hexagon, ArrowRight } from 'lucide-react';
import Btn from '../ui/Btn';

const AboutPage = ({ onBack }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)', fontFamily: 'var(--fu)', padding: '0 0 60px' }}>
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '14px 48px', 
      background: 'rgba(3,6,15,0.9)', 
      backdropFilter: 'blur(20px)', 
      borderBottom: '1px solid var(--br)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--acd)', border: '1px solid var(--brh)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Hexagon size={15} style={{ color: 'var(--ac)' }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>Stage<span style={{ color: 'var(--ac)' }}>Chain</span></span>
      </div>
      <button 
        onClick={onBack} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 7, 
          padding: '8px 16px', 
          background: 'var(--bg4)', 
          border: '1px solid var(--brm)', 
          borderRadius: 'var(--r2)', 
          fontSize: 13, 
          color: 'var(--t1)' 
        }}
      >
        ← Retour
      </button>
    </nav>

    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 38, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.03em' }}>
        À propos de <span style={{ color: 'var(--ac)' }}>StageChain</span>
      </h1>
      <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.8, marginBottom: 28 }}>
        StageChain est une application décentralisée (DApp) développée par des étudiantes de l'EMSI Marrakech dans le cadre du module Blockchain. 
        Elle digitalise et certifie l'intégralité du cycle de vie d'un stage universitaire.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
        {[
          { t: 'Problème résolu', d: 'Fausses attestations, absence de traçabilité, processus papier lents, coordination difficile entre acteurs.' },
          { t: 'Notre solution', d: 'Blockchain Ethereum pour la certification, MetaMask pour les signatures, IPFS pour le stockage des documents.' },
          { t: 'Stack technique', d: 'React.js · Solidity · MetaMask · Ethereum Sepolia · IPFS Kubo · Express.js · MongoDB' },
          { t: 'Équipe', d: 'Fatimaezzahra LAKBITA · Amina MARZAK · Kenza BOUSSOUFI · Encadrant : Pr. Yasser Saad Chadli' }
        ].map((c, i) => (
          <div key={i} style={{ background: 'var(--bg4)', border: '1px solid var(--br)', borderRadius: 'var(--r3)', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ac)', marginBottom: 8 }}>{c.t}</div>
            <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{c.d}</div>
          </div>
        ))}
      </div>

      <Btn onClick={onBack} I={ArrowRight}>Retour à l'accueil</Btn>
    </div>
  </div>
);

export default AboutPage;