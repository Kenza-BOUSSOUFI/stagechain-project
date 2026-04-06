// src/components/pages/admin/AdminLitiges.js
import React, { useState } from 'react';
import PH from '../ui/PH';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Txta from '../ui/Txta';
import Tag from '../ui/Tag';
import Alrt from '../ui/Alrt';
import { useMM } from '../hooks/useMM';
import { useToast } from '../common/ToastProvider';
import { XCircle, MessageSquare, CheckCircle } from 'lucide-react';
import { 
  Search, Wallet, User, BookOpen, Mail, Send, Save, Clock, Phone, MapPin, Plus, Briefcase, Zap, Globe, Hexagon, Copy, ChevronRight, LogOut, Eye 
} from 'lucide-react';
const AdminLitiges = () => {
  const { sign } = useMM();
  const toast = useToast();

  const [lig, setLig] = useState([
    { id: 'L-001', parties: 'Amine Filali vs TechCorp SA', motif: 'Non-validation du rapport', date: '14 Nov 2025', urgent: true, status: 'EN_ATTENTE', dec: '' },
    { id: 'L-002', parties: 'Sara Karimi vs DataLabs', motif: 'Convention non signée', date: '18 Nov 2025', urgent: false, status: 'EN_ATTENTE', dec: '' },
    { id: 'L-003', parties: 'Youssef Alami vs StartupX', motif: 'Attestation contestée', date: '20 Nov 2025', urgent: false, status: 'RÉSOLU', dec: 'Attestation confirmée valide.' },
  ]);

  const [openId, setOpenId] = useState(null);
  const [dec, setDec] = useState('');

  const handle = (id, action) => {
    if (action === 'RÉSOLU' && !dec.trim()) {
      toast('Rédigez une décision !', 'error');
      return;
    }
    sign(`Arbitrage ${id}`, () => {
      setLig(l => l.map(x => x.id === id ? { ...x, status: action, dec } : x));
      setOpenId(null);
      setDec('');
    });
  };

  return (
    <div className="fi">
      <PH title="Litiges & Arbitrage" />

      {lig.filter(l => l.status === 'EN_ATTENTE').length > 0 && (
        <Alrt type="warning" message={`${lig.filter(l => l.status === 'EN_ATTENTE').length} litige(s) en attente.`} />
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {lig.map(l => (
          <Card key={l.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--ac)' }}>{l.id}</span>
                  {l.urgent && <Tag label="URGENT" c="cr" />}
                  <Tag label={l.status} c={l.status === 'EN_ATTENTE' ? 'am' : l.status === 'RÉSOLU' ? 'ac' : 'cr'} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{l.parties}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 3 }}>{l.motif} · {l.date}</div>
                {l.dec && <div style={{ marginTop: 6, padding: '6px 9px', background: 'var(--acd)', border: '1px solid var(--brm)', borderRadius: 'var(--r1)', fontSize: 11, color: 'var(--ac)' }}>Décision : {l.dec}</div>}
              </div>

              {l.status === 'EN_ATTENTE' && (
                <div style={{ display: 'flex', gap: 7, marginLeft: 12 }}>
                  <Btn v="danger" sm I={XCircle} onClick={() => { setDec('Litige rejeté.'); handle(l.id, 'REJETÉ'); }}>Rejeter</Btn>
                  <Btn sm I={MessageSquare} onClick={() => setOpenId(openId === l.id ? null : l.id)}>Décider</Btn>
                </div>
              )}
            </div>

            {openId === l.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--br)' }}>
                <Txta label="Décision motivée" placeholder="Expliquez la décision..." rows={3} value={dec} onChange={e => setDec(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
                  <Btn I={CheckCircle} onClick={() => handle(l.id, 'RÉSOLU')}>Résoudre</Btn>
                  <Btn v="ghost" onClick={() => setOpenId(null)}>Fermer</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLitiges;