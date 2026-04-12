import React, { useRef, useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import Alrt from '../ui/Alrt';
import ML from '../ui/ML';
import { useToast } from '../common/ToastProvider';
import { Eye, RefreshCw } from 'lucide-react';
import { getConnectedWallet, getContractReadOnly, getOffreManagerContract } from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';

const Candidature = () => {
  const pollRef = useRef(false);
  const toast = useToast();
  const [cands, setCands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detM, setDetM] = useState(null);

  const statusLabel = (s) => (s === 0 ? 'EN_ATTENTE' : s === 1 ? 'ACCEPTE' : 'REFUSE');
  const C2 = { EN_ATTENTE: 'am', ACCEPTE: 'ac', REFUSE: 'cr' };

  const loadCandidatures = async () => {
    const poll = pollRef.current;
    if (!poll) setLoading(true);
    try {
      const [offreC, accountC, me] = await Promise.all([
        getOffreManagerContract(),
        getContractReadOnly(),
        getConnectedWallet(),
      ]);
      const ids = await offreC.getCandidaturesByEtudiant(me);
      const rows = [];
      for (const idBn of ids) {
        const c = await offreC.getCandidature(idBn);
        const offre = await offreC.getOffre(c.offreId);
        const rhUser = await accountC.getUser(offre.rh);
        rows.push({
          id: Number(c.id),
          offre: offre.titre || '-',
          entreprise: rhUser.entreprise || '-',
          date: c.createdAt ? new Date(Number(c.createdAt) * 1000).toLocaleDateString('fr-FR') : '-',
          status: statusLabel(Number(c.statut)),
        });
      }
      setCands(rows.sort((a, b) => b.id - a.id));
    } catch (err) {
      toast(err?.reason || err?.message || 'Impossible de charger les candidatures', 'error');
    } finally {
      if (!poll) setLoading(false);
      pollRef.current = true;
    }
  };

  useChainDataRefresh(loadCandidatures);

  return (
    <div className="fi">
      <PH title="Mes Candidatures">
        <Btn sm v="ghost" I={RefreshCw} onClick={loadCandidatures} disabled={loading}>
          Rafraîchir
        </Btn>
      </PH>
      <Alrt type="info" message="Les documents (CV, lettre de motivation) sont envoyés sur IPFS au moment où vous postulez depuis la page Offres de stage. Le statut de vos candidatures est lu sur la blockchain." />

      <div style={{ display: 'grid', gap: 10 }}>
        {!loading && cands.length === 0 && (
          <Glass>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucune candidature enregistrée.</div>
          </Glass>
        )}
        {cands.map((c) => (
          <Glass key={c.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{c.offre}</span>
                  <Tag label={c.status} c={C2[c.status]} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                  {c.entreprise} · {c.date}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn sm v="ghost" I={Eye} onClick={() => setDetM(c)}>
                  Détails
                </Btn>
              </div>
            </div>
          </Glass>
        ))}
      </div>

      <Modal open={!!detM} onClose={() => setDetM(null)} title={detM?.offre}>
        {detM && (
          <>
            <ML label="Entreprise" value={detM.entreprise} />
            <ML label="Date" value={detM.date} />
            <ML label="Statut" value={detM.status} />
            <div style={{ marginTop: 12 }}>
              <Btn v="ghost" full onClick={() => setDetM(null)}>
                Fermer
              </Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Candidature;
