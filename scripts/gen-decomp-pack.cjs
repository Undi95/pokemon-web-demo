#!/usr/bin/env node
/**
 * gen-decomp-pack.cjs — Regroupe des dossiers d'assets décomp en "packs" binaires.
 *
 * POURQUOI (moteur, hors 1:1) : le boot d'une map fait ~500 requêtes reseau, et CHAQUE
 * changement de map recharge ses tilesets (~38 fichiers : tiles + metatiles + 16 palettes
 * + anim). Sur une connexion lente (le pote) la latence de tant d'allers-retours = « les
 * maps prennent des plombes ». On concatene les dossiers denses en 1 .pack chacun ; le jeu
 * fetch toujours ses URLs 1:1, l'intercepteur les DEVIE vers la tranche du pack (1 requete
 * de pack au 1er acces, puis tout le groupe local). AUCUN fichier de jeu touche.
 *
 * DEUX familles de packs :
 *  1. Dossiers PLATS denses toujours charges au boot (GROUPS) — faible sur-fetch.
 *  2. TILESETS par-dossier : chaque tilesets/{primary,secondary}/<nom>/ → 1 pack. Une map
 *     charge SON primary + SON secondary = 2 packs au lieu de ~38 fichiers. 0 sur-fetch
 *     (une map utilise tout son dossier tileset).
 *
 * Les octets de chaque asset sont copies VERBATIM (le slice = le fichier byte-identique).
 *
 * Sortie : public/decomp/packs/<nom>.pack  +  public/decomp/packs.json (format v2 COMPACT :
 * base partagee par pack → JSON leger meme avec 70 packs). Tous trackes git → clone du pote.
 * Regenerer apres toute rege d'assets (memes octets que les fichiers individuels).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'public', 'decomp');
const EM = path.join(PUB, 'em');
const OUT_DIR = path.join(PUB, 'packs');

// Dossiers PLATS denses (whole → 1 pack). EXCLUS : battle_anims (987 Ko, 90/1232 utilises
// = 11x sur-fetch) et ui (1.3 Mo, 46/122 = 28x) → a packer par sous-ensemble plus tard.
const GROUPS = ['field_effects', 'door_anims', 'object_events', 'map_popup'];
// Categories de tilesets dont CHAQUE sous-dossier devient 1 pack.
const TILESET_CATS = ['primary', 'secondary'];

/** Chemin absolu -> URL decomp ('/decomp/…', separateurs POSIX). */
function toDecompUrl(abs) {
  return '/decomp/' + path.relative(PUB, abs).split(path.sep).join('/');
}
/** Liste recursive triee (ordre stable = pack deterministe). */
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc); else acc.push(p);
  }
  return acc;
}

/** Concatene tout le dossier `absDir` en `<packName>.pack` ; pousse {url, base, files} dans packsOut.
 *  files = [[relName, offset, length], …] ; base = URL du dossier + '/' (partagee = JSON compact). */
function packFolder(absDir, packName, packsOut) {
  if (!fs.existsSync(absDir)) return null;
  const files = walk(absDir, []).sort();
  if (!files.length) return null;
  const base = toDecompUrl(absDir) + '/';
  const chunks = [];
  let offset = 0;
  const fileEntries = [];
  for (const f of files) {
    const buf = fs.readFileSync(f);
    const rel = toDecompUrl(f).slice(base.length); // ex: 'people/brendan/walking.png'
    fileEntries.push([rel, offset, buf.length]);
    chunks.push(buf);
    offset += buf.length;
  }
  fs.writeFileSync(path.join(OUT_DIR, `${packName}.pack`), Buffer.concat(chunks));
  packsOut.push({ url: `/decomp/packs/${packName}.pack`, base, files: fileEntries });
  return { count: files.length, bytes: offset };
}

function main() {
  // Repart propre (evite les .pack orphelins d'une config precedente).
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const packs = [];
  let grandFiles = 0;
  let grandBytes = 0;
  const log = (name, r) => { if (r) { grandFiles += r.count; grandBytes += r.bytes; console.log(`[gen-pack] ${name.padEnd(30)} ${String(r.count).padStart(4)}f ${(r.bytes / 1024).toFixed(0).padStart(5)}Ko`); } };

  for (const g of GROUPS) log(g, packFolder(path.join(EM, g), g, packs));

  for (const cat of TILESET_CATS) {
    const catDir = path.join(EM, 'tilesets', cat);
    if (!fs.existsSync(catDir)) { console.warn(`[gen-pack] SKIP tilesets/${cat} (absent)`); continue; }
    for (const sub of fs.readdirSync(catDir, { withFileTypes: true })) {
      if (sub.isDirectory()) log(`tilesets/${cat}/${sub.name}`, packFolder(path.join(catDir, sub.name), `tilesets_${cat}_${sub.name}`, packs));
    }
  }

  fs.writeFileSync(path.join(PUB, 'packs.json'), JSON.stringify({ version: 2, generated: 'gen-decomp-pack.cjs', packs }));
  const jsonKb = (fs.statSync(path.join(PUB, 'packs.json')).size / 1024).toFixed(0);
  const nEntries = packs.reduce((s, p) => s + p.files.length, 0);
  console.log(`[gen-pack] TOTAL ${grandFiles} fichiers, ${(grandBytes / 1024).toFixed(0)} Ko en ${packs.length} packs.`);
  console.log(`[gen-pack] packs.json v2 : ${nEntries} entrees, ${jsonKb} Ko.`);
}

main();
