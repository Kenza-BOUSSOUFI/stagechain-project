// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title SC1 — AccountManager
/// @notice Gestion des comptes : universités, étudiants, encadrants, RH
contract AccountManager {

    // ─────────────────────────────────────────────
    //  Énumérations & Structures
    // ─────────────────────────────────────────────

    enum Role { NONE, STUDENT, ENCADRANT, RH, ADMIN }

    struct User {
        address wallet;
        Role    role;
        string  nom;
        string  prenom;
        string  filiere;
        string  entreprise;
        string  email;
        string  telephone;
        string  poste;
        string  ville;
        address universite;   // université de rattachement (pour STUDENT/ENCADRANT)
        bool    isActive;
        uint256 registeredAt;
    }

    struct Universite {
        address wallet;
        string  nom;
        string  ville;
        string  adresse;
        string  email;
        string  telephone;
        string  siteWeb;
        bool    isActive;
        uint256 registeredAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    mapping(address => User)       private users;
    mapping(address => Universite) private universites;

    address[] private universiteList;
    address[] private studentList;
    address[] private encadrantList;
    address[] private rhList;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event UniversiteRegistered(address indexed wallet, string nom, uint256 date);
    event UserRegistered(address indexed wallet, Role role, address indexed universite, uint256 date);
    event UserDeactivated(address indexed wallet, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(
            users[msg.sender].role == Role.ADMIN &&
            users[msg.sender].isActive,
            "AccountManager: admin uniquement"
        );
        _;
    }

    modifier walletValide(address _wallet) {
        require(_wallet != address(0), "AccountManager: wallet invalide");
        require(users[_wallet].role == Role.NONE, "AccountManager: wallet deja enregistre");
        _;
    }

    modifier universiteExiste(address _uni) {
        require(universites[_uni].isActive, "AccountManager: universite inexistante ou inactive");
        _;
    }

    // ─────────────────────────────────────────────
    //  Auto-inscription université
    // ─────────────────────────────────────────────

    /// @notice N'importe qui peut créer un compte université (admin de son université)
    function registerUniversite(
        string calldata _nom,
        string calldata _ville,
        string calldata _adresse,
        string calldata _email,
        string calldata _telephone,
        string calldata _siteWeb
    ) external walletValide(msg.sender) {
        require(bytes(_nom).length > 0, "AccountManager: nom requis");
        require(bytes(_ville).length > 0, "AccountManager: ville requise");
        require(bytes(_email).length > 0, "AccountManager: email requis");
        require(bytes(_telephone).length > 0, "AccountManager: telephone requis");

        universites[msg.sender] = Universite({
            wallet: msg.sender,
            nom: _nom,
            ville: _ville,
            adresse: _adresse,
            email: _email,
            telephone: _telephone,
            siteWeb: _siteWeb,
            isActive: true,
            registeredAt: block.timestamp
        });

        users[msg.sender] = User({
            wallet: msg.sender,
            role: Role.ADMIN,
            nom: _nom,
            prenom: "",
            filiere: "",
            entreprise: "",
            email: _email,
            telephone: _telephone,
            poste: "ADMIN_UNIVERSITE",
            ville: _ville,
            universite: msg.sender,
            isActive: true,
            registeredAt: block.timestamp
        });

        universiteList.push(msg.sender);
        emit UniversiteRegistered(msg.sender, _nom, block.timestamp);
        emit UserRegistered(msg.sender, Role.ADMIN, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Admin — enregistrement étudiants & encadrants
    // ─────────────────────────────────────────────

    /// @notice L'admin enregistre un étudiant rattaché à son université
    function addStudent(
        address _wallet,
        string calldata _nom,
        string calldata _prenom,
        string calldata _filiere
    ) external onlyAdmin walletValide(_wallet) {
        users[_wallet] = User({
            wallet: _wallet,
            role: Role.STUDENT,
            nom: _nom,
            prenom: _prenom,
            filiere: _filiere,
            entreprise: "",
            email: "",
            telephone: "",
            poste: "",
            ville: "",
            universite: msg.sender,  // rattaché à l'université de l'admin
            isActive: true,
            registeredAt: block.timestamp
        });
        studentList.push(_wallet);
        emit UserRegistered(_wallet, Role.STUDENT, msg.sender, block.timestamp);
    }

    /// @notice L'admin enregistre un encadrant rattaché à son université
    function addEncadrant(
        address _wallet,
        string calldata _nom,
        string calldata _prenom,
        string calldata _filiere
    ) external onlyAdmin walletValide(_wallet) {
        users[_wallet] = User({
            wallet: _wallet,
            role: Role.ENCADRANT,
            nom: _nom,
            prenom: _prenom,
            filiere: _filiere,
            entreprise: "",
            email: "",
            telephone: "",
            poste: "",
            ville: "",
            universite: msg.sender,
            isActive: true,
            registeredAt: block.timestamp
        });
        encadrantList.push(_wallet);
        emit UserRegistered(_wallet, Role.ENCADRANT, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Auto-inscription RH
    // ─────────────────────────────────────────────

    /// @notice Le RH s'enregistre lui-même — actif immédiatement
    function registerRH(
        string calldata _nom,
        string calldata _prenom,
        string calldata _entreprise,
        string calldata _poste,
        string calldata _email,
        string calldata _telephone,
        string calldata _ville
    ) external walletValide(msg.sender) {
        require(bytes(_nom).length > 0, "AccountManager: nom requis");
        require(bytes(_entreprise).length > 0, "AccountManager: entreprise requise");
        require(bytes(_poste).length > 0, "AccountManager: poste requis");
        require(bytes(_email).length > 0, "AccountManager: email requis");
        require(bytes(_telephone).length > 0, "AccountManager: telephone requis");
        require(bytes(_ville).length > 0, "AccountManager: ville requise");

        users[msg.sender] = User({
            wallet: msg.sender,
            role: Role.RH,
            nom: _nom,
            prenom: _prenom,
            filiere: "",
            entreprise: _entreprise,
            email: _email,
            telephone: _telephone,
            poste: _poste,
            ville: _ville,
            universite: address(0),
            isActive: true,
            registeredAt: block.timestamp
        });
        rhList.push(msg.sender);
        emit UserRegistered(msg.sender, Role.RH, address(0), block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Désactivation
    // ─────────────────────────────────────────────

    /// @notice L'admin désactive un compte de son université uniquement
    function deactivateUser(address _wallet) external onlyAdmin {
        require(users[_wallet].role != Role.NONE, "AccountManager: utilisateur inexistant");
        require(
            users[_wallet].universite == msg.sender,
            "AccountManager: utilisateur hors de votre universite"
        );
        users[_wallet].isActive = false;
        emit UserDeactivated(_wallet, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    function getUser(address _wallet) external view returns (User memory) {
        require(users[_wallet].role != Role.NONE, "AccountManager: introuvable");
        return users[_wallet];
    }

    function getRole(address _wallet) external view returns (Role) {
        return users[_wallet].role;
    }

    function isAuthorized(address _wallet, Role _role) external view returns (bool) {
        User storage u = users[_wallet];
        return u.isActive && u.role == _role;
    }

    function getUniversite(address _wallet) external view returns (Universite memory) {
        require(universites[_wallet].isActive, "AccountManager: universite introuvable");
        return universites[_wallet];
    }

    function getAllUniversites() external view returns (address[] memory) {
        return universiteList;
    }

    function getAllStudents() external view returns (address[] memory) {
        return studentList;
    }

    function getAllEncadrants() external view returns (address[] memory) {
        return encadrantList;
    }

    function getAllRH() external view returns (address[] memory) {
        return rhList;
    }

    /// @notice Retourne les étudiants d'une université spécifique
    function getStudentsByUniversite(address _uni) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < studentList.length; i++) {
            if (users[studentList[i]].universite == _uni) count++;
        }
        address[] memory result = new address[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < studentList.length; i++) {
            if (users[studentList[i]].universite == _uni) {
                result[j++] = studentList[i];
            }
        }
        return result;
    }

    /// @notice Retourne les encadrants d'une université spécifique
    function getEncadrantsByUniversite(address _uni) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < encadrantList.length; i++) {
            if (users[encadrantList[i]].universite == _uni) count++;
        }
        address[] memory result = new address[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < encadrantList.length; i++) {
            if (users[encadrantList[i]].universite == _uni) {
                result[j++] = encadrantList[i];
            }
        }
        return result;
    }
}