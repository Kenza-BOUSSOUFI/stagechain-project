// src/data/accounts.js
// Comptes enregistrés (simulation blockchain)
export const ACCOUNTS = {
  '0xADMIN123456': { 
    role: 'admin',    
    nom: 'Dr. Yasser Saad Chadli', 
    email: 'admin@emsi.ma',     
    extra: {} 
  },
  '0xRH456789012': { 
    role: 'rh',       
    nom: 'Mme. Fatima Alaoui',     
    email: 'rh@techcorp.ma',    
    extra: { 
      entreprise: 'TechCorp SA', 
      secteur: 'Tech', 
      ville: 'Casablanca' 
    } 
  },
  '0xETU789012345': { 
    role: 'etudiant', 
    nom: 'Amine Filali',            
    email: 'amine@emsi.ma',     
    extra: { 
      filiere: 'Génie Logiciel', 
      niveau: 'Bac+4', 
      tel: '0661234567' 
    } 
  },
  '0xENC012345678': { 
    role: 'encadrant',
    nom: 'Dr. Hassan Moufid',       
    email: 'hassan@emsi.ma',    
    extra: { 
      departement: 'Informatique', 
      specialite: 'Blockchain' 
    } 
  },
};