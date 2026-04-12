import { ethers } from 'ethers';

// ── ABIs ────────────────────────────────────────────────────────────────────
import SC2Artifact from '../data/SC2_OffreManagerABI.json';
import SC3Artifact from '../data/SC3_ConventionManagerABI.json';
import SC4Artifact from '../data/SC4_SuiviManagerABI.json';
import SC5Artifact from '../data/SC5_RapportManagerABI.json';
import SC6Artifact from '../data/SC6_CertifManagerABI.json';
import deployedLocal from '../../data/deployedLocal.json';
import ACCOUNT_MANAGER_ABI from '../../data/AccountManagerABI.json';

// ── Réseau & adresses ────────────────────────────────────────────────────────
// Adresses du dernier déploiement local (synchronisées par `npm run deploy:ignition-local` dans blockchain/).
// Fichier source : blockchain/ignition/deployments/chain-31337/deployed_addresses.json → src/data/deployedLocal.json
//
// En `npm start`, on utilise ce fichier sauf si REACT_APP_USE_DEPLOYED_ENV=1 (alors variables REACT_APP_*_ADDRESS).
const DEFAULT_ADDRESSES = {
  AccountManager: deployedLocal['StageChainModule#AccountManager'],
  OffreManager: deployedLocal['StageChainModule#OffreManager'],
  ConventionManager: deployedLocal['StageChainModule#ConventionManager'],
  RapportManager: deployedLocal['StageChainModule#RapportManager'],
  SuiviManager: deployedLocal['StageChainModule#SuiviManager'],
  CertifManager: deployedLocal['StageChainModule#CertifManager'],
};

function envInt(name) {
  const raw = process.env[name];
  if (!raw) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

/** En `npm start`, on impose 31337 si rien n’est défini, pour éviter MetaMask sur un autre réseau + mauvaise adresse de contrat. */
function resolveExpectedChainId() {
  const fromEnv = envInt('REACT_APP_CHAIN_ID');
  if (fromEnv != null) return fromEnv;
  if (process.env.NODE_ENV === 'development') return 31337;
  return null;
}

const EXPECTED_CHAIN_ID = resolveExpectedChainId();

/** En dev, ignore les REACT_APP_*_ADDRESS (souvent laissées dans les variables système Windows). */
function allowEnvContractAddresses() {
  if (process.env.NODE_ENV !== 'development') return true;
  return process.env.REACT_APP_USE_DEPLOYED_ENV === '1';
}

function resolveAddress(key) {
  const envKey = {
    AccountManager: 'REACT_APP_ACCOUNT_MANAGER_ADDRESS',
    OffreManager: 'REACT_APP_OFFRE_MANAGER_ADDRESS',
    ConventionManager: 'REACT_APP_CONVENTION_MANAGER_ADDRESS',
    RapportManager: 'REACT_APP_RAPPORT_MANAGER_ADDRESS',
    SuiviManager: 'REACT_APP_SUIVI_MANAGER_ADDRESS',
    CertifManager: 'REACT_APP_CERTIF_MANAGER_ADDRESS',
  }[key];

  const fromEnv = allowEnvContractAddresses() && envKey && process.env[envKey];
  const candidate = fromEnv ? process.env[envKey] : DEFAULT_ADDRESSES[key];
  if (!ethers.isAddress(candidate)) {
    throw new Error(`Adresse de contrat invalide pour ${key}: ${candidate || '(vide)'}`);
  }
  return candidate;
}

export const CONTRACT_ADDRESSES = Object.freeze({
  AccountManager: resolveAddress('AccountManager'),
  OffreManager: resolveAddress('OffreManager'),
  ConventionManager: resolveAddress('ConventionManager'),
  RapportManager: resolveAddress('RapportManager'),
  SuiviManager: resolveAddress('SuiviManager'),
  CertifManager: resolveAddress('CertifManager'),
});

// ── Mapping numérique Role → string ────────────────────────────────────────
export const ROLE_MAP = {
  0: 'none',
  1: 'etudiant',
  2: 'encadrant',
  3: 'rh',
  4: 'admin',
};

// ── Provider / Signer helpers ───────────────────────────────────────────────
async function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask non détecté.');
  const provider = new ethers.BrowserProvider(window.ethereum);
  if (EXPECTED_CHAIN_ID) {
    const net = await provider.getNetwork();
    const chainId = Number(net.chainId);
    if (chainId !== EXPECTED_CHAIN_ID) {
      throw new Error(
        `Mauvais réseau MetaMask (chainId ${chainId}). Attendu: ${EXPECTED_CHAIN_ID}.`
      );
    }
  }
  return provider;
}

async function getSigner() {
  const provider = await getProvider();
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

async function ensureContractDeployed(providerOrSigner, address, name) {
  const provider = typeof providerOrSigner.provider?.getCode === 'function'
    ? providerOrSigner.provider
    : providerOrSigner;
  const code = await provider.getCode(address);
  if (!code || code === '0x') {
    throw new Error(`Contrat ${name} introuvable à l'adresse ${address}. Redéployez puis rechargez le front.`);
  }
}

// ── Factories READ-ONLY (pas besoin de wallet) ──────────────────────────────
export async function getContractReadOnly() {
  const provider = await getProvider();
  await ensureContractDeployed(provider, CONTRACT_ADDRESSES.AccountManager, 'AccountManager');
  return new ethers.Contract(CONTRACT_ADDRESSES.AccountManager, ACCOUNT_MANAGER_ABI, provider);
}

// ── Factories WITH SIGNER ───────────────────────────────────────────────────
export async function getAccountManagerContract() {
  const signer = await getSigner();
  await ensureContractDeployed(signer, CONTRACT_ADDRESSES.AccountManager, 'AccountManager');
  return new ethers.Contract(CONTRACT_ADDRESSES.AccountManager, ACCOUNT_MANAGER_ABI, signer);
}

export async function getOffreManagerContract() {
  const signer = await getSigner();
  await ensureContractDeployed(signer, CONTRACT_ADDRESSES.OffreManager, 'OffreManager');
  return new ethers.Contract(CONTRACT_ADDRESSES.OffreManager, SC2Artifact, signer);
}

export async function getConventionManagerContract() {
  const signer = await getSigner();
  await ensureContractDeployed(signer, CONTRACT_ADDRESSES.ConventionManager, 'ConventionManager');
  return new ethers.Contract(CONTRACT_ADDRESSES.ConventionManager, SC3Artifact, signer);
}

export async function getSuiviManagerContract() {
  const signer = await getSigner();
  await ensureContractDeployed(signer, CONTRACT_ADDRESSES.SuiviManager, 'SuiviManager');
  return new ethers.Contract(CONTRACT_ADDRESSES.SuiviManager, SC4Artifact, signer);
}

export async function getRapportManagerContract() {
  const signer = await getSigner();
  await ensureContractDeployed(signer, CONTRACT_ADDRESSES.RapportManager, 'RapportManager');
  return new ethers.Contract(CONTRACT_ADDRESSES.RapportManager, SC5Artifact, signer);
}

export async function getCertifManagerContract() {
  const signer = await getSigner();
  await ensureContractDeployed(signer, CONTRACT_ADDRESSES.CertifManager, 'CertifManager');
  return new ethers.Contract(CONTRACT_ADDRESSES.CertifManager, SC6Artifact, signer);
}

// ── Compat alias (utilisé dans AuthPage) ───────────────────────────────────
export async function getContractWithSigner() {
  return getAccountManagerContract();
}

// ── Wallet connecté ─────────────────────────────────────────────────────────
export async function getConnectedWallet() {
  const signer = await getSigner();
  return signer.getAddress();
}

// ── Fetch utilisateur depuis la blockchain ──────────────────────────────────
export async function fetchUserFromChain(walletAddress) {
  const contract = await getContractReadOnly();
  let roleNum;
  try {
    roleNum = Number(await contract.getRole(walletAddress));
  } catch (e) {
    console.warn('[fetchUserFromChain] getRole:', e);
    throw new Error(
      'Impossible de lire le contrat AccountManager. Vérifiez le réseau 31337, l’adresse dans deployedLocal.json, puis npm run deploy:ignition-local dans blockchain/.'
    );
  }

  if (roleNum === 0) return null;

  let u;
  try {
    u = await contract.getUser(walletAddress);
  } catch (e) {
    console.warn('[fetchUserFromChain] getUser:', e);
    throw new Error(
      'Données utilisateur illisibles (ABI / contrat). Relancez : cd blockchain && npx hardhat compile && npm run deploy:ignition-local, puis redémarrez le front.'
    );
  }

  return {
    wallet:       walletAddress,
    role:         ROLE_MAP[roleNum],
    nom:          u.nom,
    prenom:       u.prenom,
    filiere:      u.filiere,
    entreprise:   u.entreprise,
    email:        u.email,
    telephone:    u.telephone,
    poste:        u.poste,
    ville:        u.ville,
    universite:   u.universite,
    isActive:     u.isActive,
    bio:          u.bio,
    competences:  u.competences,
    langues:      u.langues,
  };
}