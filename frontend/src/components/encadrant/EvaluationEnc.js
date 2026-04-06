// src/components/pages/encadrant/EvaluationEnc.js
import React, { useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Txta from '../ui/Txta';
import ML from '../ui/ML';
import Modal from '../ui/Modal';
import Alrt from '../ui/Alrt';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { CheckCircle, Eye } from 'lucide-react';

const EvaluationEnc = () => {
  const toast = useToast();
  const { sign } = useMM();

  const [note, setNote] = useState(15);
  const [remarques, setRemarques] = useState('');
  const [validated, setValidated] = useState(false);
  const [rapM, setRapM] = useState(false);

  const noteTut = 18;
  const noteFin = (noteTut * 0.6 + note * 0.4).toFixed(1);

  const valider = () => {
    if (!remarques.trim()) {
      toast('Ajoutez des remarques !', 'error');
      return;
    }
    sign('Évaluation rapport final', () => {
      setValidated(true);
      toast(`Note ${note}/20 enregistrée`, 'success');
    });
  };

  return (
    <div className="fi">
      <PH title="Évaluer le Rapport Final" />

      {validated && (
        <Alrt type="success" message={`✓ Note ${note}/20 enregistrée. Note finale estimée : ${noteFin}/20`} />
      )}

      <Alrt type="info" message="Votre note compte pour 40% de la note finale. (Tuteur 60% + Encadrant 40%)" />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 17 }}>
        <Glass glow={!validated}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--acd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--ac)' }}>A</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Amine Filali</div>
              <div style={{ fontSize: 11, color: 'var(--t2)' }}>Rapport final — Dev Blockchain</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 17 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: note >= 16 ? 'var(--ac)' : note >= 10 ? 'var(--am)' : 'var(--cr)', fontFamily: 'var(--fm)', lineHeight: 1 }}>
              {note}
            </div>
            <div style={{ fontSize: 13, color: 'var(--t3)', fontFamily: 'var(--fm)' }}>/20</div>
          </div>

          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={note}
            onChange={e => setNote(parseFloat(e.target.value))}
            disabled={validated}
            style={{ width: '100%', accentColor: 'var(--ac)', cursor: validated ? 'not-allowed' : 'pointer', marginBottom: 4 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 13 }}>
            {[0, 5, 10, 15, 20].map(v => <span key={v} style={{ fontSize: 9, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{v}</span>)}
          </div>

          <Txta label="Remarques pédagogiques" placeholder="Points forts, axes d'amélioration..." rows={4} value={remarques} onChange={e => setRemarques(e.target.value)} />

          <div style={{ marginTop: 11 }}>
            <Btn I={CheckCircle} full onClick={valider} disabled={validated}>
              {validated ? '✓ Évaluation soumise' : 'Valider mon évaluation'}
            </Btn>
          </div>
        </Glass>

        <div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Rapport à évaluer</div>
            <ML label="Étudiant" value="Amine Filali" />
            <ML label="Date soumission" value="10 Mar 2026" />
            <div style={{ marginTop: 10 }}>
              <Btn v="secondary" I={Eye} full onClick={() => setRapM(true)}>Consulter le rapport</Btn>
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Calcul note finale</div>
            <ML label="Tuteur (60%)" value={`${noteTut}/20`} color="var(--am)" />
            <ML label="Encadrant (40%)" value={`${note}/20`} color="var(--sk)" />
            <div style={{ margin: '15px 0 8px', fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t2)', textTransform: 'uppercase' }}>Note finale</div>
            <div style={{ textAlign: 'center', padding: '6px 0' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--ac)', fontFamily: 'var(--fm)' }}>{noteFin}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--fm)' }}>/20</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Rapport Final */}
      <Modal open={rapM} onClose={() => setRapM(false)} title="Rapport Final — Amine Filali" wide>
        <div style={{ padding: 14, background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 12 }}>
          <strong style={{ color: 'var(--t1)' }}>Rapport de stage — Développeur Blockchain Junior</strong><br /><br />
          Durant ce stage de 3 mois chez TechCorp SA, j'ai développé des smart contracts Solidity et intégré MetaMask. Principales réalisations : 7 smart contracts déployés, interface React.js, intégration IPFS.
        </div>
        <Btn v="ghost" full onClick={() => setRapM(false)}>Fermer</Btn>
      </Modal>
    </div>
  );
};

export default EvaluationEnc;