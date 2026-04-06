// src/components/pages/admin/DashAdmin.js
import React from 'react';
import PH from '../ui/PH';
import SC from '../ui/SC';
import Card from '../ui/Card';
import Tag from '../ui/Tag';
import { useMM } from '../hooks/useMM';

import { Users, BookOpen, Activity, FileCheck } from 'lucide-react';

const DashAdmin = () => (
  <div className="fi">
    <PH title="Tableau de Bord" subtitle="Administration Universitaire" />

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
      <SC label="Étudiants inscrits" value="247" I={Users} color="ac" />
      <SC label="Encadrants actifs" value="18" I={BookOpen} color="sk" />
      <SC label="Stages en cours" value="89" I={Activity} color="am" />
      <SC label="Conventions signées" value="76" I={FileCheck} color="vi" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Activité récente</div>
        {[
          { l: 'Convention signée — Amine Filali', t: 'Il y a 2h', c: 'ac' },
          { l: 'Nouveau compte étudiant', t: 'Il y a 4h', c: 'sk' },
          { l: 'Affectation effectuée', t: 'Il y a 6h', c: 'am' },
          { l: 'Litige résolu', t: 'Hier', c: 'vi' }
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--br)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--${a.c})`, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--t2)' }}>{a.l}</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{a.t}</span>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Répartition par filière</div>
        {[
          ['Génie Logiciel', '32', 'ac'],
          ['CyberSécurité', '28', 'sk'],
          ['IA & BigData', '21', 'am'],
          ['Réseaux', '18', 'vi']
        ].map(([f, n, c], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--br)' }}>
            <span style={{ fontSize: 12, color: 'var(--t2)' }}>{f}</span>
            <Tag label={`${n} étudiants`} c={c} />
          </div>
        ))}
      </Card>
    </div>
  </div>
);

export default DashAdmin;