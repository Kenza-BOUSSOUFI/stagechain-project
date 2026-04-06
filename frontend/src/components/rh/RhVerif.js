// src/components/pages/rh/RhVerif.js
import React, { useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Inp from '../ui/Inp';
import Alrt from '../ui/Alrt';
import ML from '../ui/ML';
import { Search, Download } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { Shield, RefreshCw } from 'lucide-react';

const RhVerif = () => {
  const toast = useToast();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [invalid, setInvalid] = useState(false);

  const verify = () => {
    if (!input.trim()) {
      toast('Entrez un identifiant !', 'error');
      return;
    }

    setLoading(true);
    setResult(null);
    setInvalid(false);
    toast('Vérification en cours...', 'loading');

    setTimeout(() => {
      setLoading(false);
      if (input.toLowerCase().includes('fake') || input.toLowerCase().includes('faux')) {
        setInvalid(true);
        toast('⚠ Attestation NON authentique !', 'error');
      } else {
        setResult({
          nom: 'Amine Filali',
          note: '17.2/20',
          date: '20 Mar 2026',
          entreprise: 'TechCorp SA',
          duree: '3 mois'
        });
        toast('Attestation authentique !', 'success');
      }
    }, 1800);
  };

  return (
    <div className="fi">
      <PH title="Vérification des Attestations" />
      <Alrt type="info" message="Vérifiez l'authenticité d'une attestation. Entrez le nom, wallet ou CID. Testez avec 'fake' pour simuler un faux." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Glass glow>
          <Inp 
            label="Identifiant (nom, wallet...)" 
            placeholder="Nom étudiant, adresse wallet..." 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            I={Search} 
          />
          <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
            <Btn loading={loading} I={Shield} full onClick={verify}>
              {loading ? 'Vérification...' : 'Vérifier'}
            </Btn>
            {(result || invalid) && (
              <Btn v="ghost" I={RefreshCw} onClick={() => { setInput(''); setResult(null); setInvalid(false); }}>Reset</Btn>
            )}
          </div>

          {invalid && <div className="fi" style={{ marginTop: 13 }}><Alrt type="error" message="⚠ ATTESTATION NON AUTHENTIQUE !" /></div>}
          {result && <div className="fi" style={{ marginTop: 13 }}><Alrt type="success" message="✓ ATTESTATION AUTHENTIQUE ET CERTIFIÉE." /></div>}
        </Glass>

        <div>
          {result ? (
            <Card className="fi">
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 11, color: 'var(--ac)' }}>Résultat</div>
              <ML label="Titulaire" value={result.nom} />
              <ML label="Entreprise" value={result.entreprise} />
              <ML label="Durée" value={result.duree} />
              <ML label="Note finale" value={result.note} color="var(--ac)" />
              <ML label="Date" value={result.date} />
              <div style={{ marginTop: 12 }}>
                <Btn sm I={Download} onClick={() => toast('Rapport téléchargé', 'success')}>Télécharger rapport</Btn>
              </div>
            </Card>
          ) : (
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
              <Shield size={28} style={{ color: 'var(--t3)', marginBottom: 10 }} />
              <div style={{ fontSize: 12, fontFamily: 'var(--fm)', color: 'var(--t3)', textAlign: 'center' }}>Entrez un identifiant</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RhVerif;