// src/components/pages/admin/DashAdmin.js
import React, { useCallback, useRef, useState } from 'react';
import PH from '../ui/PH';
import SC from '../ui/SC';
import Card from '../ui/Card';
import Tag from '../ui/Tag';
import { Users, BookOpen, Activity, FileCheck } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { getConnectedWallet, getContractReadOnly, getConventionManagerContract, getOffreManagerContract } from '../hooks/useContract';
import { useChainDataRefresh } from '../hooks/useChainDataRefresh';

const StatutConvention = { COMPLETE: 4 };

const DashAdmin = () => {
  const toast = useToast();
  const errOnce = useRef(false);
  const [nbEtudiants, setNbEtudiants] = useState(0);
  const [nbEncadrants, setNbEncadrants] = useState(0);
  const [nbConvComplete, setNbConvComplete] = useState(0);
  const [nbConvEnCours, setNbConvEnCours] = useState(0);
  const [filieres, setFilieres] = useState([]);
  const [activity, setActivity] = useState([]);

  const loadDash = useCallback(async () => {
    try {
      const [accountC, offreC, convC, me] = await Promise.all([
        getContractReadOnly(),
        getOffreManagerContract(),
        getConventionManagerContract(),
        getConnectedWallet(),
      ]);

      const [students, encadrants] = await Promise.all([
        accountC.getStudentsByUniversite(me),
        accountC.getEncadrantsByUniversite(me),
      ]);

      setNbEtudiants(students.length);
      setNbEncadrants(encadrants.length);

      const filiereCount = {};
      for (const addr of students) {
        const u = await accountC.getUser(addr);
        const f = (u.filiere || '—').trim() || '—';
        filiereCount[f] = (filiereCount[f] || 0) + 1;
      }
      const topFil = Object.entries(filiereCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([f, n], i) => ({ f, n, c: ['ac', 'sk', 'am', 'vi'][i % 4] }));
      setFilieres(topFil);

      const offerIds = await offreC.getAllOffres();
      const seen = new Set();
      const convRows = [];
      for (const oIdBn of offerIds) {
        const candIds = await offreC.getCandidaturesByOffre(oIdBn);
        for (const cIdBn of candIds) {
          const c = await offreC.getCandidature(cIdBn);
          const etuUser = await accountC.getUser(c.etudiant);
          if (etuUser.universite.toLowerCase() !== me.toLowerCase()) continue;
          const conventionId = Number(await convC.conventionParCandidature(Number(c.id)));
          if (!conventionId || seen.has(conventionId)) continue;
          seen.add(conventionId);
          const cv = await convC.getConvention(conventionId);
          const label = `${(etuUser.prenom || '')} ${(etuUser.nom || '')}`.trim() || c.etudiant;
          convRows.push({
            id: conventionId,
            label,
            complete: Number(cv.statut) === StatutConvention.COMPLETE,
            ts: Number(cv.createdAt || 0),
          });
        }
      }
      const complete = convRows.filter((r) => r.complete).length;
      setNbConvComplete(complete);
      setNbConvEnCours(Math.max(0, convRows.length - complete));

      const sortedAct = [...convRows].sort((a, b) => b.ts - a.ts).slice(0, 4);
      const now = Date.now() / 1000;
      setActivity(
        sortedAct.map((r) => ({
          l: `${r.complete ? 'Convention complète' : 'Convention en cours'} — ${r.label}`,
          t: r.ts ? `${Math.max(0, Math.floor((now - r.ts) / 3600))} h` : '—',
          c: r.complete ? 'ac' : 'am',
        }))
      );
    } catch (err) {
      console.warn('[DashAdmin]', err);
      if (!errOnce.current) {
        errOnce.current = true;
        toast(err?.reason || err?.message || 'Impossible de charger le tableau de bord', 'error');
      }
    }
  }, [toast]);

  useChainDataRefresh(loadDash);

  return (
    <div className="fi">
      <PH title="Tableau de Bord" subtitle="Administration Universitaire — données on-chain (rafraîchissement auto)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
        <SC label="Étudiants inscrits" value={String(nbEtudiants)} I={Users} color="ac" />
        <SC label="Encadrants actifs" value={String(nbEncadrants)} I={BookOpen} color="sk" />
        <SC label="Conventions en cours" value={String(nbConvEnCours)} I={Activity} color="am" />
        <SC label="Conventions complètes" value={String(nbConvComplete)} I={FileCheck} color="vi" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Activité récente (conventions)</div>
          {activity.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucune convention pour votre université pour le moment.</div>
          )}
          {activity.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--br)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--${a.c})`, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--t2)' }}>{a.l}</span>
              </div>
              <span style={{ fontSize: 10, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{a.t}</span>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 13 }}>Répartition par filière (étudiants)</div>
          {filieres.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucun étudiant rattaché.</div>
          )}
          {filieres.map(({ f, n, c }, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--br)' }}>
              <span style={{ fontSize: 12, color: 'var(--t2)' }}>{f}</span>
              <Tag label={`${n} étudiant(s)`} c={c} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default DashAdmin;
