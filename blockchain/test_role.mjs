import { ethers } from 'ethers';

const ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const ABI = ['function getRole(address) view returns (uint8)'];
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contract = new ethers.Contract(ADDR, ABI, provider);

const wallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
try {
  const role = await contract.getRole(wallet);
  console.log(`✅ getRole(${wallet}) = ${role.toString()}`);
  if (Number(role) === 4) console.log('   → ADMIN (correct après registerUniversite)');
  else if (Number(role) === 0) console.log('   → NONE (pas encore enregistré)');
} catch(e) {
  console.error('❌ Erreur:', e.message);
}
