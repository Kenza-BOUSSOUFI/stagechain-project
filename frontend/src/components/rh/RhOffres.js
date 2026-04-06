// src/components/pages/rh/RhOffres.js
import React, { useEffect, useMemo, useState } from 'react';
import PH from '../ui/PH';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Inp from '../ui/Inp';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import Alrt from '../ui/Alrt';
import Sel from '../ui/Sel';
import Glass from '../ui/Glass';
import ML from '../ui/ML';
import { Briefcase, Clock, Zap, Globe } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { FilePlus, Eye, RefreshCw } from 'lucide-react';
import { getContractReadOnly, getConnectedWallet, getOffreManagerContract } from '../hooks/useContract';


const RhOffres = () => {
  const toast = useToast();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', dureeJours: '', competences: '', domaine: 'Développement Web/Mobile', nbPlaces: '1' });
  const [detT, setDetT] = useState(null);

  const statusLabel = (s) => {
    if (s === 0) return 'PUBLIÉ';
    if (s === 1) return 'FERMÉ';
    return 'ANNULÉ';
  };

  const loadOffres = async () => {
    setLoading(true);
    try {
      const [offreContract, accountContract, me] = await Promise.all([
        getOffreManagerContract(),
        getContractReadOnly(),
        getConnectedWallet(),
      ]);
      const ids = await offreContract.getAllOffres();
      const rows = await Promise.all(ids.map(async (idBn) => {
        const o = await offreContract.getOffre(idBn);
        const rhUser = await accountContract.getUser(o.rh);
        return {
          id: Number(o.id),
          rh: o.rh,
          titre: o.titre,
          domaine: o.domaine,
          competences: o.competences,
          dureeJours: Number(o.dureeJours),
          nbPlaces: Number(o.nbPlaces),
          nbCandidatures: Number(o.nbCandidatures),
          statut: Number(o.statut),
          entreprise: rhUser.entreprise || 'Entreprise RH',
          isMine: o.rh.toLowerCase() === me.toLowerCase(),
        };
      }));
      setOffres(rows.filter((o) => o.isMine).sort((a, b) => b.id - a.id));
    } catch (err) {
      toast(err?.reason || err?.message || 'Impossible de charger les offres', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publishedCount = useMemo(() => offres.filter((o) => o.statut === 0).length, [offres]);

  const publish = async () => {
    if (!form.titre.trim() || !form.competences.trim() || !form.domaine.trim()) {
      toast('Remplissez les champs obligatoires !', 'error');
      return;
    }
    const duree = Number(form.dureeJours);
    const places = Number(form.nbPlaces);
    if (!Number.isFinite(duree) || duree <= 0) {
      toast('Durée (jours) invalide', 'error');
      return;
    }
    if (!Number.isFinite(places) || places <= 0) {
      toast('Nombre de places invalide', 'error');
      return;
    }

    try {
      setPublishing(true);
      const contract = await getOffreManagerContract();
      const tx = await contract.publierOffre(form.titre.trim(), form.domaine.trim(), form.competences.trim(), duree, places);
      toast('Transaction envoyée, confirmez dans MetaMask...', 'loading');
      await tx.wait();
      toast(`Offre "${form.titre}" publiée sur la blockchain.`, 'success');
      setForm({ titre: '', dureeJours: '', competences: '', domaine: 'Développement Web/Mobile', nbPlaces: '1' });
      setShowForm(false);
      await loadOffres();
    } catch (err) {
      toast(err?.reason || err?.message || "Echec de publication de l'offre", 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fi">
      <PH title="Mes Offres de Stage">
        <Btn I={FilePlus} onClick={() => setShowForm(!showForm)} disabled={publishing}>
          {showForm ? 'Fermer' : '+ Nouvelle offre'}
        </Btn>
      </PH>

      <Alrt
        type="info"
        message={`Offres publiées: ${publishedCount} · Les offres sont enregistrées sur la blockchain et visibles par les étudiants.`}
      />

      {showForm && (
        <Glass glow style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ac)', marginBottom: 13 }}>Publier une offre de stage</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Inp label="Titre *" placeholder="ex: Développeur Blockchain" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} I={Briefcase} />
            <Inp label="Durée (jours) *" placeholder="ex: 90" value={form.dureeJours} onChange={e => setForm(f => ({ ...f, dureeJours: e.target.value }))} I={Clock} />
            <Inp label="Compétences" placeholder="ex: React, Python" value={form.competences} onChange={e => setForm(f => ({ ...f, competences: e.target.value }))} I={Zap} />
            <Inp label="Nombre de places *" placeholder="ex: 2" value={form.nbPlaces} onChange={e => setForm(f => ({ ...f, nbPlaces: e.target.value }))} I={Globe} />
            <Sel label="Domaine" value={form.domaine} onChange={e => setForm(f => ({ ...f, domaine: e.target.value }))} options={['Développement Web/Mobile', 'Cybersécurité', 'Data Science / IA', 'DevOps / Cloud', 'Blockchain / Web3']} />
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
            <Btn full onClick={publish} disabled={publishing}>{publishing ? 'Publication...' : "Publier l'offre"}</Btn>
            <Btn v="ghost" onClick={() => setShowForm(false)} disabled={publishing}>Annuler</Btn>
          </div>
        </Glass>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <Btn sm v="ghost" I={RefreshCw} onClick={loadOffres} disabled={loading}>Rafraîchir</Btn>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {!loading && offres.length === 0 && (
          <Card>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucune offre publiée pour ce compte RH.</div>
          </Card>
        )}
        {offres.map(o => (
          <Card key={o.id} style={{ padding: '12px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{o.titre}</span>
                  <Tag label={statusLabel(o.statut)} c={o.statut === 0 ? 'ac' : 'mu'} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>{o.entreprise} · {o.domaine} · {o.dureeJours} jours</div>
              </div>

              <div style={{ textAlign: 'center', padding: '5px 10px', background: 'var(--acd)', border: '1px solid var(--brm)', borderRadius: 'var(--r2)', minWidth: 50 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ac)', fontFamily: 'var(--fm)' }}>{o.nbCandidatures}</div>
                <div style={{ fontSize: 8, color: 'var(--t3)', textTransform: 'uppercase' }}>Candidats</div>
              </div>

              <div style={{ display: 'flex', gap: 7 }}>
                <Btn v="ghost" sm I={Eye} onClick={() => setDetT(o)}>Voir</Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <Modal open={!!detT} onClose={() => setDetT(null)} title={detT?.titre}>
        {detT && (
          <>
            <ML label="Entreprise RH" value={detT.entreprise} />
            <ML label="Domaine" value={detT.domaine} />
            <ML label="Durée" value={`${detT.dureeJours} jours`} />
            <ML label="Compétences" value={detT.competences} />
            <ML label="Places restantes" value={detT.nbPlaces.toString()} color="var(--ac)" />
            <ML label="Candidats" value={detT.nbCandidatures.toString()} color="var(--ac)" />
            <div style={{ marginTop: 12 }}>
              <Btn v="ghost" full onClick={() => setDetT(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default RhOffres;