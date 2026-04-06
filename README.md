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
  - Un **PDF de convention** est généré côté navigateur (**jsPDF**) et utilisé pour garder une trace de la convention.

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

- **Dossier `convention-api/`**
  - API Express locale (port **4000** par défaut).
  - **MongoDB Atlas** (Cloud) : stocke les métadonnées des conventions. La connexion utilise un lien standard (ex: `mongodb://...`) défini dans `MONGODB_URI` pour contourner les restrictions DNS des réseaux sécurisés (écoles, entreprises). L'IP doit être autorisée sur Atlas.

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
      - À l’acceptation : génération et signature de la convention (`genererConvention`).

- **Étudiant – matching & convention**
  - `stagechain-front/src/components/etudiant/Matching.js`
    - Affichage des offres actives pour l’étudiant.
    - Possibilité de **postuler** à une offre.

  - `stagechain-front/src/components/etudiant/Convention.js`
    - Affichage de la convention associée à l’étudiant (si existante).
    - Possibilité de **signer** la convention.

- **Admin – conventions**
  - `stagechain-front/src/components/admin/AdminConv.js`
    - Vue admin université des conventions liées à son université.
    - Possibilité de **signer** la convention en tant qu’admin.

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

### 5. Relancer l’application correctement (ordre recommandé)

À faire à chaque session de travail (ou après un redémarrage PC). Utiliser **un terminal par étape** si besoin.

**A. Arrêter les anciens processus (évite port 8545 / 3000 / 4000 déjà utilisés)**

- Fermer les terminaux où tournent encore `hardhat node`, `npm start` (front), `npm start` (convention-api).
- Sous Windows, si un port reste bloqué : Gestionnaire des tâches → terminer le `node.exe` concerné, ou identifier le PID avec `netstat -ano | findstr :8545` (idem pour `3000` et `4000`).

**B. Blockchain**

1. `cd blockchain`
2. `npm install` (première fois ou après pull)
3. `npx hardhat node` — laisser ce terminal ouvert (RPC `http://127.0.0.1:8545`, chainId **31337**).

**C. Déploiement des contrats**

1. Nouveau terminal : `cd blockchain`
2. `npx hardhat compile` (après modification d’un `.sol`)
3. `npx hardhat ignition deploy ignition/modules/StageChainDeploy.ts --network localhost --reset`
4. Si les adresses affichées changent : mettre à jour `DEFAULT_ADDRESSES` ou les variables `REACT_APP_*_ADDRESS` dans `stagechain-front` (voir `useContract.js`).

**D. API convention**

1. `cd convention-api`
2. `npm install`
3. Copier `.env.example` → `.env`
4. Renseigner au minimum :
   - `CORS_ORIGIN=http://localhost:3000`
5. **MongoDB Atlas** : Renseignez `MONGODB_URI` avec l'URL **Standard** de votre cluster (pas le format `+srv` si le réseau bloque le port DNS). **Important :** N'oubliez pas d'autoriser votre adresse IP (ou `0.0.0.0/0`) dans "Network Access" sur MongoDB Atlas, sinon vous aurez une erreur de type `ETIMEOUT` ou `Authentication failed`.
6. `npm start` — doit afficher `Convention API running on http://localhost:4000`
7. Vérification : ouvrir [http://localhost:4000/health](http://localhost:4000/health) (`ok: true`).

**E. Frontend**

1. `cd stagechain-front`
2. `npm install`
3. Si l’API n’est pas sur `http://localhost:4000`, créer `.env` avec :
   - `REACT_APP_CONVENTION_API_URL=http://localhost:4000`
4. `npm start` — [http://localhost:3000](http://localhost:3000)

**F. MetaMask**

- Réseau personnalisé : RPC `http://127.0.0.1:8545`, chain ID **31337**.
- Après un `--reset` du déploiement, les comptes / données on-chain repartent à zéro : réinscrire les rôles si nécessaire.

**Après modification du code**

| Zone modifiée | Actions typiques |
|---------------|------------------|
| Contrats Solidity (`blockchain/contracts/`) | `npx hardhat compile` puis redeploy `--network localhost --reset`, puis recharger le front |
| Front (`stagechain-front/`) | `npm start` (hot reload) ou `npm run build` pour prod |
| API Mongo (`convention-api/`) | Redémarrer `npm start` dans `convention-api` |

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
