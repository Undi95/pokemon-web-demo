#!/usr/bin/env node
/**
 * Parse include/constants/flags.h + vars.h pour extraire tous les noms et
 * valeurs de flags/vars du jeu. Utilisé au runtime pour initialiser le save
 * state avec les valeurs par défaut (tout à 0).
 *
 * Sortie : public/decomp/em/flags-vars.json
 *   {
 *     flags: { FLAG_XXX: hexValue },
 *     vars:  { VAR_XXX: hexValue }
 *   }
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'flags-vars.json');
mkdirSync(dirname(outPath), { recursive: true });

function parseDefines(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  const re = /^\s*#define\s+(\w+)\s+((?:0x)?[0-9A-Fa-f]+)\s*$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const value = m[2].startsWith('0x') ? parseInt(m[2], 16) : Number(m[2]);
    if (!Number.isNaN(value)) out[name] = value;
  }
  return out;
}

const flagsPath = join(decompPath, 'include', 'constants', 'flags.h');
const varsPath = join(decompPath, 'include', 'constants', 'vars.h');

const flags = parseDefines(flagsPath);
const vars = parseDefines(varsPath);

const out = {
  flags: Object.fromEntries(Object.entries(flags).filter(([k]) => k.startsWith('FLAG_'))),
  vars: Object.fromEntries(Object.entries(vars).filter(([k]) => k.startsWith('VAR_')))
};
writeFileSync(outPath, JSON.stringify(out));
console.log('[flags-vars]', {
  flags: Object.keys(out.flags).length,
  vars: Object.keys(out.vars).length,
  output: outPath
});
