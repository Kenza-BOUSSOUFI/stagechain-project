/* eslint-disable no-unused-vars */
import React, { useCallback, useRef, useState } from 'react';
import PH from '../ui/PH';
import SC from '../ui/SC';
import Card from '../ui/Card';
import ML from '../ui/ML';
import Tag from '../ui/Tag';
import { Zap, CheckCircle, Activity, Upload } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import {
  getConnectedWallet,
  getContractReadOnly,
  getOffreManagerContract,
  getConventionManagerContract,
  getSuiviManagerContract,
} from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';

const StatutConvention = { COMPLETE: 4 };

const DashEtu = () => {
  const toast = useToast();
  const errOnce = useRef(false);
  const [nbOffresActives, setNbOffresActives] = useState(0);
  const [nbCand, setNbCand] = useState(0);
  const [convStatus, setConvStatus] = useState('—');
  const [nbRapports, setNbRapports] = useState(0);
  const [entreprise, setEntreprise] = useState('—');
  const [encadrant, setEncadrant] = useState('—');
  const [acceptedOffre, setAcceptedOffre] = useState(null);

  const loadDash = useCallback(async () => {
    try {
      const [offreC, accountC, convC, suiviC, me] = await Promise.all([
        getOffreManagerContract(),
        getContractReadOnly(),
        getConventionManagerContract(),
        getSuiviManagerContract(),
        getConnectedWallet(),
      ]);

      const ids = await offreC.getAllOffres();
      let active = 0;
      for (const idBn of ids) {
        const o = await offreC.getOffre(idBn);
        if (Number(o.statut) === 0) active += 1;
      }
      setNbOffresActives(active);

      const candIds = await offreC.getCandidaturesByEtudiant(me);
      setNbCand(candIds.length);

      let accepted = null;
      for (const idBn of candIds) {
        const c = await offreC.getCandidature(idBn);
        if (Number(c.statut) === 1) {
          const offre = await offreC.getOffre(c.offreId);
          const rhUser = await accountC.getUser(offre.rh);
          accepted = { titre: offre.titre || '-', entreprise: rhUser.entreprise || '-' };
          break;
        }
      }
      setAcceptedOffre(accepted);

      try {
        const cv = await convC.getConventionByEtudiant(me);
        const complete = Number(cv.statut) === StatutConvention.COMPLETE;
        setConvStatus(complete ? 'CONVENTION ACTIVE' : 'EN SIGNATURE');
        const rhUser = await accountC.getUser(cv.rh);
        setEntreprise(rhUser.entreprise || '—');
        setEncadrant(cv.encadrant && cv.encadrant !== '0x0000000000000000000000000000000000000000' ? cv.encadrant : 'Non affecté');
      } catch (_) {
        setConvStatus('AUCUNE');
        setEntreprise('—');
        setEncadrant('—');
      }

      const rapIds = await suiviC.getRapportsByEtudiant(me);
      setNbRapports(rapIds.length);
    } catch (err) {
      console.warn('[DashEtu]', err);
      if (!errOnce.current) {
        errOnce.current = true;
        toast(err?.reason || err?.message || 'Impossible de charger le tableau de bord', 'error');
      }
    }
  }, [toast]);

  useChainDataRefresh(loadDash);

  const candLabel = nbCand ? `${nbCand} candidature(s)` : 'Aucune';

  return (
    <div className="fi">
      <PH title="Tableau de Bord" subtitle="Espace Étudiant — données on-chain (rafraîchissement auto)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
        <SC label="Offres actives (réseau)" value={String(nbOffresActives)} I={Zap} color="ac" sub="page Offres pour postuler" />
        <SC label="Mes candidatures" value={String(nbCand)} I={CheckCircle} color="ac" sub={candLabel} />
        <SC label="Convention" value={convStatus} I={Activity} color="am" />
        <SC label="Rapports déposés" value={String(nbRapports)} I={Upload} color="sk" sub="Suivi on-chain" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Stage & convention</div>
          {acceptedOffre ? (
            <>
              <ML label="Offre acceptée" value={acceptedOffre.titre} />
              <ML label="Entreprise" value={acceptedOffre.entreprise} />
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>Aucune candidature acceptée pour le moment.</div>
          )}
          <ML label="Entreprise (convention)" value={entreprise} />
          <ML label="Encadrant (wallet)" value={encadrant} />
          <div style={{ marginTop: 10 }}>
            <Tag label={convStatus} c={convStatus === 'CONVENTION ACTIVE' ? 'ac' : 'am'} />
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Raccourcis</div>
          <div style={{ fontSize: 12, color: 'var(--t2)' }}>
            Les compteurs se mettent à jour automatiquement quand la blockchain change (nouvelle candidature, signatures, dépôt de rapport).
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashEtu;
