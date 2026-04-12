import { useEffect, useRef } from 'react';

const DEFAULT_MS = 12000;

/**
 * Appelle `loadFn` au montage puis toutes les `intervalMs` ms.
 * Ne rafraîchit pas quand l’onglet est en arrière-plan ; un rafraîchit au retour (visibility).
 * `loadFn` voit toujours la dernière référence (stable pour eslint sans useCallback obligatoire).
 */
export function useChainDataRefresh(loadFn, intervalMs = DEFAULT_MS) {
  const ref = useRef(loadFn);
  ref.current = loadFn;

  useEffect(() => {
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      ref.current();
    };
    tick();
    const id = setInterval(tick, intervalMs);
    const onVis = () => {
      if (!document.hidden) ref.current();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [intervalMs]);
}
