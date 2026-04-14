// src/components/pages/etudiant/Rapport.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { Upload, Eye, FileText, File as FileIcon, RefreshCw, ExternalLink } from 'lucide-react';
import Tag from '../ui/Tag';
import { 
  getSuiviManagerContract, 
  getRapportManagerContract, 
  getConnectedWallet,
  getAccountManagerContract 
} from '../hooks/useContract';
import { pinConventionJsonToIpfs, pinFileToIpfs } from '../hooks/conventionApi';

const Rapport = () => {
  const { sign } = useMM();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [rapports, setRapports] = useState([]);
  
  // States pour le dépôt hebdomadaire
  const [hebdoType, setHebdoType] = useState('text'); // 'text' | 'pdf'
  const [text, setText] = useState('');
  const [hebdoFile, setHebdoFile] = useState(null);
  const hebdoRef = useRef();

  // States pour le rapport final
  const [finalFile, setFinalFile] = useState(null);
  const finalRef = useRef();

  const [detM, setDetM] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [suiviC, rapportC, accC, me] = await Promise.all([
        getSuiviManagerContract(),
        getRapportManagerContract(),
        getAccountManagerContract(),
        getConnectedWallet()
      ]);

      // 1. Charger les rapports hebdomadaires
      const ids = await suiviC.getRapportsByEtudiant(me);
      const list = [];
      
      const statusLabel = (s) => s === 0 ? 'DÉPOSÉ' : s === 1 ? 'VALIDÉ' : 'COMMENTÉ';

      for (const idBn of ids) {
        const id = Number(idBn);
        const r = await suiviC.getRapport(id);
        
        // On essaye de lire le contenu depuis IPFS (simulé ou via gateway si possible)
        // Pour l'instant on garde le CID et on affichera le lien
        list.push({
          id,
          titre: `Rapport Hebdo #${id}`,
          type: 'hebdo',
          date: new Date(Number(r.createdAt) * 1000).toLocaleDateString(),
          status: statusLabel(Number(r.statut)),
          commentaire: r.commentaire,
          cid: r.cidRapport,
          raw: r
        });
      }

      // 2. Charger le rapport final s'il existe
      try {
        const rf = await rapportC.getRapportByEtudiant(me);
        if (rf && rf.id != 0) {
          list.push({
            id: Number(rf.id),
            titre: 'Rapport Final',
            type: 'final',
            date: new Date(Number(rf.createdAt) * 1000).toLocaleDateString(),
            status: rf.noteCalculee ? 'NOTÉ' : 'EN ATTENTE',
            cid: rf.cidRapportFinal,
            noteFinale: Number(rf.noteFinale) / 100,
            raw: rf
          });
        }
      } catch(e) {}

      setRapports(list.reverse());
    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur chargement rapports', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleHebdoFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast('PDF uniquement !', 'error');
      return;
    }
    setHebdoFile(f);
    toast(`Fichier "${f.name}" prêt`, 'success');
  };

  const submitHebdo = async () => {
    if (hebdoType === 'text' && !text.trim()) {
      toast('Rédigez votre rapport !', 'error');
      return;
    }
    if (hebdoType === 'pdf' && !hebdoFile) {
      toast('Sélectionnez un fichier PDF !', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let cid;
      if (hebdoType === 'text') {
        const res = await pinConventionJsonToIpfs({
          name: `hebdo-text-${Date.now()}`,
          content: { type: 'text', content: text, date: new Date().toISOString() }
        });
        cid = res.cid;
      } else {
        const fileRes = await pinFileToIpfs(hebdoFile);
        const res = await pinConventionJsonToIpfs({
          name: `hebdo-pdf-${Date.now()}`,
          content: { type: 'pdf', fileCid: fileRes.cid, filename: hebdoFile.name, date: new Date().toISOString() }
        });
        cid = res.cid;
      }

      if (!cid) throw new Error("Erreur lors de l'upload IPFS");

      const contract = await getSuiviManagerContract();
      const tx = await contract.deposerRapport(cid);
      toast('Transaction envoyée...', 'loading');
      await tx.wait();
      
      toast('Rapport hebdomadaire déposé !', 'success');
      setText('');
      setHebdoFile(null);
      await loadData();
    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur lors du dépôt', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast('PDF uniquement !', 'error');
      return;
    }
    setFinalFile(f);
    toast(`Rapport final "${f.name}" prêt`, 'success');
  };

  const submitFinal = async () => {
    if (!finalFile) {
      toast('Sélectionnez le fichier PDF !', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const fileRes = await pinFileToIpfs(finalFile);
      const res = await pinConventionJsonToIpfs({
        name: `final-rapport-${Date.now()}`,
        content: { type: 'final', fileCid: fileRes.cid, filename: finalFile.name, date: new Date().toISOString() }
      });
      const cid = res.cid;

      const contract = await getRapportManagerContract();
      const tx = await contract.deposerRapportFinal(cid);
      toast('Transaction envoyée...', 'loading');
      await tx.wait();

      toast('Rapport final déposé avec succès !', 'success');
      setFinalFile(null);
      await loadData();
    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur lors du dépôt final', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const canFinal = rapports.length > 0 && rapports.filter(r => r.type === 'hebdo').every(r => r.status === 'VALIDÉ');

  return (
    <div className="fi">
      <PH title="Mes Rapports de Stage">
        <Btn sm v="ghost" I={RefreshCw} onClick={loadData} disabled={loading}>Rafraîchir</Btn>
      </PH>
      <Alrt type="info" message="Soumettez vos rapports hebdomadaires (Texte ou PDF). Une fois tous vos rapports validés, déposez votre rapport final." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 17, marginBottom: 18 }}>
        {/* Section Hebdomadaire */}
        <Glass glow>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ac)' }}>Rapport hebdomadaire</div>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', padding: 3, borderRadius: 8 }}>
              <button 
                onClick={() => setHebdoType('text')}
                style={{ 
                  padding: '4px 8px', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: hebdoType === 'text' ? 'var(--ac)' : 'transparent',
                  color: hebdoType === 'text' ? '#000' : 'var(--t3)', cursor: 'pointer'
                }}>Texte</button>
              <button 
                onClick={() => setHebdoType('pdf')}
                style={{ 
                  padding: '4px 8px', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: hebdoType === 'pdf' ? 'var(--ac)' : 'transparent',
                  color: hebdoType === 'pdf' ? '#000' : 'var(--t3)', cursor: 'pointer'
                }}>PDF</button>
            </div>
          </div>

          {hebdoType === 'text' ? (
            <Txta label="Votre compte-rendu" placeholder="Décrivez votre semaine ici..." rows={5} value={text} onChange={e => setText(e.target.value)} />
          ) : (
            <div 
              onClick={() => hebdoRef.current.click()}
              style={{ 
                border: '2px dashed var(--br)', borderRadius: 'var(--r2)', padding: 30, textAlign: 'center', 
                cursor: 'pointer', background: 'var(--bg3)', marginBottom: 10 
              }}>
              <Upload size={20} style={{ color: 'var(--t3)', marginBottom: 7 }} />
              <div style={{ fontSize: 11, color: hebdoFile ? 'var(--ac)' : 'var(--t2)' }}>{hebdoFile ? hebdoFile.name : 'Cliquez pour charger le PDF'}</div>
              <input ref={hebdoRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleHebdoFile(e.target.files[0])} />
            </div>
          )}
          <div style={{ marginTop: 11 }}>
            <Btn I={Upload} full onClick={submitHebdo} loading={submitting}>DÉPOSER ON-CHAIN</Btn>
          </div>
        </Glass>

        {/* Section Rapport Final */}
        <Glass>
          <div style={{ fontSize: 12, fontWeight: 700, color: canFinal ? 'var(--ac)' : 'var(--t2)', marginBottom: 6 }}>Rapport Final (PDF)</div>
          {!canFinal && (
            <div style={{ fontSize: 10, color: 'var(--am)', background: 'rgba(255,170,0,0.1)', padding: '6px 10px', borderRadius: 6, marginBottom: 10 }}>
              ⚠ Tous vos rapports hebdomadaires doivent être validés.
            </div>
          )}
          <div 
            onClick={canFinal ? () => finalRef.current.click() : undefined}
            style={{ 
              border: `2px dashed ${canFinal ? 'var(--brm)' : 'var(--br)'}`, 
              borderRadius: 'var(--r2)', padding: 30, textAlign: 'center', 
              cursor: canFinal ? 'pointer' : 'not-allowed', 
              background: 'var(--bg3)', marginBottom: 11, opacity: canFinal ? 1 : 0.5 
            }}>
            <FileIcon size={20} style={{ color: 'var(--t3)', marginBottom: 7 }} />
            <div style={{ fontSize: 11, color: finalFile ? 'var(--ac)' : 'var(--t2)' }}>{finalFile ? finalFile.name : 'Rapport final PDF'}</div>
            <input ref={finalRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFinalFile(e.target.files[0])} />
          </div>
          <Btn I={Upload} full onClick={submitFinal} disabled={!canFinal} loading={submitting}>SOUMETTRE LE FINAL</Btn>
        </Glass>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Historique Blockchain</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--t3)', fontSize: 12 }}>Chargement de l'historique...</div>
        ) : rapports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--t3)', fontSize: 12 }}>Aucun rapport trouvé on-chain.</div>
        ) : (
          rapports.map(r => (
            <div key={`${r.type}-${r.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderBottom: '1px solid var(--br)' }}>
              {r.type === 'hebdo' ? <FileText size={16} color="var(--ac)" /> : <Tag label="FINAL" c="vi" />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{r.titre}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)' }}>Fait le {r.date} · CID: {r.cid?.slice(0, 10)}...</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {r.noteFinale && <Tag label={`${r.noteFinale}/20`} c="ac" />}
                <Tag label={r.status} c={r.status === 'VALIDÉ' || r.status === 'NOTÉ' ? 'ac' : r.status === 'COMMENTÉ' ? 'sk' : 'am'} />
                <button 
                  onClick={() => setDetM(r)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 6, padding: 6, cursor: 'pointer', color: 'var(--t2)' }}
                ><Eye size={14} /></button>
              </div>
            </div>
          ))
        )}
      </Card>

      <Modal open={!!detM} onClose={() => setDetM(null)} title={detM?.titre}>
        {detM && (
          <>
            <ML label="Date de dépôt" value={detM.date} />
            <ML label="Statut" value={detM.status} />
            <div style={{ marginTop: 15, marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Contenu du rapport</div>
            <div style={{ padding: 12, background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--br)', marginBottom: 15 }}>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>Identifiant IPFS : <code style={{ color: 'var(--ac)' }}>{detM.cid}</code></div>
              <Btn sm v="ghost" I={ExternalLink} onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${detM.cid}`, '_blank')}>Voir sur IPFS</Btn>
            </div>
            {detM.commentaire && (
              <Card style={{ background: 'rgba(0,255,170,0.05)', border: '1px solid var(--ac)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ac)', marginBottom: 5 }}>Commentaire de l'encadrant</div>
                <div style={{ fontSize: 12, color: 'var(--t1)', fontStyle: 'italic' }}>"{detM.commentaire}"</div>
              </Card>
            )}
            <div style={{ marginTop: 20 }}>
              <Btn v="ghost" full onClick={() => setDetM(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Rapport;