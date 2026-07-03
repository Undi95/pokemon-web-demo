#!/usr/bin/env node
/**
 * extract-pokedex-orders.cjs — génère src/data/pokedex_orders.ts depuis la décomp.
 *
 * Source : src/data/pokemon/pokedex_orders.h (gPokedexOrder_Alphabetical/Weight/Height,
 * listes de constantes NATIONAL_DEX_*) + include/constants/pokedex.h (enum → valeur).
 * Les tables sont celles de la ROM FR (ordre alphabétique = noms FR).
 *
 * Usage : node scripts/extract-pokedex-orders.cjs
 */
const fs = require('fs');
const path = require('path');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const ORDERS_H = path.join(DECOMP, 'src/data/pokemon/pokedex_orders.h');
const CONSTS_H = path.join(DECOMP, 'include/constants/pokedex.h');
const OUT = path.join(__dirname, '..', 'src', 'data', 'pokedex_orders.ts');

// ── 1. Map NATIONAL_DEX_X → valeur (enum C, valeurs implicites séquentielles) ──
const constsSrc = fs.readFileSync(CONSTS_H, 'utf8');
const dexMap = new Map();
{
  // L'enum commence à NATIONAL_DEX_NONE (=0) et incrémente ; certaines entrées ont
  // des affectations explicites (ex. NATIONAL_DEX_CHIKORITA = 152).
  const enumBody = constsSrc.match(/enum\s*\{([\s\S]*?)\}/);
  if (!enumBody) throw new Error('enum NATIONAL_DEX introuvable dans pokedex.h');
  let next = 0;
  for (const raw of enumBody[1].split(',')) {
    const entry = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!entry) continue;
    const m = entry.match(/^(\w+)(?:\s*=\s*(\w+))?$/);
    if (!m) continue;
    const name = m[1];
    if (m[2] !== undefined) {
      const v = dexMap.has(m[2]) ? dexMap.get(m[2]) : parseInt(m[2], 10);
      if (!Number.isFinite(v)) throw new Error(`valeur non résolue pour ${name} = ${m[2]}`);
      next = v;
    }
    dexMap.set(name, next);
    next++;
  }
}

// ── 2. Parse les 3 tables ──────────────────────────────────────────────────────
const ordersSrc = fs.readFileSync(ORDERS_H, 'utf8');
function extractTable(symbol) {
  const re = new RegExp(`const u16 ${symbol}\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\};`);
  const m = ordersSrc.match(re);
  if (!m) throw new Error(`${symbol} introuvable`);
  const vals = [];
  for (const tok of m[1].split(',')) {
    const name = tok.replace(/\/\/.*$/gm, '').trim();
    if (!name) continue;
    if (!dexMap.has(name)) throw new Error(`${symbol}: constante inconnue ${name}`);
    vals.push(dexMap.get(name));
  }
  return vals;
}

const alpha = extractTable('gPokedexOrder_Alphabetical');
const weight = extractTable('gPokedexOrder_Weight');
const height = extractTable('gPokedexOrder_Height');
console.log(`Alphabetical=${alpha.length} Weight=${weight.length} Height=${height.length}`);

// ── 3. Émission TS ────────────────────────────────────────────────────────────
const fmt = (a) => {
  const lines = [];
  for (let i = 0; i < a.length; i += 20) lines.push('  ' + a.slice(i, i + 20).join(', ') + ',');
  return lines.join('\n');
};
const out = `// GÉNÉRÉ par scripts/extract-pokedex-orders.cjs — NE PAS ÉDITER À LA MAIN.
// Miroir 1:1 de src/data/pokemon/pokedex_orders.h (décomp Émeraude FR) :
// numéros de dex NATIONAL triés (alpha = ordre des noms FR de la ROM).

/** 1:1 \`gPokedexOrder_Alphabetical\` (${alpha.length} entrées, NUM_SPECIES-1). */
export const gPokedexOrder_Alphabetical: readonly number[] = [
${fmt(alpha)}
];

/** 1:1 \`gPokedexOrder_Weight\` (${weight.length} entrées, NATIONAL_DEX_COUNT, léger→lourd). */
export const gPokedexOrder_Weight: readonly number[] = [
${fmt(weight)}
];

/** 1:1 \`gPokedexOrder_Height\` (${height.length} entrées, NATIONAL_DEX_COUNT, petit→grand). */
export const gPokedexOrder_Height: readonly number[] = [
${fmt(height)}
];
`;
fs.writeFileSync(OUT, out);
console.log(`écrit ${OUT}`);
