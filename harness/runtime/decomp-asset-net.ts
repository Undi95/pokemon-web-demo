/**
 * decomp-asset-net.ts — Intercepteur réseau des assets décomp (MOTEUR, hors 1:1).
 *
 * ─── POURQUOI ────────────────────────────────────────────────────────────────
 * Le code du jeu est transcrit 1:1 du décomp : sur cartouche il lit ses assets en
 * ROM (instantané). Notre portage lit les mêmes octets via `fetch('/decomp/em/…')`.
 * Ce `fetch` EST la frontière 1:1 ↔ moteur. Le réseau (dev-server, LAN, tunnel) est
 * lent : ~150-400 requêtes bloquantes par map, 500+ par combat, tout re-téléchargé à
 * chaque refresh (cache-bust). Résultat : maps interminables, transition de combat qui
 * skip (garde-fou 3 s), « pas plus d'un combat » chez un pote sur le serveur.
 *
 * ─── CE QUE FAIT CE MODULE (sans toucher UN SEUL fichier de jeu) ─────────────
 * On intercepte `window.fetch` (comme l'ancien monkey-patch cache-bust, qu'on
 * remplace) et on route les assets décomp vers :
 *   1. CACHE PERSISTANT (Cache API) — 1er chargement seulement, puis instantané, MÊME
 *      après un refresh et pour un clone frais du repo. C'est le « la cartouche a tout
 *      dedans » : après la 1re visite, l'octet est local.
 *   2. DÉDUPLICATION in-flight — 2 demandes identiques concurrentes (jeu + préchargeur,
 *      ou 2 chemins du jeu) = 1 seul aller réseau.
 *   3. PRÉCHARGEMENT APPRIS — on observe les « bursts » de requêtes (un contexte : une
 *      map, un combat…), on mémorise « quand l'URL X arrive, les URLs Y…Z suivent », et
 *      à la ré-occurrence de X on lance tout Y…Z en parallèle AVANT que le jeu ne les
 *      demande. Ses requêtes 1:1 tombent alors sur du cache chaud / de l'in-flight.
 *
 * ─── 1:1 GARANTI ─────────────────────────────────────────────────────────────
 * On ne change AUCUNE logique de jeu ni son ordre : le code 1:1 appelle `fetch` au même
 * point qu'avant, on garantit juste que l'octet est déjà là (cache) → accès instantané,
 * comme la ROM. Adaptation moteur pure, au même titre que son/save/RTC.
 *
 * ─── DEV (régénération d'assets) ─────────────────────────────────────────────
 * Le cache est versionné (CACHE_VERSION). Pour repartir propre après avoir régénéré
 * l'extracteur d'assets :
 *   • URL `?freshassets`         → bypass + purge à l'install (à faire 1×).
 *   • `window.__decompNet.clear()` → purge manuelle (console).
 *   • bump `CACHE_VERSION`        → invalidation globale pour tout le monde.
 * Modules `/src/*` (HMR de Vite) et blob m4a (natif) NE sont PAS touchés : comportement
 * cache-bust dev d'origine préservé pour eux.
 *
 * ⚠️ Cache API = contexte sécurisé requis. localhost EST sécurisé (cas du clone `npm run
 * dev` → OK pour le pote). Un accès via IP LAN http:// non-sécurisé → pas de Cache API :
 * on retombe proprement sur dédup + réseau (pas de persistance, mais rien de cassé). La
 * persistance cross-origine LAN = chantier Service Worker (phase 2).
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `decomp-assets-${CACHE_VERSION}`;
const MANIFEST_KEY = `decompNet.manifests.${CACHE_VERSION}`;

/** Un trou de plus de BURST_GAP_MS entre 2 requêtes clôt le "burst" (= contexte). */
const BURST_GAP_MS = 1200;
/** Borne d'URLs mémorisées par trigger (garde localStorage raisonnable). */
const MAX_MANIFEST_URLS = 600;
/** Requêtes de préchargement parallèles max (le navigateur plafonne ~6/host de toute façon). */
const PREFETCH_CONCURRENCY = 8;

let _origFetch: typeof window.fetch;
let _bootCb = '';
let _bypass = false;
let _installed = false;

// ── Cache persistant (Cache API) ─────────────────────────────────────────────
const _hasCaches = typeof caches !== 'undefined';
let _cacheP: Promise<Cache> | null = null;
function _cache(): Promise<Cache> | null {
  if (!_hasCaches) return null;
  if (!_cacheP) _cacheP = caches.open(CACHE_NAME);
  return _cacheP;
}

// ── Déduplication in-flight ──────────────────────────────────────────────────
const _inflight = new Map<string, Promise<Response>>();

// ── Apprentissage de contextes (burst → manifeste), persisté localStorage ────
let _manifests: Record<string, string[]> = {};
let _burst: string[] = [];
let _burstTimer: ReturnType<typeof setTimeout> | undefined;
const _prefetchedTriggers = new Set<string>(); // triggers déjà préchargés cette session

function _loadManifests(): void {
  try { _manifests = JSON.parse(localStorage.getItem(MANIFEST_KEY) || '{}'); } catch { _manifests = {}; }
}
let _saveScheduled = false;
function _scheduleSaveManifests(): void {
  if (_saveScheduled) return;
  _saveScheduled = true;
  const flush = () => {
    _saveScheduled = false;
    try { localStorage.setItem(MANIFEST_KEY, JSON.stringify(_manifests)); } catch { /* quota : tant pis */ }
  };
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (ric) ric(flush, { timeout: 3000 }); else setTimeout(flush, 1000);
}

/** Clé de cache stable : chemin relatif SANS query (indépendant de l'origin/port et du
 *  cache-bust) → un asset touché via localhost:5173 ou 127.0.0.1:5173 partage la clé. */
function _key(url: string): string {
  const q = url.indexOf('?');
  const base = q >= 0 ? url.slice(0, q) : url;
  const o = location.origin;
  return base.startsWith(o) ? base.slice(o.length) : base;
}

/** Assets décomp statiques cachables. EXCLUS : blob m4a (chemin natif), modules /src/. */
function _isCacheable(url: string): boolean {
  return url.includes('/decomp/') && !url.includes('/m4a/');
}

// ── Observation → apprentissage + déclenchement du préchargement appris ──────
function _observe(key: string): void {
  _burst.push(key);
  const learned = _manifests[key];
  if (learned && learned.length && !_prefetchedTriggers.has(key)) {
    _prefetchedTriggers.add(key);
    void _prefetch(learned);
  }
  if (_burstTimer !== undefined) clearTimeout(_burstTimer);
  _burstTimer = setTimeout(_finalizeBurst, BURST_GAP_MS);
}

function _finalizeBurst(): void {
  _burstTimer = undefined;
  if (_burst.length < 2) { _burst = []; return; }
  const trigger = _burst[0];
  const rest = _burst.slice(1);
  const prev = _manifests[trigger] || [];
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const u of [...prev, ...rest]) {
    if (u === trigger || seen.has(u)) continue;
    seen.add(u);
    merged.push(u);
    if (merged.length >= MAX_MANIFEST_URLS) break;
  }
  _manifests[trigger] = merged;
  _burst = [];
  _scheduleSaveManifests();
}

// ── Préchargement borné (silencieux : ne pollue pas l'apprentissage) ─────────
async function _prefetch(urls: string[]): Promise<void> {
  const cacheP = _cache();
  const c = cacheP ? await cacheP : null;
  const todo: string[] = [];
  for (const u of urls) {
    if (_inflight.has(u)) continue;
    if (c && (await c.match(u))) continue;
    todo.push(u);
  }
  if (!todo.length) return;
  let i = 0;
  const worker = async (): Promise<void> => {
    while (i < todo.length) {
      const u = todo[i++];
      try { await _cachedFetch(u, undefined, true); } catch { /* réseau : on réessaiera à la vraie demande */ }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(PREFETCH_CONCURRENCY, todo.length) }, () => worker()),
  );
}

/** Cœur : sert depuis le cache, sinon dédup in-flight, sinon réseau + stockage.
 *  `key` = chemin relatif normalisé. `silent` = requête de préchargement (pas d'apprentissage). */
async function _cachedFetch(key: string, init: RequestInit | undefined, silent: boolean): Promise<Response> {
  if (!silent) _observe(key);

  const cacheP = _cache();
  if (cacheP) {
    const hit = await (await cacheP).match(key);
    if (hit) return hit; // Cache.match rend une Response fraîche à chaque appel
  }

  const existing = _inflight.get(key);
  if (existing) return existing.then((r) => r.clone());

  const p = (async (): Promise<Response> => {
    // Réseau : applique le cache-bust dev d'origine (sans effet sur la clé de cache).
    const netUrl = (!import.meta.env.PROD && !key.includes('_cb=')) ? `${key}?_cb=${_bootCb}` : key;
    const resp = await _origFetch(netUrl, init);
    if (resp.ok && cacheP) {
      try { await (await cacheP).put(key, resp.clone()); } catch { /* stockage best-effort */ }
    }
    return resp;
  })();
  _inflight.set(key, p);
  try {
    const r = await p;
    return r.clone();
  } finally {
    _inflight.delete(key);
  }
}

// ── Préchargement en fond du JEU ENTIER (idle trickle) ───────────────────────
// « Précharge les ressources petit à petit pour le futur » (directive user) : on
// trickle le manifeste des assets runtime (public/decomp/asset-manifest.json, généré
// par scripts/gen-decomp-manifest.cjs) pendant les temps morts → après quelques minutes
// de jeu, TOUT est en cache, y compris la 1re visite d'une map/combat. Back-off dès que
// le jeu charge activement (warp/combat) pour ne pas lui voler la bande passante.
// Best-effort : un asset absent du manifeste reste fetché à la demande normalement.
// Désactivable : ?noprefetch. Observable : window.__decompNet.prefetchProgress().
const _prefetchState = { total: 0, done: 0, active: false, started: false };
const IDLE_BATCH = 6;            // URLs lancées par créneau idle
const IDLE_INFLIGHT_BACKOFF = 5; // si ≥ N requêtes en vol (jeu qui charge) → on attend

function _scheduleIdle(fn: () => void, delayMs: number): void {
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
  if (delayMs > 0 || !ric) setTimeout(() => (ric ? ric(fn, { timeout: 2000 }) : fn()), Math.max(0, delayMs));
  else ric(fn, { timeout: 2000 });
}

async function _startIdlePrefetch(): Promise<void> {
  if (_prefetchState.started || _bypass) return;
  if (location.search.includes('noprefetch')) return;
  _prefetchState.started = true;
  let urls: string[] = [];
  try {
    const resp = await _cachedFetch('/decomp/asset-manifest.json', undefined, true);
    const m = (await resp.json()) as { urls?: unknown };
    urls = Array.isArray(m.urls) ? (m.urls as string[]) : [];
  } catch { return; } // pas de manifeste = pas de prefetch (le jeu fetch à la demande)
  _prefetchState.total = urls.length;
  _prefetchState.active = true;
  let i = 0;
  const step = (): void => {
    // Back-off si le jeu charge activement (beaucoup d'in-flight = warp/combat en cours).
    if (_inflight.size >= IDLE_INFLIGHT_BACKOFF) { _scheduleIdle(step, 600); return; }
    let launched = 0;
    while (i < urls.length && launched < IDLE_BATCH) {
      const u = urls[i++];
      void _cachedFetch(u, undefined, true).catch(() => { /* best-effort */ });
      launched++;
    }
    _prefetchState.done = i;
    if (i < urls.length) _scheduleIdle(step, 0);
    else _prefetchState.active = false;
  };
  _scheduleIdle(step, 0);
}

/** Installe l'intercepteur. À appeler UNE fois, AVANT que le jeu ne fetch (début de main). */
export function installDecompAssetNet(): void {
  if (_installed) return;
  _installed = true;
  _origFetch = window.fetch.bind(window);
  _bootCb = String(Date.now());
  _bypass = location.search.includes('freshassets');
  _loadManifests();
  if (_bypass) {
    _manifests = {};
    try { localStorage.removeItem(MANIFEST_KEY); } catch { /* noop */ }
    if (_hasCaches) caches.delete(CACHE_NAME).catch(() => { /* noop */ });
  }

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      const raw = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
      const isLocal = raw.startsWith('/') || raw.startsWith(location.origin);
      const method = (init?.method || 'GET').toUpperCase();
      if (isLocal && method === 'GET' && !_bypass && _isCacheable(raw)) {
        return _cachedFetch(_key(raw), init, false);
      }
      // Non-cachable local (m4a, /src/, non-GET) : comportement cache-bust dev d'origine.
      if (!import.meta.env.PROD && isLocal && !raw.includes('_cb=')) {
        const sep = raw.includes('?') ? '&' : '?';
        return _origFetch(`${raw}${sep}_cb=${_bootCb}`, init);
      }
    } catch { /* fallthrough vers fetch d'origine */ }
    return _origFetch(input as RequestInfo, init);
  }) as typeof window.fetch;

  // Sonde/outil dev (console).
  (globalThis as Record<string, unknown>).__decompNet = {
    clear: async (): Promise<string> => {
      if (_hasCaches) await caches.delete(CACHE_NAME).catch(() => { /* noop */ });
      _cacheP = null;
      _manifests = {};
      _prefetchedTriggers.clear();
      try { localStorage.removeItem(MANIFEST_KEY); } catch { /* noop */ }
      return 'decomp-net : cache + manifestes purgés';
    },
    stats: (): Record<string, unknown> => ({
      cacheApi: _hasCaches,
      bypass: _bypass,
      triggersAppris: Object.keys(_manifests).length,
      inflight: _inflight.size,
      triggersPrechargesCetteSession: _prefetchedTriggers.size,
      prefetchFond: { ..._prefetchState },
    }),
    manifests: (): Record<string, string[]> => _manifests,
    prefetch: (urls: string[]): Promise<void> => _prefetch(urls),
    prefetchAll: (): Promise<void> => _startIdlePrefetch(),
    prefetchProgress: (): Record<string, unknown> => ({ ..._prefetchState }),
  };

  // Démarre le préchargement en fond du jeu entier, DIFFÉRÉ (laisse le boot + la 1re
  // scène se poser d'abord — le trickle back-off ensuite pendant les chargements actifs).
  _scheduleIdle(() => void _startIdlePrefetch(), 4000);
}
