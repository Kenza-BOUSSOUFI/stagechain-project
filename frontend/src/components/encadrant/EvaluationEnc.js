// src/components/pages/encadrant/EvaluationEnc.js
import React, { useState, useEffect, useCallback } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Txta from '../ui/Txta';
import ML from '../ui/ML';
import Modal from '../ui/Modal';
import Alrt from '../ui/Alrt';
import Sel from '../ui/Sel';
import { useToast } from '../common/ToastProvider';
import { CheckCircle, Eye, RefreshCw, ExternalLink } from 'lucide-react';
import { 
  getConventionManagerContract, 
  getAccountManagerContract, 
  getConnectedWallet,
  getRapportManagerContract
} from '../hooks/useContract';

const EvaluationEnc = () => {
  const toast = useToast();

  const [stags, setStags] = useState([]);
  const [selectedStag, setSelectedStag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [note, setNote] = useState(15);
  const [remarques, setRemarques] = useState(''); // Note: Le contrat actuel ne stocke pas de remarques pour le rapport final, mais on peut les garder en UI ou prévoir une maj contrat
  const [validated, setValidated] = useState(false);
  const [rapM, setRapM] = useState(false);

  const loadStagiaires = useCallback(async () => {
    setLoading(true);
    try {
      const convC = await getConventionManagerContract();
      const accC = await getAccountManagerContract();
      const rapportC = await getRapportManagerContract();
      const me = await getConnectedWallet();

      const convIds = await convC.getConventionsByEncadrant(me);
      const list = [];

      for (const idBn of convIds) {
        const conv = await convC.getConvention(idBn);
        
        // Vérifier s'il y a un rapport final
        try {
          const rf = await rapportC.getRapportByEtudiant(conv.etudiant);
          if (rf && rf.id != 0) {
            const etuU = await accC.getUser(conv.etudiant);
            list.push({
              id: Number(rf.id),
              nom: `${etuU.nom} ${etuU.prenom}`,
              wallet: conv.etudiant,
              cid: rf.cidRapportFinal,
              noteRH: Number(rf.noteRH),
              noteRHDeposee: rf.noteRHDeposee,
              noteEncadrant: Number(rf.noteEncadrant),
              noteEncadrantDeposee: rf.noteEncadrantDeposee,
              noteCalculee: rf.noteCalculee,
              noteFinale: Number(rf.noteFinale) / 100
            });
          }
        } catch(e) {}
      }
      setStags(list);
      if (list.length > 0 && !selectedStag) {
        setSelectedStag(list[0]);
        if (list[0].noteEncadrantDeposee) {
            setNote(list[0].noteEncadrant);
            setValidated(true);
        }
      }
    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur chargement stagiaires', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedStag, toast]);

  useEffect(() => {
    loadStagiaires();
  }, [loadStagiaires]);

  const handleSelect = (e) => {
    const s = stags.find(x => x.wallet === e.target.value);
    setSelectedStag(s);
    if (s) {
        setNote(s.noteEncadrantDeposee ? s.noteEncadrant : 15);
        setValidated(s.noteEncadrantDeposee);
    }
  };

  const valider = async () => {
    if (!selectedStag) return;
    setSubmitting(true);
    try {
      const contract = await getRapportManagerContract();
      const tx = await contract.noterParEncadrant(selectedStag.id, Math.round(note));
      toast('Envoi de la note sur la blockchain...', 'loading');
      await tx.wait();
      
      setValidated(true);
      toast(`Note ${note}/20 enregistrée avec succès !`, 'success');
      await loadStagiaires();
    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur lors de la notation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const noteTut = selectedStag?.noteRHDeposee ? selectedStag.noteRH : 0;
  const noteFin = (noteTut * 0.6 + note * 0.4).toFixed(1);

  return (
    <div className="fi">
      <PH title="Évaluation des Rapports Finaux">
        <Btn sm v="ghost" I={RefreshCw} onClick={loadStagiaires} disabled={loading}>Rafraîchir</Btn>
      </PH>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--t3)', fontSize: 12 }}>Chargement des rapports finaux...</div>
      ) : stags.length === 0 ? (
        <Alrt type="info" message="Aucun étudiant n'a encore déposé son rapport final." />
      ) : (
        <>
          <div style={{ marginBottom: 20, maxWidth: 400 }}>
            <Sel 
              label="Sélectionner l'étudiant à évaluer" 
              value={selectedStag?.wallet || ''} 
              onChange={handleSelect}
              options={stags.map(s => ({ v: s.wallet, l: s.nom }))}
            />
          </div>

          {selectedStag && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 17 }}>
              <Glass glow={!validated}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--acd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--ac)' }}>
                    {selectedStag.nom[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedStag.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--t2)' }}>Rapport Final — ID: {selectedStag.id}</div>
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
                  disabled={validated || submitting}
                  style={{ width: '100%', accentColor: 'var(--ac)', cursor: (validated || submitting) ? 'not-allowed' : 'pointer', marginBottom: 4 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 13 }}>
                  {[0, 5, 10, 15, 20].map(v => <span key={v} style={{ fontSize: 9, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{v}</span>)}
                </div>

                <Txta 
                    label="Remarques (pour votre suivi)" 
                    placeholder="Points forts, axes d'amélioration..." 
                    rows={4} 
                    value={remarques} 
                    onChange={e => setRemarques(e.target.value)} 
                    disabled={validated}
                />

                <div style={{ marginTop: 11 }}>
                  <Btn I={CheckCircle} full onClick={valider} disabled={validated} loading={submitting}>
                    {validated ? '✓ Évaluation enregistrée on-chain' : 'Valider la note sur la blockchain'}
                  </Btn>
                </div>
              </Glass>

              <div>
                <Card style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Rapport à évaluer</div>
                  <ML label="Étudiant" value={selectedStag.nom} />
                  <ML label="Status Note RH" value={selectedStag.noteRHDeposee ? 'DÉPOSÉE' : 'EN ATTENTE'} color={selectedStag.noteRHDeposee ? 'var(--ac)' : 'var(--am)'} />
                  <div style={{ marginTop: 10 }}>
                    <Btn v="secondary" I={Eye} full onClick={() => setRapM(true)}>Consulter le rapport</Btn>
                  </div>
                </Card>

                <Card>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Estimation note finale</div>
                  <ML label="Tuteur RH (60%)" value={selectedStag.noteRHDeposee ? `${selectedStag.noteRH}/20` : '—'} color="var(--am)" />
                  <ML label="Encadrant (40%)" value={`${note}/20`} color="var(--sk)" />
                  <div style={{ margin: '15px 0 8px', fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t2)', textTransform: 'uppercase' }}>Total calculé</div>
                  <div style={{ textAlign: 'center', padding: '6px 0' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--ac)', fontFamily: 'var(--fm)' }}>{noteFin}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--fm)' }}>/20</div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Rapport Final */}
      <Modal open={rapM} onClose={() => setRapM(false)} title={`Rapport Final — ${selectedStag?.nom}`} wide>
        {selectedStag && (
            <>
                <div style={{ padding: 15, background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', textAlign: 'center', marginBottom: 15 }}>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>Identifiant IPFS : <code style={{ color: 'var(--ac)' }}>{selectedStag.cid}</code></div>
                  <Btn v="secondary" I={ExternalLink} onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${selectedStag.cid}`, '_blank')}>
                    Ouvrir le Rapport PDF sur IPFS
                  </Btn>
                </div>
                <Btn v="ghost" full onClick={() => setRapM(false)}>Fermer</Btn>
            </>
        )}
      </Modal>
    </div>
  );
};

export default EvaluationEnc;