/**
 * Copie ignition/deployments/chain-31337/deployed_addresses.json
 * vers frontend/src/data/deployedLocal.json pour que le front pointe toujours sur le dernier déploiement local.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const blockchainRoot = join(__dirname, '..');
const srcPath = join(blockchainRoot, 'ignition', 'deployments', 'chain-31337', 'deployed_addresses.json');
const destPath = join(blockchainRoot, '..', 'frontend', 'src', 'data', 'deployedLocal.json');

if (!existsSync(srcPath)) {
  console.error('[sync-frontend-addresses] Fichier introuvable:', srcPath);
  console.error('Déployez d’abord : npx hardhat ignition deploy ignition/modules/StageChainDeploy.ts --network localhost');
  process.exit(1);
}

const json = readFileSync(srcPath, 'utf8');
writeFileSync(destPath, json, 'utf8');
console.log('[sync-frontend-addresses] OK →', destPath);

const artifactPath = join(blockchainRoot, 'artifacts', 'contracts', 'SC1_AccountManager.sol', 'AccountManager.json');
const abiDest = join(blockchainRoot, '..', 'frontend', 'src', 'data', 'AccountManagerABI.json');
if (existsSync(artifactPath)) {
  const art = JSON.parse(readFileSync(artifactPath, 'utf8'));
  writeFileSync(abiDest, JSON.stringify(art.abi, null, 2), 'utf8');
  console.log('[sync-frontend-addresses] ABI →', abiDest);
} else {
  console.warn('[sync-frontend-addresses] Compile d’abord (npx hardhat compile) pour copier AccountManagerABI.json');
}
