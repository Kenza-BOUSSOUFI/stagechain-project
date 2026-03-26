// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SC1_UserManager.sol";
import "./SC4_ConventionManager.sol";
import "./SC6_RapportManager.sol";

/// @title SC7 — CertifManager
/// @notice Génération de l'attestation certifiée, signatures, QR Code et vérification publique
contract CertifManager {

    // ─────────────────────────────────────────────
    //  Structures
    // ─────────────────────────────────────────────

    struct Attestation {
        uint256 id;
        address etudiantWallet;
        string  hashIPFS;          // CID PDF de l'attestation sur IPFS
        uint256 noteFinale_x10;    // ×10 (ex: 155 = 15.5/20)
        string  qrCodeData;        // données encodées dans le QR Code

        // Signatures (3 requises)
        bool    signatureTuteur;
        bool    signatureEncadrant;
        bool    signatureAdmin;

        bool    certifiee;         // true seulement si les 3 signatures présentes
        uint256 genereAt;
        uint256 certifieeAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    UserManager       public userManager;
    ConventionManager public conventionManager;
    RapportManager    public rapportManager;
    address           public admin;

    uint256 private nextId = 1;
    mapping(uint256 => Attestation) private attestations;
    mapping(address => uint256)     private attestationParEtudiant;

    // QR Code → attestationId (pour vérification publique rapide)
    mapping(bytes32 => uint256) private qrIndex;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event AttestationGeneree(uint256 indexed attestationId, address indexed etudiant, string hashIPFS, uint256 date);
    event SignatureAttestation(uint256 indexed attestationId, address indexed signataire, uint8 signatureIndex);
    event AttestationCertified(address indexed etudiant, string hashIPFS, string qrCodeData, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "CertifManager: admin uniquement");
        _;
    }

    modifier attestationExiste(uint256 _id) {
        require(attestations[_id].id != 0, "CertifManager: attestation inexistante");
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor(
        address _userManager,
        address _conventionManager,
        address _rapportManager
    ) {
        userManager       = UserManager(_userManager);
        conventionManager = ConventionManager(_conventionManager);
        rapportManager    = RapportManager(_rapportManager);
        admin = msg.sender;
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Admin (déclenchement automatique via événement SC6)
    // ─────────────────────────────────────────────

    /// @notice Génère l'attestation après validation du rapport (déclenché par SC6)
    /// @dev L'admin appelle cette fonction suite à l'événement RapportValide de SC6
    function genererAttestation(
        address _etudiant,
        string calldata _hashIPFSAttestation
    ) external onlyAdmin {
        // Vérifications chaînées
        require(
            rapportManager.isRapportValide(_etudiant),
            "CertifManager: rapport non valide"
        );
        require(
            attestationParEtudiant[_etudiant] == 0,
            "CertifManager: attestation deja generee"
        );

        uint256 noteFinale = rapportManager.getNoteFinale(_etudiant);
        string memory dernierCID = rapportManager.getDernierCID(_etudiant);

        uint256 id = nextId++;

        // Génération du QR Code data : hash(etudiant + CID rapport + timestamp)
        string memory qrData = _buildQRData(id, _etudiant, dernierCID);
        bytes32 qrHash = keccak256(abi.encodePacked(qrData));

        attestations[id] = Attestation({
            id: id,
            etudiantWallet: _etudiant,
            hashIPFS: _hashIPFSAttestation,
            noteFinale_x10: noteFinale,
            qrCodeData: qrData,
            signatureTuteur: false,
            signatureEncadrant: false,
            signatureAdmin: false,
            certifiee: false,
            genereAt: block.timestamp,
            certifieeAt: 0
        });

        attestationParEtudiant[_etudiant] = id;
        qrIndex[qrHash] = id;

        emit AttestationGeneree(id, _etudiant, _hashIPFSAttestation, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Signature (3 parties)
    // ─────────────────────────────────────────────

    /// @notice Signe l'attestation (tuteur, encadrant ou admin)
    function signerAttestation(uint256 _attestationId) external attestationExiste(_attestationId) {
        Attestation storage a = attestations[_attestationId];
        require(!a.certifiee, "CertifManager: attestation deja certifiee");

        address etudiant  = a.etudiantWallet;
        address tuteur    = conventionManager.getTuteur(etudiant);
        address encadrant = conventionManager.getEncadrant(etudiant);

        if (msg.sender == tuteur) {
            require(!a.signatureTuteur, "CertifManager: tuteur a deja signe");
            a.signatureTuteur = true;
            emit SignatureAttestation(_attestationId, msg.sender, 1);

        } else if (msg.sender == encadrant) {
            require(!a.signatureEncadrant, "CertifManager: encadrant a deja signe");
            a.signatureEncadrant = true;
            emit SignatureAttestation(_attestationId, msg.sender, 2);

        } else if (msg.sender == admin) {
            require(!a.signatureAdmin, "CertifManager: admin a deja signe");
            a.signatureAdmin = true;
            emit SignatureAttestation(_attestationId, msg.sender, 3);

        } else {
            revert("CertifManager: signataire non autorise");
        }

        // Certifie l'attestation si les 3 signatures sont présentes
        if (a.signatureTuteur && a.signatureEncadrant && a.signatureAdmin) {
            a.certifiee    = true;
            a.certifieeAt  = block.timestamp;
            emit AttestationCertified(etudiant, a.hashIPFS, a.qrCodeData, block.timestamp);
        }
    }

    // ─────────────────────────────────────────────
    //  Vérification publique (sans compte requis)
    // ─────────────────────────────────────────────

    /// @notice Vérifie une attestation via son QR Code — accessible publiquement
    /// @return authentique  true si le hash PDF correspond au hash on-chain
    /// @return etudiant     Wallet de l'étudiant
    /// @return noteFinale   Note finale ×10
    /// @return certifieeAt  Timestamp de certification
    function verifier(string calldata _qrCodeData, string calldata _hashPDFActuel)
        external
        view
        returns (
            bool    authentique,
            address etudiant,
            uint256 noteFinale,
            uint256 certifieeAt
        )
    {
        bytes32 qrHash = keccak256(abi.encodePacked(_qrCodeData));
        uint256 id = qrIndex[qrHash];

        if (id == 0) {
            return (false, address(0), 0, 0);
        }

        Attestation storage a = attestations[id];

        if (!a.certifiee) {
            return (false, a.etudiantWallet, 0, 0);
        }

        // Comparaison du hash PDF actuel avec le hash ancré on-chain
        authentique = keccak256(abi.encodePacked(_hashPDFActuel))
                   == keccak256(abi.encodePacked(a.hashIPFS));

        return (authentique, a.etudiantWallet, a.noteFinale_x10, a.certifieeAt);
    }

    /// @notice Retourne les données du QR Code pour une attestation (lecture simple)
    function getQRCode(uint256 _attestationId)
        external
        view
        attestationExiste(_attestationId)
        returns (string memory)
    {
        require(
            attestations[_attestationId].certifiee,
            "CertifManager: attestation non certifiee"
        );
        return attestations[_attestationId].qrCodeData;
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getAttestation(uint256 _id) external view attestationExiste(_id) returns (Attestation memory) {
        return attestations[_id];
    }

    function getAttestationByEtudiant(address _etudiant) external view returns (Attestation memory) {
        uint256 id = attestationParEtudiant[_etudiant];
        require(id != 0, "CertifManager: aucune attestation pour cet etudiant");
        return attestations[id];
    }

    // ─────────────────────────────────────────────
    //  Fonctions internes
    // ─────────────────────────────────────────────

    /// @dev Construit les données encodées dans le QR Code
    function _buildQRData(
        uint256 _attestationId,
        address _etudiant,
        string memory _rapportCID
    ) internal view returns (string memory) {
        // Format : "stagechainv1:{attestationId}:{etudiant}:{rapportCID}:{timestamp}"
        // Le frontend construira le vrai QR image à partir de cette chaîne
        return string(
            abi.encodePacked(
                "stagechainv1:",
                _uint2str(_attestationId),
                ":",
                _addr2str(_etudiant),
                ":",
                _rapportCID,
                ":",
                _uint2str(block.timestamp)
            )
        );
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k--;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bstr[k] = bytes1(temp);
            _i /= 10;
        }
        return string(bstr);
    }

    function _addr2str(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0"; str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2]     = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2]     = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
