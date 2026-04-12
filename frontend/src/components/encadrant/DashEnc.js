// src/components/pages/encadrant/DashEnc.js
import React, { useCallback, useRef, useState } from 'react';
import PH from '../ui/PH';
import SC from '../ui/SC';
import Card from '../ui/Card';
import Tag from '../ui/Tag';
import { Users, FileText, CheckCircle, Activity } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import {
  getConnectedWallet,
  getContractReadOnly,
  getConventionManagerContract,
  getSuiviManagerContract,
} from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';

const StatutRapport = { DEPOSE: 0, VALIDE: 1, COMMENTE: 2 };

const DashEnc = () => {
  const toast = useToast();
  const errOnce = useRef(false);
  const [nbEtu, setNbEtu] = useState(0);
  const [aEval, setAEval] = useState(0);
  const [nbValides, setNbValides] = useState(0);
  const [nbConv, setNbConv] = useState(0);
  const [rows, setRows] = useState([]);

  const loadDash = useCallback(async () => {
    try {
      const [accountC, convC, suiviC, me] = await Promise.all([
        getContractReadOnly(),
        getConventionManagerContract(),
        getSuiviManagerContract(),
        getConnectedWallet(),
      ]);

      const etus = await convC.getEtudiantsByEncadrant(me);
      setNbEtu(etus.length);

      const convIds = await convC.getConventionsByEncadrant(me);
      setNbConv(convIds.length);

      let pending = 0;
      let valides = 0;
      for (const addr of etus) {
        const rids = await suiviC.getRapportsByEtudiant(addr);
        for (const ridBn of rids) {
          const r = await suiviC.getRapport(ridBn);
          if (Number(r.statut) === StatutRapport.DEPOSE) pending += 1;
          if (Number(r.statut) === StatutRapport.VALIDE) valides += 1;
        }
      }
      setAEval(pending);
      setNbValides(valides);

      const list = [];
      for (const addr of etus.slice(0, 8)) {
        const u = await accountC.getUser(addr);
        const name = `${u.prenom || ''} ${u.nom || ''}`.trim() || addr;
        const rids = await suiviC.getRapportsByEtudiant(addr);
        let last = '—';
        if (rids.length) {
          const lastR = await suiviC.getRapport(rids[rids.length - 1]);
          last =
            Number(lastR.statut) === StatutRapport.DEPOSE
              ? 'Rapport à valider'
              : Number(lastR.statut) === StatutRapport.VALIDE
                ? 'Dernier rapport validé'
                : 'Commenté';
        }
        list.push({ n: name, e: u.filiere || '—', s: last });
      }
      setRows(list);
    } catch (err) {
      console.warn('[DashEnc]', err);
      if (!errOnce.current) {
        errOnce.current = true;
        toast(err?.reason || err?.message || 'Impossible de charger le tableau de bord', 'error');
      }
    }
  }, [toast]);

  useChainDataRefresh(loadDash);

  return (
    <div className="fi">
      <PH title="Tableau de Bord" subtitle="Espace Encadrant — données on-chain (rafraîchissement auto)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
        <SC label="Étudiants suivis" value={String(nbEtu)} I={Users} color="sk" />
        <SC label="Rapports à valider" value={String(aEval)} I={FileText} color="am" />
        <SC label="Rapports validés (suivi)" value={String(nbValides)} I={CheckCircle} color="ac" />
        <SC label="Conventions" value={String(nbConv)} I={Activity} color="vi" />
      </div>

      <Card>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Mes étudiants</div>
        {rows.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucun étudiant affecté sur vos conventions.</div>
        )}
        {rows.map((e, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--br)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{e.n}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{e.e}</div>
            </div>
            <Tag label={e.s} c={e.s === 'Rapport à valider' ? 'am' : 'ac'} />
          </div>
        ))}
      </Card>
    </div>
  );
};

export default DashEnc;
