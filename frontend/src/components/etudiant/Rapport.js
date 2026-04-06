// src/components/pages/etudiant/Rapport.js
import React, { useState, useRef } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Txta from '../ui/Txta';
import Modal from '../ui/Modal';
import ML from '../ui/ML';
import Alrt from '../ui/Alrt';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { Upload, Eye } from 'lucide-react';
import Tag from '../ui/Tag';

const Rapport = () => {
  const { sign } = useMM();
  const toast = useToast();

  const [rapports, setRapports] = useState([
    { id: 1, titre: 'Rapport Semaine 1', type: 'hebdo', date: '22 Jan 2026', status: 'VALIDÉ', tuteur: 'VALIDÉ', encadrant: 'VALIDÉ', commentaire: 'Bon démarrage !' },
    { id: 2, titre: 'Rapport Semaine 2', type: 'hebdo', date: '29 Jan 2026', status: 'VALIDÉ', tuteur: 'VALIDÉ', encadrant: 'VALIDÉ', commentaire: 'Continue ainsi.' },
    { id: 3, titre: 'Rapport Semaine 3', type: 'hebdo', date: '05 Fév 2026', status: 'VALIDÉ', tuteur: 'VALIDÉ', encadrant: 'VALIDÉ', commentaire: 'Bonne progression.' },
    { id: 4, titre: 'Rapport Semaine 4', type: 'hebdo', date: null, status: 'EN ATTENTE', tuteur: 'EN ATTENTE', encadrant: 'EN ATTENTE', commentaire: '' },
    { id: 5, titre: 'Rapport Semaine 5', type: 'hebdo', date: null, status: 'NON SOUMIS', tuteur: null, encadrant: null, commentaire: '' },
    { id: 6, titre: 'Rapport Final', type: 'final', date: null, status: 'NON SOUMIS', tuteur: null, encadrant: null, commentaire: '' },
  ]);

  const [text, setText] = useState('');
  const [finalFile, setFinalFile] = useState(null);
  const [detM, setDetM] = useState(null);
  const finalRef = useRef();

  const canFinal = rapports.filter(r => r.type === 'hebdo').every(r => r.status === 'VALIDÉ');

  const submitHebdo = () => {
    if (!text.trim()) {
      toast('Rédigez votre rapport !', 'error');
      return;
    }
    sign('Soumission rapport hebdomadaire', () => {
      setRapports(r => r.map(x => {
        if (x.status === 'NON SOUMIS' && x.type === 'hebdo') {
          return { ...x, date: new Date().toLocaleDateString('fr-FR'), status: 'EN ATTENTE', tuteur: 'EN ATTENTE', encadrant: 'EN ATTENTE' };
        }
        return x;
      }));
      setText('');
    });
  };

  const handleFF = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast('PDF uniquement !', 'error');
      return;
    }
    setFinalFile(f.name);
    toast(`"${f.name}" prêt`, 'success');
  };

  const submitFinal = () => {
    if (!finalFile) {
      toast('Sélectionnez le PDF !', 'error');
      return;
    }
    sign('Soumission rapport final', () => {
      setRapports(r => r.map(x => x.type === 'final' ? { ...x, date: new Date().toLocaleDateString('fr-FR'), status: 'EN ATTENTE', tuteur: 'EN ATTENTE', encadrant: 'EN ATTENTE' } : x));
      setFinalFile(null);
    });
  };

  return (
    <div className="fi">
      <PH title="Mes Rapports de Stage" />
      <Alrt type="info" message="Soumettez vos rapports hebdomadaires. Quand tous sont validés, vous pouvez soumettre le rapport final." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 17, marginBottom: 18 }}>
        <Glass glow>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ac)', marginBottom: 12 }}>Rapport hebdomadaire</div>
          <Txta label="Compte rendu de la semaine" placeholder="Activités, difficultés, avancées cette semaine..." rows={5} value={text} onChange={e => setText(e.target.value)} />
          <div style={{ marginTop: 11 }}><Btn I={Upload} full onClick={submitHebdo}>Soumettre le rapport</Btn></div>
        </Glass>

        <Glass>
          <div style={{ fontSize: 12, fontWeight: 700, color: canFinal ? 'var(--ac)' : 'var(--t2)', marginBottom: 6 }}>Rapport Final (PDF)</div>
          {!canFinal && <Alrt type="warning" message="Tous les rapports hebdomadaires doivent être validés d'abord." />}
          <div 
            onClick={canFinal ? () => finalRef.current.click() : undefined}
            style={{ 
              border: `2px dashed ${canFinal ? 'var(--brm)' : 'var(--br)'}`, 
              borderRadius: 'var(--r2)', 
              padding: 20, 
              textAlign: 'center', 
              cursor: canFinal ? 'pointer' : 'not-allowed', 
              background: 'var(--bg3)', 
              marginBottom: 11, 
              opacity: canFinal ? 1 : 0.5 
            }}
          >
            <Upload size={20} style={{ color: 'var(--t3)', marginBottom: 7 }} />
            <div style={{ fontSize: 12, color: finalFile ? 'var(--ac)' : 'var(--t2)', marginBottom: 2 }}>{finalFile || 'Glisser le PDF ici'}</div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>Max 50MB · PDF uniquement</div>
            <input ref={finalRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFF(e.target.files[0])} />
          </div>
          <Btn I={Upload} full onClick={submitFinal} disabled={!canFinal}>Soumettre le rapport final</Btn>
        </Glass>
      </div>

      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Historique des rapports</div>
        {rapports.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 0', borderBottom: '1px solid var(--br)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.status === 'VALIDÉ' ? 'var(--ac)' : r.status === 'EN ATTENTE' ? 'var(--am)' : 'var(--t3)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{r.titre} {r.type === 'final' && <Tag label="FINAL" c="vi" />}</div>
              {r.date && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>Soumis le {r.date}</div>}
            </div>
            {r.status !== 'NON SOUMIS' && (
              <div style={{ display: 'flex', gap: 5 }}>
                <Tag label={`Tuteur: ${r.tuteur || '—'}`} c={r.tuteur === 'VALIDÉ' ? 'ac' : r.tuteur === 'EN ATTENTE' ? 'am' : 'mu'} />
                <Tag label={`Enc.: ${r.encadrant || '—'}`} c={r.encadrant === 'VALIDÉ' ? 'sk' : r.encadrant === 'EN ATTENTE' ? 'am' : 'mu'} />
              </div>
            )}
            <Tag label={r.status} c={r.status === 'VALIDÉ' ? 'ac' : r.status === 'EN ATTENTE' ? 'am' : 'mu'} />
            {(r.status === 'VALIDÉ' || r.status === 'EN ATTENTE') && (
              <button onClick={() => setDetM(r)} style={{ color: 'var(--t3)', padding: 4 }}><Eye size={12} /></button>
            )}
          </div>
        ))}
      </Card>

      <Modal open={!!detM} onClose={() => setDetM(null)} title={detM?.titre}>
        {detM && (
          <>
            <ML label="Date" value={detM.date || '—'} />
            <ML label="Validation tuteur" value={detM.tuteur || '—'} color={detM.tuteur === 'VALIDÉ' ? 'var(--ac)' : 'var(--am)'} />
            <ML label="Validation encadrant" value={detM.encadrant || '—'} color={detM.encadrant === 'VALIDÉ' ? 'var(--sk)' : 'var(--am)'} />
            <ML label="Statut" value={detM.status} />
            {detM.commentaire && (
              <>
                <div style={{ margin: '15px 0 8px', fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t2)' }}>Commentaire</div>
                <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, fontStyle: 'italic' }}>"{detM.commentaire}"</p>
              </>
            )}
            <div style={{ marginTop: 12 }}>
              <Btn v="ghost" full onClick={() => setDetM(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Rapport;