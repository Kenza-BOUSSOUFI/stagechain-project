// src/components/pages/admin/AdminAffect.js
import React, { useState } from 'react';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import Alrt from '../ui/Alrt';
import Btn from '../ui/Btn';
import ML from '../ui/ML';
import Glass from '../ui/Glass';
import Inp from '../ui/Inp';
import Sel from '../ui/Sel';
import PH from '../ui/PH';
import Card from '../ui/Card';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { UserPlus, Check } from 'lucide-react';
import { 
  Search, Wallet, User, BookOpen, Mail, Send, Save, Clock, Phone, MapPin, Plus, Briefcase, Zap, Globe, Hexagon, Copy, ChevronRight, LogOut, Eye 
} from 'lucide-react';

const AdminAffect = () => {
  const toast = useToast();
  const { sign } = useMM();

  const [aff, setAff] = useState([
    { id: 1, etudiant: 'Amine Filali', filiere: 'Génie Logiciel', encadrant: 'Dr. Hassan Moufid', entreprise: 'TechCorp SA', status: 'ACTIF' },
    { id: 2, etudiant: 'Sara Karimi', filiere: 'CyberSécurité', encadrant: 'Pr. Aicha Benali', entreprise: 'DataLabs', status: 'ACTIF' },
    { id: 3, etudiant: 'Youssef A.', filiere: 'IA & BigData', encadrant: null, entreprise: 'AIGroup', status: 'EN_ATTENTE' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ etudiant: '', encadrant: '', entreprise: '' });

  const encs = ['Dr. Hassan Moufid', 'Pr. Aicha Benali', 'Dr. Karim Zouari', 'Pr. Nadia El Fassi'];

  const affecter = () => {
    if (!form.etudiant || !form.encadrant) {
      toast('Sélectionnez un étudiant et un encadrant !', 'error');
      return;
    }
    sign(`Affectation de ${form.encadrant} à ${form.etudiant}`, () => {
      setAff(a => a.map(x => x.etudiant === form.etudiant ? { ...x, encadrant: form.encadrant, status: 'ACTIF' } : x));
      setForm({ etudiant: '', encadrant: '', entreprise: '' });
      setShowForm(false);
    });
  };

  return (
    <div className="fi">
      <PH title="Affectations Encadrant / Étudiant">
        <Btn I={UserPlus} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fermer' : '+ Nouvelle affectation'}
        </Btn>
      </PH>

      {showForm && (
        <Card style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ac)', marginBottom: 13 }}>Affecter un encadrant à un étudiant</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Sel label="Étudiant" value={form.etudiant} onChange={e => setForm(f => ({ ...f, etudiant: e.target.value }))} options={['', 'Amine Filali', 'Sara Karimi', 'Youssef Alami']} />
            <Sel label="Encadrant" value={form.encadrant} onChange={e => setForm(f => ({ ...f, encadrant: e.target.value }))} options={['', ...encs]} />
            <Inp label="Entreprise" value={form.entreprise} onChange={e => setForm(f => ({ ...f, entreprise: e.target.value }))} placeholder="Nom de l'entreprise" />
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <Btn I={Check} onClick={affecter}>Confirmer l'affectation</Btn>
            <Btn v="ghost" onClick={() => setShowForm(false)}>Annuler</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {aff.map(a => (
          <Card key={a.id} style={{ padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--acd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--ac)' }}>
                {a.etudiant[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{a.etudiant}</span>
                  <Tag label={a.status} c={a.status === 'ACTIF' ? 'ac' : 'am'} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--t2)' }}>{a.filiere} · {a.entreprise}</div>
                {a.encadrant && <div style={{ fontSize: 11, color: 'var(--sk)', marginTop: 1 }}>Encadrant : {a.encadrant}</div>}
                {!a.encadrant && <div style={{ fontSize: 11, color: 'var(--am)', marginTop: 1 }}>⚠ Aucun encadrant affecté</div>}
              </div>
              {!a.encadrant && <Btn sm I={Check} onClick={() => { setForm(f => ({ ...f, etudiant: a.etudiant, entreprise: a.entreprise })); setShowForm(true); }}>Affecter</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAffect;