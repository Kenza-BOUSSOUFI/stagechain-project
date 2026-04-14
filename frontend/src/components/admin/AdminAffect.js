import React, { useState, useEffect } from 'react';
import Tag from '../ui/Tag';
import Card from '../ui/Card';
import Btn from '../ui/Btn';
import Inp from '../ui/Inp';
import Sel from '../ui/Sel';
import PH from '../ui/PH';
import { useToast } from '../common/ToastProvider';
import { Check, UserPlus, RefreshCw } from 'lucide-react';
import { 
  getAccountManagerContract, 
  getConventionManagerContract, 
  getConnectedWallet 
} from '../hooks/useContract';

const AdminAffect = () => {
  const toast = useToast();

  const [aff, setAff] = useState([]);
  const [encs, setEncs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ etudiantName: '', etudiantWallet: '', conventionId: 0, encadrantWallet: '', entreprise: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const accC = await getAccountManagerContract();
      const convC = await getConventionManagerContract();
      const me = await getConnectedWallet();

      // 1. Fetch Encadrants list
      const encAddrs = await accC.getEncadrantsByUniversite(me);
      const encArray = await Promise.all(encAddrs.map(async (a) => {
        const u = await accC.getUser(a);
        return { v: a, l: `${u.nom} ${u.prenom}` };
      }));
      setEncs(encArray);

      // 2. Fetch Students and their COMPLETE conventions
      const stdAddrs = await accC.getStudentsByUniversite(me);
      const newAff = [];

      for (const sw of stdAddrs) {
        const stU = await accC.getUser(sw);
        
        // Find convention
        let conv;
        try {
          conv = await convC.getConventionByEtudiant(sw);
        } catch(e) {
          conv = null;
        }

        // statut 4 is COMPLETE
        if (conv && Number(conv.statut) === 4) {
          const encadrantAddr = conv.encadrant !== '0x0000000000000000000000000000000000000000' ? conv.encadrant : null;
          let encName = null;
          if (encadrantAddr) {
            try {
              const eU = await accC.getUser(encadrantAddr);
              encName = `${eU.nom} ${eU.prenom}`;
            } catch(e) {}
          }

          let entreprise = '-';
          try {
            const rhU = await accC.getUser(conv.rh);
            entreprise = rhU.entreprise || '-';
          } catch(e) {}

          newAff.push({
            id: Number(conv.id),
            etudiantWallet: sw,
            etudiantName: `${stU.nom} ${stU.prenom}`,
            filiere: stU.filiere,
            encadrantWallet: encadrantAddr,
            encadrantName: encName,
            entreprise: entreprise,
            status: encadrantAddr ? 'ACTIF' : 'EN ATTENTE'
          });
        }
      }

      setAff(newAff.sort((a,b) => b.id - a.id));

    } catch (err) {
      toast(err?.reason || err?.message || 'Erreur lors du chargement des affectations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const affecter = async () => {
    if (!form.conventionId || !form.encadrantWallet) {
      toast('Veuillez sélectionner un encadrant', 'warning');
      return;
    }
    try {
      setSaving(true);
      const convC = await getConventionManagerContract();
      toast('Transaction en cours...', 'loading');
      const tx = await convC.affecterEncadrant(form.conventionId, form.encadrantWallet);
      await tx.wait();
      toast('Encadrant affecté avec succès !', 'success');
      setShowForm(false);
      setForm({ etudiantName: '', etudiantWallet: '', conventionId: 0, encadrantWallet: '', entreprise: '' });
      await loadData();
    } catch (err) {
      toast(err?.reason || err?.message || 'Échec de l\'affectation', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fi">
      <PH title="Affectations Encadrant / Étudiant">
        <Btn sm v="ghost" I={RefreshCw} onClick={loadData} disabled={loading}>
          Rafraîchir
        </Btn>
      </PH>

      <div style={{ marginBottom: 15, fontSize: 13, color: 'var(--t2)' }}>
        Seuls les étudiants ayant une <b>convention intégralement signée</b> (statut <i>COMPLETE</i>) peuvent recevoir un encadrant universitaire.
      </div>

      {showForm && (
        <Card style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ac)', marginBottom: 13 }}>Affecter un encadrant universitaire</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Inp label="Étudiant" value={form.etudiantName} disabled={true} />
            <Inp label="Entreprise" value={form.entreprise} disabled={true} />
            <Sel 
              label="Sélectionnez l'Encadrant" 
              value={form.encadrantWallet} 
              onChange={e => setForm(f => ({ ...f, encadrantWallet: e.target.value }))} 
              options={[{ v: '', l: '-- Choisir un encadrant --' }, ...encs]} 
            />
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <Btn I={Check} onClick={affecter} disabled={saving} loading={saving}>
              Confirmer l'affectation via MetaMask
            </Btn>
            <Btn v="ghost" onClick={() => setShowForm(false)} disabled={saving}>
              Annuler
            </Btn>
          </div>
        </Card>
      )}

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--t3)' }}>Chargement des conventions complètes...</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {aff.length === 0 && (
            <Card>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucun étudiant n'a encore validé sa convention à 100%.</div>
            </Card>
          )}
          {aff.map(a => (
            <Card key={a.id} style={{ padding: '13px 15px', border: a.status === 'EN ATTENTE' ? '1px dashed var(--brm)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--acd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--ac)' }}>
                  {a.etudiantName[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{a.etudiantName}</span>
                    <Tag label={a.status} c={a.status === 'ACTIF' ? 'ac' : 'am'} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t2)' }}>{a.filiere} · {a.entreprise}</div>
                  
                  {a.encadrantName && (
                    <div style={{ fontSize: 11, color: 'var(--sk)', marginTop: 1 }}>
                      Encadrant affecté : <b>{a.encadrantName}</b>
                    </div>
                  )}
                  {!a.encadrantName && (
                    <div style={{ fontSize: 11, color: 'var(--am)', marginTop: 1 }}>
                      ⚠ Aucun encadrant affecté
                    </div>
                  )}
                </div>
                
                {!a.encadrantName && (
                  <Btn sm I={UserPlus} onClick={() => { 
                    setForm({ 
                      etudiantName: a.etudiantName, 
                      etudiantWallet: a.etudiantWallet, 
                      entreprise: a.entreprise, 
                      conventionId: a.id, 
                      encadrantWallet: '' 
                    }); 
                    setShowForm(true); 
                  }}>
                    Affecter
                  </Btn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAffect;