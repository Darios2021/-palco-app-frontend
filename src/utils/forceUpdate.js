/* ===== Force Update / Cache Buster robusto =====
   Chequea /version.json (no-store). Si cambia:
   - Limpia Cache Storage
   - Desregistra Service Workers
   - Hace hard reload
   Además, atrapa errores de chunks viejos de Vite (code-splitting).
*/
const VERSION_URL = `${import.meta.env.BASE_URL || '/'}version.json`;
const POLL_MS = Number(import.meta.env.VITE_UPDATE_POLL_MS || 60_000); // 60s

async function getRemoteVersion () {
  try {
    // No almacenar en caché bajo ningún concepto
    const res = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // fallback: si querés seguir usando VITE_APP_VERSION, lo preferimos si existe
    const fromEnv = import.meta.env.VITE_APP_VERSION ? String(import.meta.env.VITE_APP_VERSION) : null;
    return String(fromEnv || data.version || '');
  } catch (err) {
    console.warn('[Update] No se pudo obtener version.json:', err);
    return null;
  }
}

async function clearCachesAndSW () {
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) {
      console.warn('[Update] No se pudo limpiar Cache Storage:', e);
    }
  }
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    } catch (e) {
      console.warn('[Update] No se pudo desregistrar SW:', e);
    }
  }
}

async function hardReload () {
  const v = localStorage.getItem('app-version') || '';
  sessionStorage.setItem('app-reloaded-on-version', v || `ts:${Date.now()}`);
  window.location.reload();
}

async function checkAndUpdateNow () {
  const stored = localStorage.getItem('app-version') || '';
  const alreadyReloaded = sessionStorage.getItem('app-reloaded-on-version');
  const remote = await getRemoteVersion();
  if (!remote) return false;

  if (stored !== remote && alreadyReloaded !== remote) {
    console.log(`[Update] Nueva versión detectada (${stored} → ${remote}). Refrescando…`);
    localStorage.setItem('app-version', remote);
    sessionStorage.setItem('app-reloaded-on-version', remote);
    await clearCachesAndSW();
    await hardReload();
    return true;
  }
  return false;
}

function installChunkErrorTrap () {
  window.addEventListener('error', (e) => {
    const msg = e?.message || '';
    if (msg.includes('Loading chunk') || msg.includes('Failed to fetch dynamically imported module')) {
      console.warn('[Update] Error de chunk. Limpiando y recargando…', msg);
      clearCachesAndSW().then(hardReload);
    }
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    const msg = String(e?.reason?.message || e?.reason || '');
    if (msg.includes('Loading chunk') || msg.includes('Failed to fetch dynamically imported module')) {
      console.warn('[Update] UnhandledRejection por chunk. Limpiando y recargando…', msg);
      clearCachesAndSW().then(hardReload);
    }
  });
}

export function setupUpdateWatcher () {
  installChunkErrorTrap();

  // Primer arranque: sincroniza versión local
  getRemoteVersion().then((remote) => {
    if (remote && localStorage.getItem('app-version') !== remote) {
      localStorage.setItem('app-version', remote);
    }
  });

  // Chequea al volver a la pestaña
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkAndUpdateNow();
    }
  });

  // Pool periódico
  if (POLL_MS > 0) setInterval(checkAndUpdateNow, POLL_MS);

  // (Opcional para debug) window.__forceUpdateCheck = checkAndUpdateNow;
}
