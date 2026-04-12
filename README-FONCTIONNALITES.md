# StageChain — Fonctionnalités réalisées (état actuel)

Ce document complète le `README.md` principal : il liste les **fonctionnalités opérationnelles**, les **fichiers / fonctions** côté front, le **rôle de `api-files`**, et l’organisation **smart contracts** vs **« backend »**.

---

## 1. Où se trouve quoi dans le dépôt ?

| Zone | Dossier principal | Rôle |
|------|-------------------|------|
| **Frontend** | `frontend/` | Application React (MetaMask, appels contrats, UI par rôle). |
| **« Backend » applicatif** | `api-files/` | **Seul serveur HTTP Node** du projet : IPFS (Pinata), santé du service, index Mongo optionnel pour conventions. **Pas** de serveur REST pour la logique métier des stages : celle-ci est dans les **contrats**. |
| **Smart contracts** | `blockchain/contracts/` | Logique on-chain (comptes, offres, candidatures, conventions, suivi, rapports, attestations). |
| **Blockchain (outillage)** | `blockchain/` (hors `contracts/`) | Hardhat : `ignition/` (déploiement), `scripts/` (ex. sync des adresses vers le front), `test/`, `hardhat.config.ts`. |

### Arborescence utile (extraits)

**Frontend**

- `frontend/src/App.js` — routage interne par `view` + rôle (`renderView`, `login`, `logout`).
- `frontend/src/components/pages/AuthPage.js` — authentification / inscription.
- `frontend/src/components/hooks/useContract.js` — provider MetaMask, adresses contrats, factories (`getOffreManagerContract`, `getConventionManagerContract`, etc.).
- `frontend/src/components/hooks/useChainDataRefresh.js` — rafraîchissement périodique des données chain (tableaux de bord + pages listées).
- `frontend/src/components/hooks/conventionApi.js` — appels HTTP vers `api-files` pour JSON convention + upsert Mongo optionnel.
- `frontend/src/services/pinataService.js` — `uploadFileToIPFS` (PDF CV/LM via `api-files`).
- `frontend/src/config/apiFilesBase.js` — URL de base `api-files` (`REACT_APP_API_FILES_URL`).
- `frontend/src/data/deployedLocal.json` — adresses des contrats après déploiement local (synchronisé par script Hardhat).

**Smart contracts**

- `blockchain/contracts/SC1_AccountManager.sol`
- `blockchain/contracts/SC2_OffreManager.sol`
- `blockchain/contracts/SC3_ConventionManager.sol`
- `blockchain/contracts/SC4_SuiviManager.sol`
- `blockchain/contracts/SC5_RapportManager.sol`
- `blockchain/contracts/SC6_CertifManager.sol`

**api-files (backend fichiers / IPFS)**

- `api-files/index.js` — serveur Express, routes `/health`, `/api/ipfs/*`, `/api/conventions*`.
- `api-files/.env` — `PINATA_JWT`, `PORT`, `CORS_ORIGIN`, `MONGODB_URI` (optionnel), etc.

---

## 2. Rôle de **`api-files`**

- **Sécurité** : le **JWT Pinata** reste **côté serveur** (`api-files/.env`), jamais exposé dans le navigateur.
- **IPFS** : envoi des fichiers / JSON vers **Pinata Cloud** (ou mode mock si `ALLOW_MOCK_IPFS_CID=1` sans JWT valide).
- **Proxy technique** : le front React appelle `api-files` (souvent via le proxy CRA vers le port **4000**) pour obtenir des **CID** ensuite stockés **on-chain** (CV, lettre de motivation, JSON de convention).
- **MongoDB (optionnel)** : si `MONGODB_URI` est défini, routes pour **indexer / lire** des métadonnées de conventions (`POST/GET /api/conventions`…). Sans URI, ces routes répondent **503**.

Les **règles métier** (qui peut postuler, accepter, signer, etc.) sont dans les **contrats Solidity** ; `api-files` ne les remplace pas.

---

## 3. Fonctionnalités réalisées — fichier & fonction / contrat

Légende : **Chain** = implémenté on-chain + front réel. **UI démo** = interface présente mais données ou flux principalement simulés / locaux.

### 3.1 Connexion wallet, réseau, contrats

| Fonctionnalité | Fichier (frontend) | Fonction / élément clé |
|----------------|-------------------|-------------------------|
| Connexion MetaMask, vérification `chainId`, instanciation ethers | `frontend/src/components/hooks/useContract.js` | `getProvider`, `getSigner`, `getConnectedWallet`, `getContractReadOnly`, `getOffreManagerContract`, `getConventionManagerContract`, `getAccountManagerContract`, `getSuiviManagerContract`, `getRapportManagerContract`, `getCertifManagerContract` |
| Lecture profil + rôle depuis la chaîne | `frontend/src/components/hooks/useContract.js` | `fetchUserFromChain` |

### 3.2 Authentification & inscription par rôle

| Fonctionnalité | Fichier | Fonction / élément clé |
|----------------|---------|-------------------------|
| Choix du rôle, wallet, popup MetaMask | `frontend/src/components/pages/AuthPage.js` | `handleRoleSelect`, `handleWalletCheck`, `handleMMConfirm` |
| Connexion après détection utilisateur | `frontend/src/components/pages/AuthPage.js` | `handleDirectLogin` |
| Inscription admin université / RH (transactions) | `frontend/src/components/pages/AuthPage.js` | `handleRegister` (appelle `registerUniversite`, `registerRH` sur le contrat AccountManager) |
| Contrat : comptes & rôles | `blockchain/contracts/SC1_AccountManager.sol` | `registerUniversite`, `registerRH`, `addStudent`, `addEncadrant`, `getUser`, `getRole`, `updateStudentProfile`, etc. |

*(Étudiant / encadrant : créés par l’admin via l’app ; pas d’auto-inscription chain dans le même flux que admin/RH.)*

### 3.3 Admin université — comptes & conventions

| Fonctionnalité | Fichier | Fonction / élément clé |
|----------------|---------|-------------------------|
| Liste + création étudiants / encadrants (on-chain) | `frontend/src/components/admin/AdminUsers.js` | `loadUsers`, `add` |
| Tableau de bord stats on-chain + rafraîchissement | `frontend/src/components/admin/DashAdmin.js` | `loadDash` + `useChainDataRefresh` |
| Conventions de l’université, signature admin | `frontend/src/components/admin/AdminConv.js` | `loadConventions`, `signAdmin` |
| **UI démo** : affectations, stats globales, litiges | `frontend/src/components/admin/AdminAffect.js`, `AdminStats.js`, `AdminLitiges.js` | état local / maquettes, pas de contrat dédié câblé |

### 3.4 RH — offres & candidatures & convention

| Fonctionnalité | Fichier | Fonction / élément clé |
|----------------|---------|-------------------------|
| Publier / lister ses offres | `frontend/src/components/rh/RhOffres.js` | `loadOffres`, `publish` |
| Tableau de bord RH (métriques chain) | `frontend/src/components/rh/DashRH.js` | `loadDash` |
| Liste candidatures, accepter / refuser, convention IPFS + chain | `frontend/src/components/rh/RhCandidats.js` | `loadCandidatures`, `handle`, `downloadConvention` ; appels `pinConventionJsonToIpfs`, `upsertConventionDocument` depuis `conventionApi.js` |
| **UI démo** : attestations RH, vérification attestation | `frontend/src/components/rh/RhCertif.js`, `RhVerif.js` | interactions locales / simulation |

**Contrats**

| Fonctionnalité | Fichier Solidity | Fonctions typiques |
|----------------|------------------|-------------------|
| Offres & candidatures | `blockchain/contracts/SC2_OffreManager.sol` | `publierOffre`, `postuler`, `selectionnerEtudiant`, `refuserCandidature`, `getOffre`, `getAllOffres`, `getCandidaturesByEtudiant`, `getMetriquesRH`, … |
| Conventions | `blockchain/contracts/SC3_ConventionManager.sol` | `genererConvention`, `signerParEtudiant`, `signerParRH`, `signerParAdmin`, `getConvention`, … |

### 3.5 Étudiant — profil, offres, candidatures, convention

| Fonctionnalité | Fichier | Fonction / élément clé |
|----------------|---------|-------------------------|
| Profil on-chain + université | `frontend/src/components/etudiant/EtuProfile.js` | `loadProfile`, `saveOnChain` |
| Liste offres actives, filtres, postulation + upload IPFS | `frontend/src/components/etudiant/Matching.js` | `loadOffres`, `confirmPostuler` ; `uploadFileToIPFS` (`pinataService.js`) |
| Mes candidatures | `frontend/src/components/etudiant/Candidature.js` | `loadCandidatures` |
| Ma convention, signature étudiant | `frontend/src/components/etudiant/Convention.js` | `loadConvention`, `signEtudiant` |
| Tableau de bord étudiant | `frontend/src/components/etudiant/DashEtu.js` | `loadDash` |
| Visualisation JSON convention (IPFS) | `frontend/src/components/common/ConventionViewer.js` | chargement par CID |
| **UI démo** : rapports hebdo / final, attestation | `frontend/src/components/etudiant/Rapport.js`, `Certif.js` | état local, pas branché sur SC4/SC5/SC6 dans ces écrans |

### 3.6 Encadrant

| Fonctionnalité | Fichier | Fonction / élément clé |
|----------------|---------|-------------------------|
| Tableau de bord encadrant (chain) | `frontend/src/components/encadrant/DashEnc.js` | `loadDash` |
| **UI démo** : suivi étudiants, évaluation | `frontend/src/components/encadrant/EncSuivi.js`, `EvaluationEnc.js` | état local |

**Contrats (suivi / rapports / certif — présents on-chain, intégration UI partielle)**

- `blockchain/contracts/SC4_SuiviManager.sol` — rapports d’avancement (`deposerRapport`, `validerRapport`, …).
- `blockchain/contracts/SC5_RapportManager.sol` — rapport final.
- `blockchain/contracts/SC6_CertifManager.sol` — attestations.

### 3.7 api-files — routes & handlers (dans `index.js`)

| Route | Rôle |
|-------|------|
| `GET /health` | Vérifier que le service tourne ; liste des routes utiles. |
| `POST /api/ipfs/pin-json` | Épinglage JSON (ex. convention) → CID Pinata. |
| `POST /api/ipfs/pin-pdf` | Upload multipart PDF → CID Pinata. |
| `POST /api/conventions`, `GET /api/conventions/:id` | Index / lecture métadonnées conventions en Mongo (**optionnel**). |

Fonctions internes notables : `resolvePinataContext`, `createPinataClient`, `pinataErrorPayload`, middleware `multer` pour PDF.

### 3.8 Front ↔ api-files (fichiers dédiés)

| Fichier | Export / rôle |
|---------|----------------|
| `frontend/src/services/pinataService.js` | `uploadFileToIPFS` → `POST /api/ipfs/pin-pdf` |
| `frontend/src/components/hooks/conventionApi.js` | `pinConventionJsonToIpfs` → `POST /api/ipfs/pin-json` ; `upsertConventionDocument` → Mongo via `api-files` |

---

## 4. Rafraîchissement « temps réel » (données déjà stockées)

| Fichier | Mécanisme |
|---------|-----------|
| `frontend/src/components/hooks/useChainDataRefresh.js` | Polling ~12 s + rafraîchissement au retour sur l’onglet. |
| Tableaux de bord + pages listées section 3 | Import de `useChainDataRefresh` avec le `load*` concerné ; pour certaines listes, le spinner de chargement n’est affiché qu’au **premier** chargement (ref `pollRef` / `isPoll`). |

---

## 5. Tests & déploiement (rappel)

| Élément | Emplacement |
|---------|-------------|
| Tests Hardhat | `blockchain/test/Stagechain.test.ts` |
| Module déploiement Ignition | `blockchain/ignition/modules/StageChainDeploy.ts` |
| Sync adresses → front | `blockchain/scripts/sync-frontend-addresses.js` → met à jour `frontend/src/data/deployedLocal.json` |

---

*Document généré pour décrire l’état du dépôt au moment de la rédaction ; les écrans marqués **UI démo** peuvent être branchés sur SC4–SC6 dans une itération ultérieure.*
