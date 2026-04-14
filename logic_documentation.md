# Logique Fonctionnelle StageChain

Ce document détaille le fonctionnement technique et les règles métier pour deux fonctionnalités clés du système StageChain : l'affectation d'un encadrant et le dépôt des rapports d'avancement.

---

## 1. Affectation d'un Encadrant à un Étudiant

L'affectation d'un encadrant est une étape cruciale qui survient après la validation administrative du stage. Cette logique est implémentée dans le contrat `SC3_ConventionManager`.

### Acteurs impliqués
*   **Admin Université** : Le seul acteur autorisé à effectuer l'affectation.
*   **Étudiant** : Le bénéficiaire de l'affectation (via sa convention).
*   **Encadrant** : Le professionnel de l'université qui suivra l'étudiant.

### Prérequis (Smart Contract)
Pour que l'affectation réussisse, plusieurs conditions doivent être remplies :
1.  **Statut de la Convention** : La convention doit avoir le statut `COMPLETE`. Cela signifie que les trois signatures (Étudiant, RH, Admin) ont été collectées.
2.  **Rôle de l'Encadrant** : Le wallet cible doit posséder le rôle `ENCADRANT` dans le contrat `AccountManager`.
3.  **Appartenance à l'Université** : L'encadrant doit être rattaché à la même université que l'Admin qui effectue l'appel.
4.  **Propriété de la Convention** : L'Admin ne peut affecter des encadrants qu'aux conventions gérées par son établissement.

### Flux de Logic
1.  L'Admin appelle la fonction `affecterEncadrant(uint256 _conventionId, address _encadrant)`.
2.  Le contrat vérifie les permissions via `onlyAdmin`.
3.  Le contrat met à jour le champ `encadrant` dans la structure `Convention`.
4.  La date d'affectation est enregistrée (`affectationAt`).
5.  Un événement `EncadrantAffecte` est émis pour notifier le frontend et les services de suivi.

---

## 2. Dépôt d'un Rapport d'Avancement

Pendant le stage, l'étudiant doit rendre compte de ses activités via des rapports périodiques. Cette logique est gérée par le contrat `SC4_SuiviManager`.

### Acteurs impliqués
*   **Étudiant** : L'auteur du rapport.
*   **Encadrant** : Le destinataire qui valide ou commente le rapport.

### Processus de Dépôt
1.  **Stockage Décentralisé** : Avant d'interagir avec la blockchain, le fichier du rapport (PDF, Doc) est déposé sur **IPFS** (via Pinata). Un **CID** (Content Identifier) unique est généré.
2.  **Interaction Blockchain** : L'étudiant appelle la fonction `deposerRapport(string calldata _cidRapport)`.

### Validation Technique
Le smart contract impose les règles suivantes :
*   **Rôle** : Seul un wallet avec le rôle `STUDENT` peut appeler cette fonction.
*   **Convention Active** : Le système vérifie auprès du `ConventionManager` que l'étudiant possède une convention au statut `COMPLETE`. On ne peut pas déposer de rapport si le stage n'est pas officiellement lancé.
*   **CID Valide** : Le CID ne peut pas être vide.

### Cycle de Vie du Rapport
Une fois déposé, le rapport suit les états suivants :
1.  **DEPOSE** : État initial après l'envoi par l'étudiant.
2.  **VALIDE** ou **COMMENTE** : L'encadrant peut ensuite utiliser les fonctions `validerRapport` ou `commenterRapport` pour traiter le document.

### Avantages de cette logique
*   **Immuabilité** : Le CID stocké sur la blockchain garantit que le rapport n'a pas été modifié après son dépôt.
*   **Traçabilité** : Chaque dépôt est horodaté et lié de manière indélébile au wallet de l'étudiant.

---

> [!TIP]
> Pour visualiser le contenu d'un rapport, le frontend concatène l'URL de la gateway IPFS avec le CID stocké : `https://gateway.pinata.cloud/ipfs/[CID]`.
