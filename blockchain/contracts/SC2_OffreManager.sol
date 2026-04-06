// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_AccountManager.sol";

/// @title SC2 — OffreManager
/// @notice Publication d'offres, candidatures, sélection
contract OffreManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    enum StatutOffre        { ACTIVE, FERMEE, ANNULEE }
    enum StatutCandidature  { EN_ATTENTE, ACCEPTEE, REFUSEE }

    struct Offre {
        uint256 id;
        address rh;
        string  titre;
        string  domaine;
        string  competences;
        uint256 dureeJours;
        uint256 nbPlaces;
        uint256 nbCandidatures;
        StatutOffre statut;
        uint256 createdAt;
    }

    struct Candidature {
        uint256 id;
        uint256 offreId;
        address etudiant;
        string  cidCV;          
        string  cidLM;          
        StatutCandidature statut;
        uint256 createdAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    AccountManager public accountManager;

    uint256 private offreCounter;
    uint256 private candidatureCounter;

    mapping(uint256 => Offre)       private offres;
    mapping(uint256 => Candidature) private candidatures;

    // offreId => liste des candidatureIds
    mapping(uint256 => uint256[]) private candidaturesParOffre;
    // etudiant => liste des candidatureIds
    mapping(address => uint256[]) private candidaturesParEtudiant;
    // etudiant => offreId => déjà postulé
    mapping(address => mapping(uint256 => bool)) private dejaPostule;

    // métriques entreprise (wallet RH)
    mapping(address => uint256) public nbOffresParRH;
    mapping(address => uint256) public nbStagiairesParRH;

    uint256[] private toutesLesOffres;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event OffrePubliee(uint256 indexed offreId, address indexed rh, uint256 date);
    event CandidatureDeposee(uint256 indexed candidatureId, uint256 indexed offreId, address indexed etudiant, uint256 date);
    event EtudiantSelectionne(uint256 indexed candidatureId, uint256 indexed offreId, address indexed etudiant, uint256 date);
    event CandidatureRefusee(uint256 indexed candidatureId, address indexed etudiant, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyRH() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.RH),
            "OffreManager: RH uniquement"
        );
        _;
    }

    modifier onlyStudent() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.STUDENT),
            "OffreManager: etudiant uniquement"
        );
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(address _accountManager) {
        accountManager = AccountManager(_accountManager);
    }

    // ─────────────────────────────────────────────
    //  Fonctions RH
    // ─────────────────────────────────────────────

    /// @notice Le RH publie une offre de stage
    function publierOffre(
        string calldata _titre,
        string calldata _domaine,
        string calldata _competences,
        uint256 _dureeJours,
        uint256 _nbPlaces
    ) external onlyRH {
        require(_nbPlaces > 0, "OffreManager: au moins une place");
        require(_dureeJours > 0, "OffreManager: duree invalide");

        offreCounter++;
        offres[offreCounter] = Offre({
            id: offreCounter,
            rh: msg.sender,
            titre: _titre,
            domaine: _domaine,
            competences: _competences,
            dureeJours: _dureeJours,
            nbPlaces: _nbPlaces,
            nbCandidatures: 0,
            statut: StatutOffre.ACTIVE,
            createdAt: block.timestamp
        });

        toutesLesOffres.push(offreCounter);
        nbOffresParRH[msg.sender]++;
        emit OffrePubliee(offreCounter, msg.sender, block.timestamp);
    }

    /// @notice Le RH accepte un candidat
    function selectionnerEtudiant(uint256 _candidatureId) external onlyRH {
        Candidature storage c = candidatures[_candidatureId];
        require(c.id != 0, "OffreManager: candidature inexistante");
        require(offres[c.offreId].rh == msg.sender, "OffreManager: pas votre offre");
        require(c.statut == StatutCandidature.EN_ATTENTE, "OffreManager: deja traitee");
        require(offres[c.offreId].statut == StatutOffre.ACTIVE, "OffreManager: offre fermee");

        c.statut = StatutCandidature.ACCEPTEE;
        nbStagiairesParRH[msg.sender]++;

        // Fermer l'offre si plus de places
        offres[c.offreId].nbPlaces--;
        if (offres[c.offreId].nbPlaces == 0) {
            offres[c.offreId].statut = StatutOffre.FERMEE;
        }

        emit EtudiantSelectionne(_candidatureId, c.offreId, c.etudiant, block.timestamp);
    }

    /// @notice Le RH refuse un candidat
    function refuserCandidature(uint256 _candidatureId) external onlyRH {
        Candidature storage c = candidatures[_candidatureId];
        require(c.id != 0, "OffreManager: candidature inexistante");
        require(offres[c.offreId].rh == msg.sender, "OffreManager: pas votre offre");
        require(c.statut == StatutCandidature.EN_ATTENTE, "OffreManager: deja traitee");

        c.statut = StatutCandidature.REFUSEE;
        emit CandidatureRefusee(_candidatureId, c.etudiant, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions Étudiant
    // ─────────────────────────────────────────────

    /// @notice L'étudiant postule à une offre (CV et LM sur IPFS)
    function postuler(
        uint256 _offreId,
        string calldata _cidCV,
        string calldata _cidLM
    ) external onlyStudent {
        require(offres[_offreId].statut == StatutOffre.ACTIVE, "OffreManager: offre non active");
        require(!dejaPostule[msg.sender][_offreId], "OffreManager: deja postule");
        require(bytes(_cidCV).length > 0, "OffreManager: CV requis");
        require(bytes(_cidLM).length > 0, "OffreManager: lettre de motivation requise");

        candidatureCounter++;
        candidatures[candidatureCounter] = Candidature({
            id: candidatureCounter,
            offreId: _offreId,
            etudiant: msg.sender,
            cidCV: _cidCV,
            cidLM: _cidLM,
            statut: StatutCandidature.EN_ATTENTE,
            createdAt: block.timestamp
        });

        candidaturesParOffre[_offreId].push(candidatureCounter);
        candidaturesParEtudiant[msg.sender].push(candidatureCounter);
        dejaPostule[msg.sender][_offreId] = true;
        offres[_offreId].nbCandidatures++;

        emit CandidatureDeposee(candidatureCounter, _offreId, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getOffre(uint256 _offreId) external view returns (Offre memory) {
        require(offres[_offreId].id != 0, "OffreManager: offre inexistante");
        return offres[_offreId];
    }

    function getAllOffres() external view returns (uint256[] memory) {
        return toutesLesOffres;
    }

    function getCandidature(uint256 _candidatureId) external view returns (Candidature memory) {
        require(candidatures[_candidatureId].id != 0, "OffreManager: candidature inexistante");
        return candidatures[_candidatureId];
    }

    function getCandidaturesByOffre(uint256 _offreId) external view returns (uint256[] memory) {
        return candidaturesParOffre[_offreId];
    }

    function getCandidaturesByEtudiant(address _etudiant) external view returns (uint256[] memory) {
        return candidaturesParEtudiant[_etudiant];
    }

    function getMetriquesRH(address _rh) external view returns (uint256 nbOffres, uint256 nbStagiaires) {
        return (nbOffresParRH[_rh], nbStagiairesParRH[_rh]);
    }
}