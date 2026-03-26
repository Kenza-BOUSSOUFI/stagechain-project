import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * StageChain — Module de déploiement Hardhat Ignition
 * Déploie les 7 smart contracts dans l'ordre avec les bonnes dépendances
 */
const StageChainModule = buildModule("StageChainModule", (m) => {

  // ── SC1 — UserManager ────────────────────────────────────────────
  const userManager = m.contract("UserManager");

  // ── SC2 — OffreManager ───────────────────────────────────────────
  const offreManager = m.contract("OffreManager", [userManager]);

  // ── SC3 — CandidatureManager ─────────────────────────────────────
  const candidatureManager = m.contract("CandidatureManager", [
    userManager,
    offreManager,
  ]);

  // ── SC4 — ConventionManager ──────────────────────────────────────
  const conventionManager = m.contract("ConventionManager", [
    userManager,
    candidatureManager,
  ]);

  // ── SC5 — SuiviManager ───────────────────────────────────────────
  const suiviManager = m.contract("SuiviManager", [
    userManager,
    conventionManager,
  ]);

  // ── SC6 — RapportManager ─────────────────────────────────────────
  const rapportManager = m.contract("RapportManager", [
    userManager,
    conventionManager,
  ]);

  // ── SC7 — CertifManager ──────────────────────────────────────────
  const certifManager = m.contract("CertifManager", [
    userManager,
    conventionManager,
    rapportManager,
  ]);

  // ── Lien SC6 → SC7 (appel setCertifManager après déploiement) ────
  m.call(rapportManager, "setCertifManager", [certifManager]);

  return {
    userManager,
    offreManager,
    candidatureManager,
    conventionManager,
    suiviManager,
    rapportManager,
    certifManager,
  };
});

export default StageChainModule;