import React, { useState, useCallback, useRef } from 'react';
import PH from '../ui/PH';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Inp from '../ui/Inp';
import Tag from '../ui/Tag';
import Alrt from '../ui/Alrt';
import Glass from '../ui/Glass';
import ML from '../ui/ML';
import Txta from '../ui/Txta';
import { useToast } from '../common/ToastProvider';
import { Edit2, Save, RefreshCw, Building2, Mail, Phone, MapPin } from 'lucide-react';
import {
  getAccountManagerContract,
  getConnectedWallet,
  getContractReadOnly,
} from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';

const ZERO = '0x0000000000000000000000000000000000000000';

const emptyUni = { nom: '', ville: '', adresse: '', email: '', siteWeb: '' };

const EtuProfile = () => {
  const pollRef = useRef(false);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [wallet, setWallet] = useState('');
  const [uniAdmin, setUniAdmin] = useState(emptyUni);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    filiere: '',
    email: '',
    telephone: '',
    ville: '',
    niveau: '',
    bio: '',
    competences: '',
    langues: '',
  });

  const loadProfile = useCallback(async () => {
    const poll = pollRef.current;
    if (!poll) setLoading(true);
    try {
      const [me, accountC] = await Promise.all([getConnectedWallet(), getContractReadOnly()]);
      setWallet(me);
      const u = await accountC.getUser(me);
      const uniAddr = u.universite;
      let uni = { ...emptyUni };
      if (uniAddr && String(uniAddr).toLowerCase() !== ZERO) {
        try {
          const raw = await accountC.getUniversite(uniAddr);
          uni = {
            nom: raw.nom || '',
            ville: raw.ville || '',
            adresse: raw.adresse || '',
            email: raw.email || '',
            siteWeb: raw.siteWeb || '',
          };
        } catch (_) {
          uni = { ...emptyUni, nom: 'Établissement (wallet admin)', adresse: String(uniAddr) };
        }
      }
      setUniAdmin(uni);
      setForm({
        nom: u.nom || '',
        prenom: u.prenom || '',
        filiere: u.filiere || '',
        email: u.email || '',
        telephone: u.telephone || '',
        ville: u.ville || '',
        niveau: u.poste || '',
        bio: u.bio || '',
        competences: u.competences || '',
        langues: u.langues || '',
      });
    } catch (err) {
      toast(err?.reason || err?.message || 'Impossible de charger le profil on-chain', 'error');
    } finally {
      if (!poll) setLoading(false);
      pollRef.current = true;
    }
  }, [toast]);

  useChainDataRefresh(loadProfile);

  const saveOnChain = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) {
      toast('Nom et prénom sont obligatoires.', 'error');
      return;
    }
    try {
      setSaving(true);
      const c = await getAccountManagerContract();
      const tx = await c.updateStudentProfile(
        form.nom.trim(),
        form.prenom.trim(),
        form.filiere.trim(),
        form.email.trim(),
        form.telephone.trim(),
        form.ville.trim(),
        form.niveau.trim(),
        form.bio.trim(),
        form.competences.trim(),
        form.langues.trim()
      );
      toast('Transaction envoyée, confirmez dans MetaMask...', 'loading');
      await tx.wait();
      toast('Profil enregistré sur la blockchain.', 'success');
      setEditing(false);
      await loadProfile();
    } catch (err) {
      toast(err?.reason || err?.message || 'Échec de la mise à jour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${(form.prenom?.[0] || '')}${(form.nom?.[0] || '')}`.toUpperCase() || '?';

  return (
    <div className="fi">
      <PH title="Mon profil" subtitle="Données stockées on-chain">
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn sm v="ghost" I={RefreshCw} onClick={loadProfile} disabled={loading || saving}>
            Rafraîchir
          </Btn>
          {!editing && (
            <Btn I={Edit2} onClick={() => setEditing(true)} disabled={loading}>
              Modifier
            </Btn>
          )}
        </div>
      </PH>

      <Alrt
        type="info"
        message="Votre rattachement à l’université est défini par l’admin qui a créé votre compte ; vous ne pouvez pas le modifier. Les CV et lettres de motivation se joignent uniquement lors d’une candidature (offres de stage)."
      />

      {loading ? (
        <Glass>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Chargement du profil…</div>
        </Glass>
      ) : editing ? (
        <Glass glow>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ac)', marginBottom: 14 }}>Modifier mon profil (blockchain)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Inp label="Nom *" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
            <Inp label="Prénom *" value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} />
            <Inp
              label="Filière"
              placeholder="ex: CyberSécurité"
              value={form.filiere}
              onChange={(e) => setForm((f) => ({ ...f, filiere: e.target.value }))}
            />
            <Inp label="Niveau (ex. Bac+4)" value={form.niveau} onChange={(e) => setForm((f) => ({ ...f, niveau: e.target.value }))} />
            <Inp label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} I={Mail} />
            <Inp label="Téléphone" value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} I={Phone} />
            <Inp label="Ville" value={form.ville} onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))} I={MapPin} />
          </div>
          <Txta label="Bio / présentation" rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
          <div style={{ marginTop: 12 }}>
            <Inp
              label="Compétences (texte libre)"
              placeholder="ex: React, Solidity, Docker"
              value={form.competences}
              onChange={(e) => setForm((f) => ({ ...f, competences: e.target.value }))}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <Inp label="Langues" placeholder="ex: Français, Arabe, Anglais" value={form.langues} onChange={(e) => setForm((f) => ({ ...f, langues: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
            <Btn I={Save} full loading={saving} onClick={saveOnChain}>
              Enregistrer sur la chaîne
            </Btn>
            <Btn v="ghost" disabled={saving} onClick={() => { setEditing(false); loadProfile(); }}>
              Annuler
            </Btn>
          </div>
        </Glass>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 18 }}>
          <Glass style={{ padding: 22 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--acd)',
                border: '3px solid var(--brh)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--ac)',
              }}
            >
              {initials}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: 2 }}>
              {form.prenom} {form.nom}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'center', marginBottom: 8 }}>{form.filiere || '—'}</div>
            {form.niveau ? <div style={{ textAlign: 'center', marginBottom: 10 }}><Tag label={form.niveau} c="ac" /></div> : null}
            <div style={{ borderTop: '1px solid var(--br)', paddingTop: 12, marginTop: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 6 }}>Université de rattachement</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Building2 size={16} style={{ color: 'var(--ac)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{uniAdmin.nom || 'Non renseignée'}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{[uniAdmin.ville, uniAdmin.email].filter(Boolean).join(' · ')}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--fm)', color: 'var(--t3)', marginTop: 14, textTransform: 'uppercase' }}>Wallet</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--ac)', wordBreak: 'break-all' }}>{wallet}</div>
          </Glass>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Contact</div>
              <ML label="Email" value={form.email || '—'} />
              <ML label="Téléphone" value={form.telephone || '—'} />
              <ML label="Ville" value={form.ville || '—'} />
            </Card>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>À propos</div>
              <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, margin: 0 }}>{form.bio || '—'}</p>
            </Card>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Compétences</div>
              <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, margin: 0 }}>{form.competences || '—'}</p>
            </Card>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Langues</div>
              <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, margin: 0 }}>{form.langues || '—'}</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtuProfile;
