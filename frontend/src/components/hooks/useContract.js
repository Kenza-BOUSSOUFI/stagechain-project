import { ethers } from 'ethers';

// ── ABIs ────────────────────────────────────────────────────────────────────
import SC2Artifact from '../data/SC2_OffreManagerABI.json';
import SC3Artifact from '../data/SC3_ConventionManagerABI.json';
import SC4Artifact from '../data/SC4_SuiviManagerABI.json';
import SC5Artifact from '../data/SC5_RapportManagerABI.json';
import SC6Artifact from '../data/SC6_CertifManagerABI.json';

const ACCOUNT_MANAGER_ABI = [
  'function getRole(address _wallet) view returns (uint8)',
  'function getUser(address _wallet) view returns ((address wallet,uint8 role,string nom,string prenom,string filiere,string entreprise,string email,string telephone,string poste,string ville,address universite,bool isActive,uint256 registeredAt))',
  'function addStudent(address _wallet,string _nom,string _prenom,string _filiere)',
  'function addEncadrant(address _wallet,string _nom,string _prenom,string _filiere)',
  'function getStudentsByUniversite(address _uni) view returns (address[])',
  'function getEncadrantsByUniversite(address _uni) view returns (address[])',
  'function registerUniversite(string _nom,string _ville,string _adresse,string _email,string _telephone,string _siteWeb)',
  'function registerRH(string _nom,string _prenom,string _entreprise,string _poste,string _email,string _telephone,string _ville)',
];

// ── Réseau & adresses ────────────────────────────────────────────────────────
// Par défaut, ces adresses correspondent au déploiement local Hardhat (chainId 31337):
// `blockchain/ignition/deployments/chain-31337/deployed_addresses.json`
//
// Pour utiliser Sepolia (ou autre), définis dans `.env` du front:
// - REACT_APP_CHAIN_ID=11155111
// - REACT_APP_ACCOUNT_MANAGER_ADDRESS=0x...
// - REACT_APP_OFFRE_MANAGER_ADDRESS=0x...
// - REACT_APP_CONVENTION_MANAGER_ADDRESS=0x...
// - REACT_APP_RAPPORT_MANAGER_ADDRESS=0x...
// - REACT_APP_SUIVI_MANAGER_ADDRESS=0x...
// - REACT_APP_CERTIF_MANAGER_ADDRESS=0x...
const DEFAULT_ADDRESSES = {
  AccountManager: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  OffreManager: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  ConventionManager: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  RapportManager: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  SuiviManager: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  CertifManager: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
};

function envInt(name) {
  const raw = process.env[name];
  if (!raw) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

const EXPECTED_CHAIN_ID = envInt('REACT_APP_CHAIN_ID');

function resolveAddress(key) {
  const envKey = {
    AccountManager: 'REACT_APP_ACCOUNT_MANAGER_ADDRESS',
    OffreManager: 'REACT_APP_OFFRE_MANAGER_ADDRESS',
    ConventionManager: 'REACT_APP_CONVENTION_MANAGER_ADDRESS',
    RapportManager: 'REACT_APP_RAPPORT_MANAGER_ADDRESS',
    SuiviManager: 'REACT_APP_SUIVI_MANAGER_ADDRESS',
    CertifManager: 'REACT_APP_CERTIF_MANAGER_ADDRESS',
  }[key];

  const candidate = (envKey && process.env[envKey]) ? process.env[envKey] : DEFAULT_ADDRESSES[key];
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
  const roleNum = Number(await contract.getRole(walletAddress));

  if (roleNum === 0) return null;

  const u = await contract.getUser(walletAddress);

  return {
    wallet:     walletAddress,
    role:       ROLE_MAP[roleNum],
    nom:        u.nom,
    prenom:     u.prenom,
    filiere:    u.filiere,
    entreprise: u.entreprise,
    email:      u.email,
    telephone:  u.telephone,
    poste:      u.poste,
    ville:      u.ville,
    universite: u.universite,
    isActive:   u.isActive,
  };
}