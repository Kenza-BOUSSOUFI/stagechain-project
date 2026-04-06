/* eslint-disable no-unused-vars */
import React from 'react';

// S-hi l-paths: ghir ../ we7da hitach etudiant o ui b jouj west components
import PH from '../ui/PH';
import SC from '../ui/SC';
import Card from '../ui/Card';
import ML from '../ui/ML';

import { Zap, CheckCircle, Activity, Upload } from 'lucide-react';

const DashEtu = () => (
  <div className="fi">
    <PH title="Tableau de Bord" subtitle="Espace Étudiant" />

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
      <SC label="Score matching" value="93%" I={Zap} color="ac" sub="Dev Blockchain" />
      <SC label="Statut" value="ACCEPTÉ" I={CheckCircle} color="ac" />
      <SC label="Semaine de stage" value="6 / 12" I={Activity} color="am" />
      <SC label="Rapports soumis" value="6" I={Upload} color="sk" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Progression du stage</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--t2)' }}>Semaine 6 / 12</span>
            <span style={{ fontSize: 11, color: 'var(--ac)', fontFamily: 'var(--fm)' }}>50%</span>
          </div>
          <div style={{ height: 7, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '50%', background: 'linear-gradient(90deg,var(--ac),var(--sk))', borderRadius: 99 }} />
          </div>
        </div>
        <ML label="Entreprise" value="TechCorp SA" />
        <ML label="Encadrant" value="Dr. Hassan Moufid" />
        <ML label="Début" value="15 Jan 2026" />
        <ML label="Fin prévue" value="15 Avr 2026" />
      </Card>

      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Activités récentes</div>
        {[
          { l: 'Rapport semaine 6 soumis', t: "Aujourd'hui", c: 'ac' },
          { l: 'Commentaire encadrant reçu', t: 'Hier', c: 'sk' },
          { l: 'Convention active', t: '15 Jan', c: 'am' }
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--br)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--${a.c})`, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--t2)' }}>{a.l}</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{a.t}</span>
          </div>
        ))}
      </Card>
    </div>
  </div>
);

export default DashEtu;