import React, { useState, useEffect, useCallback } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import Txta from '../ui/Txta';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import ML from '../ui/ML';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { ThumbsUp, Eye, MessageSquare, RefreshCw, ExternalLink, FileText, File } from 'lucide-react';
import { 
  getConventionManagerContract, 
  getAccountManagerContract, 
  getConnectedWallet,
  getSuiviManagerContract
} from '../hooks/useContract';

const EncSuivi = () => {
  const toast = useToast();
  const { sign } = useMM();

  const [stags, setStags] = useState([]);
  const [loading, setLoading] = useState(false);

  const [commentM, setCommentM] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [rapM, setRapM] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const convC = await getConventionManagerContract();
      const accC = await getAccountManagerContract();
      const suiviC = await getSuiviManagerContract();
      const me = await getConnectedWallet();

      const convIds = await convC.getConventionsByEncadrant(me);
      const newStags = [];

      const statusLabel = (s) => s === 0 ? 'EN ATTENTE' : s === 1 ? 'VALIDÉ' : 'COMMENTÉ';

      for (const idBn of convIds) {
        const id = Number(idBn);
        const conv = await convC.getConvention(id);
        
        let etuName = 'Unknown';
        try {
          const etuU = await accC.getUser(conv.etudiant);
          etuName = `${etuU.nom} ${etuU.prenom}`;
        } catch(e) {}

        // Charger les rapports hebdomadaires depuis SuiviManager
        const rapIds = await suiviC.getRapportsByEtudiant(conv.etudiant);
        const reportsList = [];
        
        for (const rIdBn of rapIds) {
          const rId = Number(rIdBn);
          const r = await suiviC.getRapport(rId);
          reportsList.push({
            id: rId,
            sem: `Rapport #${rId}`,
            date: new Date(Number(r.createdAt) * 1000).toLocaleDateString(),
            statut: statusLabel(Number(r.statut)),
            cid: r.cidRapport,
            commentaire: r.commentaire
          });
        }

        newStags.push({
          id: id,
          nom: etuName,
          wallet: conv.etudiant,
          sem: reportsList.filter(r => r.statut !== 'EN ATTENTE').length,
          total: 12, // arbitraire
          status: 'ACTIF',
          raps: reportsList.reverse()
        });
      }
      setStags(newStags.sort((a,b) => b.id - a.id));
    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur lors du chargement des rapports', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const valider = async (rid) => {
    setSubmitting(true);
    try {
      const contract = await getSuiviManagerContract();
      const tx = await contract.validerRapport(rid);
      toast('Validation en cours...', 'loading');
      await tx.wait();
      toast('Rapport validé !', 'success');
      await loadData();
    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur lors de la validation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const saveComment = async () => {
    if (!commentText.trim()) {
      toast('Rédigez un commentaire !', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const contract = await getSuiviManagerContract();
      const tx = await contract.commenterRapport(commentM.rid, commentText.trim());
      toast('Envoi du commentaire...', 'loading');
      await tx.wait();
      toast('Commentaire enregistré sur la blockchain !', 'success');
      setCommentM(null);
      setCommentText('');
      await loadData();
    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur lors du commentaire', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fi">
      <PH title="Suivi des Étudiants">
        <Btn sm v="ghost" I={RefreshCw} onClick={loadData} disabled={loading}>
          Rafraîchir
        </Btn>
      </PH>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--t3)' }}>Chargement des données blockchain...</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {stags.length === 0 && (
            <Glass>
              <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', padding: '10px 0' }}>Aucun étudiant ne vous a encore été affecté.</div>
            </Glass>
          )}
          {stags.map(s => (
            <Glass key={s.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--skd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--sk)' }}>
                    {s.nom[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--t2)', cursor: 'help' }} title={s.wallet}>ID Convention: #{s.id}</div>
                  </div>
                </div>
                <Tag label={s.status} c={s.status === 'ACTIF' ? 'ac' : 'am'} />
              </div>

              <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 99, marginBottom: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (s.sem / s.total) * 100)}%`, background: 'linear-gradient(90deg,var(--ac),var(--sk))', borderRadius: 99 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 11 }}>
                <span style={{ fontSize: 10, color: 'var(--t3)' }}>Rapports validés</span>
                <span style={{ fontSize: 10, color: 'var(--ac)', fontFamily: 'var(--fm)' }}>{s.sem} / {s.total}</span>
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 7, color: 'var(--t2)' }}>
                {s.raps.length === 0 ? "Aucun rapport soumis pour le moment." : "Historique des rapports :"}
              </div>

              {s.raps.map(r => (
                <div key={r.id} style={{ padding: '10px 12px', background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t1)' }}>{r.sem}</span>
                      <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 7 }}>· {r.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Tag label={r.statut} c={r.statut === 'VALIDÉ' ? 'ac' : r.statut === 'COMMENTÉ' ? 'sk' : 'am'} />
                      <Btn sm v="ghost" I={Eye} onClick={() => setRapM({ stag: s, rap: r })}>Consulter</Btn>
                      {r.statut === 'EN ATTENTE' && (
                        <>
                          <Btn sm v="ghost" I={MessageSquare} onClick={() => { setCommentM({ rid: r.id }); setCommentText(r.commentaire || ''); }}>Commenter</Btn>
                          <Btn sm I={ThumbsUp} loading={submitting} onClick={() => valider(r.id)}>Valider</Btn>
                        </>
                      )}
                    </div>
                  </div>
                  {r.commentaire && <div style={{ fontSize: 10, color: 'var(--sk)', fontStyle: 'italic', marginTop: 3 }}>💬 Feedback : {r.commentaire}</div>}
                </div>
              ))}
            </Glass>
          ))}
        </div>
      )}

      {/* Modal Commentaire */}
      <Modal open={!!commentM} onClose={() => setCommentM(null)} title="Feedback pédagogique">
        <Txta label="Votre commentaire (on-chain)" placeholder="Observations sur ce rapport..." rows={4} value={commentText} onChange={e => setCommentText(e.target.value)} />
        <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
          <Btn I={MessageSquare} full loading={submitting} onClick={saveComment}>Enregistrer le feedback</Btn>
          <Btn v="ghost" onClick={() => setCommentM(null)}>Annuler</Btn>
        </div>
      </Modal>

      {/* Modal Lecture Rapport */}
      <Modal open={!!rapM} onClose={() => setRapM(null)} title={`${rapM?.rap?.sem} — ${rapM?.stag?.nom}`} wide>
        {rapM && (
          <>
            <ML label="Date de soumission" value={rapM.rap.date} />
            <ML label="Statut blockchain" value={rapM.rap.statut} />
            <div style={{ margin: '15px 0 8px', fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t2)', textTransform: 'uppercase' }}>Accès au contenu</div>
            <div style={{ padding: 15, background: 'var(--bg3)', borderRadius: 'var(--r2)', border: '1px solid var(--br)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>Identifiant IPFS : <code style={{ color: 'var(--ac)' }}>{rapM.rap.cid}</code></div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Btn v="secondary" I={ExternalLink} onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${rapM.rap.cid}`, '_blank')}>
                  Consulter sur IPFS
                </Btn>
              </div>
            </div>

            {rapM.rap.commentaire && (
              <>
                <div style={{ margin: '15px 0 8px', fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--sk)' }}>Votre commentaire précédent</div>
                <p style={{ fontSize: 12, color: 'var(--sk)', fontStyle: 'italic', padding: 10, background: 'rgba(0,255,170,0.05)', borderRadius: 8 }}>{rapM.rap.commentaire}</p>
              </>
            )}
            <div style={{ marginTop: 20 }}>
              <Btn v="ghost" full onClick={() => setRapM(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EncSuivi;