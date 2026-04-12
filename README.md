# StageChain

Plateforme décentralisée de gestion de stages (Hardhat local + React + IPFS Pinata).

## Emplacement des dossiers

| Partie | Dossier |
|--------|---------|
| **Smart contracts (Solidity)** | `blockchain/` — contrats dans `blockchain/contracts/` (ex. `SC1_AccountManager.sol`, `SC2_OffreManager.sol`, `SC3_ConventionManager.sol`, …) |
| **Frontend (React)** | `frontend/` |
| **API fichiers / IPFS (Express)** | `api-files/` — Pinata (`/api/ipfs/*`), MongoDB optionnel pour l’index des conventions (`/api/conventions`) |

---

## Fonctionnalités actuelles (résumé)

Pour chaque point : rôle métier bref, puis **fichier** et **fonction** (ou équivalent) qui en porte la responsabilité.

### 1. Connexion wallet, réseau et chargement des contrats

- Vérification du chainId, instanciation ethers des contrats déployés.
- **Fichier :** `frontend/src/components/hooks/useContract.js` — fonctions `getProvider`, `getConnectedWallet`, `getOffreManagerContract`, `getConventionManagerContract`, `getContractReadOnly`, `fetchUserFromChain`, etc.

### 2. Authentification et inscription par rôle

- Saisie du wallet, inscription admin université / RH / (étudiant & encadrant créés par admin selon les écrans existants).
- **Fichier :** `frontend/src/components/pages/AuthPage.js` — logique de login / formulaires d’inscription.
- **Contrat :** `blockchain/contracts/SC1_AccountManager.sol` — `registerUniversite`, `registerRH`, `addStudent`, `addEncadrant`, `getUser`, `getRole`, `updateStudentProfile`.

### 3. Publication d’offres par le RH

- Champs alignés avec le formulaire : titre, domaine, compétences, durée (jours), nombre de places.
- **Fichier :** `frontend/src/components/rh/RhOffres.js` — `publish`, `loadOffres`.
- **Contrat :** `SC2_OffreManager.sol` — `publierOffre`.

### 4. Liste de toutes les offres actives pour l’étudiant + filtres (plus de matching)

- Toutes les offres `ACTIVE` sont listées ; filtres locaux : titre, domaine (liste identique à la publication RH), compétences (recherche texte), durée maximale en jours.
- **Fichier :** `frontend/src/components/etudiant/Matching.js` — `loadOffres`, `offresFiltrees` (via `useMemo`), UI des filtres.
- **Contrat :** `SC2_OffreManager.sol` — `getAllOffres`, `getOffre`.

### 5. Profil étudiant modifiable on-chain et université de rattachement

- L’admin qui crée l’étudiant fixe `universite` = son wallet (non modifiable par l’étudiant). L’étudiant met à jour nom, prénom, filière, contact, niveau, bio, compétences et langues via une transaction.
- **Fichier :** `frontend/src/components/etudiant/EtuProfile.js` — `loadProfile`, `saveOnChain` (appelle `getUniversite` pour afficher le nom de l’établissement).
- **Contrat :** `SC1_AccountManager.sol` — `addStudent` (rattachement), `updateStudentProfile`, `getUniversite`.

### 6. Candidature : CV et lettre de motivation sur IPFS, références on-chain

- Les PDF sont uploadés via **api-files** (SDK Pinata, IPFS public) ; seuls les **CID** sont passés à la transaction `postuler`.
- **Fichier :** `frontend/src/services/pinataService.js` — `uploadFileToIPFS` (appelle `api-files` / `pin-pdf`, JWT Pinata côté serveur).
- **Fichier :** `frontend/src/components/etudiant/Matching.js` — `confirmPostuler` (upload puis `contract.postuler`).
- **Contrat :** `SC2_OffreManager.sol` — `postuler(_offreId, _cidCV, _cidLM)`.

### 7. Suivi des candidatures côté étudiant

- Liste on-chain (offre, entreprise, date, statut) ; pas d’affichage CV/LM sur cet écran (fichiers uniquement à la postulation).
- **Fichier :** `frontend/src/components/etudiant/Candidature.js` — `loadCandidatures`.
- **Contrat :** `SC2_OffreManager.sol` — `getCandidaturesByEtudiant`, `getCandidature`, `getOffre`.

### 8. Gestion des candidatures côté RH (accepter / refuser)

- **Fichier :** `frontend/src/components/rh/RhCandidats.js` — `loadCandidatures`, `handle` (acceptation / refus).
- **Contrat :** `SC2_OffreManager.sol` — `selectionnerEtudiant`, `refuserCandidature`.

### 9. Convention de stage : génération JSON sur IPFS + enregistrement du CID on-chain

- À l’acceptation, le JSON descriptif est épinglé sur IPFS via l’API locale, puis le CID est passé à `genererConvention`.
- **Fichier :** `frontend/src/components/hooks/conventionApi.js` — `pinConventionJsonToIpfs` (URL de base : `REACT_APP_API_FILES_URL` ou `REACT_APP_CONVENTION_API_URL`).
- **Fichier :** `frontend/src/components/rh/RhCandidats.js` — dans `handle`, après `selectionnerEtudiant`, appel `pinConventionJsonToIpfs` puis `convC.genererConvention`.
- **API :** `api-files/index.js` — route `POST /api/ipfs/pin-json`.
- **Contrat :** `SC3_ConventionManager.sol` — `genererConvention` (le `admin` associé est l’admin université de l’étudiant, lu depuis `AccountManager`).

### 10. Signatures tripartites (étudiant, RH, admin université)

- Les trois signatures mettent à jour l’état on-chain ; le document détaillé reste le JSON sur IPFS (CID stocké dans la convention).
- **Étudiant —** `frontend/src/components/etudiant/Convention.js` — `signEtudiant` → `signerParEtudiant`.
- **RH —** `frontend/src/components/rh/RhCandidats.js` — `signerConventionRH` → `signerParRH`.
- **Admin université —** `frontend/src/components/admin/AdminConv.js` — `signAdmin` → `signerParAdmin`.
- **Contrat :** `SC3_ConventionManager.sol` — `signerParEtudiant`, `signerParRH`, `signerParAdmin`, `_updateStatut` (convention `COMPLETE` lorsque les trois sont signées).

### 11. Visualisation du JSON de convention (IPFS)

- **Fichier :** `frontend/src/components/common/ConventionViewer.js` — chargement `https://ipfs.io/ipfs/{cid}` et rendu lisible / impression.

### 12. API `api-files` (pinning serveur, optionnel pour PDF)

- Utile pour le JSON de convention depuis le front ; endpoint PDF disponible pour d’autres usages (multipart `file`).
- **Fichier :** `api-files/index.js` — `POST /api/ipfs/pin-json`, `POST /api/ipfs/pin-pdf`, `GET /health`.

---

## Démarrage rapide

1. **Blockchain :** `cd blockchain` → `npm install` → `npx hardhat node` (terminal dédié). Puis **`npm run deploy:ignition-local`** : compile/déploie sur localhost et met à jour automatiquement **`frontend/src/data/deployedLocal.json`** (le front lit ce fichier pour éviter les erreurs d’adresse de contrat). Alternative manuelle : `npx hardhat compile` puis `npx hardhat ignition deploy … --reset` puis `npm run sync:frontend`.
2. **API fichiers (obligatoire pour CV/LM et conventions IPFS) :** `cd api-files` → `npm install` → copier `.env.example` en `.env` (`PINATA_JWT`, `ALLOW_MOCK_IPFS_CID=0` pour Pinata réel) → **`npm start`** (port **4000**). Si vous ne lancez que React, le proxy affichera **ECONNREFUSED** : rien n’écoute sur 4000.
3. **Frontend :** `cd frontend` → `npm install` → `npm start` (port 3000). Les appels `/api/...` sont proxifiés vers **:4000** ; **`api-files` doit donc tourner en parallèle.**
4. **Démarrer front + API en une commande :**
   - **Depuis `frontend/` :** `npm run start:with-api` (lance `api-files` sur 4000 et React sur 3000).
   - **Depuis la racine du dépôt :** `npm install` puis **`npm run dev`** (même effet).

Le **JWT Pinata** reste dans **`api-files/.env`** (`PINATA_JWT`), pas dans le front.

MetaMask : réseau local `http://127.0.0.1:8545`, chain ID **31337**.

---

## Documentation complémentaire

- Détails Hardhat / tests : `blockchain/README.md`
- Ancienne mention `convention-api` : le dossier a été renommé en **`api-files`**. La convention reste **CID on-chain** + JSON sur **IPFS** ; une **copie d’index** peut aller dans MongoDB (`/api/conventions`) si `MONGODB_URI` est défini.
