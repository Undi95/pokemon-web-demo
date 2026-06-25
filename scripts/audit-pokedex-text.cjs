#!/usr/bin/env node
/**
 * audit-pokedex-text.cjs — ORACLE de fidélité du TEXTE des fiches Pokédex (FR).
 *
 * Confronte le paragraphe de description de chaque espèce dans
 * `public/decomp/em/pokedex-entries.json` (.description) au décomp `pokedex_text.h`
 * (`g<Nom>PokedexText[] = _("…\n" "…")`). Le décomp coupe les lignes par `\n` ; notre
 * JSON les aplatit en espaces → comparaison NORMALISÉE (sauts de ligne → espace, espaces
 * collés). Lien via la descriptionKey (= symbole). Tout écart = fiche Pokédex au mauvais texte.
 *
 *   node scripts/audit-pokedex-text.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/pokedex_text.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/pokedex-entries.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(H, 'utf8');

// symbole g<Nom>PokedexText → texte concaténé
const texts = {};
for (const m of src.matchAll(/const u8 (g\w+PokedexText)\[\]\s*=\s*_\(([\s\S]*?)\);/g)) {
  const sym = m[1];
  const segs = [...m[2].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) => x[1]);
  texts[sym] = segs.join('');
}

// normalise : \n \l \p → espace, $ (EOS) retiré, espaces collés
const norm = (s) => s.replace(/\\[nlp]/g, ' ').replace(/\$/g, '').replace(/\s+/g, ' ').trim();

const findings = [];
let checked = 0;
for (const sp of Object.keys(ours)) {
  const o = ours[sp];
  if (!o || !o.descriptionKey) continue;
  const dRaw = texts[o.descriptionKey];
  if (dRaw === undefined) { findings.push(`${sp} : symbole ${o.descriptionKey} introuvable dans pokedex_text.h`); continue; }
  checked++;
  const d = norm(dRaw), oj = norm(o.description || '');
  if (d !== oj) findings.push(`${sp} (${o.descriptionKey}) :\n      json   = ${JSON.stringify(oj)}\n      décomp = ${JSON.stringify(d)}`);
}

console.log(`Textes Pokédex décomp : ${Object.keys(texts).length} · comparés : ${checked}`);
if (findings.length === 0) { console.log('✅ descriptions Pokédex FIDÈLES au décomp pokedex_text.h (texte FR par espèce).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de texte Pokédex :\n`);
for (const f of findings.slice(0, 20)) console.log('  ' + f);
process.exit(1);
