import { expect } from "chai";
import hre from "hardhat";
import type {
  UserManager,
  OffreManager,
  CandidatureManager,
  ConventionManager,
  SuiviManager,
  RapportManager,
  CertifManager,
} from "../types/ethers-contracts/index.js";

describe("StageChain — Suite complète", function () {

  let userManager:        UserManager;
  let offreManager:       OffreManager;
  let candidatureManager: CandidatureManager;
  let conventionManager:  ConventionManager;
  let suiviManager:       SuiviManager;
  let rapportManager:     RapportManager;
  let certifManager:      CertifManager;

  let admin:    any;
  let etudiant: any;
  let rh:       any;
  let encadrant:any;
  let tuteur:   any;
  let public1:  any;
  let ethers:   any;

  beforeEach(async function () {
    const connection = await hre.network.connect();
    ethers = connection.ethers;

    const signers = await ethers.getSigners();
    [admin, etudiant, rh, encadrant, tuteur, public1] = signers;

    userManager        = await ethers.deployContract("UserManager");
    offreManager       = await ethers.deployContract("OffreManager", [await userManager.getAddress()]);
    candidatureManager = await ethers.deployContract("CandidatureManager", [
      await userManager.getAddress(),
      await offreManager.getAddress(),
    ]);
    conventionManager  = await ethers.deployContract("ConventionManager", [
      await userManager.getAddress(),
      await candidatureManager.getAddress(),
    ]);
    suiviManager       = await ethers.deployContract("SuiviManager", [
      await userManager.getAddress(),
      await conventionManager.getAddress(),
    ]);
    rapportManager     = await ethers.deployContract("RapportManager", [
      await userManager.getAddress(),
      await conventionManager.getAddress(),
    ]);
    certifManager      = await ethers.deployContract("CertifManager", [
      await userManager.getAddress(),
      await conventionManager.getAddress(),
      await rapportManager.getAddress(),
    ]);

    await rapportManager.setCertifManager(await certifManager.getAddress());
  });

  describe("SC1 — UserManager", function () {
    it("Admin enregistré au déploiement", async function () {
      const user = await userManager.getUser(admin.address);
      expect(user.role).to.equal(4n);
      expect(user.isActive).to.be.true;
    });
    it("Admin peut enregistrer un étudiant", async function () {
      await expect(userManager.addStudent(etudiant.address, "Lakbita", "Fatima", "CyberSecurite")).to.emit(userManager, "UserRegistered");
      const user = await userManager.getUser(etudiant.address);
      expect(user.nom).to.equal("Lakbita");
      expect(user.role).to.equal(1n);
    });
    it("Admin peut enregistrer un encadrant", async function () {
      await userManager.addEncadrant(encadrant.address, "Prof", "Yasser", "CyberSecurite");
      const user = await userManager.getUser(encadrant.address);
      expect(user.role).to.equal(2n);
    });
    it("Admin peut enregistrer un RH", async function () {
      await userManager.addRH(rh.address, "Martin", "Alice", "TechCorp");
      const user = await userManager.getUser(rh.address);
      expect(user.role).to.equal(3n);
    });
    it("Non-admin ne peut pas enregistrer", async function () {
      await expect(userManager.connect(public1).addStudent(etudiant.address, "A", "B", "CyberSec")).to.be.revertedWith("UserManager: admin uniquement");
    });
    it("Wallet déjà enregistré est rejeté", async function () {
      await userManager.addStudent(etudiant.address, "A", "B", "CyberSec");
      await expect(userManager.addStudent(etudiant.address, "C", "D", "Info")).to.be.revertedWith("UserManager: wallet deja enregistre");
    });
    it("isAuthorized fonctionne correctement", async function () {
      await userManager.addStudent(etudiant.address, "A", "B", "CyberSec");
      expect(await userManager.isAuthorized(etudiant.address, 1n)).to.be.true;
      expect(await userManager.isAuthorized(etudiant.address, 2n)).to.be.false;
    });
  });

  describe("SC2 — OffreManager", function () {
    beforeEach(async function () { await userManager.addRH(rh.address, "Martin", "Alice", "TechCorp"); });
    it("RH peut publier une offre", async function () {
      await expect(offreManager.connect(rh).publishOffre("TechCorp","Stage Dev","Informatique","Casablanca","Description test",'["Python","Solidity"]',"CyberSecurite",5,3)).to.emit(offreManager,"OffrePublished");
      const offre = await offreManager.getOffre(1n);
      expect(offre.titre).to.equal("Stage Dev");
      expect(offre.isOuverte).to.be.true;
    });
    it("Non-RH ne peut pas publier", async function () {
      await expect(offreManager.connect(public1).publishOffre("X","X","X","X","X","X","X",1,1)).to.be.revertedWith("OffreManager: RH autorise uniquement");
    });
    it("RH peut fermer son offre", async function () {
      await offreManager.connect(rh).publishOffre("TechCorp","Stage Dev","Info","Casa","Desc","[]","CyberSec",5,3);
      await offreManager.connect(rh).closeOffre(1n);
      const offre = await offreManager.getOffre(1n);
      expect(offre.isOuverte).to.be.false;
    });
    it("getAllOffres retourne uniquement les offres ouvertes", async function () {
      await offreManager.connect(rh).publishOffre("A","T1","D","V","Desc","[]","F",1,1);
      await offreManager.connect(rh).publishOffre("B","T2","D","V","Desc","[]","F",1,1);
      await offreManager.connect(rh).closeOffre(1n);
      const offres = await offreManager.getAllOffres();
      expect(offres.length).to.equal(1);
      expect(offres[0].titre).to.equal("T2");
    });
  });

  describe("SC3 — CandidatureManager", function () {
    beforeEach(async function () {
      await userManager.addStudent(etudiant.address, "Lakbita", "Fatima", "CyberSec");
      await userManager.addRH(rh.address, "Martin", "Alice", "TechCorp");
      await offreManager.connect(rh).publishOffre("TechCorp","Stage Dev","Info","Casa","Desc","[]","CyberSec",5,3);
    });
    it("Étudiant peut postuler", async function () {
      await expect(candidatureManager.connect(etudiant).postuler(1n,85)).to.emit(candidatureManager,"CandidatureSoumise");
      const cands = await candidatureManager.getCandidaturesParOffre(1n);
      expect(cands.length).to.equal(1);
      expect(cands[0].statut).to.equal(0n);
    });
    it("Double candidature refusée", async function () {
      await candidatureManager.connect(etudiant).postuler(1n,85);
      await expect(candidatureManager.connect(etudiant).postuler(1n,85)).to.be.revertedWith("CandidatureManager: deja candidat");
    });
    it("RH peut accepter une candidature", async function () {
      await candidatureManager.connect(etudiant).postuler(1n,85);
      await expect(candidatureManager.connect(rh).accepter(1n)).to.emit(candidatureManager,"CandidatureAccepted").and.to.emit(candidatureManager,"AdminAlerte");
      const c = await candidatureManager.getCandidature(1n);
      expect(c.statut).to.equal(1n);
    });
    it("RH peut refuser une candidature", async function () {
      await candidatureManager.connect(etudiant).postuler(1n,85);
      await candidatureManager.connect(rh).refuser(1n);
      const c = await candidatureManager.getCandidature(1n);
      expect(c.statut).to.equal(2n);
    });
    it("RH non propriétaire ne peut pas traiter", async function () {
      await userManager.addRH(public1.address,"Autre","RH","AutreBoite");
      await candidatureManager.connect(etudiant).postuler(1n,85);
      await expect(candidatureManager.connect(public1).accepter(1n)).to.be.revertedWith("CandidatureManager: non proprietaire de l'offre");
    });
  });

  describe("SC4 — ConventionManager", function () {
    beforeEach(async function () {
      await userManager.addStudent(etudiant.address,"Lakbita","Fatima","CyberSec");
      await userManager.addRH(rh.address,"Martin","Alice","TechCorp");
      await userManager.addEncadrant(encadrant.address,"Prof","Yasser","CyberSec");
      await offreManager.connect(rh).publishOffre("TechCorp","Stage Dev","Info","Casa","Desc","[]","CyberSec",5,3);
      await candidatureManager.connect(etudiant).postuler(1n,85);
      await candidatureManager.connect(rh).accepter(1n);
    });
    it("Admin peut créer une convention", async function () {
      await expect(conventionManager.registerTuteurEtCreerConvention(etudiant.address,1n,tuteur.address,"Bennani","Karim","Dev Lead",encadrant.address,rh.address,"QmHash123")).to.emit(conventionManager,"ConventionCreee");
      const conv = await conventionManager.getConventionByEtudiant(etudiant.address);
      expect(conv.isActive).to.be.false;
    });
    it("Convention activée après 3 signatures", async function () {
      await conventionManager.registerTuteurEtCreerConvention(etudiant.address,1n,tuteur.address,"Bennani","Karim","Dev Lead",encadrant.address,rh.address,"QmHash123");
      await conventionManager.connect(etudiant).signerConvention(1n);
      await conventionManager.connect(rh).signerConvention(1n);
      await expect(conventionManager.connect(admin).signerConvention(1n)).to.emit(conventionManager,"ConventionSigned");
      const conv = await conventionManager.getConvention(1n);
      expect(conv.isActive).to.be.true;
    });
    it("Signataire non autorisé rejeté", async function () {
      await conventionManager.registerTuteurEtCreerConvention(etudiant.address,1n,tuteur.address,"B","K","Dev",encadrant.address,rh.address,"QmHash");
      await expect(conventionManager.connect(public1).signerConvention(1n)).to.be.revertedWith("ConventionManager: signataire non autorise");
    });
  });

  describe("Flux complet SC5 → SC6 → SC7", function () {
    beforeEach(async function () {
      await userManager.addStudent(etudiant.address,"Lakbita","Fatima","CyberSec");
      await userManager.addRH(rh.address,"Martin","Alice","TechCorp");
      await userManager.addEncadrant(encadrant.address,"Prof","Yasser","CyberSec");
      await offreManager.connect(rh).publishOffre("TechCorp","Stage Dev","Info","Casa","Desc","[]","CyberSec",5,3);
      await candidatureManager.connect(etudiant).postuler(1n,85);
      await candidatureManager.connect(rh).accepter(1n);
      await conventionManager.registerTuteurEtCreerConvention(etudiant.address,1n,tuteur.address,"Bennani","Karim","Dev Lead",encadrant.address,rh.address,"QmConv");
      await conventionManager.connect(etudiant).signerConvention(1n);
      await conventionManager.connect(rh).signerConvention(1n);
      await conventionManager.connect(admin).signerConvention(1n);
    });
    it("SC5 — Étudiant peut soumettre un rapport d'avancement", async function () {
      await expect(suiviManager.connect(etudiant).soumettreRapport("QmRapport1","Semaine 1",1n)).to.emit(suiviManager,"RapportSubmitted");
    });
    it("SC5 — Encadrant peut commenter et valider", async function () {
      await suiviManager.connect(etudiant).soumettreRapport("QmRapport1","Sem1",1n);
      await suiviManager.connect(encadrant).ajouterCommentaire(1n,"Bon travail");
      await expect(suiviManager.connect(encadrant).validerRapport(1n)).to.emit(suiviManager,"RapportValide");
    });
    it("SC6 — Dépôt rapport final et versioning", async function () {
      await rapportManager.connect(etudiant).deposerRapport("QmRapportFinal1");
      await rapportManager.connect(etudiant).deposerRapport("QmRapportFinal2");
      const rapport = await rapportManager.getRapportByEtudiant(etudiant.address);
      expect(rapport.cidsIPFS.length).to.equal(2);
    });
    it("SC6 — Calcul automatique de la note finale", async function () {
      await rapportManager.connect(etudiant).deposerRapport("QmFinal");
      await rapportManager.connect(tuteur).valider(1n,16);
      await expect(rapportManager.connect(encadrant).valider(1n,14)).to.emit(rapportManager,"RapportValide");
      const note = await rapportManager.getNoteFinale(etudiant.address);
      expect(note).to.equal(152n);
    });
    it("SC7 — Attestation certifiée après 3 signatures", async function () {
      await rapportManager.connect(etudiant).deposerRapport("QmFinal");
      await rapportManager.connect(tuteur).valider(1n,16);
      await rapportManager.connect(encadrant).valider(1n,14);
      await certifManager.genererAttestation(etudiant.address,"QmAttestation");
      await certifManager.connect(tuteur).signerAttestation(1n);
      await certifManager.connect(encadrant).signerAttestation(1n);
      await expect(certifManager.connect(admin).signerAttestation(1n)).to.emit(certifManager,"AttestationCertified");
      const att = await certifManager.getAttestationByEtudiant(etudiant.address);
      expect(att.certifiee).to.be.true;
      expect(att.noteFinale_x10).to.equal(152n);
    });
    it("SC7 — Vérification publique : authentique", async function () {
      await rapportManager.connect(etudiant).deposerRapport("QmFinal");
      await rapportManager.connect(tuteur).valider(1n,18);
      await rapportManager.connect(encadrant).valider(1n,16);
      await certifManager.genererAttestation(etudiant.address,"QmAttestation");
      await certifManager.connect(tuteur).signerAttestation(1n);
      await certifManager.connect(encadrant).signerAttestation(1n);
      await certifManager.connect(admin).signerAttestation(1n);
      const att = await certifManager.getAttestationByEtudiant(etudiant.address);
      const [authentique, walletRetourne] = await certifManager.verifier(att.qrCodeData,"QmAttestation");
      expect(authentique).to.be.true;
      expect(walletRetourne).to.equal(etudiant.address);
    });
    it("SC7 — Vérification publique : alerte fraude", async function () {
      await rapportManager.connect(etudiant).deposerRapport("QmFinal");
      await rapportManager.connect(tuteur).valider(1n,18);
      await rapportManager.connect(encadrant).valider(1n,16);
      await certifManager.genererAttestation(etudiant.address,"QmAttestation");
      await certifManager.connect(tuteur).signerAttestation(1n);
      await certifManager.connect(encadrant).signerAttestation(1n);
      await certifManager.connect(admin).signerAttestation(1n);
      const att = await certifManager.getAttestationByEtudiant(etudiant.address);
      const [authentique] = await certifManager.verifier(att.qrCodeData,"QmFALSIFIE");
      expect(authentique).to.be.false;
    });
  });
});