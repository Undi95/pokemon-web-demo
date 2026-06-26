#!/usr/bin/env node
/**
 * audit-anim-tag-constants.cjs — ORACLE des constantes ANIM_TAG_* (tags sprite/palette d'anim combat).
 *
 * Les animations de combat référencent leurs sprites/palettes par un tag ANIM_TAG_* défini dans
 * `include/constants/battle_anim.h` comme `(ANIM_SPRITES_START + N)` (ANIM_SPRITES_START = 10000).
 * Le port code ces tags soit en CONSTANTE nommée (`const ANIM_TAG_X = 100NN`), soit en LITTÉRAL
 * commenté à un call-site (forme «100NN annoté ANIM_TAG_X», p.ex. IndexOfSpritePaletteTag). Un numéro faux
 * = le tag pointe sur un AUTRE sprite/palette → l'anim charge/anime le mauvais asset ou rien.
 *
 * Cet oracle confronte les DEUX formes au canon décomp. La famille ANIM_TAG_ est value-1:1 dans le
 * port (schéma identique ANIM_SPRITES_START+N) — elle était HORS de l'allowlist d'audit-commented-
 * constants (traitée comme sélecteur potentiellement renuméroté) ; cet oracle dédié la possède.
 *
 * Découvert en construisant cet oracle (corrigé `077c8594`) : AnimTask_AnimateGustTornadoPalette
 * passait 10008 (ANIM_TAG_PINK_ORB « unused ») au lieu de 10009 (ANIM_TAG_GUST) → la palette du
 * tornado (Tornade/Coupe-Vent/Cyclone) ne cyclait pas.
 *
 *   node scripts/audit-anim-tag-constants.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const ANIM_SPRITES_START = 10000;

// ── canon décomp : ANIM_TAG_X = (ANIM_SPRITES_START ± N) ──
const hdr = fs.readFileSync(path.join(DECOMP, 'include/constants/battle_anim.h'), 'utf8');
const canon = {};
for (const m of hdr.matchAll(/^#define\s+(ANIM_TAG_[A-Z0-9_]+)\s+\(ANIM_SPRITES_START\s*([+\-])\s*(\d+)\)/gm)) {
  canon[m[1]] = ANIM_SPRITES_START + (m[2] === '+' ? 1 : -1) * parseInt(m[3], 10);
}

// ── scan src/ (hors data auto-générée) ──
function listTs(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') listTs(p, acc); }
    else if (e.name.endsWith('.ts') && !p.includes(path.sep + 'auto' + path.sep) && !e.name.endsWith('-auto.ts') && !e.name.endsWith('.d.ts'))
      acc.push(p);
  }
  return acc;
}
const RE_CONST = /\bconst\s+(ANIM_TAG_[A-Z0-9_]+)\s*(?::\s*number\s*)?=\s*(\d+)\b/g;
const RE_CMT = /(\d+)\s*\/\*\s*(ANIM_TAG_[A-Z0-9_]+)\s*\*\//g;

let nConst = 0, nCmt = 0;
const findings = [];
for (const f of listTs(path.join(ROOT, 'src'), [])) {
  const txt = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  for (const m of txt.matchAll(RE_CONST)) {
    const n = m[1], v = parseInt(m[2], 10);
    if (!(n in canon)) continue;
    nConst++;
    if (v !== canon[n]) findings.push(`${rel}:${txt.slice(0, m.index).split('\n').length}  const ${n} = ${v}  → décomp ${canon[n]}`);
  }
  for (const m of txt.matchAll(RE_CMT)) {
    const n = m[2], v = parseInt(m[1], 10);
    if (!(n in canon)) continue;
    const ls = txt.lastIndexOf('\n', m.index) + 1;
    if (txt.slice(ls, m.index).includes('//')) continue; // exemple en commentaire de ligne, pas du code
    nCmt++;
    if (v !== canon[n]) findings.push(`${rel}:${txt.slice(0, m.index).split('\n').length}  ${v} /* ${n} */  → décomp ${canon[n]}`);
  }
}

console.log(`ANIM_TAG_ confrontés : ${nConst} const nommées + ${nCmt} littéraux commentés (vs ${Object.keys(canon).length} tags canon décomp).`);
if (findings.length === 0) { console.log('✅ Toute constante/littéral ANIM_TAG_* du port = canon décomp (ANIM_SPRITES_START+N).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
