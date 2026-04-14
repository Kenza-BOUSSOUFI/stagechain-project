import { apiFilesUrl, wrapApiFilesFetchError } from '../../config/apiFilesBase';

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
        'api-files n’écoute pas sur le port 4000. cd api-files → npm start, ou à la racine : npm run dev.'
      );
    }
    throw new Error(body?.error || body?.hint || `Erreur API (${res.status})`);
  }
  if (body?.mock) {
    throw new Error(
      'CID convention factice (MOCK). Configurez PINATA_JWT dans api-files/.env et redémarrez le serveur api-files.'
    );
  }
  return body;
}

/** Pousse le JSON de convention sur IPFS via l’API locale (Pinata JWT serveur). */
export async function pinConventionJsonToIpfs(payload) {
  let res;
  try {
    res = await fetch(apiFilesUrl('/api/ipfs/pin-json'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw wrapApiFilesFetchError(e);
  }
  return readJson(res);
}

/** Copie optionnelle en MongoDB (si MONGODB_URI est défini dans api-files/.env). */
export async function upsertConventionDocument(payload) {
  let res;
  try {
    res = await fetch(apiFilesUrl('/api/conventions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw wrapApiFilesFetchError(e);
  }
  return readJson(res);
}

export async function getConventionDocument(conventionId) {
  let res;
  try {
    res = await fetch(apiFilesUrl(`/api/conventions/${conventionId}`));
  } catch (e) {
    throw wrapApiFilesFetchError(e);
  }
  return readJson(res);
}


/** Pin n'importe quel fichier (PDF) via POST multipart. */
export async function pinFileToIpfs(file) {
  let res;
  try {
    const formData = new FormData();
    formData.append('file', file);
    res = await fetch(apiFilesUrl('/api/ipfs/pin-pdf'), {
      method: 'POST',
      body: formData,
    });
  } catch (e) {
    throw wrapApiFilesFetchError(e);
  }
  return readJson(res);
}

