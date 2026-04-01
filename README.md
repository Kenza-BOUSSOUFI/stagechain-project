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
  - Le **contenu de la convention** est **uploadé sur IPFS via Pinata** (JSON pin), puis le **CID** est enregistré **on-chain** dans `cidConvention`. Les boutons PDF ouvrent `https://ipfs.io/ipfs/{cid}`.

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
  - **Pinata** : `POST /api/ipfs/pin-json` — envoie un JSON à Pinata (`pinJSONToIPFS`) et retourne le **CID** (clé secrète `PINATA_JWT` côté serveur uniquement).
  - **MongoDB** (optionnel) : endpoints `/api/conventions` si `MONGODB_URI` est défini et Mongo tourne.

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
      - À l’acceptation : appel à `convention-api` pour **pinner sur Pinata**, puis `genererConvention(..., cid)` (SC3).
      - **Signer** la convention et **télécharger** via le lien IPFS public.

- **Étudiant – matching & convention**
  - `stagechain-front/src/components/etudiant/Matching.js`
    - Affichage des offres actives pour l’étudiant.
    - Possibilité de **postuler** à une offre.

  - `stagechain-front/src/components/etudiant/Convention.js`
    - Affichage de la convention associée à l’étudiant (si existante).
    - Possibilité de **signer** la convention.
    - Bouton PDF : ouverture du document sur **IPFS** à partir du CID on-chain.

- **Admin – conventions**
  - `stagechain-front/src/components/admin/AdminConv.js`
    - Vue admin université des conventions liées à son université.
    - Possibilité de **signer** la convention en tant qu’admin.
    - Signature admin et téléchargement via **IPFS** (CID on-chain).

---

### 3 bis. Upload Pinata (convention)

La clé Pinata ne doit **jamais** être dans le front React. Le flux est :

1. Le RH clique **Accepter** sur une candidature.
2. Le front appelle `POST http://localhost:4000/api/ipfs/pin-json` (voir `stagechain-front/src/components/hooks/conventionApi.js`).
3. `convention-api` appelle l’API Pinata avec le **JWT** serveur et reçoit un **CID**.
4. Le front envoie une transaction `ConventionManager.genererConvention(candidatureId, cid)`.

**Obtenir un JWT Pinata**

1. Compte sur [https://app.pinata.cloud](https://app.pinata.cloud).
2. API Keys → créer une clé avec la permission **pinning** (ou utiliser un JWT fourni par Pinata selon leur interface actuelle).
3. Copier le **JWT** dans `convention-api/.env` :

```env
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Variables utiles**

| Fichier | Variable | Rôle |
|---------|----------|------|
| `convention-api/.env` | `PINATA_JWT` | Obligatoire pour l’upload convention |
| `convention-api/.env` | `PORT` | Port de l’API (défaut `4000`) |
| `convention-api/.env` | `CORS_ORIGIN` | Origine autorisée du front (ex. `http://localhost:3000`) |
| `convention-api/.env` | `MONGODB_URI` | Optionnel (endpoints Mongo legacy) |
| `stagechain-front/.env` | `REACT_APP_CONVENTION_API_URL` | URL de l’API si différente de `http://localhost:4000` |

**Fichier `.env` : où et comment**

- Le JWT doit être dans **`convention-api/.env`** (même dossier que `index.js`), **pas** dans `stagechain-front/.env` et **pas** seulement dans `.env.example`.
- Après toute modification de `.env`, **redémarrer** le serveur : arrêter le terminal `npm start` de `convention-api`, puis relancer `npm start`.
- Vérifier que la ligne est bien au format `PINATA_JWT=eyJ...` (une seule ligne, sans guillemets autour du JWT, pas d’espace avant le nom de la variable).

**Erreur dans l’interface RH : « PINATA_JWT manquant dans .env »**

- Signification : le processus Node de `convention-api` ne voit pas `process.env.PINATA_JWT` (variable absente, vide, ou fichier `.env` au mauvais endroit).
- Correctifs typiques :
  1. Créer ou éditer `convention-api/.env` et y coller un **vrai** JWT Pinata (compte [Pinata](https://app.pinata.cloud) → API Keys → clé avec droit **pinning**).
  2. Ne pas laisser la valeur `your_pinata_jwt_here` si l’API la traite comme invalide ; surtout ne pas oublier de sauvegarder le fichier.
  3. Redémarrer `convention-api` après sauvegarde.
  4. Confirmer que l’API répond : [http://localhost:4000/health](http://localhost:4000/health).
  5. Si le front tourne sur un autre port ou une autre machine, aligner `REACT_APP_CONVENTION_API_URL` dans `stagechain-front/.env` et `CORS_ORIGIN` dans `convention-api/.env`.

**Sans compte Pinata (dev local uniquement)**

- Dans `convention-api/.env`, ajouter `ALLOW_MOCK_IPFS_CID=1` (sans `PINATA_JWT` valide). L’API renvoie alors un **CID factice** : la transaction `genererConvention` passe, mais le lien `ipfs.io` ne pointe vers aucun fichier réel. À utiliser seulement pour tester le flux ; en production, configurer un vrai `PINATA_JWT`.

**Comportement à l’acceptation RH**

- L’ordre côté code est : transaction blockchain **acceptation** de la candidature, puis appel **Pinata** pour obtenir le CID, puis transaction **`genererConvention`**. Si Pinata échoue après l’acceptation, la candidature peut rester **ACCEPTE** sans convention générée : corriger Pinata puis utiliser une **nouvelle** candidature (ou scénario de test) pour refaire un flux complet.

**Erreur Ethers : `missing revert data` / `CALL_EXCEPTION` sur `estimateGas` vers `OffreManager` (`0xe7f1…`)**

- Si le champ `data` de la transaction commence par `0xa4a49ab2` puis **32 octets à zéro**, il s’agit de `selectionnerEtudiant(0)` — **invalide** (aucune candidature n’a l’id `0` on-chain).
- Cause fréquente : mauvaise lecture de l’id candidature côté front ; le code utilise désormais l’id renvoyé par `getCandidaturesByOffre` comme référence. Après mise à jour, faire **Rafraîchir** sur la page candidatures.
- Autres causes possibles : mauvais réseau MetaMask (pas Hardhat 31337), contrat `OffreManager` non déployé à l’adresse attendue, ou wallet connecté **sans** rôle RH (revert `OffreManager: RH uniquement`).

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
    - `genererConvention(...)` — le 2e argument est le **CID IPFS** (non vide).
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

**D. API convention + Pinata (obligatoire pour l’acceptation RH avec upload IPFS)**

1. `cd convention-api`
2. `npm install`
3. Copier `.env.example` → `.env`
4. Renseigner au minimum :
   - `PINATA_JWT=...` (JWT Pinata, voir section **Upload Pinata** — obligatoire pour que RH puisse **Accepter** une candidature avec upload IPFS)
   - `CORS_ORIGIN=http://localhost:3000`
5. **MongoDB** : ne définir `MONGODB_URI` que si Mongo tourne. Sinon, laissez la ligne absente ou commentée dans `.env` (l’API démarre quand même pour Pinata ; la connexion Mongo a un timeout court si la ligne est présente mais le serveur est arrêté).
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
| API Pinata / Mongo (`convention-api/`) | Redémarrer `npm start` dans `convention-api` |

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
- Pour l’upload IPFS (Pinata) et l’API locale:
  - `convention-api/index.js` (Express, `POST /api/ipfs/pin-json`, Mongo optionnel).
  - `stagechain-front/src/components/hooks/conventionApi.js` (`pinConventionJsonToIpfs`).

---

### 7. Modifications récentes (résumé pour l’équipe)

- **Convention + IPFS (Pinata)** : à l’acceptation d’une candidature par le RH, le front appelle `convention-api` (`POST /api/ipfs/pin-json`) pour pinner un JSON sur IPFS ; le **CID** retourné est passé à `SC3_ConventionManager.genererConvention(candidatureId, cid)`.
- **`convention-api`** : service Express sur le port **4000** ; variable **`PINATA_JWT`** obligatoire pour cet upload ; **MongoDB** optionnel (`MONGODB_URI` commenté par défaut dans `.env.example`) ; timeout court sur la connexion Mongo si le serveur est absent.
- **`SC3_ConventionManager.sol`** : `genererConvention` exige un **CID non vide** (convention liée à un contenu IPFS).
- **Interface** : téléchargement / PDF convention via `https://ipfs.io/ipfs/{cid}` (étudiant, admin, RH).
- **Documentation** : section **Upload Pinata**, procédure de **relance** (section 5), **dépannage** erreur `PINATA_JWT manquant dans .env` (section 3 bis).

