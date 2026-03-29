import { expect } from "chai";
import hre from "hardhat";
import type {
  AccountManager,
  OffreManager,
  ConventionManager,
  SuiviManager,
  RapportManager,
  CertifManager,
} from "../types/ethers-contracts/index.js";

describe("StageChain — Suite complète", function () {

  let accountManager:   AccountManager;
  let offreManager:     OffreManager;
  let conventionManager: ConventionManager;
  let suiviManager:     SuiviManager;
  let rapportManager:   RapportManager;
  let certifManager:    CertifManager;

  // Signers
  let adminUni:   any; // admin université (auto-inscrit)
  let etudiant:   any;
  let encadrant:  any;
  let rh:         any;
  let public1:    any; // vérificateur externe / non autorisé
  let ethers:     any;

  beforeEach(async function () {
    const connection = await hre.network.connect();
    ethers = connection.ethers;

    const signers = await ethers.getSigners();
    [adminUni, etudiant, encadrant, rh, public1] = signers;

    // ── Déploiement dans l'ordre des dépendances ──────────────────────────
    accountManager    = await ethers.deployContract("AccountManager");
    offreManager      = await ethers.deployContract("OffreManager",      [await accountManager.getAddress()]);
    conventionManager = await ethers.deployContract("ConventionManager", [await accountManager.getAddress(), await offreManager.getAddress()]);
    suiviManager      = await ethers.deployContract("SuiviManager",      [await accountManager.getAddress(), await conventionManager.getAddress()]);
    rapportManager    = await ethers.deployContract("RapportManager",    [await accountManager.getAddress(), await conventionManager.getAddress()]);
    certifManager     = await ethers.deployContract("CertifManager",     [await accountManager.getAddress(), await rapportManager.getAddress(), await conventionManager.getAddress()]);

    // ── Setup de base : inscription université (admin) + RH ───────────────
    await accountManager.connect(adminUni).registerUniversite("Université Hassan II", "Casablanca");
    await accountManager.connect(rh).registerRH("Martin", "Alice", "TechCorp");
  });

  // ═══════════════════════════════════════════════════════════════════
  //  SC1 — AccountManager
  // ═══════════════════════════════════════════════════════════════════

  describe("SC1 — AccountManager", function () {

    it("Auto-inscription université : admin enregistré correctement", async function () {
      const user = await accountManager.getUser(adminUni.address);
      expect(user.role).to.equal(4n);       // Role.ADMIN
      expect(user.isActive).to.be.true;
      expect(user.nom).to.equal("Université Hassan II");
    });

    it("Deux universités peuvent s'inscrire indépendamment", async function () {
      const [,,,,,admin2] = await ethers.getSigners();
      await accountManager.connect(admin2).registerUniversite("Université Mohammed V", "Rabat");
      const user2 = await accountManager.getUser(admin2.address);
      expect(user2.role).to.equal(4n);
      expect(user2.nom).to.equal("Université Mohammed V");
    });

    it("Même wallet ne peut pas s'inscrire deux fois", async function () {
      await expect(
        accountManager.connect(adminUni).registerUniversite("Doublon", "Fès")
      ).to.be.revertedWith("AccountManager: wallet deja enregistre");
    });

    it("Admin peut enregistrer un étudiant", async function () {
      await expect(
        accountManager.connect(adminUni).addStudent(etudiant.address, "Lakbita", "Fatima", "CyberSécurité")
      ).to.emit(accountManager, "UserRegistered");

      const user = await accountManager.getUser(etudiant.address);
      expect(user.nom).to.equal("Lakbita");
      expect(user.role).to.equal(1n);       // Role.STUDENT
      expect(user.universite).to.equal(adminUni.address);
    });

    it("Admin peut enregistrer un encadrant", async function () {
      await accountManager.connect(adminUni).addEncadrant(encadrant.address, "Prof", "Yasser", "Informatique");
      const user = await accountManager.getUser(encadrant.address);
      expect(user.role).to.equal(2n);       // Role.ENCADRANT
      expect(user.universite).to.equal(adminUni.address);
    });

    it("Auto-inscription RH active immédiatement", async function () {
      const user = await accountManager.getUser(rh.address);
      expect(user.role).to.equal(3n);       // Role.RH
      expect(user.entreprise).to.equal("TechCorp");
      expect(user.isActive).to.be.true;
    });

    it("Non-admin ne peut pas enregistrer un étudiant", async function () {
      await expect(
        accountManager.connect(public1).addStudent(etudiant.address, "A", "B", "Info")
      ).to.be.revertedWith("AccountManager: admin uniquement");
    });

    it("Wallet déjà enregistré est rejeté", async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      await expect(
        accountManager.connect(adminUni).addStudent(etudiant.address, "C", "D", "CyberSec")
      ).to.be.revertedWith("AccountManager: wallet deja enregistre");
    });

    it("isAuthorized retourne vrai pour le bon rôle", async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      expect(await accountManager.isAuthorized(etudiant.address, 1n)).to.be.true;
      expect(await accountManager.isAuthorized(etudiant.address, 2n)).to.be.false;
    });

    it("Admin désactive un utilisateur de son université", async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      await accountManager.connect(adminUni).deactivateUser(etudiant.address);
      expect(await accountManager.isAuthorized(etudiant.address, 1n)).to.be.false;
    });

    it("Admin ne peut pas désactiver un utilisateur d'une autre université", async function () {
      const [,,,,,admin2, etudiant2] = await ethers.getSigners();
      await accountManager.connect(admin2).registerUniversite("Université Ibn Tofail", "Kénitra");
      await accountManager.connect(admin2).addStudent(etudiant2.address, "X", "Y", "Info");
      await expect(
        accountManager.connect(adminUni).deactivateUser(etudiant2.address)
      ).to.be.revertedWith("AccountManager: utilisateur hors de votre universite");
    });

    it("getStudentsByUniversite retourne les bons étudiants", async function () {
      const [,,,,,, etudiant2] = await ethers.getSigners();
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      await accountManager.connect(adminUni).addStudent(etudiant2.address, "C", "D", "Math");
      const students = await accountManager.getStudentsByUniversite(adminUni.address);
      expect(students.length).to.equal(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  SC2 — OffreManager
  // ═══════════════════════════════════════════════════════════════════

  describe("SC2 — OffreManager", function () {

    it("RH peut publier une offre", async function () {
      await expect(
        offreManager.connect(rh).publierOffre("Stage Dev Blockchain", "Informatique", "Solidity,Python", 90, 3)
      ).to.emit(offreManager, "OffrePubliee");

      const offre = await offreManager.getOffre(1n);
      expect(offre.titre).to.equal("Stage Dev Blockchain");
      expect(offre.statut).to.equal(0n); // StatutOffre.ACTIVE
    });

    it("Non-RH ne peut pas publier", async function () {
      await expect(
        offreManager.connect(public1).publierOffre("X", "X", "X", 30, 1)
      ).to.be.revertedWith("OffreManager: RH uniquement");
    });

    it("Étudiant peut postuler à une offre", async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "Lakbita", "Fatima", "CyberSec");
      await offreManager.connect(rh).publierOffre("Stage Dev", "Info", "Python", 90, 3);

      await expect(
        offreManager.connect(etudiant).postuler(1n, "QmCidCV123", "QmCidLM456")
      ).to.emit(offreManager, "CandidatureDeposee");

      const cands = await offreManager.getCandidaturesByOffre(1n);
      expect(cands.length).to.equal(1);
    });

    it("Double candidature refusée", async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      await offreManager.connect(rh).publierOffre("Stage", "Info", "JS", 60, 2);
      await offreManager.connect(etudiant).postuler(1n, "QmCV", "QmLM");
      await expect(
        offreManager.connect(etudiant).postuler(1n, "QmCV2", "QmLM2")
      ).to.be.revertedWith("OffreManager: deja postule");
    });

    it("RH peut accepter une candidature", async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      await offreManager.connect(rh).publierOffre("Stage", "Info", "JS", 60, 2);
      await offreManager.connect(etudiant).postuler(1n, "QmCV", "QmLM");
      await expect(
        offreManager.connect(rh).selectionnerEtudiant(1n)
      ).to.emit(offreManager, "EtudiantSelectionne");

      const cand = await offreManager.getCandidature(1n);
      expect(cand.statut).to.equal(1n); // StatutCandidature.ACCEPTEE
    });

    it("RH peut refuser une candidature", async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      await offreManager.connect(rh).publierOffre("Stage", "Info", "JS", 60, 2);
      await offreManager.connect(etudiant).postuler(1n, "QmCV", "QmLM");
      await offreManager.connect(rh).refuserCandidature(1n);
      const cand = await offreManager.getCandidature(1n);
      expect(cand.statut).to.equal(2n); // StatutCandidature.REFUSEE
    });

    it("RH non propriétaire ne peut pas traiter la candidature", async function () {
      const [,,,,, rh2] = await ethers.getSigners();
      await accountManager.connect(rh2).registerRH("Dupont", "Paul", "AutreBoite");
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      await offreManager.connect(rh).publierOffre("Stage", "Info", "JS", 60, 2);
      await offreManager.connect(etudiant).postuler(1n, "QmCV", "QmLM");
      await expect(
        offreManager.connect(rh2).selectionnerEtudiant(1n)
      ).to.be.revertedWith("OffreManager: pas votre offre");
    });

    it("getAllOffres retourne toutes les offres actives", async function () {
      await offreManager.connect(rh).publierOffre("T1", "Info", "JS", 60, 2);
      await offreManager.connect(rh).publierOffre("T2", "Info", "Python", 90, 1);
      const offres = await offreManager.getAllOffres();
      expect(offres.length).to.equal(2);
    });

    it("métriques RH correctes après sélection", async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "A", "B", "Info");
      await offreManager.connect(rh).publierOffre("Stage", "Info", "JS", 60, 2);
      await offreManager.connect(etudiant).postuler(1n, "QmCV", "QmLM");
      await offreManager.connect(rh).selectionnerEtudiant(1n);
      const [nbOffres, nbStagiaires] = await offreManager.getMetriquesRH(rh.address);
      expect(nbOffres).to.equal(1n);
      expect(nbStagiaires).to.equal(1n);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  SC3 — ConventionManager
  // ═══════════════════════════════════════════════════════════════════

  describe("SC3 — ConventionManager", function () {

    beforeEach(async function () {
      await accountManager.connect(adminUni).addStudent(etudiant.address, "Lakbita", "Fatima", "CyberSec");
      await accountManager.connect(adminUni).addEncadrant(encadrant.address, "Prof", "Yasser", "Info");
      await offreManager.connect(rh).publierOffre("Stage Dev", "Info", "Solidity", 90, 3);
      await offreManager.connect(etudiant).postuler(1n, "QmCV", "QmLM");
      await offreManager.connect(rh).selectionnerEtudiant(1n);
    });

    it("RH peut générer une convention", async function () {
      await expect(
        conventionManager.connect(rh).genererConvention(1n, "QmConvention123")
      ).to.emit(conventionManager, "ConventionGeneree");

      const conv = await conventionManager.getConventionByEtudiant(etudiant.address);
      expect(conv.encadrant).to.equal("0x0000000000000000000000000000000000000000");
      expect(conv.statut).to.equal(0n); // EN_ATTENTE
    });

    it("Admin peut affecter un encadrant", async function () {
      await conventionManager.connect(rh).genererConvention(1n, "QmConvention123");
      await expect(
        conventionManager.connect(adminUni).affecterEncadrant(1n, encadrant.address)
      ).to.emit(conventionManager, "EncadrantAffecte");

      const conv = await conventionManager.getConvention(1n);
      expect(conv.encadrant).to.equal(encadrant.address);
    });

    it("Admin ne peut pas affecter un encadrant d'une autre université", async function () {
      const [,,,,, admin2, encadrant2] = await ethers.getSigners();
      await accountManager.connect(admin2).registerUniversite("Uni Rabat", "Rabat");
      await accountManager.connect(admin2).addEncadrant(encadrant2.address, "Prof2", "Omar", "Math");
      await conventionManager.connect(rh).genererConvention(1n, "QmConv");
      await expect(
        conventionManager.connect(adminUni).affecterEncadrant(1n, encadrant2.address)
      ).to.be.revertedWith("ConventionManager: encadrant hors de votre universite");
    });

    it("Signatures bloquées si encadrant non affecté", async function () {
      await conventionManager.connect(rh).genererConvention(1n, "QmConv");
      await expect(
        conventionManager.connect(etudiant).signerParEtudiant(1n)
      ).to.be.revertedWith("ConventionManager: encadrant non affecte");
    });

    it("Convention COMPLETE après 3 signatures", async function () {
      await conventionManager.connect(rh).genererConvention(1n, "QmConvention123");
      await conventionManager.connect(adminUni).affecterEncadrant(1n, encadrant.address);
      await conventionManager.connect(etudiant).signerParEtudiant(1n);
      await conventionManager.connect(rh).signerParRH(1n);
      await expect(
        conventionManager.connect(adminUni).signerParAdmin(1n)
      ).to.emit(conventionManager, "ConventionComplete");

      const conv = await conventionManager.getConvention(1n);
      expect(conv.statut).to.equal(4n); // COMPLETE
    });

    it("Signataire non autorisé rejeté", async function () {
      await conventionManager.connect(rh).genererConvention(1n, "QmConv");
      await conventionManager.connect(adminUni).affecterEncadrant(1n, encadrant.address);
      await expect(
        conventionManager.connect(public1).signerParEtudiant(1n)
      ).to.be.revertedWith("ConventionManager: pas votre convention");
    });

    it("getEncadrantByEtudiant retourne le bon encadrant", async function () {
      await conventionManager.connect(rh).genererConvention(1n, "QmConv");
      await conventionManager.connect(adminUni).affecterEncadrant(1n, encadrant.address);
      const enc = await conventionManager.getEncadrantByEtudiant(etudiant.address);
      expect(enc).to.equal(encadrant.address);
    });

    it("getEtudiantsByEncadrant retourne les étudiants suivis", async function () {
      await conventionManager.connect(rh).genererConvention(1n, "QmConv");
      await conventionManager.connect(adminUni).affecterEncadrant(1n, encadrant.address);
      const etudiants = await conventionManager.getEtudiantsByEncadrant(encadrant.address);
      expect(etudiants.length).to.equal(1);
      expect(etudiants[0]).to.equal(etudiant.address);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  Flux complet SC4 → SC5 → SC6
  // ═══════════════════════════════════════════════════════════════════

  describe("Flux complet SC4 → SC5 → SC6", function () {

    beforeEach(async function () {
      // Setup complet : inscription → offre → candidature → convention signée
      await accountManager.connect(adminUni).addStudent(etudiant.address, "Lakbita", "Fatima", "CyberSec");
      await accountManager.connect(adminUni).addEncadrant(encadrant.address, "Prof", "Yasser", "Info");
      await offreManager.connect(rh).publierOffre("Stage Dev", "Info", "Solidity", 90, 3);
      await offreManager.connect(etudiant).postuler(1n, "QmCV", "QmLM");
      await offreManager.connect(rh).selectionnerEtudiant(1n);
      await conventionManager.connect(rh).genererConvention(1n, "QmConvention");
      await conventionManager.connect(adminUni).affecterEncadrant(1n, encadrant.address);
      await conventionManager.connect(etudiant).signerParEtudiant(1n);
      await conventionManager.connect(rh).signerParRH(1n);
      await conventionManager.connect(adminUni).signerParAdmin(1n);
    });

    // ── SC4 — SuiviManager ──────────────────────────────────────────

    it("SC4 — Étudiant peut déposer un rapport d'avancement", async function () {
      await expect(
        suiviManager.connect(etudiant).deposerRapport("QmRapportSemaine1")
      ).to.emit(suiviManager, "RapportDepose");
    });

    it("SC4 — Dépôt bloqué si aucune convention existante", async function () {
      // Étudiant sans convention du tout → rejet par ConventionManager
      const [,,,,, etudiant2] = await ethers.getSigners();
      await accountManager.connect(adminUni).addStudent(etudiant2.address, "X", "Y", "Math");
      await expect(
        suiviManager.connect(etudiant2).deposerRapport("QmRapport")
      ).to.be.revertedWith("ConventionManager: aucune convention");
    });

    it("SC4 — Dépôt bloqué si convention non complète (signatures manquantes)", async function () {
      // Étudiant avec convention générée mais pas encore signée
      const [,,,,, etudiant2] = await ethers.getSigners();
      await accountManager.connect(adminUni).addStudent(etudiant2.address, "X", "Y", "Math");
      await offreManager.connect(etudiant2).postuler(1n, "QmCV2", "QmLM2");
      await offreManager.connect(rh).selectionnerEtudiant(2n);
      await conventionManager.connect(rh).genererConvention(2n, "QmConv2");
      await conventionManager.connect(adminUni).affecterEncadrant(2n, encadrant.address);
      // Convention générée mais pas signée → statut EN_ATTENTE
      await expect(
        suiviManager.connect(etudiant2).deposerRapport("QmRapport")
      ).to.be.revertedWith("SuiviManager: convention non signee");
    });

    it("SC4 — Encadrant peut valider un rapport", async function () {
      await suiviManager.connect(etudiant).deposerRapport("QmRapport1");
      await expect(
        suiviManager.connect(encadrant).validerRapport(1n)
      ).to.emit(suiviManager, "RapportValide");
    });

    it("SC4 — Encadrant peut commenter un rapport", async function () {
      await suiviManager.connect(etudiant).deposerRapport("QmRapport1");
      await expect(
        suiviManager.connect(encadrant).commenterRapport(1n, "Bon travail, continuer ainsi")
      ).to.emit(suiviManager, "RapportCommente");

      const rapport = await suiviManager.getRapport(1n);
      expect(rapport.commentaire).to.equal("Bon travail, continuer ainsi");
    });

    it("SC4 — Non-encadrant ne peut pas valider", async function () {
      await suiviManager.connect(etudiant).deposerRapport("QmRapport1");
      await expect(
        suiviManager.connect(public1).validerRapport(1n)
      ).to.be.revertedWith("SuiviManager: encadrant uniquement");
    });

    it("SC4 — getRapportsByEtudiant retourne tous les rapports", async function () {
      await suiviManager.connect(etudiant).deposerRapport("QmRapport1");
      await suiviManager.connect(etudiant).deposerRapport("QmRapport2");
      await suiviManager.connect(etudiant).deposerRapport("QmRapport3");
      const rapports = await suiviManager.getRapportsByEtudiant(etudiant.address);
      expect(rapports.length).to.equal(3);
    });

    // ── SC5 — RapportManager ────────────────────────────────────────

    it("SC5 — Étudiant peut déposer le rapport final", async function () {
      await expect(
        rapportManager.connect(etudiant).deposerRapportFinal("QmRapportFinal")
      ).to.emit(rapportManager, "RapportFinalDepose");
    });

    it("SC5 — Double dépôt rapport final refusé", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal1");
      await expect(
        rapportManager.connect(etudiant).deposerRapportFinal("QmFinal2")
      ).to.be.revertedWith("RapportManager: rapport deja depose");
    });

    it("SC5 — RH note le rapport (60%)", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await expect(
        rapportManager.connect(rh).noterParRH(1n, 16)
      ).to.emit(rapportManager, "NoteRHDeposee");
    });

    it("SC5 — Encadrant note le rapport (40%)", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await expect(
        rapportManager.connect(encadrant).noterParEncadrant(1n, 14)
      ).to.emit(rapportManager, "NoteEncadrantDeposee");
    });

    it("SC5 — Note finale calculée automatiquement (60% RH + 40% Encadrant)", async function () {
      // noteFinale = noteRH*60 + noteEncadrant*40
      // 16*60 + 14*40 = 960 + 560 = 1520 (×100 pour précision)
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await rapportManager.connect(rh).noterParRH(1n, 16);
      await expect(
        rapportManager.connect(encadrant).noterParEncadrant(1n, 14)
      ).to.emit(rapportManager, "NoteFinaleCalculee");

      const rapport = await rapportManager.getRapportFinal(1n);
      expect(rapport.noteFinale).to.equal(1520n);
      expect(rapport.noteCalculee).to.be.true;
    });

    it("SC5 — Note invalide rejetée (>20)", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await expect(
        rapportManager.connect(rh).noterParRH(1n, 21)
      ).to.be.revertedWith("RapportManager: note invalide (0-20)");
    });

    it("SC5 — isNoteCalculee retourne vrai après les deux notes", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      expect(await rapportManager.isNoteCalculee(etudiant.address)).to.be.false;
      await rapportManager.connect(rh).noterParRH(1n, 18);
      await rapportManager.connect(encadrant).noterParEncadrant(1n, 16);
      expect(await rapportManager.isNoteCalculee(etudiant.address)).to.be.true;
    });

    // ── SC6 — CertifManager ─────────────────────────────────────────

    it("SC6 — Attestation générée après note calculée", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await rapportManager.connect(rh).noterParRH(1n, 18);
      await rapportManager.connect(encadrant).noterParEncadrant(1n, 16);
      await expect(
        certifManager.connect(adminUni).genererAttestation(etudiant.address, "QmAttestation", "QR-DATA-123")
      ).to.emit(certifManager, "AttestationGeneree");
    });

    it("SC6 — Attestation bloquée si note non calculée", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await expect(
        certifManager.connect(adminUni).genererAttestation(etudiant.address, "QmAttestation", "QR-DATA")
      ).to.be.revertedWith("CertifManager: note non calculee");
    });

    it("SC6 — Attestation CERTIFIEE après signature Admin + RH", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await rapportManager.connect(rh).noterParRH(1n, 18);
      await rapportManager.connect(encadrant).noterParEncadrant(1n, 16);
      await certifManager.connect(adminUni).genererAttestation(etudiant.address, "QmAttestation", "QR-DATA-123");
      await certifManager.connect(adminUni).signerParAdmin(1n);
      await expect(
        certifManager.connect(rh).signerParRH(1n)
      ).to.emit(certifManager, "AttestationCertifiee");

      const att = await certifManager.getAttestationByEtudiant(etudiant.address);
      expect(att.statut).to.equal(3n); // CERTIFIEE
    });

    it("SC6 — Note finale copiée dans l'attestation", async function () {
      // 18*60 + 16*40 = 1080 + 640 = 1720
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await rapportManager.connect(rh).noterParRH(1n, 18);
      await rapportManager.connect(encadrant).noterParEncadrant(1n, 16);
      await certifManager.connect(adminUni).genererAttestation(etudiant.address, "QmAttestation", "QR-DATA");
      const att = await certifManager.getAttestationByEtudiant(etudiant.address);
      expect(att.noteFinale).to.equal(1720n);
    });

    it("SC6 — Admin révoque une attestation", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await rapportManager.connect(rh).noterParRH(1n, 18);
      await rapportManager.connect(encadrant).noterParEncadrant(1n, 16);
      await certifManager.connect(adminUni).genererAttestation(etudiant.address, "QmAttestation", "QR-DATA");
      await expect(
        certifManager.connect(adminUni).revoquerAttestation(1n)
      ).to.emit(certifManager, "AttestationRevoquee");

      const att = await certifManager.getAttestation(1n);
      expect(att.statut).to.equal(4n); // REVOQUEE
    });

    it("SC6 — Vérification publique via QR : attestation authentique", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await rapportManager.connect(rh).noterParRH(1n, 18);
      await rapportManager.connect(encadrant).noterParEncadrant(1n, 16);
      await certifManager.connect(adminUni).genererAttestation(etudiant.address, "QmAttestation", "QR-DATA-ABC");
      await certifManager.connect(adminUni).signerParAdmin(1n);
      await certifManager.connect(rh).signerParRH(1n);

      const [estValide, etudiantRetourne,,] = await certifManager.verifierParQR("QR-DATA-ABC");
      expect(estValide).to.be.true;
      expect(etudiantRetourne).to.equal(etudiant.address);
    });

    it("SC6 — Vérification publique via QR : QR inconnu = invalide", async function () {
      const [estValide] = await certifManager.verifierParQR("QR-INEXISTANT");
      expect(estValide).to.be.false;
    });

    it("SC6 — Attestation non certifiée = invalide lors de la vérification", async function () {
      await rapportManager.connect(etudiant).deposerRapportFinal("QmFinal");
      await rapportManager.connect(rh).noterParRH(1n, 18);
      await rapportManager.connect(encadrant).noterParEncadrant(1n, 16);
      await certifManager.connect(adminUni).genererAttestation(etudiant.address, "QmAttestation", "QR-DATA-XYZ");
      // Pas encore signée → non certifiée
      const [estValide] = await certifManager.verifierParQR("QR-DATA-XYZ");
      expect(estValide).to.be.false;
    });
  });
});
