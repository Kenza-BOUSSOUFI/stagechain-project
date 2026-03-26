// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_UserManager.sol";

/// @title SC2 — OffreManager
/// @notice Publication et gestion des offres de stage par les RH
contract OffreManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    struct Offre {
        uint256 id;
        address rhWallet;
        string  entreprise;
        string  titre;
        string  domaine;
        string  ville;
        string  description;
        string  competencesRequises; // JSON stringifié côté frontend
        string  filiere;
        uint8   niveauRequis;        // 1=L1, 2=L2, 3=L3, 4=M1, 5=M2
        uint16  dureeMois;
        bool    isOuverte;
        uint256 publishedAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    UserManager public userManager;

    uint256 private nextId = 1;
    mapping(uint256 => Offre) private offres;
    uint256[] private offreIds;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event OffrePublished(uint256 indexed offreId, address indexed entreprise, uint256 date);
    event OfreClosed(uint256 indexed offreId, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyRH() {
        require(
            userManager.isAuthorized(msg.sender, UserManager.Role.RH),
            "OffreManager: RH autorise uniquement"
        );
        _;
    }

    modifier offreExiste(uint256 _id) {
        require(offres[_id].id != 0, "OffreManager: offre inexistante");
        _;
    }

    modifier offreOuverte(uint256 _id) {
        require(offres[_id].isOuverte, "OffreManager: offre deja fermee");
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(address _userManager) {
        userManager = UserManager(_userManager);
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — RH
    // ─────────────────────────────────────────────

    /// @notice Publie une nouvelle offre de stage
    function publishOffre(
        string calldata _entreprise,
        string calldata _titre,
        string calldata _domaine,
        string calldata _ville,
        string calldata _description,
        string calldata _competencesRequises,
        string calldata _filiere,
        uint8           _niveauRequis,
        uint16          _dureeMois
    ) external onlyRH returns (uint256) {
        uint256 id = nextId++;
        offres[id] = Offre({
            id: id,
            rhWallet: msg.sender,
            entreprise: _entreprise,
            titre: _titre,
            domaine: _domaine,
            ville: _ville,
            description: _description,
            competencesRequises: _competencesRequises,
            filiere: _filiere,
            niveauRequis: _niveauRequis,
            dureeMois: _dureeMois,
            isOuverte: true,
            publishedAt: block.timestamp
        });
        offreIds.push(id);
        emit OffrePublished(id, msg.sender, block.timestamp);
        return id;
    }

    /// @notice Ferme une offre (seul le RH propriétaire peut le faire)
    function closeOffre(uint256 _id)
        external
        onlyRH
        offreExiste(_id)
        offreOuverte(_id)
    {
        require(offres[_id].rhWallet == msg.sender, "OffreManager: non proprietaire");
        offres[_id].isOuverte = false;
        emit OfreClosed(_id, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getOffre(uint256 _id) external view offreExiste(_id) returns (Offre memory) {
        return offres[_id];
    }

    /// @notice Retourne toutes les offres ouvertes
    function getAllOffres() external view returns (Offre[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < offreIds.length; i++) {
            if (offres[offreIds[i]].isOuverte) count++;
        }
        Offre[] memory result = new Offre[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < offreIds.length; i++) {
            if (offres[offreIds[i]].isOuverte) {
                result[j++] = offres[offreIds[i]];
            }
        }
        return result;
    }

    /// @notice Vérifie que l'offre appartient au RH et est ouverte (utilisé par SC3)
    function isOffreValide(uint256 _id, address _rh) external view returns (bool) {
        Offre storage o = offres[_id];
        return o.id != 0 && o.isOuverte && o.rhWallet == _rh;
    }
}
