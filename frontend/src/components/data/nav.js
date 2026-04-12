// src/data/nav.js
export const NAV = {
  admin: [
    { id: 'dashboard',     l: 'Tableau de Bord' },
    { id: 'admin_users',   l: 'Gestion des Comptes' },
    { id: 'admin_affect',  l: 'Affectations' },
    { id: 'admin_conv',    l: 'Conventions de Stage' },
    { id: 'admin_stats',   l: 'Statistiques' },
    { id: 'admin_litiges', l: 'Litiges & Arbitrage' }
  ],
  rh: [
    { id: 'dashboard',    l: 'Tableau de Bord' },
    { id: 'rh_offres',    l: 'Mes Offres' },
    { id: 'rh_candidats', l: 'Candidatures' },
    { id: 'rh_certif',    l: 'Attestations' },
    { id: 'rh_verif',     l: 'Vérifier Attestation' }
  ],
  etudiant: [
    { id: 'dashboard',   l: 'Tableau de Bord' },
    { id: 'etu_profile', l: 'Mon Profil' },
    { id: 'matching',    l: 'Offres de stage' },
    { id: 'candidature', l: 'Mes Candidatures' },
    { id: 'convention',  l: 'Ma Convention' },
    { id: 'rapport',     l: 'Mes Rapports' },
    { id: 'certif',      l: 'Mon Attestation' }
  ],
  encadrant: [
    { id: 'dashboard',  l: 'Tableau de Bord' },
    { id: 'enc_suivi',  l: 'Suivi des Étudiants' },
    { id: 'evaluation', l: 'Évaluer les Rapports' }
  ],
};

export default NAV;