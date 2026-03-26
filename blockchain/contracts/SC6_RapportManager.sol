// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_UserManager.sol";
import "./SC4_ConventionManager.sol";

/// @title SC6 — RapportManager
/// @notice Dépôt, versioning, validation et notation du rapport final
contract RapportManager {

    // ─────────────────────────────────────────────
    //  Énumérations & Structures
    // ─────────────────────────────────────────────

    enum Statut { EN_ATTENTE, REJETE, VALIDE }

    struct Remarque {
        address auteur;
        string  contenu;
        uint256 dateAt;
    }

    struct RapportFinal {
        uint256  id;
        address  etudiantWallet;
        string[] cidsIPFS;        // versioning : chaque dépôt reçoit un CID unique
        Statut   statut;

        // Validation tuteur
        bool     valideParTuteur;
        uint8    noteTuteur;       // /20
        uint256  dateTuteur;

        // Validation encadrant
        bool     valideParEncadrant;
        uint8    noteEncadrant;    // /20
        uint256  dateEncadrant;

        // Note finale calculée automatiquement
        bool     noteCalculee;
        uint256  noteFinale_x10;   // ×10 pour éviter les décimales (ex: 155 = 15.5/20)

        uint256  premierDepotAt;
        uint256  dernierDepotAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    UserManager       public userManager;
    ConventionManager public conventionManager;
    address           public certifManagerAddr; // sera défini après déploiement de SC7

    uint256 private nextId = 1;
    mapping(uint256 => RapportFinal) private rapports;
    mapping(address => uint256)      private rapportParEtudiant;
    mapping(uint256 => Remarque[])   private remarques; // stockées on-chain (simplification)

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event RapportDepose(address indexed etudiant, string cidIPFS, uint256 version, uint256 date);
    event RemarqueAjoutee(uint256 indexed rapportId, address indexed auteur, uint256 date);
    event RapportRejete(uint256 indexed rapportId, address indexed valideur, uint256 date);
    event ValidationEnregistree(uint256 indexed rapportId, address indexed valideur, uint8 note, uint256 date);
    event RapportValide(address indexed etudiant, string cidIPFS, uint256 noteFinale_x10, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyStudent() {
        require(
            userManager.isAuthorized(msg.sender, UserManager.Role.STUDENT),
            "RapportManager: etudiant autorise uniquement"
        );
        _;
    }

    modifier onlyTuteurOuEncadrant(uint256 _rapportId) {
        address etudiant = rapports[_rapportId].etudiantWallet;
        address tuteur   = conventionManager.getTuteur(etudiant);
        address encadrant = conventionManager.getEncadrant(etudiant);
        require(
            msg.sender == tuteur || msg.sender == encadrant,
            "RapportManager: tuteur ou encadrant uniquement"
        );
        _;
    }

    modifier rapportExiste(uint256 _id) {
        require(rapports[_id].id != 0, "RapportManager: rapport inexistant");
        _;
    }

    modifier conventionActive(address _etudiant) {
        require(
            conventionManager.isConventionActive(_etudiant),
            "RapportManager: aucune convention active"
        );
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(address _userManager, address _conventionManager) {
        userManager       = UserManager(_userManager);
        conventionManager = ConventionManager(_conventionManager);
    }

    /// @notice L'admin lie SC7 après son déploiement
    function setCertifManager(address _addr) external {
        require(certifManagerAddr == address(0), "RapportManager: deja defini");
        certifManagerAddr = _addr;
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Étudiant
    // ─────────────────────────────────────────────

    /// @notice Dépose le rapport final (ou une nouvelle version)
    function deposerRapport(string calldata _cidIPFS)
        external
        onlyStudent
        conventionActive(msg.sender)
    {
        uint256 existingId = rapportParEtudiant[msg.sender];

        if (existingId == 0) {
            // Premier dépôt
            uint256 id = nextId++;
            rapports[id].id             = id;
            rapports[id].etudiantWallet = msg.sender;
            rapports[id].statut         = Statut.EN_ATTENTE;
            rapports[id].premierDepotAt = block.timestamp;
            rapports[id].dernierDepotAt = block.timestamp;
            rapports[id].cidsIPFS.push(_cidIPFS);

            rapportParEtudiant[msg.sender] = id;
            emit RapportDepose(msg.sender, _cidIPFS, 1, block.timestamp);

        } else {
            // Nouvelle version (boucle de correction)
            RapportFinal storage r = rapports[existingId];
            require(r.statut != Statut.VALIDE, "RapportManager: rapport deja valide");

            r.statut         = Statut.EN_ATTENTE;
            r.dernierDepotAt = block.timestamp;
            // Reset validations si nouvelle version après rejet
            r.valideParTuteur    = false;
            r.valideParEncadrant = false;
            r.noteCalculee       = false;
            r.cidsIPFS.push(_cidIPFS);

            emit RapportDepose(msg.sender, _cidIPFS, r.cidsIPFS.length, block.timestamp);
        }
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Tuteur & Encadrant
    // ─────────────────────────────────────────────

    /// @notice Ajoute une remarque sur le rapport
    function ajouterRemarque(uint256 _rapportId, string calldata _contenu)
        external
        rapportExiste(_rapportId)
        onlyTuteurOuEncadrant(_rapportId)
    {
        remarques[_rapportId].push(Remarque({
            auteur:  msg.sender,
            contenu: _contenu,
            dateAt:  block.timestamp
        }));
        emit RemarqueAjoutee(_rapportId, msg.sender, block.timestamp);
    }

    /// @notice Rejette le rapport (demande corrections)
    function rejeter(uint256 _rapportId)
        external
        rapportExiste(_rapportId)
        onlyTuteurOuEncadrant(_rapportId)
    {
        RapportFinal storage r = rapports[_rapportId];
        require(r.statut == Statut.EN_ATTENTE, "RapportManager: statut invalide");
        r.statut = Statut.REJETE;
        emit RapportRejete(_rapportId, msg.sender, block.timestamp);
    }

    /// @notice Valide le rapport avec une note (tuteur = 60%, encadrant = 40%)
    function valider(uint256 _rapportId, uint8 _note)
        external
        rapportExiste(_rapportId)
        onlyTuteurOuEncadrant(_rapportId)
    {
        require(_note <= 20, "RapportManager: note invalide (max 20)");

        RapportFinal storage r = rapports[_rapportId];
        require(r.statut == Statut.EN_ATTENTE, "RapportManager: statut invalide");

        address etudiant  = r.etudiantWallet;
        address tuteur    = conventionManager.getTuteur(etudiant);
        address encadrant = conventionManager.getEncadrant(etudiant);

        if (msg.sender == tuteur) {
            require(!r.valideParTuteur, "RapportManager: tuteur a deja valide");
            r.valideParTuteur = true;
            r.noteTuteur      = _note;
            r.dateTuteur      = block.timestamp;
            emit ValidationEnregistree(_rapportId, msg.sender, _note, block.timestamp);

        } else if (msg.sender == encadrant) {
            require(!r.valideParEncadrant, "RapportManager: encadrant a deja valide");
            r.valideParEncadrant = true;
            r.noteEncadrant      = _note;
            r.dateEncadrant      = block.timestamp;
            emit ValidationEnregistree(_rapportId, msg.sender, _note, block.timestamp);
        }

        // Calcul automatique de la note si les 2 validations sont présentes
        // note = (tuteur × 0.6) + (encadrant × 0.4) → ×10 pour éviter les décimales
        if (r.valideParTuteur && r.valideParEncadrant && !r.noteCalculee) {
            r.noteFinale_x10 = (uint256(r.noteTuteur) * 6) + (uint256(r.noteEncadrant) * 4);
            r.noteCalculee   = true;
            r.statut         = Statut.VALIDE;

            string memory dernierCID = r.cidsIPFS[r.cidsIPFS.length - 1];
            emit RapportValide(etudiant, dernierCID, r.noteFinale_x10, block.timestamp);
        }
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getRapport(uint256 _id) external view rapportExiste(_id) returns (RapportFinal memory) {
        return rapports[_id];
    }

    function getRapportByEtudiant(address _etudiant) external view returns (RapportFinal memory) {
        uint256 id = rapportParEtudiant[_etudiant];
        require(id != 0, "RapportManager: aucun rapport pour cet etudiant");
        return rapports[id];
    }

    function getRemarques(uint256 _rapportId) external view returns (Remarque[] memory) {
        return remarques[_rapportId];
    }

    /// @notice Vérifie que le rapport est validé (utilisé par SC7)
    function isRapportValide(address _etudiant) external view returns (bool) {
        uint256 id = rapportParEtudiant[_etudiant];
        return id != 0 && rapports[id].statut == Statut.VALIDE;
    }

    /// @notice Retourne la note finale ×10 (ex: 155 = 15.5/20)
    function getNoteFinale(address _etudiant) external view returns (uint256) {
        uint256 id = rapportParEtudiant[_etudiant];
        require(id != 0 && rapports[id].noteCalculee, "RapportManager: note non encore calculee");
        return rapports[id].noteFinale_x10;
    }

    /// @notice Retourne le dernier CID IPFS du rapport (utilisé par SC7)
    function getDernierCID(address _etudiant) external view returns (string memory) {
        uint256 id = rapportParEtudiant[_etudiant];
        require(id != 0, "RapportManager: aucun rapport");
        string[] storage cids = rapports[id].cidsIPFS;
        return cids[cids.length - 1];
    }
}
