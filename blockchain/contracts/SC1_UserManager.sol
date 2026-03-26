// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title SC1 — UserManager
/// @notice Gestion des comptes étudiants et encadrants sur la blockchain
contract UserManager {

    // ─────────────────────────────────────────────
    //  Énumérations & Structures
    // ─────────────────────────────────────────────

    enum Role { NONE, STUDENT, ENCADRANT, RH, ADMIN }

    struct User {
        address wallet;
        Role    role;
        string  nom;
        string  prenom;
        string  filiere;      // pour étudiant
        string  entreprise;   // pour RH / tuteur
        bool    isActive;
        uint256 registeredAt;
    }

    // ─────────────────────────────────────────────
    //  État
    // ─────────────────────────────────────────────

    address public admin;

    mapping(address => User) private users;
    address[] private studentList;
    address[] private encadrantList;

    // ─────────────────────────────────────────────
    //  Événements
    // ─────────────────────────────────────────────

    event UserRegistered(address indexed wallet, Role role, uint256 date);
    event UserDeactivated(address indexed wallet, uint256 date);

    // ─────────────────────────────────────────────
    //  Modificateurs
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "UserManager: admin uniquement");
        _;
    }

    modifier walletValide(address _wallet) {
        require(_wallet != address(0), "UserManager: wallet invalide");
        require(users[_wallet].role == Role.NONE, "UserManager: wallet deja enregistre");
        _;
    }

    // ─────────────────────────────────────────────
    //  Constructeur
    // ─────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        // L'admin est enregistré automatiquement
        users[msg.sender] = User({
            wallet: msg.sender,
            role: Role.ADMIN,
            nom: "Admin",
            prenom: "Universite",
            filiere: "",
            entreprise: "",
            isActive: true,
            registeredAt: block.timestamp
        });
        emit UserRegistered(msg.sender, Role.ADMIN, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions publiques — Admin
    // ─────────────────────────────────────────────

    /// @notice Enregistre un étudiant on-chain
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
            isActive: true,
            registeredAt: block.timestamp
        });
        studentList.push(_wallet);
        emit UserRegistered(_wallet, Role.STUDENT, block.timestamp);
    }

    /// @notice Enregistre un encadrant pédagogique on-chain
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
            isActive: true,
            registeredAt: block.timestamp
        });
        encadrantList.push(_wallet);
        emit UserRegistered(_wallet, Role.ENCADRANT, block.timestamp);
    }

    /// @notice Enregistre un RH entreprise on-chain
    function addRH(
        address _wallet,
        string calldata _nom,
        string calldata _prenom,
        string calldata _entreprise
    ) external onlyAdmin walletValide(_wallet) {
        users[_wallet] = User({
            wallet: _wallet,
            role: Role.RH,
            nom: _nom,
            prenom: _prenom,
            filiere: "",
            entreprise: _entreprise,
            isActive: true,
            registeredAt: block.timestamp
        });
        emit UserRegistered(_wallet, Role.RH, block.timestamp);
    }

    /// @notice Désactive un compte
    function deactivateUser(address _wallet) external onlyAdmin {
        require(users[_wallet].role != Role.NONE, "UserManager: utilisateur inexistant");
        users[_wallet].isActive = false;
        emit UserDeactivated(_wallet, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  Fonctions de lecture
    // ─────────────────────────────────────────────

    /// @notice Retourne le profil complet d'un utilisateur
    function getUser(address _wallet) external view returns (User memory) {
        require(users[_wallet].role != Role.NONE, "UserManager: utilisateur introuvable");
        return users[_wallet];
    }

    /// @notice Retourne le rôle d'un wallet (utilisé par les autres smart contracts)
    function getRole(address _wallet) external view returns (Role) {
        return users[_wallet].role;
    }

    /// @notice Vérifie qu'un wallet est actif avec le rôle attendu
    function isAuthorized(address _wallet, Role _role) external view returns (bool) {
        User storage u = users[_wallet];
        return u.isActive && u.role == _role;
    }

    /// @notice Retourne la liste des étudiants enregistrés
    function getAllStudents() external view returns (address[] memory) {
        return studentList;
    }

    /// @notice Retourne la liste des encadrants enregistrés
    function getAllEncadrants() external view returns (address[] memory) {
        return encadrantList;
    }
}
