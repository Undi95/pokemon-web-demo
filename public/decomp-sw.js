/*
 * decomp-sw.js — Service Worker d'assets décomp (MOTEUR, hors 1:1).
 *
 * POURQUOI (complément de harness/runtime/decomp-asset-net.ts) : l'intercepteur `window.fetch`
 * ne voit QUE les requêtes fetch. Beaucoup de PNG sont chargés par Phaser via `img.src`, qui
 * BYPASSE window.fetch → ni cache, ni packs pour eux (mesuré : ~100+ req/img à froid). Un
 * Service Worker intercepte TOUTES les requêtes réseau (fetch, img, xhr) au niveau réseau :
 * on sert alors l'img depuis les MÊMES packs (public/decomp/packs.json + *.pack) + un cache
 * persistant. AUCUN fichier de jeu touché : le jeu charge toujours ses URLs 1:1, on les dévie.
 *
 * Débloque aussi la persistance offline. (LAN/tunnel : nécessite HTTPS = contexte sécurisé.)
 *
 * Coexistence avec l'intercepteur fetch : le SW est SOUS la couche JS. Les assets fetch-packés
 * sont déjà servis par l'intercepteur (il slice avant d'atteindre le réseau) ; le SW ne voit
 * donc que l'img, les individuels non-packés, et les .pack/packs.json (pass-through + cache).
 * Slice byte-identique (mêmes octets que le fichier d'origine).
 */
'use strict';

const CACHE = 'decomp-sw-v1';

/** Clé stable = pathname (sans query ?_cb) → un asset via localhost/127.0.0.1 partage la clé. */
function keyOf(url) {
  try { return new URL(url).pathname; } catch (e) { return url; }
}
function isDecomp(url) {
  return url.indexOf('/decomp/') !== -1 && url.indexOf('/m4a/') === -1;
}
function isPackOrManifest(path) {
  return path.indexOf('/decomp/packs/') !== -1 || path === '/decomp/packs.json';
}
function contentType(path) {
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.json')) return 'application/json';
  return 'application/octet-stream'; // .bin / .4bpp.bin / .pal / .gbapal
}

// ── Index des packs (packs.json v2 : {packs:[{url, base, files:[[relName,off,len]]}]}) ──
let _packIndex = null;      // { [assetPath]: [packUrl, offset, length] }
let _packIndexP = null;
function loadPackIndex() {
  if (_packIndex) return Promise.resolve(_packIndex);
  if (!_packIndexP) {
    _packIndexP = (async () => {
      const idx = {};
      try {
        const r = await fetch('/decomp/packs.json');
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j.packs)) {
            for (const p of j.packs) for (const f of p.files) idx[p.base + f[0]] = [p.url, f[1], f[2]];
          }
        }
      } catch (e) { /* pas de packs = fetch individuel normal */ }
      _packIndex = idx;
      return idx;
    })();
  }
  return _packIndexP;
}

// ── Buffers de packs mémoïsés (1 fetch/pack, réutilisé pour toutes ses tranches) ──
const _packBuffers = new Map(); // packUrl -> Promise<ArrayBuffer>
function getPack(packUrl) {
  let p = _packBuffers.get(packUrl);
  if (!p) {
    p = (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(packUrl);
      if (hit) return hit.arrayBuffer();
      const r = await fetch(packUrl); // fetch SW-initié : ne re-déclenche PAS ce handler (pas de récursion)
      if (r.ok) { try { await cache.put(packUrl, r.clone()); } catch (e) {} }
      return r.arrayBuffer();
    })();
    _packBuffers.set(packUrl, p);
  }
  return p;
}

async function handle(request) {
  const path = keyOf(request.url);
  const cache = await caches.open(CACHE);
  const hit = await cache.match(path);
  if (hit) return hit;

  // .pack / packs.json : pass-through réseau + cache (JAMAIS slicé).
  if (isPackOrManifest(path)) {
    const resp = await fetch(request);
    if (resp.ok) { try { await cache.put(path, resp.clone()); } catch (e) {} }
    return resp;
  }

  // Asset packé ? sert SA tranche.
  const idx = await loadPackIndex();
  const entry = idx[path];
  if (entry) {
    const buf = await getPack(entry[0]);
    const slice = buf.slice(entry[1], entry[1] + entry[2]);
    const resp = new Response(slice, { status: 200, headers: { 'Content-Type': contentType(path) } });
    try { await cache.put(path, resp.clone()); } catch (e) {}
    return resp;
  }

  // Sinon : réseau + cache.
  const resp = await fetch(request);
  if (resp.ok) { try { await cache.put(path, resp.clone()); } catch (e) {} }
  return resp;
}

self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Purge les vieilles versions de cache SW.
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k.startsWith('decomp-sw-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !isDecomp(req.url)) return; // laisse passer normalement (src/, HMR, m4a…)
  e.respondWith(handle(req));
});
