// src/components/pages/etudiant/Convention.js
import React, { useRef, useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import ML from '../ui/ML';
import Alrt from '../ui/Alrt';
import { useToast } from '../common/ToastProvider';
import Tag from '../ui/Tag';
import { CheckCircle, Clock } from 'lucide-react';
import { Download } from 'lucide-react';
import { getConnectedWallet, getConventionManagerContract, getContractReadOnly, getOffreManagerContract } from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';
import Modal from '../ui/Modal';
import ConventionViewer from '../common/ConventionViewer';

const Convention = () => {
  const pollRef = useRef(false);
  const toast = useToast();
  const [conv, setConv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewConvM, setViewConvM] = useState(null);

  const loadConvention = async () => {
    const poll = pollRef.current;
    if (!poll) setLoading(true);
    try {
      const [convC, accountC, offreC, me] = await Promise.all([
        getConventionManagerContract(),
        getContractReadOnly(),
        getOffreManagerContract(),
        getConnectedWallet(),
      ]);
      const c = await convC.getConventionByEtudiant(me);
      const rhUser = await accountC.getUser(c.rh);
      const cand = await offreC.getCandidature(c.candidatureId);
      const offre = await offreC.getOffre(cand.offreId);
      let encName = 'Non affecté';
      if (c.encadrant && c.encadrant !== '0x0000000000000000000000000000000000000000') {
        try {
          const encU = await accountC.getUser(c.encadrant);
          encName = `${encU.nom} ${encU.prenom}`;
        } catch(e) {}
      }

      setConv({
        id: Number(c.id),
        cidConvention: c.cidConvention,
        signEtudiant: !!c.signEtudiant,
        signRH: !!c.signRH,
        signAdmin: !!c.signAdmin,
        etudiant: me,
        entreprise: rhUser.entreprise || '-',
        titreOffre: offre.titre || '-',
        encadrant: encName,
      });
    } catch (err) {
      setConv(null);
    } finally {
      if (!poll) setLoading(false);
      pollRef.current = true;
    }
  };

  useChainDataRefresh(loadConvention);

  const sigs = { etu: !!conv?.signEtudiant, rh: !!conv?.signRH, admin: !!conv?.signAdmin };
  const all = sigs.etu && sigs.rh && sigs.admin;

  const signEtudiant = async () => {
    if (!conv?.id) return;
    try {
      setBusy(true);
      const convC = await getConventionManagerContract();
      const tx = await convC.signerParEtudiant(conv.id);
      toast('Signature envoyée...', 'loading');
      await tx.wait();
      toast('Convention signée.', 'success');
      await loadConvention();
    } catch (err) {
      toast(err?.reason || err?.message || 'Signature échouée', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fi">
      <PH title="Ma Convention de Stage">
        <Btn v="secondary" sm I={Download} onClick={() => {
          if (!conv?.cidConvention) {
            toast('CID de convention indisponible', 'warning');
            return;
          }
          setViewConvM(conv.cidConvention);
        }}>Télécharger / Voir</Btn>
      </PH>

      {all && <Alrt type="success" message="Convention officielle ACTIVÉE ! Le stage peut démarrer." />}
      {!all && <Alrt type="warning" message="Convention en attente. Active seulement après les 3 signatures." />}

      <Glass glow={all}>
        {!conv && !loading && (
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucune convention disponible pour cet étudiant.</div>
        )}
        {conv && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ paddingRight: 18, borderRight: '1px solid var(--br)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 11 }}>Détails</div>
            <ML label="Numéro" value={`#CONV-${conv.id}`} color="var(--ac)" />
            <ML label="Étudiant (wallet)" value={conv.etudiant} />
            <ML label="Entreprise" value={conv.entreprise} />
            <ML label="Offre" value={conv.titreOffre} />
            <ML label="Encadrant" value={conv.encadrant} />
          </div>
          <div style={{ paddingLeft: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 11 }}>Signatures</div>
            {[{ l: 'Étudiant', d: sigs.etu }, { l: 'RH', d: sigs.rh }, { l: 'Admin', d: sigs.admin }].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: '1px solid var(--br)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: s.d ? 'var(--acd)' : 'var(--bg3)', border: `1px solid ${s.d ? 'var(--ac)' : 'var(--br)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.d ? <CheckCircle size={10} style={{ color: 'var(--ac)' }} /> : <Clock size={10} style={{ color: 'var(--t3)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: s.d ? 'var(--ac)' : 'var(--t2)' }}>Sig. {s.l}</div>
                </div>
                {s.d && <Tag label="SIGNÉ" c="ac" />}
              </div>
            ))}
            {!sigs.etu && (
              <div style={{ marginTop: 12 }}>
                <Btn I={CheckCircle} full disabled={busy} onClick={signEtudiant}>Signer via MetaMask</Btn>
              </div>
            )}
          </div>
        </div>
        )}
      </Glass>

      <Modal open={!!viewConvM} onClose={() => setViewConvM(null)} title="Convention Officielle" wide style={{ maxWidth: 900 }}>
        {viewConvM && <ConventionViewer cid={viewConvM} />}
      </Modal>
    </div>
  );
};

export default Convention;