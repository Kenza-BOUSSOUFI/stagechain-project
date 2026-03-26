// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_UserManager.sol";
import "./SC3_CandidatureManager.sol";

/// @title SC4 — ConventionManager
/// @notice Génération et signature de la convention de stage (3 signatures requises)
contract ConventionManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    struct Tuteur {
        address wallet;
        string  nom;
        string  prenom;
        string  poste;
        bool    enregistre;
    }

    struct Convention {
        uint256 id;
        uint256 candidatureId;
        address etudiantWallet;
        address rhWallet;
        address tuteurWallet;
        address encadrantWallet;
        string  hashIPFS;          // CID du PDF sur IPFS
        bool    signatureEtudiant;
        bool    signatureRH;
        bool    signatureAdmin;
        bool    isActive;          // true seulement si les 3 signatures sont présentes
        uint256 createdAt;
        uint256 activatedAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    UserManager         public userManager;
    CandidatureManager  public candidatureManager;
    address             public admin;

    uint256 private nextId = 1;
    mapping(uint256 => Convention) private conventions;
    mapping(address => uint256)    private tuteurs;       // wallet → conventionId
    mapping(address => Tuteur)     private tuteurProfils; // wallet → infos tuteur

    // etudiant → conventionId (un seul stage actif à la fois)
    mapping(address => uint256) private conventionEtudiant;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event TuteurEnregistre(address indexed tuteurWallet, uint256 indexed conventionId, uint256 date);
    event ConventionCreee(uint256 indexed conventionId, string hashIPFS, uint256 date);
    event SignatureEnregistree(uint256 indexed conventionId, address indexed signataire, uint8 signatureIndex);
    event ConventionSigned(uint256 indexed conventionId, string hashIPFS, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "ConventionManager: admin uniquement");
        _;
    }

    modifier conventionExiste(uint256 _id) {
        require(conventions[_id].id != 0, "ConventionManager: convention inexistante");
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(address _userManager, address _candidatureManager) {
        userManager        = UserManager(_userManager);
        candidatureManager = CandidatureManager(_candidatureManager);
        admin = msg.sender;
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Admin
    // ─────────────────────────────────────────────

    /// @notice Enregistre le tuteur pédagogique on-chain et crée la convention
    /// @param _etudiantWallet  Wallet de l'étudiant
    /// @param _offreId         ID de l'offre acceptée
    /// @param _tuteurWallet    Wallet du tuteur entreprise
    /// @param _tuteurNom       Nom du tuteur
    /// @param _tuteurPrenom    Prénom du tuteur
    /// @param _tuteurPoste     Poste du tuteur
    /// @param _encadrantWallet Wallet de l'encadrant pédagogique
    /// @param _hashIPFS        CID du PDF de convention uploadé sur IPFS
    function registerTuteurEtCreerConvention(
        address _etudiantWallet,
        uint256 _offreId,
        address _tuteurWallet,
        string calldata _tuteurNom,
        string calldata _tuteurPrenom,
        string calldata _tuteurPoste,
        address _encadrantWallet,
        address _rhWallet,
        string calldata _hashIPFS
    ) external onlyAdmin {
        // Vérifie que la candidature est bien acceptée
        uint256 candId = candidatureManager.getCandidatureAcceptee(_etudiantWallet, _offreId);

        // Vérifie que l'encadrant est bien enregistré
        require(
            userManager.isAuthorized(_encadrantWallet, UserManager.Role.ENCADRANT),
            "ConventionManager: encadrant invalide"
        );

        // Enregistre le tuteur
        tuteurProfils[_tuteurWallet] = Tuteur({
            wallet: _tuteurWallet,
            nom: _tuteurNom,
            prenom: _tuteurPrenom,
            poste: _tuteurPoste,
            enregistre: true
        });

        // Crée la convention
        uint256 id = nextId++;
        conventions[id] = Convention({
            id: id,
            candidatureId: candId,
            etudiantWallet: _etudiantWallet,
            rhWallet: _rhWallet,
            tuteurWallet: _tuteurWallet,
            encadrantWallet: _encadrantWallet,
            hashIPFS: _hashIPFS,
            signatureEtudiant: false,
            signatureRH: false,
            signatureAdmin: false,
            isActive: false,
            createdAt: block.timestamp,
            activatedAt: 0
        });

        conventionEtudiant[_etudiantWallet] = id;
        tuteurs[_tuteurWallet] = id;

        emit TuteurEnregistre(_tuteurWallet, id, block.timestamp);
        emit ConventionCreee(id, _hashIPFS, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Signature (3 parties)
    // ─────────────────────────────────────────────

    /// @notice Signe la convention via MetaMask (détermine automatiquement le signataire)
    function signerConvention(uint256 _conventionId) external conventionExiste(_conventionId) {
        Convention storage c = conventions[_conventionId];
        require(!c.isActive, "ConventionManager: convention deja active");

        if (msg.sender == c.etudiantWallet) {
            require(!c.signatureEtudiant, "ConventionManager: deja signe");
            c.signatureEtudiant = true;
            emit SignatureEnregistree(_conventionId, msg.sender, 1);

        } else if (msg.sender == c.rhWallet) {
            require(!c.signatureRH, "ConventionManager: deja signe");
            c.signatureRH = true;
            emit SignatureEnregistree(_conventionId, msg.sender, 2);

        } else if (msg.sender == admin) {
            require(!c.signatureAdmin, "ConventionManager: deja signe");
            c.signatureAdmin = true;
            emit SignatureEnregistree(_conventionId, msg.sender, 3);

        } else {
            revert("ConventionManager: signataire non autorise");
        }

        // Active la convention si les 3 signatures sont présentes
        if (c.signatureEtudiant && c.signatureRH && c.signatureAdmin) {
            c.isActive     = true;
            c.activatedAt  = block.timestamp;
            emit ConventionSigned(_conventionId, c.hashIPFS, block.timestamp);
        }
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getConvention(uint256 _id) external view conventionExiste(_id) returns (Convention memory) {
        return conventions[_id];
    }

    function getConventionByEtudiant(address _etudiant) external view returns (Convention memory) {
        uint256 id = conventionEtudiant[_etudiant];
        require(id != 0, "ConventionManager: aucune convention pour cet etudiant");
        return conventions[id];
    }

    /// @notice Vérifie que la convention est active (utilisé par SC5 et SC6)
    function isConventionActive(address _etudiant) external view returns (bool) {
        uint256 id = conventionEtudiant[_etudiant];
        return id != 0 && conventions[id].isActive;
    }

    /// @notice Retourne l'encadrant lié à un étudiant (pour SC5 et SC6)
    function getEncadrant(address _etudiant) external view returns (address) {
        uint256 id = conventionEtudiant[_etudiant];
        require(id != 0 && conventions[id].isActive, "ConventionManager: aucune convention active");
        return conventions[id].encadrantWallet;
    }

    /// @notice Retourne le tuteur lié à un étudiant (pour SC6 et SC7)
    function getTuteur(address _etudiant) external view returns (address) {
        uint256 id = conventionEtudiant[_etudiant];
        require(id != 0 && conventions[id].isActive, "ConventionManager: aucune convention active");
        return conventions[id].tuteurWallet;
    }

    function getTuteurProfil(address _wallet) external view returns (Tuteur memory) {
        require(tuteurProfils[_wallet].enregistre, "ConventionManager: tuteur inconnu");
        return tuteurProfils[_wallet];
    }
}
