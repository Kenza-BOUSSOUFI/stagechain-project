import React from 'react';
import { LayoutDashboard, FileText, UserPlus, Briefcase, Settings } from 'lucide-react';

const Sidebar = ({ role }) => {
  const menuItems = {
    admin: [
      { name: 'Dashboard', icon: <LayoutDashboard /> },
      { name: 'Gérer Comptes', icon: <UserPlus /> }, // SC1 - UserManager
    ],
    etudiant: [
      { name: 'Mon Profil', icon: <LayoutDashboard /> },
      { name: 'Matching Stages', icon: <Briefcase /> }, // SC3 - Matching
      { name: 'Mes Rapports', icon: <FileText /> }, // SC6 - Rapport[cite: 1]
    ],
    rh: [
      { name: 'Publier Offre', icon: <Briefcase /> }, // SC2 - OffreManager[cite: 1]
      { name: 'Candidatures', icon: <UserPlus /> },
    ]
  };

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 p-6">
      <h2 className="text-emerald-400 font-bold text-xl mb-10 text-center uppercase tracking-widest">StageChain</h2>
      <nav className="space-y-4">
        {menuItems[role]?.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer transition text-slate-400">
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;