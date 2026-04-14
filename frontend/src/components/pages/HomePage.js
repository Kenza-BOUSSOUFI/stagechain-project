import React, { useState, useEffect } from 'react';
import { Hexagon, Wallet, ArrowRight, Home, Info } from 'lucide-react';
import { 
  Shield, 
  Lock, 
  Zap, 
  Globe, 
  ChevronRight, 
  Award, 
  CheckCircle, 
  Users 
} from 'lucide-react';

const HomePage = ({ onConnect, onAbout }) => {
  const [particles, setParticles] = useState([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setParticles(Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      dur: `${10 + Math.random() * 15}s`,
      size: `${2 + Math.random() * 3}px`,
      op: 0.2 + Math.random() * 0.5
    })));

    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const features = [
    { I: Shield, t: 'Sécurisé', d: 'Authentification via MetaMask. Chaque signature est certifiée et irréversible.' },
    { I: Globe, t: 'Décentralisé', d: 'Données stockées sur Ethereum. Aucun serveur central, aucun risque de perte.' },
    { I: Zap, t: 'Automatisé', d: 'Matching intelligent, génération automatique des conventions et calcul des notes.' },
    { I: Award, t: 'Certifié', d: 'Attestations vérifiables via QR code par tout recruteur, sans compte requis.' },
  ];

  const steps = [
    { n: '01', t: 'Inscription', d: 'Créez votre compte avec votre wallet MetaMask. Chaque rôle a son formulaire adapté.' },
    { n: '02', t: 'Matching offres', d: "L'algorithme compare votre profil avec les offres selon 5 critères pondérés." },
    { n: '03', t: 'Convention', d: 'Signez la convention en ligne. 3 signatures requises : Étudiant + RH + Admin.' },
    { n: '04', t: 'Suivi & Rapports', d: 'Soumettez vos rapports hebdomadaires. Validés par encadrant et tuteur.' },
    { n: '05', t: 'Attestation', d: 'Recevez votre attestation certifiée avec QR code. Téléchargeable et imprimable.' },
  ];

  const actors = [
    { label: 'Admin Université', color: 'var(--vi)', tasks: ['Enregistrer les comptes', 'Affecter les encadrants', 'Signer les conventions'] },
    { label: 'RH Entreprise', color: 'var(--am)', tasks: ['Publier les offres', 'Sélectionner les candidats', 'Signer les attestations'] },
    { label: 'Étudiant', color: 'var(--ac)', tasks: ['Trouver un stage', 'Déposer CV et LM', "Recevoir l'attestation"] },
    { label: 'Encadrant', color: 'var(--sk)', tasks: ['Suivre les étudiants', 'Valider les rapports', 'Évaluer le stage'] },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)', fontFamily: 'var(--fu)', overflowX: 'hidden' }}>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map(p => (
          <div 
            key={p.id} 
            className="particle" 
            style={{ 
              left: p.left, 
              animationDelay: p.delay, 
              animationDuration: p.dur, 
              width: p.size, 
              height: p.size, 
              opacity: p.op 
            }} 
          />
        ))}
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'radial-gradient(ellipse 80% 60% at 20% 0%,rgba(0,240,160,0.05) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 100%,rgba(56,178,245,0.05) 0%,transparent 60%)', 
          pointerEvents: 'none' 
        }} />
      </div>

      {/* NAV */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '14px 48px', 
        background: 'rgba(3,6,15,0.9)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid var(--br)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--acd)', border: '1px solid var(--brh)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hexagon size={15} style={{ color: 'var(--ac)' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>Stage<span style={{ color: 'var(--ac)' }}>Chain</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--t1)', cursor: 'pointer' }}><Home size={13} />Accueil</button>
          <button onClick={onAbout} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--t2)', cursor: 'pointer' }}><Info size={13} />À propos</button>
          <button onClick={onConnect} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: 'var(--ac)', color: '#030f06', border: 'none', borderRadius: 'var(--r2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 3px 14px var(--acg)' }}>
            <Wallet size={13} />Se connecter
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '90px 24px 70px' }}>
        

        <h1 className="float" style={{ fontSize: 60, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.88, marginBottom: 20 }}>
          Stage<span style={{ color: 'var(--ac)' }}>Chain</span>
          <br />
          <span style={{ fontSize: 26, fontWeight: 400, color: 'var(--t2)', letterSpacing: '-0.02em' }}>
            La gestion des stages sur la blockchain
          </span>
        </h1>

        <p style={{ fontSize: 15, color: 'var(--t2)', maxWidth: 520, margin: '0 auto 38px', lineHeight: 1.7 }}>
          Plateforme décentralisée qui digitalise et certifie l'intégralité du cycle de vie d'un stage universitaire. Éliminez les faux documents, automatisez le suivi.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 13 }}>
          <button 
            onClick={onConnect} 
            className="glow"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 9, padding: '14px 30px', background: 'var(--ac)', color: '#030f06', 
              border: 'none', borderRadius: 'var(--r2)', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 24px var(--acg)' 
            }}
          >
            <Wallet size={16} />Se connecter via MetaMask<ArrowRight size={15} />
          </button>
          <button 
            onClick={onAbout}
            style={{ 
              padding: '14px 30px', background: 'var(--bg4)', border: '1px solid var(--brm)', borderRadius: 'var(--r2)', 
              fontSize: 15, fontWeight: 600, color: 'var(--t1)', cursor: 'pointer' 
            }}
          >
            En savoir plus
          </button>
        </div>
      </section>

      {/* STATS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 70px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, maxWidth: 880, margin: '0 auto' }}>
          {[{ v: '247', l: 'Étudiants inscrits' }, { v: '89', l: 'Stages actifs' }, { v: '23', l: 'Entreprises partenaires' }, { v: '189', l: 'Attestations émises' }].map((s, i) => (
            <div key={i} style={{ background: 'rgba(13,31,60,0.7)', border: '1px solid var(--br)', borderRadius: 'var(--r3)', padding: '20px 16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--ac)', fontFamily: 'var(--fm)', lineHeight: 1, marginBottom: 5 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'var(--t2)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', background: 'rgba(13,31,60,0.3)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'var(--bg2)', padding: 24, borderRadius: 'var(--r3)', border: '1px solid var(--br)' }}>
              <div style={{ width: 42, height: 42, background: 'var(--acd)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <f.I size={20} style={{ color: 'var(--ac)' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--t1)' }}>{f.t}</h3>
              <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESSUS (STEPS) */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--t1)' }}>Comment ça marche ?</h2>
          <div style={{ width: 50, height: 3, background: 'var(--ac)', margin: '15px auto' }}></div>
        </div>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 15 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: 'transparent', WebkitTextStroke: '1px var(--br)', fontFamily: 'var(--fm)', marginBottom: 10 }}>{s.n}</div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--t1)' }}>{s.t}</h4>
              <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACTEURS */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 48px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {actors.map((a, i) => (
            <div key={i} style={{ border: `1px solid ${a.color}30`, padding: 20, borderRadius: 'var(--r3)', background: 'var(--bg3)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: a.color, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} /> {a.label}
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {a.tasks.map((t, j) => (
                  <li key={j} style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={10} style={{ color: a.color }} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '60px 48px 30px', borderTop: '1px solid var(--br)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <Hexagon size={18} style={{ color: 'var(--ac)' }} />
              <span style={{ fontWeight: 800, color: 'var(--t1)' }}>StageChain</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--t3)' }}>© 2026 EMSI Marrakech CyberSecurity Group. All rights reserved.</p>
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--t1)' }}>Filière</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>CyberSécurité</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--t1)' }}>Plateforme</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>Ethereum / React / Tailwind</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;