// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_AccountManager.sol";
import "./SC5_RapportManager.sol";
import "./SC3_ConventionManager.sol";

/// @title SC6 — CertifManager
/// @notice Génération attestation, signatures Admin + RH, QR code
contract CertifManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    enum StatutAttestation { EN_ATTENTE, SIGNEE_ADMIN, SIGNEE_RH, CERTIFIEE, REVOQUEE }

    struct Attestation {
        uint256 id;
        address etudiant;
        address admin;
        address rh;
        string  cidAttestation;     // CID IPFS du PDF attestation
        string  qrCodeData;         // données encodées dans le QR code
        uint256 noteFinale;         // copiée depuis SC5
        bool    signAdmin;
        bool    signRH;
        StatutAttestation statut;
        uint256 createdAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    AccountManager    public accountManager;
    RapportManager    public rapportManager;
    ConventionManager public conventionManager;

    uint256 private attestationCounter;
    mapping(uint256 => Attestation) private attestations;
    mapping(address => uint256)     public attestationParEtudiant;
    // QR code hash => attestationId (pour vérification publique)
    mapping(string => uint256)      public attestationParQR;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event AttestationGeneree(uint256 indexed attestationId, address indexed etudiant, uint256 date);
    event AttestationSignee(uint256 indexed attestationId, address indexed signataire, uint256 date);
    event AttestationCertifiee(uint256 indexed attestationId, address indexed etudiant, uint256 date);
    event AttestationRevoquee(uint256 indexed attestationId, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.ADMIN),
            "CertifManager: admin uniquement"
        );
        _;
    }

    modifier onlyRH() {
        require(
            accountManager.isAuthorized(msg.sender, AccountManager.Role.RH),
            "CertifManager: RH uniquement"
        );
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(
        address _accountManager,
        address _rapportManager,
        address _conventionManager
    ) {
        accountManager    = AccountManager(_accountManager);
        rapportManager    = RapportManager(_rapportManager);
        conventionManager = ConventionManager(_conventionManager);
    }

    // ─────────────────────────────────────────────
    //  Génération automatique (déclenchée par admin)
    // ─────────────────────────────────────────────

    /// @notice Génère l'attestation après que la note finale est calculée
    function genererAttestation(
        address _etudiant,
        string calldata _cidAttestation,
        string calldata _qrCodeData
    ) external onlyAdmin {
        require(rapportManager.isNoteCalculee(_etudiant), "CertifManager: note non calculee");
        require(attestationParEtudiant[_etudiant] == 0, "CertifManager: attestation deja generee");

        RapportManager.RapportFinal memory rapport = rapportManager.getRapportByEtudiant(_etudiant);
        ConventionManager.Convention memory conv   = conventionManager.getConventionByEtudiant(_etudiant);

        attestationCounter++;
        attestations[attestationCounter] = Attestation({
            id: attestationCounter,
            etudiant: _etudiant,
            admin: msg.sender,
            rh: conv.rh,
            cidAttestation: _cidAttestation,
            qrCodeData: _qrCodeData,
            noteFinale: rapport.noteFinale,
            signAdmin: false,
            signRH: false,
            statut: StatutAttestation.EN_ATTENTE,
            createdAt: block.timestamp
        });

        attestationParEtudiant[_etudiant]  = attestationCounter;
        attestationParQR[_qrCodeData]      = attestationCounter;

        emit AttestationGeneree(attestationCounter, _etudiant, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Signatures
    // ─────────────────────────────────────────────

    /// @notice L'admin signe l'attestation
    function signerParAdmin(uint256 _attestationId) external onlyAdmin {
        Attestation storage a = attestations[_attestationId];
        require(a.id != 0, "CertifManager: attestation inexistante");
        require(msg.sender == a.admin, "CertifManager: pas votre universite");
        require(!a.signAdmin, "CertifManager: deja signe");

        a.signAdmin = true;
        a.statut    = StatutAttestation.SIGNEE_ADMIN;
        emit AttestationSignee(_attestationId, msg.sender, block.timestamp);
        _verifierCertification(a);
    }

    /// @notice Le RH signe l'attestation
    function signerParRH(uint256 _attestationId) external onlyRH {
        Attestation storage a = attestations[_attestationId];
        require(a.id != 0, "CertifManager: attestation inexistante");
        require(msg.sender == a.rh, "CertifManager: pas votre attestation");
        require(!a.signRH, "CertifManager: deja signe");

        a.signRH = true;
        a.statut = StatutAttestation.SIGNEE_RH;
        emit AttestationSignee(_attestationId, msg.sender, block.timestamp);
        _verifierCertification(a);
    }

    /// @notice Certifie si les deux signatures sont présentes
    function _verifierCertification(Attestation storage a) internal {
        if (a.signAdmin && a.signRH) {
            a.statut = StatutAttestation.CERTIFIEE;
            emit AttestationCertifiee(a.id, a.etudiant, block.timestamp);
        }
    }

    /// @notice L'admin révoque une attestation
    function revoquerAttestation(uint256 _attestationId) external onlyAdmin {
        Attestation storage a = attestations[_attestationId];
        require(a.id != 0, "CertifManager: attestation inexistante");
        require(msg.sender == a.admin, "CertifManager: pas votre universite");
        require(a.statut != StatutAttestation.REVOQUEE, "CertifManager: deja revoquee");

        a.statut = StatutAttestation.REVOQUEE;
        emit AttestationRevoquee(_attestationId, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Vérification publique (sans authentification)
    // ─────────────────────────────────────────────

    /// @notice Vérification publique via QR code — accessible à tous
    function verifierParQR(string calldata _qrCodeData) external view returns (
        bool estValide,
        address etudiant,
        uint256 noteFinale,
        uint256 date
    ) {
        uint256 id = attestationParQR[_qrCodeData];
        if (id == 0) return (false, address(0), 0, 0);

        Attestation memory a = attestations[id];
        estValide  = (a.statut == StatutAttestation.CERTIFIEE);
        etudiant   = a.etudiant;
        noteFinale = a.noteFinale;
        date       = a.createdAt;
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getAttestation(uint256 _attestationId) external view returns (Attestation memory) {
        require(attestations[_attestationId].id != 0, "CertifManager: inexistante");
        return attestations[_attestationId];
    }

    function getAttestationByEtudiant(address _etudiant) external view returns (Attestation memory) {
        uint256 id = attestationParEtudiant[_etudiant];
        require(id != 0, "CertifManager: aucune attestation");
        return attestations[id];
    }
}
