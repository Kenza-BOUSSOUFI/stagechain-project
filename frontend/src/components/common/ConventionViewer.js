import React, { useState, useEffect } from 'react';
import Btn from '../ui/Btn';
import { Download, Printer } from 'lucide-react';
import { useToast } from './ToastProvider';

const ConventionViewer = ({ cid }) => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cid) return;
    const fetchConvention = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
        if (!res.ok) throw new Error('Erreur réseau IPFS');
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast('Impossible de charger la convention IPFS.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchConvention();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--fm)', color: 'var(--t3)' }}>Chargement du document IPFS...</div>;
  }

  if (!data) {
    return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--fm)', color: 'var(--t3)' }}>Document introuvable ou erreur de lecture.</div>;
  }

  // To support older formats, provide fallback values
  const etu = data.etudiant || {};
  const ent = data.entreprise || {};
  const uni = data.universite || {};
  const cond = data.conditions || {};
  const dates = data.datesStage || {};

  return (
    <div style={{ position: 'relative' }}>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-container, .print-container * { visibility: visible; }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
              box-shadow: none !important;
            }
            .hide-on-print { display: none !important; }
          }
        `}
      </style>
      
      <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 10 }}>
        <Btn v="secondary" I={Download} onClick={() => window.open(`https://ipfs.io/ipfs/${cid}`, '_blank')}>
          Voir JSON Brut
        </Btn>
        <Btn I={Printer} onClick={handlePrint}>
          Imprimer (PDF)
        </Btn>
      </div>

      <div 
        className="print-container"
        style={{ 
          background: '#fff', 
          color: '#000', 
          padding: '40px 50px', 
          borderRadius: 8, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          fontFamily: 'serif',
          lineHeight: '1.6',
          maxWidth: 800,
          margin: '0 auto'
        }}
      >
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 30 }}>
          <h1 style={{ fontSize: 24, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: 2 }}>Convention de Stage</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
            Document immutable généré le {data.generatedAt ? new Date(data.generatedAt).toLocaleDateString('fr-FR') : 'Date Inconnue'}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: '#777', wordBreak: 'break-all' }}>CID: {cid}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 30 }}>
          {/* ETABLISSEMENT */}
          <div style={{ padding: 15, border: '1px solid #ddd', borderRadius: 6 }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: 16, borderBottom: '1px solid #eee', paddingBottom: 5 }}>L'Établissement</h3>
            <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Nom :</strong> {uni.nomEtablissement || 'Non spécifié'}</p>
            <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Ville :</strong> {uni.ville || 'Non spécifié'}</p>
            <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Contact :</strong> {uni.email || '-'}</p>
            {uni.walletAdmin && <p style={{ margin: '4px 0', fontSize: 10, wordBreak: 'break-all', color: '#666' }}>Wallet: {uni.walletAdmin}</p>}
          </div>

          {/* ENTREPRISE */}
          <div style={{ padding: 15, border: '1px solid #ddd', borderRadius: 6 }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: 16, borderBottom: '1px solid #eee', paddingBottom: 5 }}>L'Entreprise</h3>
            <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Nom :</strong> {ent.nomEntreprise || 'Non spécifié'}</p>
            <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Représentant :</strong> {ent.representantRH || '-'}</p>
            <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Ville :</strong> {ent.ville || '-'}</p>
            <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Contact :</strong> {ent.emailContact || '-'}</p>
            {ent.walletRH && <p style={{ margin: '4px 0', fontSize: 10, wordBreak: 'break-all', color: '#666' }}>Wallet: {ent.walletRH}</p>}
          </div>
        </div>

        {/* ETUDIANT */}
        <div style={{ padding: 15, border: '1px solid #ddd', borderRadius: 6, marginBottom: 30 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 16, borderBottom: '1px solid #eee', paddingBottom: 5 }}>Le (la) Stagiaire</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Nom Complet :</strong> {etu.nomComplet || data.name || '-'}</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Filière :</strong> {etu.filiere || '-'}</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Ville :</strong> {etu.ville || '-'}</p>
            </div>
            <div>
              <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Email :</strong> {etu.email || '-'}</p>
              <p style={{ margin: '4px 0', fontSize: 14 }}><strong>Téléphone :</strong> {etu.telephone || '-'}</p>
              <p style={{ margin: '4px 0', fontSize: 10, wordBreak: 'break-all', color: '#666' }}>Wallet: {etu.wallet || data.etudiantWallet || '-'}</p>
            </div>
          </div>
        </div>

        {/* CONDITIONS */}
        <div style={{ padding: 15, border: '1px solid #eee', backgroundColor: '#fdfdfd', borderRadius: 6, marginBottom: 40 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Sujet et Conditions</h3>
          <p style={{ margin: '6px 0', fontSize: 14 }}><strong>Sujet du Stage :</strong> {cond.sujet || data.offreTitre || '-'}</p>
          <p style={{ margin: '6px 0', fontSize: 14 }}><strong>Période :</strong> Du {dates.debut || '...'} au {dates.fin || '...'}</p>
          <p style={{ margin: '6px 0', fontSize: 14 }}><strong>Gratification :</strong> {cond.gratification || '-'}</p>
          <p style={{ margin: '6px 0', fontSize: 14 }}><strong>Statut Blockchain :</strong> {data.statut || 'Généré par Smart Contract'}</p>
        </div>

        {/* SIGNATURES */}
        <div>
          <h3 style={{ textAlign: 'center', marginBottom: 20, fontSize: 18 }}>Signatures des Parties</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div style={{ border: '1px dashed #aaa', padding: 20, minHeight: 120, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <strong style={{ fontSize: 14, marginBottom: 10 }}>L'Entreprise</strong>
              <div style={{ flex: 1 }}></div>
              <span style={{ fontSize: 11, color: '#888' }}>Cachet et Signature</span>
            </div>
            <div style={{ border: '1px dashed #aaa', padding: 20, minHeight: 120, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <strong style={{ fontSize: 14, marginBottom: 10 }}>L'Établissement</strong>
              <div style={{ flex: 1 }}></div>
              <span style={{ fontSize: 11, color: '#888' }}>Cachet et Signature</span>
            </div>
            <div style={{ border: '1px dashed #aaa', padding: 20, minHeight: 120, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <strong style={{ fontSize: 14, marginBottom: 10 }}>Le (la) Stagiaire</strong>
              <div style={{ flex: 1 }}></div>
              <span style={{ fontSize: 11, color: '#888' }}>Signature</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 10, color: '#999', marginTop: 15 }}>
            Ces signatures seront complétées électroniquement sur la blockchain. Une fois scellées, l'empreinte fait foi.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ConventionViewer;
