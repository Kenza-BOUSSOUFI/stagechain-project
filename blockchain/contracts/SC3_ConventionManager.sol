// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_AccountManager.sol";
import "./SC2_OffreManager.sol";

/// @title SC3 — ConventionManager
/// @notice Génération, signature tripartite et affectation encadrant
contract ConventionManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    enum StatutConvention {
        EN_ATTENTE,
        SIGNEE_ETUDIANT,
        SIGNEE_RH,
        SIGNEE_ADMIN,
        COMPLETE
    }

    struct Convention {
        uint256 id;
        uint256 candidatureId;
        address etudiant;
        address rh;
        address admin;
        address encadrant;      // affecté manuellement par l'admin
        string  cidConvention;
        bool    signEtudiant;
        bool    signRH;
        bool    signAdmin;
        StatutConvention statut;
        uint256 createdAt;
        uint256 affectationAt;  // date d'affectation de l'encadrant
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    AccountManager public accountManager;
    OffreManager   public offreManager;

    uint256 private conventionCounter;

    mapping(uint256 => Convention) private conventions;
    mapping(uint256 => uint256)    public conventionParCandidature;
    mapping(address => uint256)    public conventionParEtudiant;

    // encadrant => liste des conventionIds qu'il suit
    mapping(address => uint256[]) private conventionsParEncadrant;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event ConventionGeneree(uint256 indexed conventionId, uint256 indexed candidatureId, uint256 date);
    event EncadrantAffecte(uint256 indexed conventionId, address indexed encadrant, address indexed etudiant, uint256 date);
    event ConventionSignee(uint256 indexed conventionId, address indexed signataire, uint256 date);
    event ConventionComplete(uint256 indexed conventionId, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyRH() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.RH),
            "ConventionManager: RH uniquement"
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.ADMIN),
            "ConventionManager: admin uniquement"
        );
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(address _accountManager, address _offreManager) {
        accountManager = AccountManager(_accountManager);
        offreManager   = OffreManager(_offreManager);
    }

    // ─────────────────────────────────────────────
    //  Génération convention (RH)
    // ─────────────────────────────────────────────

    /// @notice Le RH génère la convention après sélection de l'étudiant
    function genererConvention(
        uint256 _candidatureId,
        string calldata _cidConvention
    ) external onlyRH {
        OffreManager.Candidature memory c = offreManager.getCandidature(_candidatureId);
        require(
            c.statut == OffreManager.StatutCandidature.ACCEPTEE,
            "ConventionManager: candidature non acceptee"
        );
        require(
            conventionParCandidature[_candidatureId] == 0,
            "ConventionManager: convention deja generee"
        );
        require(
            bytes(_cidConvention).length > 0,
            "ConventionManager: CID requis"
        );

        // Récupérer l'admin université de l'étudiant
        AccountManager.User memory etudiantUser = accountManager.getUser(c.etudiant);
        address adminUniversite = etudiantUser.universite;

        conventionCounter++;
        conventions[conventionCounter] = Convention({
            id: conventionCounter,
            candidatureId: _candidatureId,
            etudiant: c.etudiant,
            rh: msg.sender,
            admin: adminUniversite,
            encadrant: address(0),   // pas encore affecté
            cidConvention: _cidConvention,
            signEtudiant: false,
            signRH: false,
            signAdmin: false,
            statut: StatutConvention.EN_ATTENTE,
            createdAt: block.timestamp,
            affectationAt: 0
        });

        conventionParCandidature[_candidatureId] = conventionCounter;
        conventionParEtudiant[c.etudiant]        = conventionCounter;

        emit ConventionGeneree(conventionCounter, _candidatureId, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Affectation encadrant (Admin)
    // ─────────────────────────────────────────────

    /// @notice L'admin affecte un encadrant à un étudiant via sa convention
    function affecterEncadrant(
        uint256 _conventionId,
        address _encadrant
    ) external onlyAdmin {
        Convention storage conv = conventions[_conventionId];
        require(conv.id != 0, "ConventionManager: convention inexistante");
        require(
            conv.admin == msg.sender,
            "ConventionManager: pas votre universite"
        );
        require(
            conv.statut != StatutConvention.COMPLETE,
            "ConventionManager: convention deja complete"
        );
        require(
            accountManager.isAuthorized(_encadrant, AccountManager.Role.ENCADRANT),
            "ConventionManager: wallet non encadrant"
        );

        // Vérifier que l'encadrant appartient à la même université que l'étudiant
        AccountManager.User memory encadrantUser = accountManager.getUser(_encadrant);
        require(
            encadrantUser.universite == msg.sender,
            "ConventionManager: encadrant hors de votre universite"
        );

        conv.encadrant    = _encadrant;
        conv.affectationAt = block.timestamp;

        conventionsParEncadrant[_encadrant].push(_conventionId);

        emit EncadrantAffecte(_conventionId, _encadrant, conv.etudiant, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Signatures
    // ─────────────────────────────────────────────

    /// @notice L'étudiant signe la convention
    function signerParEtudiant(uint256 _conventionId) external {
        Convention storage conv = conventions[_conventionId];
        require(conv.id != 0, "ConventionManager: convention inexistante");
        require(msg.sender == conv.etudiant, "ConventionManager: pas votre convention");
        require(!conv.signEtudiant, "ConventionManager: deja signe");

        conv.signEtudiant = true;
        _updateStatut(conv);
        emit ConventionSignee(_conventionId, msg.sender, block.timestamp);
    }

    /// @notice Le RH signe la convention
    function signerParRH(uint256 _conventionId) external onlyRH {
        Convention storage conv = conventions[_conventionId];
        require(conv.id != 0, "ConventionManager: convention inexistante");
        require(msg.sender == conv.rh, "ConventionManager: pas votre convention");
        require(!conv.signRH, "ConventionManager: deja signe");

        conv.signRH = true;
        _updateStatut(conv);
        emit ConventionSignee(_conventionId, msg.sender, block.timestamp);
    }

    /// @notice L'admin signe la convention
    function signerParAdmin(uint256 _conventionId) external onlyAdmin {
        Convention storage conv = conventions[_conventionId];
        require(conv.id != 0, "ConventionManager: convention inexistante");
        require(msg.sender == conv.admin, "ConventionManager: pas votre universite");
        require(!conv.signAdmin, "ConventionManager: deja signe");

        conv.signAdmin = true;
        _updateStatut(conv);
        emit ConventionSignee(_conventionId, msg.sender, block.timestamp);
    }

    /// @notice Met à jour le statut quand toutes les signatures sont collectées
    function _updateStatut(Convention storage conv) internal {
        if (conv.signEtudiant && conv.signRH && conv.signAdmin) {
            conv.statut = StatutConvention.COMPLETE;
            emit ConventionComplete(conv.id, block.timestamp);
        }
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getConvention(uint256 _conventionId) external view returns (Convention memory) {
        require(conventions[_conventionId].id != 0, "ConventionManager: inexistante");
        return conventions[_conventionId];
    }

    function getConventionByEtudiant(address _etudiant) external view returns (Convention memory) {
        uint256 id = conventionParEtudiant[_etudiant];
        require(id != 0, "ConventionManager: aucune convention");
        return conventions[id];
    }

    /// @notice Retourne tous les étudiants suivis par un encadrant
    function getEtudiantsByEncadrant(address _encadrant) external view returns (address[] memory) {
        uint256[] memory ids = conventionsParEncadrant[_encadrant];
        address[] memory etudiants = new address[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            etudiants[i] = conventions[ids[i]].etudiant;
        }
        return etudiants;
    }

    /// @notice Retourne les conventions suivies par un encadrant
    function getConventionsByEncadrant(address _encadrant) external view returns (uint256[] memory) {
        return conventionsParEncadrant[_encadrant];
    }

    function isConventionComplete(uint256 _conventionId) external view returns (bool) {
        return conventions[_conventionId].statut == StatutConvention.COMPLETE;
    }

    /// @notice Retourne l'encadrant affecté à un étudiant
    function getEncadrantByEtudiant(address _etudiant) external view returns (address) {
        uint256 id = conventionParEtudiant[_etudiant];
        require(id != 0, "ConventionManager: aucune convention");
        require(conventions[id].encadrant != address(0), "ConventionManager: encadrant non affecte");
        return conventions[id].encadrant;
    }
}