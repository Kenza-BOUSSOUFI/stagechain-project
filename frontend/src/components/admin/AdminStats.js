// src/components/pages/admin/AdminStats.js
import React from 'react';
import PH from '../ui/PH';
import SC from '../ui/SC';
import Glass from '../ui/Glass';
import Btn from '../ui/Btn';
import { Activity, FileCheck, CheckCircle, Building2 } from 'lucide-react';
import { useToast } from '../common/ToastProvider';
import { useMM } from '../hooks/useMM';
import { Download } from 'lucide-react';
import { 
  Search, Wallet, User, BookOpen, Mail, Send, Save, Clock, Phone, MapPin, Plus, Briefcase, Zap, Globe, Hexagon, Copy, ChevronRight, LogOut, Eye 
} from 'lucide-react';
const AdminStats = () => {
  const toast = useToast();

  return (
    <div className="fi">
      <PH title="Statistiques Globales">
        <Btn v="secondary" sm I={Download} onClick={() => toast('Export CSV !', 'success')}>Exporter CSV</Btn>
      </PH>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 13, marginBottom: 20 }}>
        <SC label="Stages actifs" value="89" I={Activity} color="ac" />
        <SC label="Conventions signées" value="76" I={FileCheck} color="sk" />
        <SC label="Taux complétion" value="78%" I={CheckCircle} color="vi" />
        <SC label="Entreprises partenaires" value="23" I={Building2} color="am" />
      </div>

      <Glass>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Stages par mois</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 90 }}>
          {[42, 68, 85, 60, 91, 118, 105, 132, 154, 139, 186, 198].map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: '100%', background: 'linear-gradient(180deg,var(--ac),rgba(0,240,160,0.3))', borderRadius: '3px 3px 0 0', height: `${(v / 198) * 100}%`, minHeight: 4 }} />
              <span style={{ fontSize: 7, fontFamily: 'var(--fm)', color: 'var(--t3)' }}>{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
};

export default AdminStats;