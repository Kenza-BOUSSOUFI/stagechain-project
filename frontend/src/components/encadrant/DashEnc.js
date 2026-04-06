// src/components/pages/encadrant/DashEnc.js
import React from 'react';
import PH from '../ui/PH';
import SC from '../ui/SC';
import Card from '../ui/Card';
import Tag from '../ui/Tag';
import { 
  Search, Wallet, User, BookOpen, Mail, Send, Save, Clock, Phone, MapPin, Plus, Briefcase, Zap, Globe, Hexagon, Copy, ChevronRight, LogOut, Eye 
} from 'lucide-react';
import { Users, FileText, CheckCircle, Activity } from 'lucide-react';

const DashEnc = () => (
  <div className="fi">
    <PH title="Tableau de Bord" subtitle="Espace Encadrant Pédagogique" />

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
      <SC label="Étudiants suivis" value="8" I={Users} color="sk" />
      <SC label="Rapports à évaluer" value="3" I={FileText} color="am" />
      <SC label="Rapports validés" value="14" I={CheckCircle} color="ac" />
      <SC label="Stages actifs" value="8" I={Activity} color="vi" />
    </div>

    <Card>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Mes étudiants</div>
      {[
        { n: 'Amine Filali', e: 'TechCorp SA', s: 'Rapport à valider', sem: 6 },
        { n: 'Sara Karimi', e: 'DataLabs', s: 'En cours', sem: 8 },
        { n: 'Youssef A.', e: 'AIGroup', s: 'En cours', sem: 3 }
      ].map((e, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--br)' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{e.n}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{e.e} · Semaine {e.sem}/12</div>
          </div>
          <Tag label={e.s} c={e.s === 'Rapport à valider' ? 'am' : 'ac'} />
        </div>
      ))}
    </Card>
  </div>
);

export default DashEnc;