// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_UserManager.sol";
import "./SC4_ConventionManager.sol";

/// @title SC5 — SuiviManager
/// @notice Suivi pédagogique : rapports d'avancement et commentaires de l'encadrant
contract SuiviManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    struct RapportAvancement {
        uint256 id;
        address etudiantWallet;
        string  cidIPFS;       // CID du rapport sur IPFS
        string  titre;
        uint256 semaine;       // numéro de semaine du stage
        bool    valide;
        uint256 soumisAt;
        uint256 valideAt;
    }

    struct Commentaire {
        uint256 rapportId;
        address encadrantWallet;
        string  contenu;       // stocké off-chain normalement, ici simplifié on-chain
        uint256 dateAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    UserManager        public userManager;
    ConventionManager  public conventionManager;

    uint256 private nextRapportId   = 1;
    uint256 private nextCommentaireId = 1;

    mapping(uint256 => RapportAvancement) private rapports;
    mapping(uint256 => Commentaire[])     private commentaires; // rapportId → commentaires

    // etudiant → liste des rapportIds
    mapping(address => uint256[]) private rapportsParEtudiant;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event RapportSubmitted(address indexed etudiant, string cidIPFS, uint256 semaine, uint256 date);
    event CommentaireAjoute(uint256 indexed rapportId, address indexed encadrant, uint256 date);
    event RapportValide(uint256 indexed rapportId, address indexed encadrant, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyStudent() {
        require(
            userManager.isAuthorized(msg.sender, UserManager.Role.STUDENT),
            "SuiviManager: etudiant autorise uniquement"
        );
        _;
    }

    modifier onlyEncadrant() {
        require(
            userManager.isAuthorized(msg.sender, UserManager.Role.ENCADRANT),
            "SuiviManager: encadrant autorise uniquement"
        );
        _;
    }

    modifier conventionActive() {
        require(
            conventionManager.isConventionActive(msg.sender),
            "SuiviManager: aucune convention active"
        );
        _;
    }

    modifier rapportExiste(uint256 _id) {
        require(rapports[_id].id != 0, "SuiviManager: rapport inexistant");
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(address _userManager, address _conventionManager) {
        userManager       = UserManager(_userManager);
        conventionManager = ConventionManager(_conventionManager);
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Étudiant
    // ─────────────────────────────────────────────

    /// @notice Soumet un rapport d'avancement hebdomadaire
    function soumettreRapport(
        string calldata _cidIPFS,
        string calldata _titre,
        uint256         _semaine
    ) external onlyStudent conventionActive {
        uint256 id = nextRapportId++;
        rapports[id] = RapportAvancement({
            id: id,
            etudiantWallet: msg.sender,
            cidIPFS: _cidIPFS,
            titre: _titre,
            semaine: _semaine,
            valide: false,
            soumisAt: block.timestamp,
            valideAt: 0
        });
        rapportsParEtudiant[msg.sender].push(id);
        emit RapportSubmitted(msg.sender, _cidIPFS, _semaine, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Encadrant
    // ─────────────────────────────────────────────

    /// @notice Ajoute un commentaire sur un rapport d'avancement
    function ajouterCommentaire(
        uint256        _rapportId,
        string calldata _contenu
    ) external onlyEncadrant rapportExiste(_rapportId) {
        // Vérifie que l'encadrant est bien lié à cet étudiant
        address etudiant = rapports[_rapportId].etudiantWallet;
        require(
            conventionManager.getEncadrant(etudiant) == msg.sender,
            "SuiviManager: encadrant non lie a cet etudiant"
        );

        commentaires[_rapportId].push(Commentaire({
            rapportId: _rapportId,
            encadrantWallet: msg.sender,
            contenu: _contenu,
            dateAt: block.timestamp
        }));
        emit CommentaireAjoute(_rapportId, msg.sender, block.timestamp);
    }

    /// @notice Valide un rapport d'avancement
    function validerRapport(uint256 _rapportId) external onlyEncadrant rapportExiste(_rapportId) {
        RapportAvancement storage r = rapports[_rapportId];
        require(!r.valide, "SuiviManager: deja valide");

        address etudiant = r.etudiantWallet;
        require(
            conventionManager.getEncadrant(etudiant) == msg.sender,
            "SuiviManager: encadrant non lie a cet etudiant"
        );

        r.valide    = true;
        r.valideAt  = block.timestamp;
        emit RapportValide(_rapportId, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getRapport(uint256 _id) external view rapportExiste(_id) returns (RapportAvancement memory) {
        return rapports[_id];
    }

    function getCommentaires(uint256 _rapportId) external view returns (Commentaire[] memory) {
        return commentaires[_rapportId];
    }

    function getRapportsEtudiant(address _etudiant) external view returns (RapportAvancement[] memory) {
        uint256[] storage ids = rapportsParEtudiant[_etudiant];
        RapportAvancement[] memory result = new RapportAvancement[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = rapports[ids[i]];
        }
        return result;
    }
}
