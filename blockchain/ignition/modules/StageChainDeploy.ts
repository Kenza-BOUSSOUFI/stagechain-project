import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * StageChain — Module de déploiement Hardhat Ignition
 * Déploie les 6 smart contracts dans l'ordre avec les bonnes dépendances
 *
 * Ordre de déploiement :
 *   SC1 — AccountManager       (aucune dépendance)
 *   SC2 — OffreManager         (dépend de SC1)
 *   SC3 — ConventionManager    (dépend de SC1, SC2)
 *   SC4 — SuiviManager         (dépend de SC1, SC3)
 *   SC5 — RapportManager       (dépend de SC1, SC3)
 *   SC6 — CertifManager        (dépend de SC1, SC5, SC3)
 */
const StageChainModule = buildModule("StageChainModule", (m) => {

  // ── SC1 — AccountManager ─────────────────────────────────────────
  // Gestion des comptes : universités (auto-inscription),
  // étudiants/encadrants (via admin), RH (auto-inscription)
  const accountManager = m.contract("AccountManager");

  // ── SC2 — OffreManager ───────────────────────────────────────────
  // Publication offres + candidatures + sélection
  const offreManager = m.contract("OffreManager", [
    accountManager,
  ]);

  // ── SC3 — ConventionManager ──────────────────────────────────────
  // Génération convention, affectation encadrant, signatures tripartites
  const conventionManager = m.contract("ConventionManager", [
    accountManager,
    offreManager,
  ]);

  // ── SC4 — SuiviManager ───────────────────────────────────────────
  // Dépôt et validation des rapports d'avancement
  const suiviManager = m.contract("SuiviManager", [
    accountManager,
    conventionManager,
  ]);

  // ── SC5 — RapportManager ─────────────────────────────────────────
  // Rapport final, notation RH (60%) + Encadrant (40%), calcul note
  const rapportManager = m.contract("RapportManager", [
    accountManager,
    conventionManager,
  ]);

  // ── SC6 — CertifManager ──────────────────────────────────────────
  // Génération attestation, signatures Admin + RH, vérification QR
  const certifManager = m.contract("CertifManager", [
    accountManager,
    rapportManager,
    conventionManager,
  ]);

  return {
    accountManager,
    offreManager,
    conventionManager,
    suiviManager,
    rapportManager,
    certifManager,
  };
});

export default StageChainModule;