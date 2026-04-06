// src/components/pages/rh/RhCandidats.js
import React, { useEffect, useMemo, useState } from 'react';
import PH from '../ui/PH';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Modal from '../ui/Modal';
import Txta from '../ui/Txta';
import Tag from '../ui/Tag';
import ML from '../ui/ML';
import { Save, Download, RefreshCw } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { User, MessageSquare, XCircle, CheckCircle } from 'lucide-react';
import { getConnectedWallet, getContractReadOnly, getConventionManagerContract, getOffreManagerContract } from '../hooks/useContract';
import { pinConventionJsonToIpfs } from '../hooks/conventionApi';
import ConventionViewer from '../common/ConventionViewer';

const RhCandidats = () => {
  const toast = useToast();
  const [filter, setFilter] = useState('ALL');
  const [cands, setCands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);
  const [noteM, setNoteM] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [profM, setProfM] = useState(null);
  const [viewConvM, setViewConvM] = useState(null);

  const statusLabel = (s) => (s === 0 ? 'EN_ATTENTE' : s === 1 ? 'ACCEPTE' : 'REFUSE');
  const SC2 = { EN_ATTENTE: 'am', ACCEPTE: 'ac', REFUSE: 'cr' };

  const loadCandidatures = async () => {
    setLoading(true);
    try {
      const [offreC, accountC, convC, me] = await Promise.all([
        getOffreManagerContract(),
        getContractReadOnly(),
        getConventionManagerContract(),
        getConnectedWallet(),
      ]);

      const ids = await offreC.getAllOffres();
      const myOffres = [];
      for (const idBn of ids) {
        const o = await offreC.getOffre(idBn);
        if (o.rh.toLowerCase() === me.toLowerCase()) myOffres.push({ id: Number(o.id), titre: o.titre, competences: o.competences });
      }

      const rows = [];
      for (const o of myOffres) {
        const candIds = await offreC.getCandidaturesByOffre(o.id);
        for (const cIdBn of candIds) {
          const candidatureIdNum = Number(cIdBn);
          if (!Number.isFinite(candidatureIdNum) || candidatureIdNum < 1) continue;
          const c = await offreC.getCandidature(cIdBn);
          const u = await accountC.getUser(c.etudiant);
          const convId = Number(await convC.conventionParCandidature(candidatureIdNum));
          const conv = convId > 0 ? await convC.getConvention(convId) : null;
          rows.push({
            id: candidatureIdNum,
            candidatureId: candidatureIdNum,
            offreId: Number(c.offreId),
            offreTitre: o.titre,
            name: `${u.prenom || ''} ${u.nom || ''}`.trim() || c.etudiant,
            etudiantWallet: c.etudiant,
            filiere: u.filiere || '-',
            competences: o.competences || '-',
            status: statusLabel(Number(c.statut)),
            note: '',
            cv: c.cidCV || '-',
            lm: c.cidLM || '-',
            email: u.email || '-',
            tel: u.telephone || '-',
            ville: u.ville || '-',
            conventionId: convId || null,
            convention: conv,
          });
        }
      }
      setCands(rows.sort((a, b) => b.id - a.id));
    } catch (err) {
      toast(err?.reason || err?.message || 'Impossible de charger les candidatures', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle = async (id, action) => {
    const target = cands.find((c) => c.id === id);
    if (!target) return;
    const candId = Number(target.candidatureId);
    if (!Number.isFinite(candId) || candId < 1) {
      toast('ID candidature invalide (0). Rafraîchissez la liste.', 'error');
      return;
    }
    try {
      setActingId(id);
      const [offreC, convC, accountC] = await Promise.all([
        getOffreManagerContract(), 
        getConventionManagerContract(),
        getContractReadOnly()
      ]);
      const rhWallet = await getConnectedWallet();

      if (action === 'ACCEPTE') {
        const tx = await offreC.selectionnerEtudiant(candId);
        toast('Acceptation envoyée...', 'loading');
        await tx.wait();

        // Fetch full details for the convention
        const etuUser = await accountC.getUser(target.etudiantWallet);
        const rhUser = await accountC.getUser(rhWallet);
        
        let uniDetails = { nomEtablissement: 'Université Non Assignée' };
        if (etuUser.universite && etuUser.universite !== '0x0000000000000000000000000000000000000000') {
           try {
              const uniUser = await accountC.getUser(etuUser.universite);
              uniDetails = {
                 nomEtablissement: uniUser.nom || 'Université',
                 ville: uniUser.ville || '',
                 email: uniUser.email || '',
                 telephone: uniUser.telephone || '',
                 walletAdmin: etuUser.universite
              };
           } catch (e) { console.error('Erreur recup universite', e); }
        }

        const ipfsRes = await pinConventionJsonToIpfs({
          name: `convention-candidature-${candId}`,
          content: {
            type: 'STAGECHAIN_CONVENTION_DE_STAGE',
            titreDocument: 'Convention de Stage',
            candidatureId: candId,
            offreId: target.offreId,
            offreTitre: target.offreTitre,
            etudiant: {
              wallet: target.etudiantWallet,
              nomComplet: target.name,
              email: target.email,
              telephone: target.tel,
              ville: target.ville,
              filiere: target.filiere
            },
            entreprise: {
              nomEntreprise: rhUser.entreprise || 'Entreprise Inconnue',
              representantRH: `${rhUser.prenom || ''} ${rhUser.nom || ''}`.trim() || 'Représentant RH',
              poste: rhUser.poste || 'RH',
              emailContact: rhUser.email || '',
              telephoneContact: rhUser.telephone || '',
              ville: rhUser.ville || '',
              walletRH: rhWallet,
              competencesRequises: target.competences
            },
            universite: uniDetails,
            statut: 'Validée par l\'entreprise',
            datesStage: {
              debut: 'À définir',
              fin: 'À définir'
            },
            conditions: {
              gratification: 'Selon la réglementation en vigueur',
              sujet: target.offreTitre
            },
            generatedAt: new Date().toISOString()
          }
        });
        const cid = ipfsRes?.cid;
        if (!cid) throw new Error('CID IPFS non généré');
        const tx2 = await convC.genererConvention(candId, cid);
        await tx2.wait();
        toast('Candidature acceptée et convention IPFS générée.', 'success');
      } else {
        const tx = await offreC.refuserCandidature(candId);
        toast('Refus envoyé...', 'loading');
        await tx.wait();
        toast('Candidature refusée.', 'success');
      }
      await loadCandidatures();
    } catch (err) {
      toast(err?.reason || err?.message || 'Action impossible', 'error');
    } finally {
      setActingId(null);
    }
  };

  const signerConventionRH = async (cand) => {
    if (!cand.conventionId) return;
    try {
      setActingId(cand.id);
      const convC = await getConventionManagerContract();
      const tx = await convC.signerParRH(cand.conventionId);
      toast('Signature RH envoyée...', 'loading');
      await tx.wait();
      toast('Convention signée par RH.', 'success');
      await loadCandidatures();
    } catch (err) {
      toast(err?.reason || err?.message || 'Signature RH échouée', 'error');
    } finally {
      setActingId(null);
    }
  };

  const downloadConvention = (cand) => {
    if (!cand?.convention?.cidConvention) {
      toast('CID de convention indisponible', 'warning');
      return;
    }
    setViewConvM(cand.convention.cidConvention);
  };

  const saveNote = () => {
    if (!noteText.trim()) {
      toast('Écrivez une note !', 'error');
      return;
    }
    setCands((list) => list.map((x) => (x.id === noteM ? { ...x, note: noteText } : x)));
    toast('Note enregistrée', 'success');
    setNoteM(null);
    setNoteText('');
  };

  const shown = useMemo(() => (filter === 'ALL' ? cands : cands.filter((c) => c.status === filter)), [filter, cands]);

  return (
    <div className="fi">
      <PH title="Gestion des Candidatures">
        <div style={{ display: 'flex', gap: 7 }}>
          {['ALL', 'EN_ATTENTE', 'ACCEPTE', 'REFUSE'].map((f) => (
            <Btn key={f} v={filter === f ? 'primary' : 'ghost'} sm onClick={() => setFilter(f)}>
              {f === 'ALL' ? `Tous(${cands.length})` : f === 'EN_ATTENTE' ? `Attente(${cands.filter((c) => c.status === 'EN_ATTENTE').length})` : f === 'ACCEPTE' ? `Acceptés(${cands.filter((c) => c.status === 'ACCEPTE').length})` : `Refusés(${cands.filter((c) => c.status === 'REFUSE').length})`}
            </Btn>
          ))}
        </div>
      </PH>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <Btn sm v="ghost" I={RefreshCw} onClick={loadCandidatures} disabled={loading}>Rafraîchir</Btn>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {shown.map((c) => (
          <Card key={c.id} style={{ padding: '12px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 35, height: 35, borderRadius: 9, background: 'var(--acd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--ac)' }}>
                {(c.name[0] || 'U').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
                  <Tag label={c.status} c={SC2[c.status] || 'mu'} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{c.offreTitre} · {c.filiere} · {c.competences}</div>
                {c.note && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1, fontStyle: 'italic' }}>Note : {c.note}</div>}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Btn v="ghost" sm I={User} onClick={() => setProfM(c)}>Profil complet</Btn>
                <Btn v="ghost" sm I={MessageSquare} onClick={() => { setNoteM(c.id); setNoteText(c.note || ''); }}>Note</Btn>
                {c.status === 'EN_ATTENTE' && (
                  <>
                    <Btn v="danger" sm I={XCircle} disabled={actingId === c.id} onClick={() => handle(c.id, 'REFUSE')}>Refuser</Btn>
                    <Btn sm I={CheckCircle} disabled={actingId === c.id} onClick={() => handle(c.id, 'ACCEPTE')}>Accepter</Btn>
                  </>
                )}
                {c.conventionId && (
                  <>
                    {!c.convention.signRH && <Btn sm I={CheckCircle} disabled={actingId === c.id} onClick={() => signerConventionRH(c)}>Signer conv.</Btn>}
                    <Btn v="secondary" sm I={Download} onClick={() => downloadConvention(c)}>Télécharger conv.</Btn>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {shown.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--t3)', fontFamily: 'var(--fm)', fontSize: 12 }}>Aucune candidature.</div>
        )}
      </div>

      <Modal open={!!noteM} onClose={() => setNoteM(null)} title="Note RH interne">
        <Txta label="Note (non visible par l'étudiant)" placeholder="Commentaire sur le profil..." rows={4} value={noteText} onChange={(e) => setNoteText(e.target.value)} />
        <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
          <Btn I={Save} full onClick={saveNote}>Enregistrer</Btn>
          <Btn v="ghost" onClick={() => setNoteM(null)}>Annuler</Btn>
        </div>
      </Modal>

      <Modal open={!!profM} onClose={() => setProfM(null)} title={`Profil complet — ${profM?.name}`} wide>
        {profM && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <ML label="Wallet étudiant" value={profM.etudiantWallet} />
              <ML label="Email" value={profM.email} />
              <ML label="Téléphone" value={profM.tel} />
              <ML label="Ville" value={profM.ville} />
              <ML label="Filière" value={profM.filiere} />
              <ML label="Compétences offre" value={profM.competences} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 11 }}>Documents joints (IPFS)</div>
              {[{ label: 'CID CV', file: profM.cv }, { label: 'CID Lettre de Motivation', file: profM.lm }].map((d, i) => (
                <div key={i} style={{ padding: '11px 13px', background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', marginBottom: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{d.file}</div>
                  </div>
                  <Btn sm v="secondary" I={Download} onClick={() => window.open(`https://ipfs.io/ipfs/${d.file}`, '_blank', 'noopener,noreferrer')}>Télécharger</Btn>
                </div>
              ))}
              {profM.status === 'EN_ATTENTE' && (
                <div style={{ marginTop: 14, display: 'flex', gap: 9 }}>
                  <Btn v="danger" sm I={XCircle} full onClick={() => { handle(profM.id, 'REFUSE'); setProfM(null); }}>Refuser</Btn>
                  <Btn sm I={CheckCircle} full onClick={() => { handle(profM.id, 'ACCEPTE'); setProfM(null); }}>Accepter</Btn>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!viewConvM} onClose={() => setViewConvM(null)} title="Visualisation de la Convention" wide style={{ maxWidth: 900 }}>
        {viewConvM && <ConventionViewer cid={viewConvM} />}
      </Modal>
    </div>
  );
};

export default RhCandidats;