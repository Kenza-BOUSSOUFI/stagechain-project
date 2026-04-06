// src/components/pages/rh/RhCertif.js
import React, { useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import Modal from '../ui/Modal';
import ML from '../ui/ML';
import Tag from '../ui/Tag';
import Alrt from '../ui/Alrt';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { CheckCircle, Eye } from 'lucide-react';

const RhCertif = () => {
  const { sign } = useMM();
  const toast = useToast();

  const [att, setAtt] = useState([
    { id: 1, etudiant: 'Amine Filali', note: '17.2/20', entreprise: 'TechCorp SA', signed: false },
    { id: 2, etudiant: 'Sara Karimi', note: '16.8/20', entreprise: 'DataLabs', signed: false },
  ]);

  const [detM, setDetM] = useState(null);

  const doSign = (id) => {
    sign("Signature de l'attestation", () => {
      setAtt(a => a.map(x => x.id === id ? { ...x, signed: true } : x));
    });
  };

  return (
    <div className="fi">
      <PH title="Attestations de Stage" />
      <Alrt type="info" message="Signez les attestations des stagiaires. 3 signatures requises : RH + Encadrant + Admin." />

      <div style={{ display: 'grid', gap: 12 }}>
        {att.map(a => (
          <Glass key={a.id} glow={a.signed}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{a.etudiant}</span>
                  {a.signed ? <Tag label="SIGNÉ ✓" c="ac" /> : <Tag label="EN ATTENTE" c="am" />}
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>{a.entreprise} · Note finale : {a.note}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn sm v="ghost" I={Eye} onClick={() => setDetM(a)}>Détails</Btn>
                {!a.signed && <Btn I={CheckCircle} sm onClick={() => doSign(a.id)}>Signer l'attestation</Btn>}
                {a.signed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', background: 'var(--acd)', border: '1px solid var(--brh)', borderRadius: 'var(--r2)' }}>
                    <CheckCircle size={12} style={{ color: 'var(--ac)' }} />
                    <span style={{ fontSize: 11, color: 'var(--ac)', fontFamily: 'var(--fm)' }}>Signé</span>
                  </div>
                )}
              </div>
            </div>
          </Glass>
        ))}
      </div>

      <Modal open={!!detM} onClose={() => setDetM(null)} title={`Attestation — ${detM?.etudiant}`}>
        {detM && (
          <>
            <ML label="Entreprise" value={detM.entreprise} />
            <ML label="Note finale" value={detM.note} color="var(--ac)" />
            <ML label="Statut" value={detM.signed ? 'SIGNÉ ✓' : 'EN ATTENTE'} color={detM.signed ? 'var(--ac)' : 'var(--am)'} />
            <div style={{ marginTop: 12 }}>
              <Btn v="ghost" full onClick={() => setDetM(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default RhCertif;