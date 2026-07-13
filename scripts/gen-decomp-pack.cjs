#!/usr/bin/env node
/**
 * gen-decomp-pack.cjs — Regroupe des dossiers d'assets décomp en "packs" binaires.
 *
 * POURQUOI (moteur, hors 1:1) : le boot d'une map fait ~500 requêtes réseau (latence =
 * « maps interminables » chez le pote). On concatène les dossiers TOUJOURS chargés
 * (battle_anims, field_effects, door_anims, ui, object_events, map_popup) en 1 .pack
 * chacun + un index plat `packs.json` (clé asset -> [packUrl, offset, length]).
 * L'intercepteur `decomp-asset-net.ts` sert ensuite chaque asset packé depuis SA tranche
 * (1 requête de pack au 1er accès, puis tout le groupe est en mémoire/cache). AUCUN fichier
 * de jeu touché : le jeu fetch toujours ses URLs 1:1, on les dévie vers le pack.
 *
 * Les octets de chaque asset sont copiés VERBATIM (le slice = le fichier d'origine
 * byte-identique). Idempotent : régénère packs.json + les .pack à chaque run.
 *
 * Sortie : public/decomp/packs/<groupe>.pack  +  public/decomp/packs.json
 * (tous deux TRACKÉS git → le clone du pote en profite dès le 1er boot).
 *
 * Régénérer après toute régé d'assets (mêmes octets que les fichiers individuels).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'public', 'decomp');
const EM = path.join(PUB, 'em');
const OUT_DIR = path.join(PUB, 'packs');

// Groupes DENSES chargés au boot, à FAIBLE sur-fetch (mesuré en jeu : la plupart des
// fichiers du dossier sont réellement demandés). EXCLUS volontairement :
//  - battle_anims (987 Ko, 90/1232 utilisés = 11× sur-fetch) et ui (1.3 Mo, 46/122 = 28×)
//    → un blanket-pack y coûterait trop de bande passante ; à packer par SOUS-ENSEMBLE plus tard.
//  - tilesets/ : secondary a 1474 fichiers, une map n'en veut qu'un sous-dossier.
// NB (mesuré) : le pack ne couvre que le chemin `fetch` (window.fetch). Les assets chargés
// via Phaser/`img.src` bypassent l'intercepteur → couverture complète = chantier Service Worker.
const GROUPS = ['field_effects', 'door_anims', 'object_events', 'map_popup'];

/** Chemin -> URL décomp ('/decomp/em/…') avec séparateurs POSIX. */
function toDecompUrl(absFile) {
  const rel = path.relative(PUB, absFile).split(path.sep).join('/');
  return '/decomp/' + rel;
}

/** Liste récursive triée (ordre stable = pack déterministe). */
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  /** @type {Record<string, [string, number, number]>} clé asset -> [packUrl, offset, length] */
  const entries = {};
  let grandFiles = 0;
  let grandBytes = 0;

  for (const g of GROUPS) {
    const gdir = path.join(EM, g);
    if (!fs.existsSync(gdir)) { console.warn(`[gen-pack] SKIP ${g} (absent)`); continue; }
    const files = walk(gdir, []).sort();
    const chunks = [];
    let offset = 0;
    const packUrl = `/decomp/packs/${g}.pack`;
    for (const f of files) {
      const buf = fs.readFileSync(f);
      entries[toDecompUrl(f)] = [packUrl, offset, buf.length];
      chunks.push(buf);
      offset += buf.length;
    }
    fs.writeFileSync(path.join(OUT_DIR, `${g}.pack`), Buffer.concat(chunks));
    grandFiles += files.length;
    grandBytes += offset;
    console.log(`[gen-pack] ${g.padEnd(16)} ${String(files.length).padStart(5)} fichiers  ${(offset / 1024).toFixed(0).padStart(6)} Ko  -> ${g}.pack`);
  }

  const manifest = { version: 1, generated: 'gen-decomp-pack.cjs', groups: GROUPS, entries };
  fs.writeFileSync(path.join(PUB, 'packs.json'), JSON.stringify(manifest));
  const jsonKb = (fs.statSync(path.join(PUB, 'packs.json')).size / 1024).toFixed(0);
  console.log(`[gen-pack] TOTAL ${grandFiles} fichiers, ${(grandBytes / 1024).toFixed(0)} Ko en ${GROUPS.length} packs.`);
  console.log(`[gen-pack] packs.json : ${Object.keys(entries).length} entrées, ${jsonKb} Ko.`);
}

main();
