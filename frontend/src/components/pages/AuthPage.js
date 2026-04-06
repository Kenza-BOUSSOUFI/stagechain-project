// src/components/pages/AuthPage.js
import React, { useState } from 'react';
import { Hexagon, Wallet, ArrowRight, User, Mail, Phone, MapPin, Building2, BookOpen, CheckCircle, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import RCFG from '../data/rcfg';
import { useToast } from '../common/ToastProvider';
import Inp from '../ui/Inp';
import Btn from '../ui/Btn';
import Alrt from '../ui/Alrt';
import Glass from '../ui/Glass';
import MMPopup from '../common/MMPopup';
import { fetchUserFromChain, getContractWithSigner, getConnectedWallet } from '../hooks/useContract';

const AuthPage = ({ onBack, onLogin }) => {
  const toast = useToast();
  const { login: appContextLogin } = useApp();

  const [phase, setPhase] = useState('role');
  const [role, setRole] = useState(null);
  const [wallet, setWallet] = useState('');
  const [showMM, setShowMM] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Formulaire admin université
  const [regForm, setRegForm] = useState({
    nom: '',
    ville: '',
    adresse: '',
    email: '',
    telephone: '',
    siteWeb: ''
  });

  // ── Formulaire RH
  const [rhForm, setRhForm] = useState({
    nom: '',
    prenom: '',
    entreprise: '',
    poste: '',
    email: '',
    telephone: '',
    ville: ''
  });

  const handleRoleSelect = (r) => {
    setRole(r);
    setPhase('wallet');
  };

  const handleWalletCheck = () => {
    if (!wallet.trim()) {
      toast('Entrez votre adresse wallet !', 'error');
      return;
    }
    setShowMM(true);
  };

  // ── Vérification on-chain via smart contract
  const handleMMConfirm = async () => {
    setShowMM(false);
    setLoading(true);
    toast('Vérification on-chain...', 'loading');

    try {
      // Récupère le compte actuellement connecté dans MetaMask
      const connectedWallet = await getConnectedWallet();

      // Vérifie que l'adresse saisie correspond au wallet MetaMask actif
      if (wallet.trim().toLowerCase() !== connectedWallet.toLowerCase()) {
        toast(
          `⚠️ Le wallet saisi ne correspond pas au wallet MetaMask actif (${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}).`,
          'error'
        );
        // Retour à l'écran de connexion wallet avec la bonne adresse pré-remplie
        setWallet(connectedWallet);
        setPhase('wallet');
        setLoading(false);
        return;
      }

      // Interroge la blockchain
      const userOnChain = await fetchUserFromChain(connectedWallet);

      if (!userOnChain) {
        // Wallet non enregistré → formulaire d'inscription pour le rôle sélectionné
        toast('Wallet non enregistré — Créez votre compte', 'warning');
        setPhase('register');
      } else if (userOnChain.role !== role) {
        // ❌ Wallet enregistré avec un AUTRE rôle — bloquer et informer
        toast(
          `❌ Ce wallet est déjà enregistré comme "${RCFG[userOnChain.role]?.label || userOnChain.role}" sur la blockchain, pas comme "${RCFG[role]?.label || role}". Sélectionnez le bon rôle.`,
          'error'
        );
        // Rester sur la page du rôle choisi (ex: RH), pour forcer le changement de wallet.
        setPhase('wallet');
        setLoading(false);
        return;
      } else {
        // ✅ Wallet trouvé avec le bon rôle
        setFoundUser(userOnChain);
        setPhase('found');
      }
    } catch (err) {
      toast('Erreur : ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = () => {
    appContextLogin(foundUser);
    onLogin(foundUser);
    toast(`Bienvenue, ${foundUser.nom} !`, 'success');
  };

  // ── Inscription on-chain selon le rôle
  const handleRegister = async () => {
    setLoading(true);

    try {
      const contract = await getContractWithSigner();
      toast('Transaction en cours — Confirmez dans MetaMask...', 'loading');

      if (role === 'admin') {
        // ── Validation admin
        if (!regForm.nom.trim())       { toast("Nom de l'université requis", 'error'); setLoading(false); return; }
        if (!regForm.ville.trim())     { toast('Ville requise', 'error'); setLoading(false); return; }
        if (!regForm.email.trim())     { toast('Email université requis', 'error'); setLoading(false); return; }
        if (!regForm.telephone.trim()) { toast('Téléphone université requis', 'error'); setLoading(false); return; }

        // ── Appel smart contract
        const tx = await contract.registerUniversite(
          regForm.nom,
          regForm.ville,
          regForm.adresse,
          regForm.email,
          regForm.telephone,
          regForm.siteWeb
        );
        await tx.wait();

      } else if (role === 'rh') {
        // ── Validation RH
        if (!rhForm.nom.trim())        { toast('Nom requis', 'error'); setLoading(false); return; }
        if (!rhForm.entreprise.trim()) { toast('Entreprise requise', 'error'); setLoading(false); return; }
        if (!rhForm.poste.trim())      { toast('Poste requis', 'error'); setLoading(false); return; }
        if (!rhForm.email.trim())      { toast('Email professionnel requis', 'error'); setLoading(false); return; }
        if (!rhForm.telephone.trim())  { toast('Téléphone requis', 'error'); setLoading(false); return; }
        if (!rhForm.ville.trim())      { toast('Ville entreprise requise', 'error'); setLoading(false); return; }

        // ── Appel smart contract
        const tx = await contract.registerRH(
          rhForm.nom,
          rhForm.prenom,
          rhForm.entreprise,
          rhForm.poste,
          rhForm.email,
          rhForm.telephone,
          rhForm.ville
        );
        await tx.wait();

      } else {
        // etudiant / encadrant → enregistrement par admin uniquement
        toast("Un admin doit vous enregistrer depuis son espace.", 'warning');
        setLoading(false);
        return;
      }

      // ── Relit depuis le contrat pour avoir les données officielles
      const connectedWallet = await getConnectedWallet();
      const newUser = await fetchUserFromChain(connectedWallet);

      appContextLogin(newUser);
      onLogin(newUser);
      toast(`Compte créé sur la blockchain ! Bienvenue, ${newUser.nom} !`, 'success');

    } catch (err) {
      const msg = err?.reason || err?.message || 'Transaction échouée';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Formulaires d'inscription par rôle
  const regFields = {
    // ✅ Admin : formulaire réaliste université
    admin: (
      <>
        <Inp
          label="Nom de l'université *"
          placeholder="ex: EMSI Casablanca"
          value={regForm.nom}
          onChange={e => setRegForm(f => ({ ...f, nom: e.target.value }))}
          I={Building2}
        />
        <Inp
          label="Ville *"
          placeholder="ex: Casablanca"
          value={regForm.ville}
          onChange={e => setRegForm(f => ({ ...f, ville: e.target.value }))}
          I={MapPin}
        />
        <Inp
          label="Adresse complète"
          placeholder="ex: 12 Av. Hassan II"
          value={regForm.adresse}
          onChange={e => setRegForm(f => ({ ...f, adresse: e.target.value }))}
          I={MapPin}
        />
        <Inp
          label="Email officiel *"
          placeholder="ex: contact@universite.ma"
          value={regForm.email}
          onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
          I={Mail}
        />
        <Inp
          label="Téléphone *"
          placeholder="ex: +212 5 22 00 00 00"
          value={regForm.telephone}
          onChange={e => setRegForm(f => ({ ...f, telephone: e.target.value }))}
          I={Phone}
        />
        <Inp
          label="Site web"
          placeholder="ex: https://www.universite.ma"
          value={regForm.siteWeb}
          onChange={e => setRegForm(f => ({ ...f, siteWeb: e.target.value }))}
          I={Globe}
        />
      </>
    ),

    // ✅ RH : formulaire réaliste entreprise
    rh: (
      <>
        <Inp
          label="Nom *"
          placeholder="NOM"
          value={rhForm.nom}
          onChange={e => setRhForm(f => ({ ...f, nom: e.target.value }))}
          I={User}
        />
        <Inp
          label="Prénom"
          placeholder="Prénom"
          value={rhForm.prenom}
          onChange={e => setRhForm(f => ({ ...f, prenom: e.target.value }))}
          I={User}
        />
        <Inp
          label="Entreprise *"
          placeholder="ex: TechCorp SA"
          value={rhForm.entreprise}
          onChange={e => setRhForm(f => ({ ...f, entreprise: e.target.value }))}
          I={Building2}
        />
        <Inp
          label="Poste *"
          placeholder="ex: Responsable recrutement"
          value={rhForm.poste}
          onChange={e => setRhForm(f => ({ ...f, poste: e.target.value }))}
          I={BookOpen}
        />
        <Inp
          label="Email professionnel *"
          placeholder="ex: rh@techcorp.ma"
          value={rhForm.email}
          onChange={e => setRhForm(f => ({ ...f, email: e.target.value }))}
          I={Mail}
        />
        <Inp
          label="Téléphone *"
          placeholder="ex: +212 6 00 00 00 00"
          value={rhForm.telephone}
          onChange={e => setRhForm(f => ({ ...f, telephone: e.target.value }))}
          I={Phone}
        />
        <Inp
          label="Ville entreprise *"
          placeholder="ex: Rabat"
          value={rhForm.ville}
          onChange={e => setRhForm(f => ({ ...f, ville: e.target.value }))}
          I={MapPin}
        />
      </>
    ),

    // ℹ️ Etudiant : info seulement — l'admin les enregistre via addStudent()
    etudiant: (
      <div style={{ gridColumn: '1 / -1', padding: '18px', background: 'var(--amd)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 'var(--r2)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--am)', marginBottom: 6 }}>
          Inscription via votre université
        </div>
        <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6 }}>
          Les étudiants sont enregistrés directement par l'administrateur de leur université sur la blockchain.<br />
          Contactez votre université pour obtenir l'accès.
        </div>
      </div>
    ),

    // ℹ️ Encadrant : même logique que étudiant
    encadrant: (
      <div style={{ gridColumn: '1 / -1', padding: '18px', background: 'var(--amd)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 'var(--r2)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--am)', marginBottom: 6 }}>
          Inscription via votre université
        </div>
        <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.6 }}>
          Les encadrants sont enregistrés par l'administrateur de leur université sur la blockchain.<br />
          Contactez votre université pour obtenir l'accès.
        </div>
      </div>
    ),
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 20% 0%,rgba(0,240,160,0.04) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 100%,rgba(56,178,245,0.04) 0%,transparent 60%)', pointerEvents: 'none' }} />

      {showMM && <MMPopup wallet={wallet} onConfirm={handleMMConfirm} onReject={() => setShowMM(false)} />}

      <div style={{ maxWidth: 560, width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 58, height: 58, borderRadius: 15, background: 'var(--acd)', border: '2px solid var(--brh)', marginBottom: 14, boxShadow: '0 0 32px var(--acg)' }}>
            <Hexagon size={26} style={{ color: 'var(--ac)' }} />
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.9, marginBottom: 7 }}>
            Stage<span style={{ color: 'var(--ac)' }}>Chain</span>
          </h1>
          <p style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {phase === 'role'     ? 'Sélectionnez votre rôle'
           : phase === 'wallet'   ? `Connexion — ${RCFG[role]?.label}`
           : phase === 'found'    ? 'Compte trouvé !'
           : 'Créer mon compte'}
          </p>
        </div>

        {/* ── PHASE : role ── */}
        {phase === 'role' && (
          <div className="fi">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 15px', background: 'var(--amd)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 'var(--r2)', marginBottom: 20 }}>
              <Wallet size={13} style={{ color: 'var(--am)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--am)', marginBottom: 1 }}>Connexion via MetaMask</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>Wallet Ethereum · Réseau local Hardhat</div>
              </div>
              <div className="blink" style={{ fontSize: 9, fontFamily: 'var(--fm)', color: 'var(--am)' }}>LIVE</div>
            </div>

            <p style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)', textAlign: 'center', marginBottom: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Choisissez votre rôle
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {Object.entries(RCFG).map(([id, r]) => (
                <button
                  key={id}
                  onClick={() => handleRoleSelect(id)}
                  style={{ padding: '14px 16px', borderRadius: 'var(--r2)', background: 'var(--bg4)', border: '1px solid var(--br)', textAlign: 'left', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{r.label}</div>
                  <p style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)', lineHeight: 1.5 }}>{r.desc}</p>
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={onBack} style={{ fontSize: 12, color: 'var(--t3)' }}>← Retour à l'accueil</button>
            </div>
          </div>
        )}

        {/* ── PHASE : wallet ── */}
        {phase === 'wallet' && (
          <Glass glow className="fi">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${RCFG[role]?.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={15} style={{ color: RCFG[role]?.color }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{RCFG[role]?.label}</div>
                <div style={{ fontSize: 11, color: 'var(--t2)' }}>Entrez votre adresse wallet Ethereum</div>
              </div>
            </div>

            <div style={{ marginBottom: 13 }}>
              <Inp label="Adresse Wallet Ethereum *" placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)} I={Wallet} />
            </div>

            <div style={{ display: 'flex', gap: 9 }}>
              <Btn I={ArrowRight} full onClick={handleWalletCheck} disabled={loading}>
                {loading ? 'Vérification...' : 'Vérifier via MetaMask'}
              </Btn>
              <Btn v="ghost" onClick={() => setPhase('role')}>Retour</Btn>
            </div>
          </Glass>
        )}

        {/* ── PHASE : found ── */}
        {phase === 'found' && foundUser && (
          <Glass glow className="fi">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--acd)', border: '2px solid var(--brh)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 11px', fontSize: 22, fontWeight: 800, color: 'var(--ac)' }}>
                {foundUser.nom[0]}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{foundUser.nom}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 7 }}>{RCFG[foundUser.role]?.label}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--ac)' }}>
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </div>
            </div>
            <Alrt type="success" message={`✓ Compte trouvé ! Bienvenue, ${foundUser.nom} !`} />
            <Btn I={ArrowRight} full onClick={handleDirectLogin}>Accéder à mon espace</Btn>
          </Glass>
        )}

        {/* ── PHASE : register ── */}
        {phase === 'register' && (
          <Glass className="fi">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {regFields[role]}
            </div>

            {/* Boutons seulement pour admin et rh */}
            {(role === 'admin' || role === 'rh') && (
              <div style={{ display: 'flex', gap: 9 }}>
                <Btn I={CheckCircle} full onClick={handleRegister} disabled={loading}>
                  {loading ? 'Transaction...' : 'Créer mon compte'}
                </Btn>
                <Btn v="ghost" onClick={() => setPhase('wallet')}>Retour</Btn>
              </div>
            )}

            {/* Bouton retour seulement pour etudiant/encadrant */}
            {(role === 'etudiant' || role === 'encadrant') && (
              <Btn v="ghost" full onClick={() => setPhase('wallet')}>← Retour</Btn>
            )}
          </Glass>
        )}

      </div>
    </div>
  );
};

export default AuthPage;