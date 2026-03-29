// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_AccountManager.sol";
import "./SC3_ConventionManager.sol";

/// @title SC5 — RapportManager
/// @notice Dépôt rapport final, notation RH (60%) + Encadrant (40%), calcul note
contract RapportManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    struct RapportFinal {
        uint256 id;
        address etudiant;
        string  cidRapportFinal;  // CID IPFS
        uint8   noteRH;           // /20
        uint8   noteEncadrant;    // /20
        uint256 noteFinale;       // calculée (60% RH + 40% Encadrant) * 100 pour précision
        bool    noteRHDeposee;
        bool    noteEncadrantDeposee;
        bool    noteCalculee;
        uint256 createdAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    AccountManager    public accountManager;
    ConventionManager public conventionManager;

    uint256 private rapportCounter;
    mapping(uint256 => RapportFinal) private rapports;
    mapping(address => uint256) public rapportParEtudiant;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event RapportFinalDepose(uint256 indexed rapportId, address indexed etudiant, uint256 date);
    event NoteRHDeposee(uint256 indexed rapportId, uint8 note, uint256 date);
    event NoteEncadrantDeposee(uint256 indexed rapportId, uint8 note, uint256 date);
    event NoteFinaleCalculee(uint256 indexed rapportId, address indexed etudiant, uint256 noteFinale, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyStudent() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.STUDENT),
            "RapportManager: etudiant uniquement"
        );
        _;
    }

    modifier onlyRH() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.RH),
            "RapportManager: RH uniquement"
        );
        _;
    }

    modifier onlyEncadrant() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.ENCADRANT),
            "RapportManager: encadrant uniquement"
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
    //  Fonctions
    // ─────────────────────────────────────────────

    /// @notice L'étudiant dépose son rapport final
    function deposerRapportFinal(string calldata _cidRapport) external onlyStudent {
        ConventionManager.Convention memory conv = conventionManager.getConventionByEtudiant(msg.sender);
        require(conv.statut == ConventionManager.StatutConvention.COMPLETE, "RapportManager: convention non complete");
        require(rapportParEtudiant[msg.sender] == 0, "RapportManager: rapport deja depose");
        require(bytes(_cidRapport).length > 0, "RapportManager: CID requis");

        rapportCounter++;
        rapports[rapportCounter] = RapportFinal({
            id: rapportCounter,
            etudiant: msg.sender,
            cidRapportFinal: _cidRapport,
            noteRH: 0,
            noteEncadrant: 0,
            noteFinale: 0,
            noteRHDeposee: false,
            noteEncadrantDeposee: false,
            noteCalculee: false,
            createdAt: block.timestamp
        });

        rapportParEtudiant[msg.sender] = rapportCounter;
        emit RapportFinalDepose(rapportCounter, msg.sender, block.timestamp);
    }

    /// @notice Le RH note le rapport final (60% de la note finale, sur 20)
    function noterParRH(uint256 _rapportId, uint8 _note) external onlyRH {
        require(_note <= 20, "RapportManager: note invalide (0-20)");
        RapportFinal storage r = rapports[_rapportId];
        require(r.id != 0, "RapportManager: rapport inexistant");
        require(!r.noteRHDeposee, "RapportManager: note RH deja deposee");

        r.noteRH = _note;
        r.noteRHDeposee = true;
        emit NoteRHDeposee(_rapportId, _note, block.timestamp);

        if (r.noteEncadrantDeposee) {
            _calculerNote(r);
        }
    }

    /// @notice L'encadrant note le rapport final (40% de la note finale, sur 20)
    function noterParEncadrant(uint256 _rapportId, uint8 _note) external onlyEncadrant {
        require(_note <= 20, "RapportManager: note invalide (0-20)");
        RapportFinal storage r = rapports[_rapportId];
        require(r.id != 0, "RapportManager: rapport inexistant");
        require(!r.noteEncadrantDeposee, "RapportManager: note encadrant deja deposee");

        r.noteEncadrant = _note;
        r.noteEncadrantDeposee = true;
        emit NoteEncadrantDeposee(_rapportId, _note, block.timestamp);

        if (r.noteRHDeposee) {
            _calculerNote(r);
        }
    }

    /// @notice Calcule la note finale : 60% RH + 40% Encadrant (×100 pour précision)
    function _calculerNote(RapportFinal storage r) internal {
        // noteFinale sur 2000 (20 * 100) pour éviter les décimales
        r.noteFinale = (uint256(r.noteRH) * 60 + uint256(r.noteEncadrant) * 40);
        r.noteCalculee = true;
        emit NoteFinaleCalculee(r.id, r.etudiant, r.noteFinale, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getRapportFinal(uint256 _rapportId) external view returns (RapportFinal memory) {
        require(rapports[_rapportId].id != 0, "RapportManager: rapport inexistant");
        return rapports[_rapportId];
    }

    function getRapportByEtudiant(address _etudiant) external view returns (RapportFinal memory) {
        uint256 id = rapportParEtudiant[_etudiant];
        require(id != 0, "RapportManager: aucun rapport");
        return rapports[id];
    }

    function isNoteCalculee(address _etudiant) external view returns (bool) {
        return rapports[rapportParEtudiant[_etudiant]].noteCalculee;
    }
}