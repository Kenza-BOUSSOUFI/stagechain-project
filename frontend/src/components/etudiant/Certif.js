// src/components/pages/etudiant/Certif.js
import React, { useState } from 'react';
import PH from '../ui/PH';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import Alrt from '../ui/Alrt';
import ML from '../ui/ML';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { Award, Download, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Tag from '../ui/Tag';
import { CheckCircle } from 'lucide-react';
import { 
  Search, Wallet, User, BookOpen, Mail, Send, Save, Clock, Phone, MapPin, Plus, Briefcase, Zap, Globe, Hexagon, Copy, ChevronRight, LogOut, Eye 
} from 'lucide-react';
const Certif = ({ user }) => {
  const { sign } = useMM();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const wallet = user?.wallet || '0x...';

  const printAtt = () => {
    window.print();
    toast('Impression lancée...', 'info');
  };

  return (
    <div className="fi">
      <PH title="Mon Attestation de Stage" />

      {step === 0 ? (
        <Glass style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Statut de l'attestation</div>
          {[
            { l: 'Rapport final validé', ok: true },
            { l: 'Signature RH', ok: true },
            { l: 'Signature Encadrant', ok: true },
            { l: 'Signature Admin', ok: false }
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: '1px solid var(--br)' }}>
              {r.ok ? <CheckCircle size={13} style={{ color: 'var(--ac)' }} /> : <Clock size={13} style={{ color: 'var(--am)' }} />}
              <span style={{ fontSize: 12, color: r.ok ? 'var(--ac)' : 'var(--t2)', flex: 1 }}>{r.l}</span>
              {r.ok ? <Tag label="OK" c="ac" /> : <Tag label="EN ATTENTE" c="am" />}
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <Btn I={Award} full onClick={() => sign("Génération de l'attestation", () => setStep(1))}>Générer l'attestation</Btn>
          </div>
        </Glass>
      ) : (
        <div className="fi" style={{ display: 'flex', gap: 18 }}>
          {/* Attestation imprimable */}
          <div id="attestation" style={{ flex: '0 0 auto', background: 'linear-gradient(135deg,#fff 0%,#f0f7f4 100%)', borderRadius: 22, padding: 30, textAlign: 'center', width: 295, boxShadow: '0 14px 44px rgba(0,0,0,0.22)' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: 7, fontFamily: 'monospace' }}>EMSI Marrakech</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#030f06', letterSpacing: '-0.02em', marginBottom: 4 }}>Attestation de Stage</div>
            <div style={{ fontSize: 8, color: '#22c07a', fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: 18, textTransform: 'uppercase' }}>✓ Certifiée</div>
            <div style={{ background: '#fff', padding: 12, borderRadius: 11, marginBottom: 14, display: 'inline-block', border: '1px solid #e2e8f0' }}>
              <QRCodeSVG value={`STAGECHAIN-${wallet}`} size={105} fgColor="#030f06" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 2 }}>{user?.nom || 'Amine Filali'}</div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 7 }}>Développeur Blockchain · TechCorp SA</div>
            <div style={{ fontSize: 11, color: '#22c07a', fontFamily: 'monospace', marginBottom: 5 }}>Note finale : 17.2 / 20</div>
            <div style={{ fontSize: 7, color: '#bbb', fontFamily: 'monospace', marginBottom: 4 }}>3 mois · Jan–Avr 2026</div>
            <div style={{ fontSize: 8, color: '#aaa', fontFamily: 'monospace', wordBreak: 'break-all' }}>{wallet?.slice?.(0, 22)}...</div>
          </div>

          <div style={{ flex: 1 }}>
            <Alrt type="success" message="Attestation générée ! Téléchargeable, imprimable et vérifiable via QR Code." />
            <Glass style={{ marginBottom: 12 }}>
              <ML label="Titulaire" value={user?.nom || 'Amine Filali'} />
              <ML label="Entreprise" value="TechCorp SA" />
              <ML label="Durée" value="3 mois (Jan–Avr 2026)" />
              <ML label="Note finale" value="17.2 / 20" color="var(--ac)" />
              <ML label="Date certification" value="20 Mar 2026" />
            </Glass>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
              <Btn I={Download} full onClick={() => toast('Téléchargement PDF...', 'info')}>Télécharger PDF</Btn>
              <Btn v="secondary" I={QrCode} full onClick={() => toast('QR Code disponible', 'info')}>Scanner QR</Btn>
              <Btn v="ghost" full onClick={printAtt}>🖨️ Imprimer</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certif;