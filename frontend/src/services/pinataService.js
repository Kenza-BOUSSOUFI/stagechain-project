import { apiFilesUrl, wrapApiFilesFetchError } from '../config/apiFilesBase';

/**
 * Upload IPFS via l’API locale `api-files` : le JWT Pinata (cloud) est lu côté serveur
 * dans `api-files/.env` → `PINATA_JWT`, jamais exposé dans le navigateur.
 */

async function readJson(res) {
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (_) {
    body = { error: text ? text.slice(0, 500) : `Réponse non JSON (${res.status})` };
  }
  if (!res.ok) {
    const combined = `${body?.error || ''} ${body?.hint || ''} ${text || ''}`;
    if (/ECONNREFUSED|Could not proxy|proxy error/i.test(combined)) {
      throw new Error(
        'api-files n’écoute pas sur le port 4000. Terminal : cd api-files → npm start. Racine du repo : npm run dev (api + front).'
      );
    }
    throw new Error(body?.error || body?.hint || `Erreur API fichiers (${res.status})`);
  }
  if (body?.mock) {
    throw new Error(
      'CID factice (MOCK) : dans api-files/.env mettez un PINATA_JWT valide et ALLOW_MOCK_IPFS_CID=0, puis redémarrez le serveur api-files (npm start dans le dossier api-files). Si Windows a une variable ALLOW_MOCK_IPFS_CID=1, supprimez-la ou le .env l’écrase maintenant au démarrage.'
    );
  }
  return body;
}

/**
 * PDF vers IPFS (Pinata) via POST multipart `file` sur api-files.
 * @param {File} file
 * @returns {Promise<string>} CID
 */
export const uploadFileToIPFS = async (file) => {
  const form = new FormData();
  form.append('file', file, file.name || 'document.pdf');
  let res;
  try {
    res = await fetch(apiFilesUrl('/api/ipfs/pin-pdf'), {
      method: 'POST',
      body: form,
    });
  } catch (e) {
    throw wrapApiFilesFetchError(e);
  }
  const data = await readJson(res);
  if (!data?.cid) throw new Error('Réponse API sans CID');
  return data.cid;
};

/**
 * JSON vers IPFS via api-files (même JWT serveur).
 * @param {object} jsonData
 * @param {string} [name] métadonnée Pinata
 */
export const uploadJSONToIPFS = async (jsonData, name = 'metadata') => {
  let res;
  try {
    res = await fetch(apiFilesUrl('/api/ipfs/pin-json'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content: jsonData }),
    });
  } catch (e) {
    throw wrapApiFilesFetchError(e);
  }
  const data = await readJson(res);
  if (!data?.cid) throw new Error('Réponse API sans CID');
  return data.cid;
};
