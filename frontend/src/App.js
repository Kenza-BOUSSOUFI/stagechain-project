/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

// Styles
import GS from './components/styles/GlobalStyles';

// Toast & Providers
import { ToastProvider } from './components/common/ToastProvider';
import { AppProvider } from './components/context/AppContext';

// Pages principales
import HomePage from './components/pages/HomePage';
import AboutPage from './components/pages/AboutPage';
import AuthPage from './components/pages/AuthPage';

// Sidebar
import Sidebar from './components/common/Sidebar';

// === ADMIN ===
import DashAdmin from './components/admin/DashAdmin';
import AdminUsers from './components/admin/AdminUsers';
import AdminAffect from './components/admin/AdminAffect';
import AdminConv from './components/admin/AdminConv';
import AdminStats from './components/admin/AdminStats';
import AdminLitiges from './components/admin/AdminLitiges';

// === RH ===
import DashRH from './components/rh/DashRH';
import RhOffres from './components/rh/RhOffres';
import RhCandidats from './components/rh/RhCandidats';
import RhCertif from './components/rh/RhCertif';
import RhVerif from './components/rh/RhVerif';

// === ETUDIANT ===
import DashEtu from './components/etudiant/DashEtu';
import EtuProfile from './components/etudiant/EtuProfile';
import Matching from './components/etudiant/Matching';
import Candidature from './components/etudiant/Candidature';
import Convention from './components/etudiant/Convention';
import Rapport from './components/etudiant/Rapport';
import Certif from './components/etudiant/Certif';

// === ENCADRANT ===
import DashEnc from './components/encadrant/DashEnc';
import EncSuivi from './components/encadrant/EncSuivi';
import EvaluationEnc from './components/encadrant/EvaluationEnc';

function AppInner() {
  const [page, setPage] = useState('home'); // home | about | auth | app
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');

  const login = (u) => {
    setUser(u);
    setView('dashboard');
    setPage('app'); // Hna fin kankhwiw l-auth o nkhelliw l-app t-ban
  };

  const logout = () => {
    setUser(null);
    setPage('home');
    setView('dashboard');
  };

  const renderView = () => {
    // 1. Dashboard par défaut selon le rôle
    if (view === 'dashboard') {
      if (user?.role === 'admin')     return <DashAdmin />;
      if (user?.role === 'rh')        return <DashRH />;
      if (user?.role === 'etudiant')  return <DashEtu />;
      if (user?.role === 'encadrant') return <DashEnc />;
      // Rôle inconnu — ne jamais afficher admin par défaut
      return null;
    }

    // 2. Les autres vues
    const pages = {
      admin_users:    <AdminUsers />,
      admin_affect:   <AdminAffect />,
      admin_conv:     <AdminConv />,
      admin_stats:    <AdminStats />,
      admin_litiges:  <AdminLitiges />,

      rh_offres:      <RhOffres />,
      rh_candidats:   <RhCandidats />,
      rh_certif:      <RhCertif />,
      rh_verif:       <RhVerif />,

      etu_profile:    <EtuProfile user={user} />,
      matching:       <Matching />,
      candidature:    <Candidature />,
      convention:     <Convention />,
      rapport:        <Rapport />,
      certif:         <Certif user={user} />,

      enc_suivi:      <EncSuivi />,
      evaluation:     <EvaluationEnc />,
    };

    // Si la vue n'existe pas, retourner le dashboard du bon rôle
    if (!pages[view]) {
      setView('dashboard');
      return null;
    }

    return pages[view];
  };

  return (
    <>
      {page === 'home' && (
        <HomePage onConnect={() => setPage('auth')} onAbout={() => setPage('about')} />
      )}
      
      {page === 'about' && (
        <AboutPage onBack={() => setPage('home')} />
      )}
      
      {page === 'auth' && (
        <AuthPage 
          onBack={() => setPage('home')} 
          onLogin={login} // On passe la fonction login pour changer le state ici
        />
      )}

      {page === 'app' && user && (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
          <Sidebar view={view} setView={setView} user={user} onLogout={logout} />
          <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
            {renderView()}
          </main>
        </div>
      )}
    </>
  );
}

export default function StageChain() {
  return (
    <ToastProvider>
      <GS />
      <AppProvider>
        <AppInner />
      </AppProvider>
    </ToastProvider>
  );
}