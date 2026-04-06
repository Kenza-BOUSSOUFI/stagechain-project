const API_BASE = process.env.REACT_APP_CONVENTION_API_URL || 'http://localhost:4000';

async function readJson(res) {
  let body = null;
  try {
    body = await res.json();
  } catch (_) {
    body = null;
  }
  if (!res.ok) {
    throw new Error(body?.error || `Erreur API (${res.status})`);
  }
  return body;
}

export async function upsertConventionDocument(payload) {
  const res = await fetch(`${API_BASE}/api/conventions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return readJson(res);
}

export async function getConventionDocument(conventionId) {
  const res = await fetch(`${API_BASE}/api/conventions/${conventionId}`);
  return readJson(res);
}

export async function pinConventionJsonToIpfs(payload) {
  const res = await fetch(`${API_BASE}/api/ipfs/pin-json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return readJson(res);
}

