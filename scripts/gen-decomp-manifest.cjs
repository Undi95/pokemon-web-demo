#!/usr/bin/env node
/**
 * gen-decomp-manifest.cjs — génère public/decomp/asset-manifest.json
 *
 * Liste les assets décomp RUNTIME (ce que le jeu fetch réellement) pour que le
 * préchargeur en fond (harness/runtime/decomp-asset-net.ts) puisse les trickler
 * pendant les temps morts → 1re visite d'une map/combat instantanée aussi.
 *
 * NE TOUCHE À AUCUN FICHIER DE JEU : c'est un manifeste moteur (hint de prefetch,
 * best-effort — si un asset manque, le jeu le fetch à la demande normalement).
 *
 * Exclusions (non-runtime / gérés autrement / gros pour rien) :
 *   - dumps DEV : extracted-all/, extracted/, map-dumps/
 *   - audio : sound/ cries/ sfx/ m4a/  (le son passe par le blob m4a/sound-data.bin,
 *     préchargé à part ; les fichiers individuels ne sont pas fetchés au runtime)
 *   - docs/binaires : *.md, *.h, *.gba, *.gitignore
 *
 * Ordre = priorité de préchargement (visuels overworld → visuels combat/menu → data).
 *
 * Usage : node scripts/gen-decomp-manifest.cjs
 * Régénérer après ajout d'assets. Le manifeste est tracké (le clone du pote en profite).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'public', 'decomp', 'em');
const OUT = path.resolve(__dirname, '..', 'public', 'decomp', 'asset-manifest.json');
const URL_PREFIX = '/decomp/em/';

// Top-dirs exclus (dev / audio-par-blob).
const EXCLUDE_DIRS = new Set([
  'extracted-all', 'extracted', 'map-dumps', 'sound', 'cries', 'sfx', 'm4a',
]);
const EXCLUDE_EXT = new Set(['md', 'h', 'gba', 'gitignore']);

// Priorité par top-dir (plus petit = préchargé plus tôt). Défaut = 5.
const TIER = {
  tilesets: 0, 'tileset-pairs': 0, layouts: 0, maps: 0, object_events: 1,
  pokemon: 2, battle_anims: 2, trainer_pics: 2, ui: 2, items: 2, intro: 2,
  battle_transitions: 2, field_effects: 2, pokeblock: 3, berry: 3,
  scripts: 4, 'static-tables': 4,
};

function topDir(rel) {
  const i = rel.indexOf('/');
  return i >= 0 ? rel.slice(0, i) : '';
}

/** @param {string} dir @param {string[]} out */
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const rel = path.relative(ROOT, full).split(path.sep).join('/');
      if (EXCLUDE_DIRS.has(topDir(rel + '/'))) continue;
      walk(full, out);
    } else if (entry.isFile()) {
      const rel = path.relative(ROOT, full).split(path.sep).join('/');
      const top = topDir(rel);
      if (EXCLUDE_DIRS.has(top)) continue;
      const ext = (rel.split('.').pop() || '').toLowerCase();
      if (EXCLUDE_EXT.has(ext)) continue;
      out.push(rel);
    }
  }
}

if (!fs.existsSync(ROOT)) {
  console.error('[gen-manifest] introuvable :', ROOT);
  process.exit(1);
}

const rels = [];
walk(ROOT, rels);

// Tri stable par (tier, chemin) → ordre de préchargement déterministe.
rels.sort((a, b) => {
  const ta = TIER[topDir(a)] ?? 5;
  const tb = TIER[topDir(b)] ?? 5;
  if (ta !== tb) return ta - tb;
  return a < b ? -1 : a > b ? 1 : 0;
});

const urls = rels.map((r) => URL_PREFIX + r);
const manifest = { version: 1, count: urls.length, urls };

fs.writeFileSync(OUT, JSON.stringify(manifest));
const bytes = fs.statSync(OUT).size;

// Récap par tier (info).
const byTier = {};
for (const r of rels) { const t = TIER[topDir(r)] ?? 5; byTier[t] = (byTier[t] || 0) + 1; }
console.log(`[gen-manifest] ${urls.length} assets runtime → ${OUT} (${(bytes / 1024).toFixed(0)} Ko)`);
console.log('[gen-manifest] par tier :', JSON.stringify(byTier));
