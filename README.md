## StageChain – Guide projet pour l’équipe

Plateforme décentralisée de gestion des stages (local Hardhat + React).

---

### 1. Phases déjà implémentées

- **Connexion wallet & vérification réseau**
  - Connexion via MetaMask sur le réseau **Hardhat local (chainId 31337)**.
  - Vérification que les contrats sont bien déployés aux adresses du fichier `blockchain/ignition/deployments/chain-31337/deployed_addresses.json`.
  - Si un contrat est introuvable → message clair: « Contrat X introuvable… Redéployez puis rechargez le front ».

- **Gestion des comptes & rôles (SC1_AccountManager.sol)**
  - Rôles gérés: **étudiant, encadrant, RH, admin université**.
  - Récupération du rôle et des infos utilisateur depuis la blockchain.
  - Si le wallet connecté n’est pas enregistré → affichage d’une **fenêtre d’inscription** adaptée au rôle choisi.

- **Inscription Admin université & RH**
  - Formulaires enrichis avec des champs plus réalistes :
    - Admin université: `nom`, `ville`, `adresse`, `email`, `telephone`, `siteWeb`.
    - RH: `nom`, `prenom`, `entreprise`, `poste`, `email`, `telephone`, `ville`.
  - Ces champs sont **stockés on-chain** dans `SC1_AccountManager.sol` et exposés au front.

- **Gestion des comptes étudiants & encadrants (Admin)**
  - L’admin université peut **créer des comptes étudiant et encadrant** (wallet + nom + prénom + filière).
  - Liste des étudiants/encadrants de l’université chargée **depuis la blockchain**.

- **Gestion des offres de stage (RH – SC2_OffreManager.sol)**
  - RH peut publier des offres avec: `titre`, `domaine`, `competences`, `dureeJours`, `nbPlaces`.
  - Affichage des offres existantes côté RH (filtrées par RH connecté) et côté étudiant (offres actives).

- **Candidatures & sélection (SC2_OffreManager.sol)**
  - Étudiant peut **postuler** à une offre.
  - RH voit la liste des candidatures, peut **accepter** ou **refuser**.

- **Conventions de stage (SC3_ConventionManager.sol)**
  - Lorsqu’un étudiant est accepté, le RH **génère automatiquement une convention** liée à l’offre.
  - La convention peut être **signée** par:
    - l’étudiant,
    - le RH,
    - l’admin université.
  - La signature est possible même si aucun encadrant n’est encore affecté.
  - La convention est associée à un **CID IPFS** (fichier de convention stocké sur IPFS / Pinata dans la future intégration complète).

---

### 2. Architecture globale du projet

- **Dossier `blockchain/`**
  - Projet Hardhat (Solidity, tests, déploiement).
  - Contrats principaux utilisés actuellement:
    - `SC1_AccountManager.sol` : comptes, rôles, profils (admin, RH, étudiant, encadrant).
    - `SC2_OffreManager.sol` : offres de stage et candidatures.
    - `SC3_ConventionManager.sol` : conventions de stage et signatures.
  - **Ignition** (déploiement) :
    - `ignition/deployments/chain-31337/deployed_addresses.json` : adresses des contrats sur le réseau local Hardhat.

- **Dossier `stagechain-front/`**
  - Application React (Create React App).
  - Intégration Web3 via `ethers.js` et MetaMask.
  - Rôle principal: interface utilisateur pour admin université, RH et étudiant.

---

### 3. Fichiers front importants

- **Hooks Web3**
  - `stagechain-front/src/components/hooks/useContract.js`
    - Centralise la connexion à MetaMask (provider + signer).
    - Expose les fonctions pour obtenir les contrats:
      - `getAccountManagerContract()`
      - `getOffreManagerContract()`
      - `getConventionManagerContract()`
      - etc.
    - Vérifie:
      - le **chainId** MetaMask (`EXPECTED_CHAIN_ID`),
      - la présence du bytecode des contrats (`ensureContractDeployed`).
    - Fonction utilitaire:
      - `fetchUserFromChain(walletAddress)` pour récupérer le profil utilisateur complet.

- **Authentification & inscription**
  - `stagechain-front/src/components/pages/AuthPage.js`
    - Gère:
      - la **saisie manuelle** de l’adresse wallet,
      - la **vérification stricte** que le wallet saisi = wallet MetaMask actif,
      - la sélection du rôle (étudiant / encadrant / RH / admin),
      - l’affichage des formulaires d’inscription pour admin université et RH,
      - la redirection selon le rôle après login.

  - `stagechain-front/src/components/common/MMPopup.js`
    - Popup de connexion MetaMask avec les textes adaptés au réseau **Hardhat local (31337)**.

- **Administration – gestion des utilisateurs**
  - `stagechain-front/src/components/admin/AdminUsers.js`
    - Interface admin université:
      - création de comptes **étudiant** et **encadrant**,
      - affichage des étudiants/encadrants liés à l’université (on-chain).

- **RH – gestion des offres et candidats**
  - `stagechain-front/src/components/rh/RhOffres.js`
    - Liste des offres du RH connecté (données depuis `SC2_OffreManager.sol`).
    - Formulaire de création d’offre.

  - `stagechain-front/src/components/rh/RhCandidats.js`
    - Liste des candidatures reçues.
    - Actions:
      - **Accepter** / **refuser** une candidature (SC2).
      - **Générer** et **signer** la convention (SC3).
      - **Télécharger** la convention via son CID IPFS.

- **Étudiant – matching & convention**
  - `stagechain-front/src/components/etudiant/Matching.js`
    - Affichage des offres actives pour l’étudiant.
    - Possibilité de **postuler** à une offre.

  - `stagechain-front/src/components/etudiant/Convention.js`
    - Affichage de la convention associée à l’étudiant (si existante).
    - Possibilité de **signer** la convention.
    - Lien pour **télécharger** la convention (IPFS).

- **Admin – conventions**
  - `stagechain-front/src/components/admin/AdminConv.js`
    - Vue admin université des conventions liées à son université.
    - Possibilité de **signer** la convention en tant qu’admin.
    - Lien de téléchargement IPFS.

---

### 4. Fichiers blockchain importants

- `blockchain/contracts/SC1_AccountManager.sol`
  - Définit la structure `User` (wallet, rôle, nom, prénom, filière, entreprise, email, téléphone, poste, ville, université, isActive, registeredAt).
  - Fonctions clés:
    - `getRole(address)`
    - `getUser(address)`
    - `registerUniversite(...)`
    - `registerRH(...)`
    - `addStudent(...)`
    - `addEncadrant(...)`

- `blockchain/contracts/SC2_OffreManager.sol`
  - Gestion des offres et candidatures:
    - `publierOffre(...)`
    - `getAllOffres()`, `getOffre(...)`
    - `postuler(...)`
    - `selectionnerEtudiant(...)`
    - `refuserCandidature(...)`

- `blockchain/contracts/SC3_ConventionManager.sol`
  - Gestion des conventions:
    - `genererConvention(...)`
    - `getConventionByEtudiant(...)`
    - `signerParEtudiant(...)`
    - `signerParRH(...)`
    - `signerParAdmin(...)`
  - Les signatures ne bloquent plus si aucun encadrant n’est encore affecté.

- `blockchain/ignition/deployments/chain-31337/deployed_addresses.json`
  - Contient les **adresses de déploiement locales** des contrats.
  - À utiliser pour mettre à jour les adresses par défaut dans `useContract.js` si besoin.

---

### 5. Comment lancer le projet (rappel rapide)

Dans le dossier racine `stagechain-project-test` :

1. **Installer les dépendances (une seule fois)**
   - Dans `blockchain/` : `npm install`
   - Dans `stagechain-front/` : `npm install`

2. **Démarrer le nœud Hardhat**
   - Dans `blockchain/` :
     - `npx hardhat node`

3. **Déployer les contrats**
   - Dans un autre terminal, toujours dans `blockchain/` :
     - `npx hardhat ignition deploy ignition/modules/StageChainDeploy.ts --network localhost --reset`

4. **Lancer le front**
   - Dans `stagechain-front/` :
     - `npm start`

---

### 6. Partage avec les collègues

Pour comprendre ou modifier le projet, les collègues peuvent commencer par :
- Lire **ce `README.md`** (racine) pour une vue d’ensemble.
- Lire `blockchain/README.md` pour les détails blockchain (tests, architecture complète).
- Lire `stagechain-front/src/components/hooks/useContract.js` pour comprendre **comment le front parle aux contrats**.
- Explorer ensuite les pages:
  - `AuthPage.js` (authentification/inscription),
  - `AdminUsers.js` et `AdminConv.js` (admin),
  - `RhOffres.js` et `RhCandidats.js` (RH),
  - `Matching.js` et `Convention.js` (étudiant).

