# StageChain

> Plateforme décentralisée de gestion des stages sur la Blockchain  
> EMSI Marrakech — Filière CyberSécurité & Infrastructure réseau  
> Equipe : Boussoufi Kenza . Marzak Amena . Lakbita Fatimaezzahra .   
> Encadrant : Pr. Yasser Saad Chadli

---

## Présentation

StageChain est une DApp (application décentralisée) basée sur Ethereum qui digitalise et certifie l'intégralité du cycle de vie d'un stage universitaire : de la candidature jusqu'à l'attestation certifiée avec QR Code.

---

## Stack Technologique

| Composant       | Technologie                          |
|-----------------|--------------------------------------|
| Blockchain      | Ethereum (Sepolia testnet)           |
| Smart Contracts | Solidity 0.8.28                      |
| Framework       | Hardhat v3                           |
| Langage         | TypeScript                           |
| Tests           | Mocha + Chai                         |
| Auth            | MetaMask (wallet Ethereum)           |
| Stockage        | IPFS (CID ancré on-chain)            |
| Base de données | MongoDB (données off-chain)          |
| Frontend        | React.js                             |

---

## Architecture des Smart Contracts

```
SC1_UserManager.sol         → Gestion des comptes (Admin, Étudiant, Encadrant, RH)
SC2_OffreManager.sol        → Publication des offres de stage
SC3_CandidatureManager.sol  → Candidatures, matching automatique, acceptation/refus
SC4_ConventionManager.sol   → Convention numérique (3 signatures MetaMask)
SC5_SuiviManager.sol        → Suivi hebdomadaire du stage
SC6_RapportManager.sol      → Rapport final, versioning IPFS, calcul note automatique
SC7_CertifManager.sol       → Attestation certifiée + QR Code + vérification publique
```

### Chaîne de dépendances

```
SC1 ← SC2 ← SC3 ← SC4 ← SC5
                    ↑
                   SC6 → SC7
```

Chaque contrat vérifie que l'étape précédente est validée on-chain avant d'autoriser une action.

---

## Prérequis

Avant de cloner le projet, assure-toi d'avoir installé :

| Outil      | Version requise | Lien de téléchargement                        |
|------------|-----------------|-----------------------------------------------|
| Node.js    | 24.x LTS        | https://nodejs.org/en/download                |
| Git        | Toute version   | https://git-scm.com/downloads                 |
| MetaMask   | Extension       | https://metamask.io                           |
| VS Code    | Recommandé      | https://code.visualstudio.com                 |

Pour vérifier les versions installées :

```bash
node --version    # doit afficher v24.x.x
npm --version     # doit afficher 10.x.x
git --version
```

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/stagechain.git
cd stagechain
```

> ⚠️ **Important** : place le projet dans un dossier **sans espaces** dans le chemin.  
> Exemple correct   : `C:\Projects\stagechain`  
> Exemple incorrect : `C:\Mon Projet\stagechain`

### 2. Installer les dépendances

```bash
npm install
```

### 3. Vérifier que le projet est en mode ESM

```bash
npm pkg set type="module"
```

---

## Configuration

### Créer le fichier `.env`

Copie le fichier d'exemple et remplis les valeurs :

```bash
cp .env.example .env
```

Contenu du fichier `.env` :

```env
# Clé privée de ton wallet MetaMask (sans le 0x)
SEPOLIA_PRIVATE_KEY=ta_cle_privee_metamask

# URL RPC Sepolia (compte gratuit sur infura.io)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/ta_cle_infura
```

> ⚠️ **Ne jamais partager le fichier `.env` ni le committer sur GitHub.**  
> Le fichier `.gitignore` l'exclut déjà automatiquement.

#### Obtenir la clé privée MetaMask :
1. Ouvrir MetaMask → cliquer sur les 3 points à côté du compte
2. "Account details" → "Show private key"
3. Entrer le mot de passe → copier la clé

#### Obtenir une URL RPC Sepolia (Infura) :
1. Créer un compte gratuit sur **infura.io**
2. "Create New API Key" → Web3 API
3. Copier l'URL Sepolia

---

## Compilation

```bash
npx hardhat compile
```

Cette commande :
- Compile les 7 smart contracts Solidity
- Génère les artifacts dans `artifacts/`
- Génère les types TypeScript dans `types/ethers-contracts/`

Résultat attendu :
```
Compiled 7 Solidity files with solc 0.8.28 (evm target: cancun)
```

---

## Tests

```bash
npx hardhat test
```

Résultat attendu :
```
StageChain — Suite complète
  SC1 — UserManager
    ✔ Admin enregistré au déploiement
    ✔ Admin peut enregistrer un étudiant
    ✔ Admin peut enregistrer un encadrant
    ✔ Admin peut enregistrer un RH
    ✔ Non-admin ne peut pas enregistrer
    ✔ Wallet déjà enregistré est rejeté
    ✔ isAuthorized fonctionne correctement
  SC2 — OffreManager
    ✔ RH peut publier une offre
    ✔ Non-RH ne peut pas publier
    ✔ RH peut fermer son offre
    ✔ getAllOffres retourne uniquement les offres ouvertes
  SC3 — CandidatureManager
    ✔ Étudiant peut postuler
    ✔ Double candidature refusée
    ✔ RH peut accepter une candidature
    ✔ RH peut refuser une candidature
    ✔ RH non propriétaire ne peut pas traiter
  SC4 — ConventionManager
    ✔ Admin peut créer une convention
    ✔ Convention activée après 3 signatures
    ✔ Signataire non autorisé rejeté
  Flux complet SC5 → SC6 → SC7
    ✔ SC5 — Étudiant peut soumettre un rapport d'avancement
    ✔ SC5 — Encadrant peut commenter et valider
    ✔ SC6 — Dépôt rapport final et versioning
    ✔ SC6 — Calcul automatique de la note finale
    ✔ SC7 — Attestation certifiée après 3 signatures
    ✔ SC7 — Vérification publique : authentique
    ✔ SC7 — Vérification publique : alerte fraude

26 passing
```

---

## Déploiement

### En local (développement)

Ouvre deux terminaux :

**Terminal 1 — démarrer le nœud local :**
```bash
npx hardhat node
```

**Terminal 2 — déployer les contracts :**
```bash
npx hardhat ignition deploy ignition/modules/StageChainDeploy.ts --network localhost
```

Les adresses des contracts déployés seront sauvegardées dans `ignition/deployments/`.

## Structure du projet

```
stagechain/
├── contracts/                          # Smart contracts Solidity
│   ├── SC1_UserManager.sol
│   ├── SC2_OffreManager.sol
│   ├── SC3_CandidatureManager.sol
│   ├── SC4_ConventionManager.sol
│   ├── SC5_SuiviManager.sol
│   ├── SC6_RapportManager.sol
│   └── SC7_CertifManager.sol
├── ignition/
│   └── modules/
│       └── StageChainDeploy.ts         # Script de déploiement Hardhat Ignition
├── test/
│   └── Stagechain.test.ts              # Suite de tests (26 tests)
├── types/
│   └── ethers-contracts/               # Types TypeScript (auto-générés)
├── artifacts/                          # Artifacts de compilation (auto-générés)
├── .env                                # Variables d'environnement (ne pas committer)
├── .env.example                        # Exemple de configuration
├── .gitignore
├── hardhat.config.ts                   # Configuration Hardhat v3
├── package.json
├── tsconfig.json
└── README.md
```

---

## Fonctionnement du Calcul de Note (SC6)

```
Note finale = (Note tuteur × 60%) + (Note encadrant × 40%)

Stockée on-chain ×10 pour éviter les décimales :
  Exemple : note tuteur = 16, note encadrant = 14
  noteFinale_x10 = (16 × 6) + (14 × 4) = 152
  Affichage frontend : 15.2 / 20
```

---

## Vérification Publique des Attestations (SC7)

La vérification est **entièrement publique, sans compte requis** :

1. Scanner le QR Code de l'attestation
2. Le QR Code contient : `stagechainv1:{id}:{wallet}:{CID}:{timestamp}`
3. SC7 compare le hash PDF actuel avec le hash ancré on-chain
4. Résultat : ✅ Authentique ou ⚠️ Document falsifié

---

## Rôles du Système

| Rôle               | Permissions                                                           |
|--------------------|-----------------------------------------------------------------------|
| Admin université   | Enregistre les comptes, crée les conventions, génère les attestations |
| Étudiant           | Postule aux offres, signe la convention, dépose les rapports          |
| RH Entreprise      | Publie les offres, sélectionne les candidats, signe la convention     |
| Encadrant          | Suit la progression, valide les rapports, signe l'attestation         |
| Tuteur entreprise  | Évalue l'étudiant, valide le rapport final, signe l'attestation       |
| Public             | Vérifie les attestations via QR Code (sans compte)                    |

---

## Problèmes fréquents

### Erreur `ERR_DLOPEN_FAILED`
**Cause** : Version de Node.js incompatible.  
**Solution** : Utiliser Node.js v22.x LTS — https://nodejs.org/en/download

### Erreur `EPERM` ou `operation not permitted`
**Cause** : Espaces dans le chemin du projet ou fichiers verrouillés.  
**Solution** : Déplacer le projet dans un dossier sans espaces et relancer PowerShell en administrateur.

### Erreur `Stack too deep`
**Cause** : Trop de variables locales dans une fonction Solidity.  
**Solution** : Activer `viaIR: true` dans `hardhat.config.ts` (déjà configuré).

### Dossier `types/` introuvable
**Cause** : Le projet n'a pas encore été compilé.  
**Solution** : `npx hardhat compile`

### Erreur `Cannot find module 'hardhat'`
**Cause** : Les dépendances ne sont pas installées.  
**Solution** : `npm install`

---


Année universitaire 2025–2026