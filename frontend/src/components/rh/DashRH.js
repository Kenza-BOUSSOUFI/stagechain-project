// src/components/pages/rh/DashRH.js
import React from 'react';
import PH from '../ui/PH';
import SC from '../ui/SC';
import Card from '../ui/Card';
import Tag from '../ui/Tag';
import { FilePlus, Inbox, User, Award } from 'lucide-react';

const DashRH = () => (
  <div className="fi">
    <PH title="Tableau de Bord" subtitle="Ressources Humaines" />

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
      <SC label="Offres publiées" value="14" I={FilePlus} color="am" />
      <SC label="Candidatures" value="87" I={Inbox} color="ac" />
      <SC label="Stagiaires actifs" value="11" I={User} color="sk" />
      <SC label="Attestations émises" value="9" I={Award} color="vi" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Candidatures récentes</div>
        {[
          { n: 'Amine Filali', o: 'Dev Blockchain', m: '95%', s: 'EN_ATTENTE' },
          { n: 'Sara Karimi', o: 'CyberSec', m: '88%', s: 'ACCEPTE' },
          { n: 'Youssef Alami', o: 'Data Scientist', m: '74%', s: 'REFUSE' }
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--br)' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{c.n}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)' }}>{c.o} · {c.m}</div>
            </div>
            <Tag label={c.s} c={c.s === 'ACCEPTE' ? 'ac' : c.s === 'EN_ATTENTE' ? 'am' : 'cr'} />
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Offres actives</div>
        {[
          ['Dev Blockchain Junior', '12 candidats'],
          ['CyberSéc Analyste', '8 candidats'],
          ['DevOps Engineer', '5 candidats']
        ].map(([o, n], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--br)' }}>
            <span style={{ fontSize: 12, color: 'var(--t2)' }}>{o}</span>
            <Tag label={n} c="ac" />
          </div>
        ))}
      </Card>
    </div>
  </div>
);

export default DashRH;