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
import { UserPlus, Search, Wallet, User, BookOpen, Send, RefreshCw, GraduationCap, Users, UserX } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('etudiant');

  const filtered = useMemo(() => users.filter(u =>
    `${u.nom} ${u.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
    u.filiere.toLowerCase().includes(search.toLowerCase()) ||
    u.wallet.toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  const filteredStudents = filtered.filter(u => u.role === 'etudiant');
  const filteredEncadrants = filtered.filter(u => u.role === 'encadrant');

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            disabled={loadingList}
            onClick={() => setActiveTab('etudiant')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: activeTab === 'etudiant' ? 'var(--ac)' : 'var(--bg3)',
              color: activeTab === 'etudiant' ? '#000' : 'var(--t2)',
              boxShadow: activeTab === 'etudiant' ? '0 0 15px rgba(0, 255, 170, 0.2)' : 'none',
              transition: 'all 0.2s'
            }}>
            <GraduationCap size={18} /> Étudiants
            <div style={{ 
              background: activeTab === 'etudiant' ? 'rgba(0,0,0,0.1)' : 'var(--bg)', 
              color: activeTab === 'etudiant' ? '#000' : 'var(--t3)',
              width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 11, marginLeft: 4 
            }}>
              {filteredStudents.length}
            </div>
          </button>
          
          <button 
            disabled={loadingList}
            onClick={() => setActiveTab('encadrant')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: activeTab === 'encadrant' ? 'var(--ac)' : 'var(--bg3)',
              color: activeTab === 'encadrant' ? '#000' : 'var(--t2)',
              boxShadow: activeTab === 'encadrant' ? '0 0 15px rgba(0, 255, 170, 0.2)' : 'none',
              transition: 'all 0.2s'
            }}>
            <Users size={18} /> Encadrants
            <div style={{ 
              background: activeTab === 'encadrant' ? 'rgba(0,0,0,0.1)' : 'var(--bg)', 
              color: activeTab === 'encadrant' ? '#000' : 'var(--t3)',
              width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 11, marginLeft: 4 
            }}>
              {filteredEncadrants.length}
            </div>
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 220 }}>
            <Inp placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} I={Search} />
          </div>
          <Btn sm v="ghost" I={RefreshCw} onClick={loadUsers} disabled={loadingList}>Rafraîchir</Btn>
        </div>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeTab === 'etudiant' ? <GraduationCap size={16} /> : <Users size={16} />}
          {activeTab === 'etudiant' ? 'Étudiants' : 'Encadrants'} — {activeTab === 'etudiant' ? filteredStudents.length : filteredEncadrants.length} résultat(s)
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {!loadingList && (activeTab === 'etudiant' ? filteredStudents : filteredEncadrants).length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--t3)', padding: '10px 4px' }}>
              Aucun résultat trouvé.
            </div>
          )}
          {(activeTab === 'etudiant' ? filteredStudents : filteredEncadrants).map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 'var(--r2)', border: '1px solid transparent' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--acd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: 'var(--ac)' }}>
                {(u.nom?.[0] || 'U').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: '#fff' }}>{u.prenom} {u.nom}</div>
                <div style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{u.wallet} · {u.filiere}</div>
              </div>
              
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: u.isActive ? 'var(--ac)' : 'var(--cr)', textTransform: 'uppercase', marginRight: 16 }}>
                {u.isActive ? 'ACTIF' : 'INACTIF'}
              </div>
              
              {u.isActive && (
                <button 
                  onClick={async () => {
                    try {
                      setSaving(true);
                      const contract = await getContractWithSigner();
                      const tx = await contract.deactivateUser(u.wallet);
                      toast('Transaction envoyée...', 'loading');
                      await tx.wait();
                      toast('Compte désactivé avec succès.', 'success');
                      await loadUsers();
                    } catch (err) {
                      toast(err?.reason || err?.message || 'Échec de la désactivation', 'error');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  style={{ 
                    border: '1px solid rgba(255, 60, 60, 0.3)', background: 'rgba(255, 60, 60, 0.05)', color: '#ff4d4d', 
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    opacity: saving ? 0.5 : 1
                  }}>
                  <UserX size={14} /> Désactiver
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;