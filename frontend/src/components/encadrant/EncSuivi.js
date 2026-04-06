// src/components/pages/encadrant/EncSuivi.js
import React, { useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import Txta from '../ui/Txta';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import ML from '../ui/ML';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { ThumbsUp, ThumbsDown, Eye, MessageSquare } from 'lucide-react';


const EncSuivi = () => {
  const toast = useToast();
  const { sign } = useMM();

  const [stags, setStags] = useState([
    {
      id: 1,
      nom: 'Amine Filali',
      sem: 6,
      total: 12,
      status: 'ACTIF',
      raps: [
        { id: 1, sem: 'Semaine 5', date: '05 Fév', text: "Développé le module d'authentification.", commentaire: '', statut: 'EN ATTENTE' },
        { id: 2, sem: 'Semaine 6', date: '12 Fév', text: "Intégration de l'API REST.", commentaire: '', statut: 'EN ATTENTE' }
      ]
    },
    {
      id: 2,
      nom: 'Sara Karimi',
      sem: 8,
      total: 12,
      status: 'EN ATTENTE',
      raps: [
        { id: 1, sem: 'Semaine 8', date: '19 Fév', text: "Tests de pénétration réseau.", commentaire: '', statut: 'EN ATTENTE' }
      ]
    },
  ]);

  const [commentM, setCommentM] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [rapM, setRapM] = useState(null);

  const valider = (sid, rid) => {
    sign('Validation du rapport', () => {
      setStags(s => s.map(x =>
        x.id === sid
          ? { ...x, raps: x.raps.map(r => r.id === rid ? { ...r, statut: 'VALIDÉ' } : r) }
          : x
      ));
    });
  };

  const rejeter = (sid, rid) => {
    sign('Refus du rapport', () => {
      setStags(s => s.map(x =>
        x.id === sid
          ? { ...x, raps: x.raps.map(r => r.id === rid ? { ...r, statut: 'REJETÉ' } : r) }
          : x
      ));
    });
  };

  const saveComment = () => {
    if (!commentText.trim()) {
      toast('Rédigez un commentaire !', 'error');
      return;
    }
    setStags(s => s.map(x =>
      x.id === commentM.sid
        ? { ...x, raps: x.raps.map(r => r.id === commentM.rid ? { ...r, commentaire: commentText } : r) }
        : x
    ));
    toast("Commentaire envoyé à l'étudiant", 'success');
    setCommentM(null);
    setCommentText('');
  };

  return (
    <div className="fi">
      <PH title="Suivi des Étudiants" />

      <div style={{ display: 'grid', gap: 12 }}>
        {stags.map(s => (
          <Glass key={s.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--skd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--sk)' }}>
                  {s.nom[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--t2)' }}>Semaine {s.sem} / {s.total}</div>
                </div>
              </div>
              <Tag label={s.status} c={s.status === 'ACTIF' ? 'ac' : 'am'} />
            </div>

            <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 99, marginBottom: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(s.sem / s.total) * 100}%`, background: 'linear-gradient(90deg,var(--ac),var(--sk))', borderRadius: 99 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 11 }}>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>Progression</span>
              <span style={{ fontSize: 10, color: 'var(--ac)', fontFamily: 'var(--fm)' }}>{Math.round((s.sem / s.total) * 100)}%</span>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 7 }}>Rapports à évaluer :</div>

            {s.raps.map(r => (
              <div key={r.id} style={{ padding: '8px 11px', background: 'var(--bg3)', border: '1px solid var(--br)', borderRadius: 'var(--r2)', marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t1)' }}>{r.sem}</span>
                    <span style={{ fontSize: 10, color: 'var(--t3)', marginLeft: 7 }}>· {r.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <Tag label={r.statut} c={r.statut === 'VALIDÉ' ? 'ac' : r.statut === 'REJETÉ' ? 'cr' : 'am'} />
                    <Btn sm v="ghost" I={Eye} onClick={() => setRapM({ stag: s, rap: r })}>Lire</Btn>
                    <Btn sm v="ghost" I={MessageSquare} onClick={() => { setCommentM({ sid: s.id, rid: r.id }); setCommentText(r.commentaire || ''); }}>Commenter</Btn>
                    {r.statut === 'EN ATTENTE' && (
                      <>
                        <Btn sm I={ThumbsDown} v="danger" onClick={() => rejeter(s.id, r.id)}>Refuser</Btn>
                        <Btn sm I={ThumbsUp} onClick={() => valider(s.id, r.id)}>Valider</Btn>
                      </>
                    )}
                  </div>
                </div>
                {r.commentaire && <div style={{ fontSize: 10, color: 'var(--sk)', fontStyle: 'italic', marginTop: 3 }}>💬 {r.commentaire}</div>}
              </div>
            ))}
          </Glass>
        ))}
      </div>

      {/* Modal Commentaire */}
      <Modal open={!!commentM} onClose={() => setCommentM(null)} title="Commenter le rapport">
        <Txta label="Commentaire pédagogique" placeholder="Votre retour..." rows={4} value={commentText} onChange={e => setCommentText(e.target.value)} />
        <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
          <Btn I={MessageSquare} full onClick={saveComment}>Envoyer</Btn>
          <Btn v="ghost" onClick={() => setCommentM(null)}>Annuler</Btn>
        </div>
      </Modal>

      {/* Modal Lecture Rapport */}
      <Modal open={!!rapM} onClose={() => setRapM(null)} title={`${rapM?.rap?.sem} — ${rapM?.stag?.nom}`}>
        {rapM && (
          <>
            <ML label="Date" value={rapM.rap.date} />
            <ML label="Statut" value={rapM.rap.statut} />
            <div style={{ margin: '15px 0 8px', fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--t2)', textTransform: 'uppercase' }}>Contenu du rapport</div>
            <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, padding: 12, background: 'var(--bg3)', borderRadius: 'var(--r2)' }}>
              {rapM.rap.text}
            </p>
            {rapM.rap.commentaire && (
              <>
                <div style={{ margin: '15px 0 8px', fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--sk)' }}>Votre commentaire</div>
                <p style={{ fontSize: 12, color: 'var(--sk)', fontStyle: 'italic' }}>{rapM.rap.commentaire}</p>
              </>
            )}
            <div style={{ marginTop: 12 }}>
              <Btn v="ghost" full onClick={() => setRapM(null)}>Fermer</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default EncSuivi;