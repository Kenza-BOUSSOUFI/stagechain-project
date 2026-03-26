// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_UserManager.sol";
import "./SC2_OffreManager.sol";

/// @title SC3 — CandidatureManager
/// @notice Gestion des candidatures : matching, soumission, acceptation, refus
contract CandidatureManager {

    // ─────────────────────────────────────────────
    //  Énumérations & Structures
    // ─────────────────────────────────────────────

    enum Statut { EN_ATTENTE, ACCEPTE, REFUSE }

    struct Candidature {
        uint256 id;
        address etudiantWallet;
        uint256 offreId;
        uint16  scoreMatching;   // sur 100
        Statut  statut;
        uint256 soumiseAt;
        uint256 traiteeAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    UserManager  public userManager;
    OffreManager public offreManager;
    address      public admin;

    uint256 private nextId = 1;
    mapping(uint256 => Candidature) private candidatures;

    // etudiant → offreId → candidatureId (évite double candidature)
    mapping(address => mapping(uint256 => uint256)) private dejaCandidat;

    // offreId → liste des candidatureIds
    mapping(uint256 => uint256[]) private candidaturesParOffre;

    // etudiant → liste des candidatureIds
    mapping(address => uint256[]) private candidaturesParEtudiant;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event CandidatureSoumise(uint256 indexed candidatureId, address indexed etudiant, uint256 indexed offreId, uint256 date);
    event CandidatureAccepted(address indexed etudiant, uint256 indexed offreId, uint256 date);
    event CandidatureRefused(address indexed etudiant, uint256 indexed offreId, uint256 date);
    event AdminAlerte(address indexed etudiant, uint256 indexed offreId, string message);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyStudent() {
        require(
            userManager.isAuthorized(msg.sender, UserManager.Role.STUDENT),
            "CandidatureManager: etudiant autorise uniquement"
        );
        _;
    }

    modifier onlyRH() {
        require(
            userManager.isAuthorized(msg.sender, UserManager.Role.RH),
            "CandidatureManager: RH autorise uniquement"
        );
        _;
    }

    modifier candidatureExiste(uint256 _id) {
        require(candidatures[_id].id != 0, "CandidatureManager: candidature inexistante");
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(address _userManager, address _offreManager) {
        userManager  = UserManager(_userManager);
        offreManager = OffreManager(_offreManager);
        admin = msg.sender;
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Étudiant
    // ─────────────────────────────────────────────

    /// @notice Soumet une candidature à une offre
    /// @param _offreId      L'identifiant de l'offre
    /// @param _scoreMatching Le score calculé côté frontend (sur 100)
    function postuler(uint256 _offreId, uint16 _scoreMatching) external onlyStudent {
        require(dejaCandidat[msg.sender][_offreId] == 0, "CandidatureManager: deja candidat");
        require(_scoreMatching <= 100, "CandidatureManager: score invalide");

        // Vérifie que l'offre est toujours ouverte via SC2
        OffreManager.Offre memory o = offreManager.getOffre(_offreId);
        require(o.isOuverte, "CandidatureManager: offre fermee");

        uint256 id = nextId++;
        candidatures[id] = Candidature({
            id: id,
            etudiantWallet: msg.sender,
            offreId: _offreId,
            scoreMatching: _scoreMatching,
            statut: Statut.EN_ATTENTE,
            soumiseAt: block.timestamp,
            traiteeAt: 0
        });

        dejaCandidat[msg.sender][_offreId] = id;
        candidaturesParOffre[_offreId].push(id);
        candidaturesParEtudiant[msg.sender].push(id);

        emit CandidatureSoumise(id, msg.sender, _offreId, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — RH
    // ─────────────────────────────────────────────

    /// @notice Accepte une candidature
    function accepter(uint256 _candidatureId) external onlyRH candidatureExiste(_candidatureId) {
        Candidature storage c = candidatures[_candidatureId];

        require(c.statut == Statut.EN_ATTENTE, "CandidatureManager: statut invalide");
        require(
            offreManager.isOffreValide(c.offreId, msg.sender),
            "CandidatureManager: non proprietaire de l'offre"
        );

        c.statut    = Statut.ACCEPTE;
        c.traiteeAt = block.timestamp;

        emit CandidatureAccepted(c.etudiantWallet, c.offreId, block.timestamp);

        // Alerte automatique à l'admin pour déclencher l'étape convention (SC4)
        emit AdminAlerte(c.etudiantWallet, c.offreId, "Nouveau stage a traiter : convention requise");
    }

    /// @notice Refuse une candidature
    function refuser(uint256 _candidatureId) external onlyRH candidatureExiste(_candidatureId) {
        Candidature storage c = candidatures[_candidatureId];

        require(c.statut == Statut.EN_ATTENTE, "CandidatureManager: statut invalide");
        require(
            offreManager.isOffreValide(c.offreId, msg.sender),
            "CandidatureManager: non proprietaire de l'offre"
        );

        c.statut    = Statut.REFUSE;
        c.traiteeAt = block.timestamp;

        emit CandidatureRefused(c.etudiantWallet, c.offreId, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getCandidature(uint256 _id) external view candidatureExiste(_id) returns (Candidature memory) {
        return candidatures[_id];
    }

    function getCandidaturesParOffre(uint256 _offreId) external view returns (Candidature[] memory) {
        uint256[] storage ids = candidaturesParOffre[_offreId];
        Candidature[] memory result = new Candidature[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = candidatures[ids[i]];
        }
        return result;
    }

    function getCandidaturesEtudiant(address _etudiant) external view returns (Candidature[] memory) {
        uint256[] storage ids = candidaturesParEtudiant[_etudiant];
        Candidature[] memory result = new Candidature[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = candidatures[ids[i]];
        }
        return result;
    }

    /// @notice Retourne l'ID de candidature acceptée d'un étudiant pour une offre (utilisé par SC4)
    function getCandidatureAcceptee(address _etudiant, uint256 _offreId) external view returns (uint256) {
        uint256 id = dejaCandidat[_etudiant][_offreId];
        require(id != 0, "CandidatureManager: candidature inexistante");
        require(candidatures[id].statut == Statut.ACCEPTE, "CandidatureManager: candidature non acceptee");
        return id;
    }
}
