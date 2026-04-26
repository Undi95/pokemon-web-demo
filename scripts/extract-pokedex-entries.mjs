#!/usr/bin/env node
/**
 * Extrait Pokédex entries (catégorie, hauteur, poids, description FR).
 *
 * Sources :
 *   - `src/data/pokemon/pokedex_entries.h` : struct PokedexEntry
 *   - `src/data/pokemon/pokedex_text.h` : descriptions FR `gXXXPokedexText`
 *
 * Sortie : `pokedex-entries.json` :
 *   { "SPECIES_BULBASAUR": {
 *       "category": "GRAINE", "height": 7, "weight": 69,
 *       "descriptionKey": "gBulbasaurPokedexText",
 *       "description": "BULBIZARRE peut..." } }
 *
 * Note : height en décimètres, weight en hectogrammes (conversion runtime).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const outDirPub = join(projectRoot, 'public', 'decomp', 'em');
mkdirSync(outDirSrc, { recursive: true });
mkdirSync(outDirPub, { recursive: true });

function findFile(candidates) {
  for (const c of candidates) if (existsSync(join(decompPath, c))) return c;
  return null;
}

function parseDescriptions() {
  const file = findFile([
    'src/data/pokemon/pokedex_text.h',
    'src/data/pokedex_text.h',
  ]);
  if (!file) { console.warn('pokedex_text.h not found'); return {}; }
  const text = readFileSync(join(decompPath, file), 'utf8');
  // Format flexible : const u8 gXxxPokedexText[] = _("...");
  // Le texte peut faire plusieurs lignes (concaténation _("a")+_("b") ou \n).
  const reText = /const\s+u8\s+(g\w+PokedexText)\[\]\s*=\s*([\s\S]*?);/g;
  const descs = {};
  let m;
  while ((m = reText.exec(text)) !== null) {
    const varName = m[1];
    const block = m[2];
    // Format décomp : `_(\n "ligne1"\n "ligne2"\n ...)`. On extrait TOUTES
    // les strings "..." du block (concaténation C automatique).
    const reStr = /"((?:\\.|[^"\\])*)"/g;
    let s, parts = [];
    while ((s = reStr.exec(block)) !== null) parts.push(s[1]);
    descs[varName] = parts.join(' ').replace(/\\n|\\p|\\l/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return descs;
}

function parseEntries(descriptions) {
  const file = findFile([
    'src/data/pokemon/pokedex_entries.h',
    'src/data/pokedex_entries.h',
  ]);
  if (!file) { console.error('pokedex_entries.h not found'); return {}; }
  const text = readFileSync(join(decompPath, file), 'utf8');
  const reEntry = /\[(NATIONAL_DEX_\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\}/g;
  const out = {};
  let m;
  while ((m = reEntry.exec(text)) !== null) {
    const dexKey = m[1];
    const body = m[2];
    const cat = body.match(/\.categoryName\s*=\s*_\("(.*?)"\)/);
    const height = body.match(/\.height\s*=\s*(\d+)/);
    const weight = body.match(/\.weight\s*=\s*(\d+)/);
    const descKey = body.match(/\.description\s*=\s*(g\w+PokedexText)/);
    const species = dexKey.replace('NATIONAL_DEX_', 'SPECIES_');
    out[species] = {
      category: cat?.[1] ?? null,
      height: height ? Number(height[1]) : null,
      weight: weight ? Number(weight[1]) : null,
      descriptionKey: descKey?.[1] ?? null,
      description: descKey ? (descriptions[descKey[1]] ?? null) : null,
    };
  }
  return out;
}

const descriptions = parseDescriptions();
const entries = parseEntries(descriptions);

const json = JSON.stringify(entries);
writeFileSync(join(outDirSrc, 'pokedex-entries.json'), json);
writeFileSync(join(outDirPub, 'pokedex-entries.json'), json);

console.log(`[extract-pokedex-entries] ${Object.keys(entries).length} species, ${Object.keys(descriptions).length} descriptions`);
console.log(`  spot BULBASAUR:`, JSON.stringify(entries.SPECIES_BULBASAUR)?.slice(0, 200));
console.log(`  spot TREECKO:`, JSON.stringify(entries.SPECIES_TREECKO)?.slice(0, 200));
