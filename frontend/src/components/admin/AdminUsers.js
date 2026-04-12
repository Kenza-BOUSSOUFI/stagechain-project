// src/components/pages/admin/AdminUsers.js
import React, { useMemo, useRef, useState } from 'react';
import PH from '../ui/PH';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Inp from '../ui/Inp';
import Tag from '../ui/Tag';
import Alrt from '../ui/Alrt';
import Sel from '../ui/Sel';
import { useToast } from '../common/ToastProvider';
import { UserPlus, Search, Wallet, User, BookOpen, Send, RefreshCw } from 'lucide-react';
import { getContractWithSigner, getConnectedWallet } from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';

const AdminUsers = () => {
  const pollRef = useRef(false);
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ wallet: '', nom: '', prenom: '', role: 'etudiant', filiere: '' });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => users.filter(u =>
    `${u.nom} ${u.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
    u.filiere.toLowerCase().includes(search.toLowerCase()) ||
    u.wallet.toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  const loadUsers = async () => {
    let isPoll = pollRef.current;
    if (!isPoll) setLoadingList(true);
    try {
      const contract = await getContractWithSigner();
      const adminWallet = await getConnectedWallet();

      const [students, encadrants] = await Promise.all([
        contract.getStudentsByUniversite(adminWallet),
        contract.getEncadrantsByUniversite(adminWallet),
      ]);

      const addrs = [...students, ...encadrants];
      const userDetails = await Promise.all(addrs.map(async (addr) => {
        const u = await contract.getUser(addr);
        return {
          id: addr.toLowerCase(),
          wallet: addr,
          nom: u.nom || '',
          prenom: u.prenom || '',
          role: Number(u.role) === 2 ? 'encadrant' : 'etudiant',
          filiere: u.filiere || '',
          isActive: !!u.isActive,
        };
      }));

      setUsers(userDetails);
    } catch (err) {
      toast(err?.reason || err?.message || 'Impossible de charger les comptes on-chain', 'error');
    } finally {
      if (!isPoll) setLoadingList(false);
      pollRef.current = true;
    }
  };

  useChainDataRefresh(loadUsers);

  const add = async () => {
    if (!form.wallet.trim() || !form.nom.trim() || !form.prenom.trim() || !form.filiere.trim()) {
      toast('Remplissez tous les champs !', 'error');
      return;
    }

    try {
      setSaving(true);
      const contract = await getContractWithSigner();
      const me = (await getConnectedWallet()).toLowerCase();
      const target = form.wallet.trim().toLowerCase();
      if (target === me) {
        toast(
          'Impossible d’utiliser votre propre wallet : il est déjà l’admin université. Indiquez l’adresse d’un autre compte (ex. #1 Hardhat).',
          'error'
        );
        setSaving(false);
        return;
      }

      let tx;
      if (form.role === 'encadrant') {
        tx = await contract.addEncadrant(form.wallet.trim(), form.nom.trim(), form.prenom.trim(), form.filiere.trim());
      } else {
        tx = await contract.addStudent(form.wallet.trim(), form.nom.trim(), form.prenom.trim(), form.filiere.trim());
      }
      toast('Transaction envoyée, confirmez dans MetaMask...', 'loading');
      await tx.wait();
      toast('Compte créé sur la blockchain.', 'success');
      setForm({ wallet: '', nom: '', prenom: '', role: 'etudiant', filiere: '' });
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      let msg = err?.reason || err?.message || 'Echec de création du compte';
      const s = String(msg);
      if (s.includes('missing revert data') || s.includes('deja enregistre')) {
        msg =
          'Transaction refusée : ce wallet est déjà enregistré sur la chaîne, ou ce n’est pas le bon réseau (31337). Utilisez un compte MetaMask vide / jamais inscrit (ex. 0x7099… pour Hardhat #1).';
      }
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fi">
      <PH title="Gestion des Comptes">
        <Btn I={UserPlus} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fermer' : '+ Nouveau compte'}
        </Btn>
      </PH>

      <Alrt
        type="info"
        message="Création on-chain des comptes Étudiant et Encadrant par l'admin université connecté. Utilisez un wallet différent du vôtre (déjà admin) — ex. compte Hardhat #1 : 0x70997970C51812dc3A010C7d01b50e0d17dc79C8."
      />

      {showForm && (
        <Card style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ac)', marginBottom: 13 }}>Enregistrer un nouveau compte</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Inp label="Adresse Wallet *" placeholder="Autre que votre wallet admin — ex. 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" value={form.wallet} onChange={e => setForm(f => ({ ...f, wallet: e.target.value }))} I={Wallet} />
            <Inp label="Nom *" placeholder="NOM" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} I={User} />
            <Inp label="Prénom *" placeholder="Prénom" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} I={User} />
            <Sel label="Rôle" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} options={[{ v: 'etudiant', l: 'Étudiant' }, { v: 'encadrant', l: 'Encadrant Universitaire' }]} />
            <Inp label="Filière" placeholder="ex: CyberSécurité" value={form.filiere} onChange={e => setForm(f => ({ ...f, filiere: e.target.value }))} I={BookOpen} />
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <Btn I={Send} onClick={add} disabled={saving}>{saving ? 'Transaction...' : 'Enregistrer via MetaMask'}</Btn>
            <Btn v="ghost" onClick={() => setShowForm(false)}>Annuler</Btn>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Comptes ({filtered.length})</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Inp placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} I={Search} />
            <Btn sm v="ghost" I={RefreshCw} onClick={loadUsers} disabled={loadingList}>Rafraîchir</Btn>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {!loadingList && filtered.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--t3)', padding: '10px 4px' }}>
              Aucun compte trouvé pour votre université.
            </div>
          )}
          {filtered.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 'var(--r2)' }}>
              <div style={{ width: 31, height: 31, borderRadius: 8, background: 'var(--acd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--ac)' }}>
                {(u.nom?.[0] || 'U').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{u.prenom} {u.nom}</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{u.wallet} · {u.filiere}</div>
              </div>
              <Tag label={u.role === 'encadrant' ? 'Encadrant' : 'Étudiant'} c={u.role === 'encadrant' ? 'sk' : 'ac'} />
              <Tag label={u.isActive ? 'Actif' : 'Inactif'} c={u.isActive ? 'ac' : 'cr'} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;