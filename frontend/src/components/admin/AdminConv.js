// src/components/pages/admin/AdminConv.js
import React, { useRef, useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import Modal from '../ui/Modal';
import Alrt from '../ui/Alrt';
import ML from '../ui/ML';
import Tag from '../ui/Tag';
import { CheckCircle, Circle, Eye, Download } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { getConnectedWallet, getContractReadOnly, getConventionManagerContract, getOffreManagerContract } from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';

const AdminConv = () => {
  const pollRef = useRef(false);
  const toast = useToast();
  const [conv, setConv] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [detM, setDetM] = useState(null);

  const loadConventions = async () => {
    const poll = pollRef.current;
    if (!poll) setLoading(true);
    try {
      const [offreC, convC, accountC, me] = await Promise.all([
        getOffreManagerContract(),
        getConventionManagerContract(),
        getContractReadOnly(),
        getConnectedWallet(),
      ]);

      const offerIds = await offreC.getAllOffres();
      const result = [];
      const seen = new Set();

      for (const oIdBn of offerIds) {
        const candIds = await offreC.getCandidaturesByOffre(oIdBn);
        for (const cIdBn of candIds) {
          const c = await offreC.getCandidature(cIdBn);
          const etuUser = await accountC.getUser(c.etudiant);
          if (etuUser.universite.toLowerCase() !== me.toLowerCase()) continue;
          const conventionId = Number(await convC.conventionParCandidature(c.id));
          if (!conventionId || seen.has(conventionId)) continue;
          seen.add(conventionId);

          const cv = await convC.getConvention(conventionId);
          const rhUser = await accountC.getUser(cv.rh);
          result.push({
            id: Number(cv.id),
            etudiant: `${etuUser.prenom || ''} ${etuUser.nom || ''}`.trim() || cv.etudiant,
            entreprise: rhUser.entreprise || '-',
            sigEtu: !!cv.signEtudiant,
            sigRH: !!cv.signRH,
            sigAdmin: !!cv.signAdmin,
            cidConvention: cv.cidConvention,
          });
        }
      }

      setConv(result.sort((a, b) => b.id - a.id));
    } catch (err) {
      toast(err?.reason || err?.message || 'Impossible de charger les conventions', 'error');
    } finally {
      if (!poll) setLoading(false);
      pollRef.current = true;
    }
  };

  useChainDataRefresh(loadConventions);

  const signAdmin = async (id) => {
    try {
      setBusyId(id);
      const convC = await getConventionManagerContract();
      const tx = await convC.signerParAdmin(id);
      toast('Signature admin envoyée...', 'loading');
      await tx.wait();
      toast('Convention signée par admin.', 'success');
      await loadConventions();
    } catch (err) {
      toast(err?.reason || err?.message || 'Signature admin échouée', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fi">
      <PH title="Conventions de Stage" />
      <Alrt type="info" message="Convention : JSON sur IPFS (CID on-chain). Signatures étudiant, RH et admin université requises pour finaliser." />

      <div style={{ display: 'grid', gap: 12 }}>
        {!loading && conv.length === 0 && (
          <Glass>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucune convention trouvée pour votre université.</div>
          </Glass>
        )}
        {conv.map(c => {
          const all = c.sigEtu && c.sigRH && c.sigAdmin;
          return (
            <Glass key={c.id} glow={all}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{c.etudiant}</span>
                    {all ? <Tag label="ACTIVE" c="ac" /> : <Tag label="EN ATTENTE" c="am" />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t2)' }}>{c.entreprise}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn sm v="ghost" I={Eye} onClick={() => setDetM(c)}>Détails</Btn>
                  <Btn sm v="ghost" I={Download} onClick={() => window.open(`https://ipfs.io/ipfs/${c.cidConvention}`, '_blank', 'noopener,noreferrer')}>IPFS</Btn>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: all ? 0 : 11 }}>
                {[{ l: 'Étudiant', d: c.sigEtu }, { l: 'RH', d: c.sigRH }, { l: 'Admin', d: c.sigAdmin }].map((s, j) => (
                  <div key={j} style={{
                    padding: '8px 11px', background: s.d ? 'var(--acd)' : 'var(--bg3)',
                    border: `1px solid ${s.d ? 'var(--brh)' : 'var(--br)'}`, borderRadius: 'var(--r2)',
                    display: 'flex', alignItems: 'center', gap: 7
                  }}>
                    {s.d ? <CheckCircle size={12} style={{ color: 'var(--ac)' }} /> : <Circle size={12} style={{ color: 'var(--t3)' }} />}
                    <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: s.d ? 'var(--ac)' : 'var(--t3)' }}>Sig. {s.l}</span>
                  </div>
                ))}
              </div>

              {!c.sigAdmin && (
                <Btn I={CheckCircle} disabled={busyId === c.id} onClick={() => signAdmin(c.id)}>Signer (admin université)</Btn>
              )}
            </Glass>
          );
        })}
      </div>

      <Modal open={!!detM} onClose={() => setDetM(null)} title={`Convention — ${detM?.etudiant}`}>
        {detM && (
          <>
            <ML label="Entreprise" value={detM.entreprise} />
            <ML label="CID Convention" value={detM.cidConvention} />
            <ML label="Sig. Étudiant" value={detM.sigEtu ? '✓' : 'En attente'} color={detM.sigEtu ? 'var(--ac)' : 'var(--am)'} />
            <ML label="Sig. RH" value={detM.sigRH ? '✓' : 'En attente'} color={detM.sigRH ? 'var(--ac)' : 'var(--am)'} />
            <ML label="Sig. Admin" value={detM.sigAdmin ? '✓' : 'En attente'} color={detM.sigAdmin ? 'var(--ac)' : 'var(--am)'} />
            <div style={{ marginTop: 12 }}>
              <Btn v="ghost" full onClick={() => setDetM(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminConv;