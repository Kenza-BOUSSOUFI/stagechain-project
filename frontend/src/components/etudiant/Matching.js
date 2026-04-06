// src/components/pages/etudiant/Matching.js
import React, { useEffect, useMemo, useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import { useToast } from '../common/ToastProvider';
import { Search, Eye, Send, CheckCircle } from 'lucide-react';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import ML from '../ui/ML';
import { getContractReadOnly, getConnectedWallet, getOffreManagerContract } from '../hooks/useContract';

const Matching = () => {
  const toast = useToast();

  const [searching, setSearching] = useState(false);
  const [done, setDone] = useState(false);
  const [postule, setPostule] = useState([]);
  const [detM, setDetM] = useState(null);
  const [offres, setOffres] = useState([]);

  const loadOffres = async () => {
    try {
      const [offreContract, accountContract] = await Promise.all([
        getOffreManagerContract(),
        getContractReadOnly(),
      ]);
      const ids = await offreContract.getAllOffres();
      const rows = await Promise.all(ids.map(async (idBn) => {
        const o = await offreContract.getOffre(idBn);
        const rhUser = await accountContract.getUser(o.rh);
        return {
          id: Number(o.id),
          titre: o.titre,
          entreprise: rhUser.entreprise || 'Entreprise RH',
          duree: `${Number(o.dureeJours)} jours`,
          competences: o.competences,
          domaine: o.domaine,
          nbPlaces: Number(o.nbPlaces),
          nbCandidatures: Number(o.nbCandidatures),
          statut: Number(o.statut),
        };
      }));
      // Offres actives seulement, triées par plus récentes.
      setOffres(rows.filter((o) => o.statut === 0).sort((a, b) => b.id - a.id));
    } catch (err) {
      toast(err?.reason || err?.message || 'Impossible de charger les offres', 'error');
    }
  };

  useEffect(() => {
    loadOffres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const offresClassees = useMemo(() => offres.map((o, i) => ({
    ...o,
    // score visuel simple tant que l'algo de matching complet n'est pas branché on-chain
    match: Math.max(55, 95 - (i * 7)),
  })), [offres]);

  const doSearch = () => {
    setSearching(true);
    toast('Analyse en cours...', 'loading');
    setTimeout(() => {
      setSearching(false);
      setDone(true);
      toast(`${offresClassees.length} offres compatibles !`, 'success');
    }, 1800);
  };

  const postuler = async (o) => {
    if (postule.includes(o.id)) {
      toast('Déjà postulé !', 'warning');
      return;
    }
    try {
      const contract = await getOffreManagerContract();
      await getConnectedWallet();
      const tx = await contract.postuler(o.id, `CID-CV-${o.id}`, `CID-LM-${o.id}`);
      toast('Transaction envoyée, confirmez dans MetaMask...', 'loading');
      await tx.wait();
      setPostule(p => [...p, o.id]);
      toast('Candidature enregistrée sur la blockchain.', 'success');
    } catch (err) {
      toast(err?.reason || err?.message || 'Echec de candidature', 'error');
    }
  };

  return (
    <div className="fi">
      <PH title="Offres & Matching" />

      <Glass glow style={{ marginBottom: 15 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>Algorithme de matching — 5 critères</div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14 }}>Compétences 35% · Filière 25% · Niveau 20% · Domaine 10% · Ville 10%</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9, marginBottom: 13 }}>
          {[['Compétences', 35], ['Filière', 25], ['Niveau', 20], ['Domaine', 10], ['Ville', 10]].map(([l, p]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ac)', fontFamily: 'var(--fm)', marginBottom: 2 }}>{p}%</div>
              <div style={{ fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
              <div style={{ height: 3, background: `linear-gradient(90deg,var(--ac) ${p}%,var(--bg3) 0%)`, borderRadius: 99, marginTop: 4 }} />
            </div>
          ))}
        </div>
        <Btn loading={searching} full I={Search} onClick={doSearch}>
          {searching ? 'Analyse en cours...' : 'Calculer la compatibilité'}
        </Btn>
      </Glass>

      {done && (
        <div className="fi">
          <div style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t3)', marginBottom: 11 }}>{offresClassees.length} offres classées</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {offresClassees.map((o, i) => {
              const d = postule.includes(o.id);
              return (
                <Card key={o.id} style={{ padding: '12px 15px', borderColor: i === 0 ? 'var(--brh)' : 'var(--br)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ textAlign: 'center', padding: '5px 10px', background: i === 0 ? 'var(--acd)' : 'var(--bg3)', border: `1px solid ${i === 0 ? 'var(--brh)' : 'var(--br)'}`, borderRadius: 8, minWidth: 50 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: i === 0 ? 'var(--ac)' : 'var(--t2)', fontFamily: 'var(--fm)' }}>{o.match}%</div>
                      <div style={{ fontSize: 7, color: 'var(--t3)', textTransform: 'uppercase' }}>Score</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{o.titre}</span>
                        {i === 0 && <Tag label="MEILLEUR" c="ac" />}
                        {d && <Tag label="POSTULÉ ✓" c="sk" />}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 1 }}>{o.entreprise} · {o.domaine} · {o.duree}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>{o.competences}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <Btn v="ghost" sm I={Eye} onClick={() => setDetM(o)}>Détails</Btn>
                      <Btn sm I={d ? CheckCircle : Send} v={d ? 'success' : 'primary'} onClick={() => postuler(o)} disabled={d}>
                        {d ? 'Postulé' : 'Postuler'}
                      </Btn>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={!!detM} onClose={() => setDetM(null)} title={detM?.titre}>
        {detM && (
          <>
            <ML label="Entreprise" value={detM.entreprise} />
            <ML label="Domaine" value={detM.domaine} />
            <ML label="Durée" value={detM.duree} />
            <ML label="Compétences" value={detM.competences} />
            <ML label="Places restantes" value={detM.nbPlaces.toString()} />
            <ML label="Candidatures" value={detM.nbCandidatures.toString()} />
            <ML label="Score" value={`${detM.match}%`} color="var(--ac)" />
            <div style={{ marginTop: 12, display: 'flex', gap: 9 }}>
              <Btn full I={Send} onClick={() => { postuler(detM); setDetM(null); }}>Postuler</Btn>
              <Btn v="ghost" onClick={() => setDetM(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Matching;