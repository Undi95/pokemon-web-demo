#!/usr/bin/env node
/**
 * Parse `include/constants/metatile_labels.h` (global) + `data/maps/<Map>/metatile_labels.h`
 * (per-map) pour produire public/decomp/em/metatile-labels.json.
 *
 * Permet à l'opcode `setmetatile X, Y, METATILE_X, IMPASSABLE` du script-runner
 * de résoudre le label en numérique (avant : no-op, juste flag impassable).
 *
 * Format de sortie :
 *   { "METATILE_BattleArena_Door": 0x21B, ... }
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'metatile-labels.json');
mkdirSync(dirname(outPath), { recursive: true });

function parseDefines(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  const re = /^\s*#define\s+(METATILE_\w+)\s+((?:0x)?[0-9A-Fa-f]+)\s*$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const value = m[2].startsWith('0x') ? parseInt(m[2], 16) : Number(m[2]);
    if (!Number.isNaN(value)) out[m[1]] = value;
  }
  return out;
}

const out = {};
// Global
Object.assign(out, parseDefines(join(decompPath, 'include', 'constants', 'metatile_labels.h')));

// Per-map (parcours data/maps/*/metatile_labels.h)
const mapsDir = join(decompPath, 'data', 'maps');
if (existsSync(mapsDir)) {
  for (const mapName of readdirSync(mapsDir)) {
    const f = join(mapsDir, mapName, 'metatile_labels.h');
    if (existsSync(f)) Object.assign(out, parseDefines(f));
  }
}

writeFileSync(outPath, JSON.stringify(out));
console.log('[metatile-labels]', { count: Object.keys(out).length, output: outPath });
