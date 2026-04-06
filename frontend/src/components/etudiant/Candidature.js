// src/components/pages/etudiant/Candidature.js
import React, { useState, useRef } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import Alrt from '../ui/Alrt';
import ML from '../ui/ML';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { Eye, Upload, ArrowRight, XCircle } from 'lucide-react';
import { Send } from 'lucide-react';


const Candidature = () => {
  const toast = useToast();
  const { sign } = useMM();

  const cvRef = useRef();
  const lmRef = useRef();

  const [cands, setCands] = useState([
    { id: 1, offre: 'Développeur Blockchain Junior', entreprise: 'TechCorp SA', date: '10 Nov 2025', status: 'ACCEPTE', cv: 'CV_Amine.pdf', lm: 'LM_Amine.pdf' },
    { id: 2, offre: 'CyberSécurité Analyste', entreprise: 'DataLabs', date: '08 Nov 2025', status: 'EN_ATTENTE', cv: 'CV_Amine.pdf', lm: 'LM_Amine.pdf' },
    { id: 3, offre: 'Data Scientist Junior', entreprise: 'AIGroup', date: '06 Nov 2025', status: 'REFUSE', cv: 'CV_Amine.pdf', lm: 'LM_Amine.pdf' },
  ]);

  const [detM, setDetM] = useState(null);
  const [showUp, setShowUp] = useState(false);
  const [upFiles, setUpFiles] = useState({ cv: null, lm: null });
  const [upForId, setUpForId] = useState(null);

  const annuler = (id) => {
    sign('Annulation', () => setCands(c => c.filter(x => x.id !== id)));
  };

  const handleFile = (type, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast('PDF uniquement !', 'error');
      return;
    }
    setUpFiles(f => ({ ...f, [type]: file.name }));
    toast(`${type.toUpperCase()} chargé : ${file.name}`, 'success');
  };

  const submitDocs = () => {
    if (!upFiles.cv || !upFiles.lm) {
      toast('CV et LM requis !', 'error');
      return;
    }
    sign('Envoi des documents', () => {
      setCands(c => c.map(x => x.id === upForId ? { ...x, cv: upFiles.cv, lm: upFiles.lm } : x));
      setShowUp(false);
      setUpFiles({ cv: null, lm: null });
      setUpForId(null);
    });
  };

  const C2 = { ACCEPTE: 'ac', EN_ATTENTE: 'am', REFUSE: 'cr' };

  return (
    <div className="fi">
      <PH title="Mes Candidatures" />
      <Alrt type="info" message="Pour chaque candidature, joignez votre CV et votre Lettre de Motivation en PDF. Le RH pourra les consulter." />

      <div style={{ display: 'grid', gap: 10 }}>
        {cands.map(c => (
          <Glass key={c.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{c.offre}</span>
                  <Tag label={c.status} c={C2[c.status]} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 4 }}>{c.entreprise} · {c.date}</div>
                <div style={{ display: 'flex', gap: 7 }}>
                  {c.cv && <Tag label={`CV: ${c.cv}`} c="sk" />}
                  {c.lm && <Tag label={`LM: ${c.lm}`} c="vi" />}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <Btn sm v="ghost" I={Eye} onClick={() => setDetM(c)}>Détails</Btn>
                <Btn sm v="secondary" I={Upload} onClick={() => { setUpForId(c.id); setShowUp(true); }}>Documents</Btn>
                {c.status === 'ACCEPTE' && <Btn sm I={ArrowRight} onClick={() => toast('Convention disponible !', 'success')}>Convention</Btn>}
                {c.status === 'EN_ATTENTE' && <Btn sm v="danger" I={XCircle} onClick={() => annuler(c.id)}>Annuler</Btn>}
              </div>
            </div>
          </Glass>
        ))}
      </div>

      {/* Modal Upload CV + LM */}
      <Modal open={showUp} onClose={() => setShowUp(false)} title="Déposer CV et Lettre de Motivation">
        <Alrt type="info" message="Déposez votre CV et votre Lettre de Motivation au format PDF." />
        {[{ key: 'cv', label: 'CV (Curriculum Vitae)', ref: cvRef }, { key: 'lm', label: 'Lettre de Motivation', ref: lmRef }].map(({ key, label, ref }) => (
          <div key={key} style={{ marginBottom: 13 }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{label}</div>
            <div 
              onClick={() => ref.current.click()} 
              style={{ 
                border: `2px dashed ${upFiles[key] ? 'var(--ac)' : 'var(--brm)'}`, 
                borderRadius: 'var(--r2)', 
                padding: '16px 14px', 
                textAlign: 'center', 
                cursor: 'pointer', 
                background: upFiles[key] ? 'var(--acd)' : 'var(--bg3)', 
                transition: 'all 0.2s' 
              }}
            >
              <Upload size={19} style={{ color: upFiles[key] ? 'var(--ac)' : 'var(--t3)', marginBottom: 7 }} />
              <div style={{ fontSize: 12, color: upFiles[key] ? 'var(--ac)' : 'var(--t2)' }}>{upFiles[key] || 'Cliquer ou glisser le PDF'}</div>
              <input ref={ref} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(key, e.target.files[0])} />
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 9, marginTop: 13 }}>
          <Btn I={Send} full onClick={submitDocs}>Envoyer les documents</Btn>
          <Btn v="ghost" onClick={() => setShowUp(false)}>Annuler</Btn>
        </div>
      </Modal>

      <Modal open={!!detM} onClose={() => setDetM(null)} title={detM?.offre}>
        {detM && (
          <>
            <ML label="Entreprise" value={detM.entreprise} />
            <ML label="Date" value={detM.date} />
            <ML label="Statut" value={detM.status} />
            <ML label="CV" value={detM.cv || 'Non déposé'} />
            <ML label="Lettre de Motivation" value={detM.lm || 'Non déposée'} />
            <div style={{ marginTop: 12 }}>
              <Btn v="ghost" full onClick={() => setDetM(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Candidature;