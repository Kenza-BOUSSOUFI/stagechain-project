// src/components/pages/rh/DashRH.js
import React, { useCallback, useRef, useState } from 'react';
import PH from '../ui/PH';
import SC from '../ui/SC';
import Card from '../ui/Card';
import Tag from '../ui/Tag';
import { FilePlus, Inbox, User, Award } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { getConnectedWallet, getContractReadOnly, getOffreManagerContract } from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';

const statusLabel = (s) => (s === 0 ? 'EN_ATTENTE' : s === 1 ? 'ACCEPTE' : 'REFUSE');

const DashRH = () => {
  const toast = useToast();
  const errOnce = useRef(false);
  const [nbOffres, setNbOffres] = useState(0);
  const [nbCand, setNbCand] = useState(0);
  const [nbStagiaires, setNbStagiaires] = useState(0);
  const [recentCand, setRecentCand] = useState([]);
  const [activeOffres, setActiveOffres] = useState([]);

  const loadDash = useCallback(async () => {
    try {
      const [offreC, accountC, me] = await Promise.all([
        getOffreManagerContract(),
        getContractReadOnly(),
        getConnectedWallet(),
      ]);
      const m = await offreC.getMetriquesRH(me);
      setNbOffres(Number(m[0]));
      setNbStagiaires(Number(m[1]));

      const ids = await offreC.getAllOffres();
      const myOffres = [];
      let totalCand = 0;
      for (const idBn of ids) {
        const o = await offreC.getOffre(idBn);
        if (o.rh.toLowerCase() !== me.toLowerCase()) continue;
        const oid = Number(o.id);
        const candIds = await offreC.getCandidaturesByOffre(oid);
        totalCand += candIds.length;
        myOffres.push({ id: oid, titre: o.titre || '-', nb: candIds.length, statut: Number(o.statut) });
      }
      setNbCand(totalCand);

      const rows = [];
      for (const o of myOffres) {
        const candIds = await offreC.getCandidaturesByOffre(o.id);
        for (const cIdBn of candIds) {
          const c = await offreC.getCandidature(cIdBn);
          const u = await accountC.getUser(c.etudiant);
          rows.push({
            id: Number(c.id),
            name: `${u.prenom || ''} ${u.nom || ''}`.trim() || c.etudiant,
            offre: o.titre,
            status: statusLabel(Number(c.statut)),
          });
        }
      }
      setRecentCand(rows.sort((a, b) => b.id - a.id).slice(0, 5));
      setActiveOffres(
        myOffres
          .filter((o) => o.statut === 0)
          .sort((a, b) => b.nb - a.nb)
          .slice(0, 4)
          .map((o) => [o.titre, `${o.nb} candidat(s)`])
      );
    } catch (err) {
      console.warn('[DashRH]', err);
      if (!errOnce.current) {
        errOnce.current = true;
        toast(err?.reason || err?.message || 'Impossible de charger le tableau de bord', 'error');
      }
    }
  }, [toast]);

  useChainDataRefresh(loadDash);

  return (
    <div className="fi">
      <PH title="Tableau de Bord" subtitle="Ressources Humaines — données on-chain (rafraîchissement auto)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
        <SC label="Offres publiées" value={String(nbOffres)} I={FilePlus} color="am" />
        <SC label="Candidatures" value={String(nbCand)} I={Inbox} color="ac" />
        <SC label="Stagiaires (on-chain)" value={String(nbStagiaires)} I={User} color="sk" />
        <SC label="Attestations" value="—" I={Award} color="vi" sub="non indexées en liste" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Candidatures récentes</div>
          {recentCand.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucune candidature sur vos offres.</div>
          )}
          {recentCand.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--br)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)' }}>{c.offre}</div>
              </div>
              <Tag label={c.status} c={c.status === 'ACCEPTE' ? 'ac' : c.status === 'EN_ATTENTE' ? 'am' : 'cr'} />
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Offres actives (candidatures)</div>
          {activeOffres.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucune offre active.</div>
          )}
          {activeOffres.map(([o, n], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--br)' }}>
              <span style={{ fontSize: 12, color: 'var(--t2)' }}>{o}</span>
              <Tag label={n} c="ac" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default DashRH;
