import React, { useMemo, useState, useRef } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import { useToast } from '../common/ToastProvider';
import { Search, Eye, Send, CheckCircle, Upload, RefreshCw } from 'lucide-react';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import ML from '../ui/ML';
import Inp from '../ui/Inp';
import Sel from '../ui/Sel';
import { getContractReadOnly, getConnectedWallet, getOffreManagerContract } from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';
import { uploadFileToIPFS } from '../../services/pinataService';

const DOMAINES = [
  'Tous les domaines',
  'Développement Web/Mobile',
  'Cybersécurité',
  'Data Science / IA',
  'DevOps / Cloud',
  'Blockchain / Web3',
];

const Matching = () => {
  const pollRef = useRef(false);
  const toast = useToast();
  const cvRef = useRef();
  const lmRef = useRef();

  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postule, setPostule] = useState([]);
  const [detM, setDetM] = useState(null);

  const [filtreTitre, setFiltreTitre] = useState('');
  const [filtreDomaine, setFiltreDomaine] = useState('Tous les domaines');
  const [filtreCompetences, setFiltreCompetences] = useState('');
  const [filtreDureeMax, setFiltreDureeMax] = useState('');

  const [applyOffre, setApplyOffre] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [lmFile, setLmFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadOffres = async () => {
    const poll = pollRef.current;
    if (!poll) setLoading(true);
    try {
      const [offreContract, accountContract, me] = await Promise.all([
        getOffreManagerContract(),
        getContractReadOnly(),
        getConnectedWallet(),
      ]);
      const ids = await offreContract.getAllOffres();
      const rows = await Promise.all(
        ids.map(async (idBn) => {
          const o = await offreContract.getOffre(idBn);
          const rhUser = await accountContract.getUser(o.rh);
          return {
            id: Number(o.id),
            titre: o.titre,
            entreprise: rhUser.entreprise || 'Entreprise RH',
            dureeJours: Number(o.dureeJours),
            duree: `${Number(o.dureeJours)} jours`,
            competences: o.competences,
            domaine: o.domaine,
            nbPlaces: Number(o.nbPlaces),
            nbCandidatures: Number(o.nbCandidatures),
            statut: Number(o.statut),
          };
        })
      );
      const actives = rows.filter((o) => o.statut === 0).sort((a, b) => b.id - a.id);
      setOffres(actives);

      const candIds = await offreContract.getCandidaturesByEtudiant(me);
      const applied = new Set();
      for (const idBn of candIds) {
        const cand = await offreContract.getCandidature(idBn);
        applied.add(Number(cand.offreId));
      }
      setPostule([...applied]);
    } catch (err) {
      toast(err?.reason || err?.message || 'Impossible de charger les offres', 'error');
    } finally {
      if (!poll) setLoading(false);
      pollRef.current = true
      setLoading(false);

    }
  };

  useChainDataRefresh(loadOffres);

  const offresFiltrees = useMemo(() => {
    const t = filtreTitre.trim().toLowerCase();
    const comp = filtreCompetences.trim().toLowerCase();
    const dMax = filtreDureeMax.trim() ? Number(filtreDureeMax) : null;
    return offres.filter((o) => {
      if (t && !o.titre.toLowerCase().includes(t)) return false;
      if (filtreDomaine !== 'Tous les domaines' && o.domaine !== filtreDomaine) return false;
      if (comp && !String(o.competences || '').toLowerCase().includes(comp)) return false;
      if (Number.isFinite(dMax) && dMax > 0 && o.dureeJours > dMax) return false;
      return true;
    });
  }, [offres, filtreTitre, filtreDomaine, filtreCompetences, filtreDureeMax]);

  const openPostuler = (o) => {
    setApplyOffre(o);
    setCvFile(null);
    setLmFile(null);
  };

  const pickPdf = (type, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast('PDF uniquement pour CV et lettre de motivation.', 'error');
      return;
    }
    if (type === 'cv') setCvFile(file);
    else setLmFile(file);
  };

  const confirmPostuler = async () => {
    if (!applyOffre) return;
    if (!cvFile || !lmFile) {
      toast('Sélectionnez un CV et une lettre de motivation (PDF).', 'error');
      return;
    }
    try {
      setSubmitting(true);
      toast('Upload IPFS en cours...', 'loading');
      const [cidCV, cidLM] = await Promise.all([
        uploadFileToIPFS(cvFile),
        uploadFileToIPFS(lmFile),
      ]);
      const contract = await getOffreManagerContract();
      await getConnectedWallet();
      const tx = await contract.postuler(applyOffre.id, cidCV, cidLM);
      toast('Transaction envoyée, confirmez dans MetaMask...', 'loading');
      await tx.wait();
      setPostule((p) => [...p, applyOffre.id]);
      setApplyOffre(null);
      setCvFile(null);
      setLmFile(null);
      toast('Candidature enregistrée : CID CV et LM sur IPFS, références sur la blockchain.', 'success');
    } catch (err) {
      toast(err?.reason || err?.message || 'Échec de la candidature', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fi">
      <PH title="Offres de stage">
        <Btn sm v="ghost" I={RefreshCw} onClick={loadOffres} disabled={loading}>
          Rafraîchir
        </Btn>
      </PH>

      <Glass glow style={{ marginBottom: 15 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
          Filtrer les offres (mêmes critères que la publication RH : titre, domaine, compétences, durée)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <Inp
            label="Recherche titre"
            placeholder="ex: développeur"
            value={filtreTitre}
            onChange={(e) => setFiltreTitre(e.target.value)}
            I={Search}
          />
          <Sel
            label="Domaine"
            value={filtreDomaine}
            onChange={(e) => setFiltreDomaine(e.target.value)}
            options={DOMAINES}
          />
          <Inp
            label="Compétences (contient)"
            placeholder="ex: React"
            value={filtreCompetences}
            onChange={(e) => setFiltreCompetences(e.target.value)}
          />
          <Inp
            label="Durée max (jours)"
            placeholder="ex: 120 — vide = pas de limite"
            value={filtreDureeMax}
            onChange={(e) => setFiltreDureeMax(e.target.value)}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 10 }}>
          {offresFiltrees.length} offre(s) affichée(s) sur {offres.length} actives · CV/LM : upload via l’API locale (Pinata JWT côté serveur dans api-files) puis CID enregistrés on-chain.
        </div>
      </Glass>

      <div style={{ display: 'grid', gap: 10 }}>
        {!loading && offresFiltrees.length === 0 && (
          <Card>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucune offre ne correspond aux filtres.</div>
          </Card>
        )}
        {offresFiltrees.map((o) => {
          const d = postule.includes(o.id);
          return (
            <Card key={o.id} style={{ padding: '12px 15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{o.titre}</span>
                    {d && <Tag label="POSTULÉ ✓" c="sk" />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 1 }}>
                    {o.entreprise} · {o.domaine} · {o.duree}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t3)' }}>{o.competences}</div>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <Btn v="ghost" sm I={Eye} onClick={() => setDetM(o)}>
                    Détails
                  </Btn>
                  <Btn sm I={d ? CheckCircle : Send} v={d ? 'success' : 'primary'} onClick={() => !d && openPostuler(o)} disabled={d}>
                    {d ? 'Postulé' : 'Postuler'}
                  </Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!applyOffre} onClose={() => !submitting && setApplyOffre(null)} title={applyOffre ? `Postuler — ${applyOffre.titre}` : ''}>
        {applyOffre && (
          <>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12 }}>
              Déposez votre CV et votre lettre de motivation en PDF. Envoi vers Pinata (IPFS) via l’API locale avec JWT serveur ; la transaction enregistre uniquement les CID sur la blockchain.
            </div>
            {[
              { key: 'cv', label: 'CV (PDF)', ref: cvRef, file: cvFile, pick: (f) => pickPdf('cv', f) },
              { key: 'lm', label: 'Lettre de motivation (PDF)', ref: lmRef, file: lmFile, pick: (f) => pickPdf('lm', f) },
            ].map(({ key, label, ref, file, pick }) => (
              <div key={key} style={{ marginBottom: 13 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--fm)',
                    color: 'var(--t2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 5,
                  }}
                >
                  {label}
                </div>
                <div
                  onClick={() => ref.current?.click()}
                  style={{
                    border: `2px dashed ${file ? 'var(--ac)' : 'var(--brm)'}`,
                    borderRadius: 'var(--r2)',
                    padding: '14px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: file ? 'var(--acd)' : 'var(--bg3)',
                  }}
                >
                  <Upload size={18} style={{ color: file ? 'var(--ac)' : 'var(--t3)', marginBottom: 6 }} />
                  <div style={{ fontSize: 12, color: file ? 'var(--ac)' : 'var(--t2)' }}>
                    {file ? file.name : 'Cliquer pour choisir un PDF'}
                  </div>
                  <input
                    ref={ref}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => pick(e.target.files?.[0])}
                  />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 9, marginTop: 13 }}>
              <Btn I={Send} full loading={submitting} onClick={confirmPostuler}>
                Envoyer sur IPFS et postuler
              </Btn>
              <Btn v="ghost" disabled={submitting} onClick={() => setApplyOffre(null)}>
                Annuler
              </Btn>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!detM} onClose={() => setDetM(null)} title={detM?.titre}>
        {detM && (
          <>
            <ML label="Entreprise" value={detM.entreprise} />
            <ML label="Domaine" value={detM.domaine} />
            <ML label="Durée" value={detM.duree} />
            <ML label="Compétences" value={detM.competences} />
            <ML label="Places restantes" value={detM.nbPlaces.toString()} />
            <ML label="Candidatures" value={detM.nbCandidatures.toString()} />
            <div style={{ marginTop: 12, display: 'flex', gap: 9 }}>
              <Btn
                full
                I={Send}
                onClick={() => {
                  if (!postule.includes(detM.id)) openPostuler(detM);
                  setDetM(null);
                }}
                disabled={postule.includes(detM.id)}
              >
                {postule.includes(detM.id) ? 'Déjà postulé' : 'Postuler'}
              </Btn>
              <Btn v="ghost" onClick={() => setDetM(null)}>
                Fermer
              </Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Matching;
