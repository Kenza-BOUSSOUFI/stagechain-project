// src/components/pages/etudiant/EtuProfile.js
import React, { useState } from 'react';
import PH from '../ui/PH';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Inp from '../ui/Inp';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import Alrt from '../ui/Alrt';
import Sel from '../ui/Sel';
import Txta from '../ui/Txta';
import Glass from '../ui/Glass';
import ML from '../ui/ML';
import { useToast } from '../common/ToastProvider';
import { Edit2, Plus, Save, Trash2 } from 'lucide-react';
import { useMM } from '../hooks/useMM';
import { Mail, Phone, MapPin, Send } from 'lucide-react';


const EtuProfile = ({ user }) => {
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    nom: user?.nom || 'Amine Filali',
    filiere: user?.extra?.filiere || 'Génie Logiciel',
    niveau: user?.extra?.niveau || 'Bac+4',
    email: user?.email || 'amine@emsi.ma',
    tel: '0661234567',
    ville: 'Casablanca',
    competences: 'React.js, Node.js, Solidity, Python, Docker',
    langues: 'Arabe, Français, Anglais',
    bio: "Étudiant en génie logiciel passionné par la blockchain et le développement Web3."
  });

  const [formP, setFormP] = useState({ ...profile });

  const [projets, setProjets] = useState([
    { id: 1, titre: 'DApp Voting System', tech: 'Solidity, React', desc: 'Application de vote décentralisée sur Ethereum.', lien: 'github.com/amine/voting-dapp' },
    { id: 2, titre: 'NFT Marketplace', tech: 'Solidity, IPFS', desc: 'Marketplace NFTs avec stockage IPFS.', lien: 'github.com/amine/nft-market' },
  ]);

  const [posts, setPosts] = useState([
    { id: 1, contenu: "Première DApp déployée sur Sepolia ! 🚀", date: '15 Jan 2026' },
    { id: 2, contenu: "Intégration MetaMask réussie avec ethers.js.", date: '20 Jan 2026' },
  ]);

  const [newProjet, setNewProjet] = useState({ titre: '', tech: '', desc: '', lien: '' });
  const [newPost, setNewPost] = useState('');
  const [showProjForm, setShowProjForm] = useState(false);
  const [editProjId, setEditProjId] = useState(null);
  const [editProjForm, setEditProjForm] = useState({});

  const saveProfile = () => {
    setProfile({ ...formP });
    setEditing(false);
    toast('Profil mis à jour !', 'success');
  };

  const addProjet = () => {
    if (!newProjet.titre.trim()) {
      toast('Titre requis !', 'error');
      return;
    }
    setProjets(p => [...p, { id: Date.now(), ...newProjet }]);
    setNewProjet({ titre: '', tech: '', desc: '', lien: '' });
    setShowProjForm(false);
    toast('Projet ajouté !', 'success');
  };

  const delProjet = (id) => {
    setProjets(p => p.filter(x => x.id !== id));
    toast('Projet supprimé', 'info');
  };

  const saveEditProjet = () => {
    setProjets(p => p.map(x => x.id === editProjId ? { ...editProjForm } : x));
    setEditProjId(null);
    toast('Projet modifié', 'success');
  };

  const addPost = () => {
    if (!newPost.trim()) {
      toast('Rédigez votre post !', 'error');
      return;
    }
    setPosts(p => [{ id: Date.now(), contenu: newPost, date: new Date().toLocaleDateString('fr-FR') }, ...p]);
    setNewPost('');
    toast('Post publié !', 'success');
  };

  const delPost = (id) => setPosts(p => p.filter(x => x.id !== id));

  const wallet = user?.wallet || '0x...';

  return (
    <div className="fi">
      <PH title="Mon Profil" subtitle="Espace Étudiant">
        {!editing && <Btn I={Edit2} onClick={() => { setFormP({ ...profile }); setEditing(true); }}>Modifier le profil</Btn>}
      </PH>

      {!editing ? (
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 18 }}>
          {/* Colonne gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Glass style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--acd)', border: '3px solid var(--brh)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28, fontWeight: 800, color: 'var(--ac)' }}>
                {profile.nom[0]}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{profile.nom}</div>
              <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 6 }}>{profile.filiere}</div>
              <Tag label={profile.niveau} c="ac" />
              {/* Contact info */}
              {[{ I: Mail, v: profile.email }, { I: Phone, v: profile.tel }, { I: MapPin, v: profile.ville }].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <r.I size={12} style={{ color: 'var(--t3)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--t2)', wordBreak: 'break-all' }}>{r.v}</span>
                </div>
              ))}
              <div style={{ fontSize: 9, fontFamily: 'var(--fm)', color: 'var(--t3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wallet</div>
              <div style={{ fontSize: 9, fontFamily: 'var(--fm)', color: 'var(--ac)', wordBreak: 'break-all' }}>{wallet}</div>
            </Glass>
          </div>

          {/* Colonne droite */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 9 }}>À propos</div>
              <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{profile.bio}</p>
            </Card>

            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 9 }}>Compétences</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {profile.competences.split(',').map((c, i) => (
                  <span key={i} style={{ padding: '3px 11px', background: 'var(--acd)', border: '1px solid var(--brm)', borderRadius: 99, fontSize: 12, color: 'var(--ac)' }}>
                    {c.trim()}
                  </span>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 9 }}>Langues</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {profile.langues.split(',').map((l, i) => (
                  <span key={i} style={{ padding: '3px 11px', background: 'var(--skd)', border: '1px solid var(--skd)', borderRadius: 99, fontSize: 12, color: 'var(--sk)' }}>
                    {l.trim()}
                  </span>
                ))}
              </div>
            </Card>

            {/* Projets */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Mes Projets</div>
                <Btn sm I={Plus} onClick={() => setShowProjForm(!showProjForm)}>{showProjForm ? 'Fermer' : '+ Ajouter'}</Btn>
              </div>

              {showProjForm && (
                <div style={{ padding: 13, background: 'var(--bg3)', border: '1px solid var(--brh)', borderRadius: 'var(--r2)', marginBottom: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 9 }}>
                    <Inp label="Titre *" placeholder="ex: DApp Voting" value={newProjet.titre} onChange={e => setNewProjet(p => ({ ...p, titre: e.target.value }))} />
                    <Inp label="Technologies" placeholder="ex: React, Solidity" value={newProjet.tech} onChange={e => setNewProjet(p => ({ ...p, tech: e.target.value }))} />
                    <Inp label="Lien GitHub" placeholder="github.com/..." value={newProjet.lien} onChange={e => setNewProjet(p => ({ ...p, lien: e.target.value }))} />
                  </div>
                  <Txta label="Description" placeholder="Décrivez votre projet..." rows={2} value={newProjet.desc} onChange={e => setNewProjet(p => ({ ...p, desc: e.target.value }))} />
                  <div style={{ display: 'flex', gap: 9, marginTop: 9 }}>
                    <Btn sm I={Save} onClick={addProjet}>Ajouter</Btn>
                    <Btn sm v="ghost" onClick={() => setShowProjForm(false)}>Annuler</Btn>
                  </div>
                </div>
              )}

              {projets.map(p => (
                editProjId === p.id ? (
                  <div key={p.id} style={{ padding: 12, background: 'var(--bg3)', border: '1px solid var(--brh)', borderRadius: 'var(--r2)', marginBottom: 9 }}>
                    {/* Formulaire édition projet */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
                      <Inp label="Titre" value={editProjForm.titre} onChange={e => setEditProjForm(f => ({ ...f, titre: e.target.value }))} />
                      <Inp label="Tech" value={editProjForm.tech} onChange={e => setEditProjForm(f => ({ ...f, tech: e.target.value }))} />
                      <Inp label="Lien" value={editProjForm.lien} onChange={e => setEditProjForm(f => ({ ...f, lien: e.target.value }))} />
                    </div>
                    <Txta rows={2} value={editProjForm.desc} onChange={e => setEditProjForm(f => ({ ...f, desc: e.target.value }))} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
                      <Btn sm I={Save} onClick={saveEditProjet}>Sauvegarder</Btn>
                      <Btn sm v="ghost" onClick={() => setEditProjId(null)}>Annuler</Btn>
                    </div>
                  </div>
                ) : (
                  <div key={p.id} style={{ padding: '11px 13px', background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', marginBottom: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.titre}</div>
                        <div style={{ fontSize: 11, color: 'var(--ac)', marginBottom: 3 }}>{p.tech}</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>{p.desc}</div>
                        {p.lien && <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--sk)', marginTop: 3 }}>🔗 {p.lien}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 7, marginLeft: 9 }}>
                        <Btn sm v="ghost" I={Edit2} onClick={() => { setEditProjId(p.id); setEditProjForm({ ...p }); }}>Modifier</Btn>
                        <button onClick={() => delProjet(p.id)} style={{ color: 'var(--cr)', padding: 4 }}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </Card>

            {/* Publications */}
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Mes Publications</div>
              <div style={{ marginBottom: 12 }}>
                <Txta label="Nouveau post" placeholder="Partagez une réalisation, une astuce..." rows={3} value={newPost} onChange={e => setNewPost(e.target.value)} />
                <div style={{ marginTop: 8 }}><Btn sm I={Send} onClick={addPost}>Publier</Btn></div>
              </div>
              {posts.map(p => (
                <div key={p.id} style={{ padding: '11px 13px', background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, flex: 1 }}>{p.contenu}</p>
                    <button onClick={() => delPost(p.id)} style={{ color: 'var(--cr)', padding: 4, marginLeft: 9 }}><Trash2 size={11} /></button>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)', marginTop: 5 }}>{p.date}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      ) : (
        <Glass glow>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ac)', marginBottom: 14 }}>Modifier mon profil</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Inp label="Nom complet" value={formP.nom} onChange={e => setFormP(f => ({ ...f, nom: e.target.value }))} />
            <Inp label="Email" value={formP.email} onChange={e => setFormP(f => ({ ...f, email: e.target.value }))} />
            <Inp label="Téléphone" value={formP.tel} onChange={e => setFormP(f => ({ ...f, tel: e.target.value }))} />
            <Inp label="Ville" value={formP.ville} onChange={e => setFormP(f => ({ ...f, ville: e.target.value }))} />
            <Sel label="Filière" value={formP.filiere} onChange={e => setFormP(f => ({ ...f, filiere: e.target.value }))} options={['Génie Logiciel', 'CyberSécurité', 'IA & BigData', 'Réseaux', 'DevOps / Cloud']} />
            <Sel label="Niveau" value={formP.niveau} onChange={e => setFormP(f => ({ ...f, niveau: e.target.value }))} options={['Bac+3', 'Bac+4', 'Bac+5']} />
            <Inp label="Compétences" value={formP.competences} onChange={e => setFormP(f => ({ ...f, competences: e.target.value }))} />
            <Inp label="Langues" value={formP.langues} onChange={e => setFormP(f => ({ ...f, langues: e.target.value }))} />
          </div>
          <Txta label="Bio / Présentation" rows={3} value={formP.bio} onChange={e => setFormP(f => ({ ...f, bio: e.target.value }))} />
          <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
            <Btn I={Save} full onClick={saveProfile}>Sauvegarder</Btn>
            <Btn v="ghost" onClick={() => setEditing(false)}>Annuler</Btn>
          </div>
        </Glass>
      )}
    </div>
  );
};

export default EtuProfile;