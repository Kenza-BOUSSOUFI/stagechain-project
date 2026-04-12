/**
 * URL de base pour l’API Express `api-files`.
 * Par défaut chaîne vide → chemins relatifs `/api/...` (proxy CRA dans package.json vers :4000).
 * Sinon définir REACT_APP_API_FILES_URL (ex. déploiement séparé).
 */
export function getApiFilesBase() {
  const u = (process.env.REACT_APP_API_FILES_URL || process.env.REACT_APP_CONVENTION_API_URL || '').trim();
  return u.replace(/\/$/, '');
}

/** @param {string} path ex. `/api/ipfs/pin-pdf` */
export function apiFilesUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = getApiFilesBase();
  return base ? `${base}${p}` : p;
}

/** Réécrit les erreurs réseau (serveur api-files arrêté, etc.) */
export function wrapApiFilesFetchError(err) {
  const msg = err?.message || String(err);
  if (
    err?.name === 'TypeError' ||
    /Failed to fetch|Load failed|NetworkError|ECONNREFUSED|Could not proxy/i.test(msg)
  ) {
    return new Error(
      'Port 4000 fermé : le serveur api-files n’est pas démarré (erreur proxy ECONNREFUSED). Ouvrez un terminal : cd api-files → npm start. Ou à la racine du projet : npm install puis npm run dev (lance api-files + React ensemble).'
    );
  }
  return err instanceof Error ? err : new Error(msg);
}
