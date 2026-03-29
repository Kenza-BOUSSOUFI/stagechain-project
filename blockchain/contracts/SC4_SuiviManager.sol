// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_AccountManager.sol";
import "./SC3_ConventionManager.sol";

/// @title SC4 — SuiviManager
/// @notice Dépôt et validation des rapports d'avancement
contract SuiviManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    enum StatutRapport { DEPOSE, VALIDE, COMMENTE }

    struct RapportAvancement {
        uint256 id;
        address etudiant;
        string  cidRapport;   // CID IPFS
        string  commentaire;  // commentaire encadrant
        StatutRapport statut;
        uint256 createdAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    AccountManager    public accountManager;
    ConventionManager public conventionManager;

    uint256 private rapportCounter;
    mapping(uint256 => RapportAvancement) private rapports;
    mapping(address => uint256[]) private rapportsParEtudiant;
    mapping(address => uint256[]) private rapportsParEncadrant;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event RapportDepose(uint256 indexed rapportId, address indexed etudiant, uint256 date);
    event RapportValide(uint256 indexed rapportId, address indexed encadrant, uint256 date);
    event RapportCommente(uint256 indexed rapportId, address indexed encadrant, string commentaire, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyStudent() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.STUDENT),
            "SuiviManager: etudiant uniquement"
        );
        _;
    }

    modifier onlyEncadrant() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.ENCADRANT),
            "SuiviManager: encadrant uniquement"
        );
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(address _accountManager, address _conventionManager) {
        accountManager    = AccountManager(_accountManager);
        conventionManager = ConventionManager(_conventionManager);
    }

    // ─────────────────────────────────────────────
    //  Fonctions Étudiant
    // ─────────────────────────────────────────────

    /// @notice L'étudiant dépose un rapport d'avancement
    function deposerRapport(string calldata _cidRapport) external onlyStudent {
        // Vérifier que la convention de l'étudiant est complète
        ConventionManager.Convention memory conv = conventionManager.getConventionByEtudiant(msg.sender);
        require(conv.statut == ConventionManager.StatutConvention.COMPLETE, "SuiviManager: convention non signee");
        require(bytes(_cidRapport).length > 0, "SuiviManager: CID requis");

        rapportCounter++;
        rapports[rapportCounter] = RapportAvancement({
            id: rapportCounter,
            etudiant: msg.sender,
            cidRapport: _cidRapport,
            commentaire: "",
            statut: StatutRapport.DEPOSE,
            createdAt: block.timestamp
        });

        rapportsParEtudiant[msg.sender].push(rapportCounter);
        emit RapportDepose(rapportCounter, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions Encadrant
    // ─────────────────────────────────────────────

    /// @notice L'encadrant valide un rapport
    function validerRapport(uint256 _rapportId) external onlyEncadrant {
        RapportAvancement storage r = rapports[_rapportId];
        require(r.id != 0, "SuiviManager: rapport inexistant");
        require(r.statut == StatutRapport.DEPOSE, "SuiviManager: rapport deja traite");

        r.statut = StatutRapport.VALIDE;
        rapportsParEncadrant[msg.sender].push(_rapportId);
        emit RapportValide(_rapportId, msg.sender, block.timestamp);
    }

    /// @notice L'encadrant commente un rapport
    function commenterRapport(uint256 _rapportId, string calldata _commentaire) external onlyEncadrant {
        RapportAvancement storage r = rapports[_rapportId];
        require(r.id != 0, "SuiviManager: rapport inexistant");
        require(bytes(_commentaire).length > 0, "SuiviManager: commentaire requis");

        r.commentaire = _commentaire;
        r.statut = StatutRapport.COMMENTE;
        rapportsParEncadrant[msg.sender].push(_rapportId);
        emit RapportCommente(_rapportId, msg.sender, _commentaire, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getRapport(uint256 _rapportId) external view returns (RapportAvancement memory) {
        require(rapports[_rapportId].id != 0, "SuiviManager: rapport inexistant");
        return rapports[_rapportId];
    }

    function getRapportsByEtudiant(address _etudiant) external view returns (uint256[] memory) {
        return rapportsParEtudiant[_etudiant];
    }

    function getRapportsByEncadrant(address _encadrant) external view returns (uint256[] memory) {
        return rapportsParEncadrant[_encadrant];
    }
}