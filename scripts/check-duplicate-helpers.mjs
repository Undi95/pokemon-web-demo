#!/usr/bin/env node
/**
 * check-duplicate-helpers.mjs
 * ----------------------------
 * Détecte les helpers / constants / functions dupliqués entre modules
 * `src/engine/` ET la racine miroir `src/game/`. Une duplication = candidat
 * à move vers `decomp-globals.ts`, un module shared, ou (depuis la vague
 * miroir 2026-06-05) à consolider sur le miroir `src/game/X.ts` source-unique.
 * Inclure `src/game/` ici fait que le tool surface les doublons engine↔miroir
 * (= ce que la migration miroir doit résoudre) et garde-fou anti-re-duplication.
 *
 * Heuristiques :
 *   1. Helpers nommés identiques définis dans 2+ fichiers (= same name)
 *   2. Constants identiques avec même name et même value
 *   3. Patterns de code répétitifs (= e.g. _isOpen / _onClose / Open/Close/Tick
 *      pattern dans bag/party/pokedex/trainer-card screens)
 *
 * Usage :
 *   node scripts/check-duplicate-helpers.mjs                # rapport stdout
 *   node scripts/check-duplicate-helpers.mjs --output=x.md  # markdown
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const srcEngine = join(projectRoot, 'src', 'engine');
const srcGame = join(projectRoot, 'src', 'game');   // racine miroir 1:1 (vague 2026-06-05)

function walk(dir, results = []) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (f === 'auto' || f === 'auto-asm' || f === 'auto-asm-bytecode' || f === 'auto-engine' || f === 'auto-tasks' || f === 'auto-test') continue;
      walk(full, results);
    } else if (f.endsWith('.ts') && !f.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

// Scanne engine + miroir game (= surface aussi les doublons engine↔miroir).
const tsFiles = [srcEngine, srcGame].flatMap((root) => walk(root));

// ─── Extract definitions ─────────────────────────────────────────────────────

const FN_RE = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm;
const CONST_RE = /^(?:export\s+)?const\s+(\w+)\s*[:=]/gm;
const LET_RE = /^(?:export\s+)?let\s+(\w+)\s*[:=]/gm;
const ENUM_RE = /^(?:export\s+)?(?:const\s+)?enum\s+(\w+)/gm;

const fnLocations = new Map();   // name → [{file, line}]
const constLocations = new Map();
const letLocations = new Map();

for (const tsFile of tsFiles) {
  const content = readFileSync(tsFile, 'utf8');
  const rel = tsFile.replace(projectRoot, '').replace(/\\/g, '/');

  for (const m of content.matchAll(FN_RE)) {
    const line = content.slice(0, m.index).split('\n').length;
    if (!fnLocations.has(m[1])) fnLocations.set(m[1], []);
    fnLocations.get(m[1]).push({ file: rel, line });
  }
  for (const m of content.matchAll(CONST_RE)) {
    const line = content.slice(0, m.index).split('\n').length;
    if (!constLocations.has(m[1])) constLocations.set(m[1], []);
    constLocations.get(m[1]).push({ file: rel, line });
  }
  for (const m of content.matchAll(LET_RE)) {
    const line = content.slice(0, m.index).split('\n').length;
    if (!letLocations.has(m[1])) letLocations.set(m[1], []);
    letLocations.get(m[1]).push({ file: rel, line });
  }
}

// ─── Find duplicates ─────────────────────────────────────────────────────────

function findDupes(map) {
  const dupes = [];
  for (const [name, locs] of map) {
    if (locs.length >= 2) dupes.push({ name, locations: locs });
  }
  return dupes.sort((a, b) => b.locations.length - a.locations.length);
}

const dupFns = findDupes(fnLocations);
const dupConsts = findDupes(constLocations);
const dupLets = findDupes(letLocations);

// ─── Pattern detection : _isOpen / _onClose / Open/Close screen patterns ────

const PATTERN_FILES = new Map();
for (const tsFile of tsFiles) {
  const content = readFileSync(tsFile, 'utf8');
  const rel = tsFile.replace(projectRoot, '').replace(/\\/g, '/');
  const hasIsOpen = /^let _isOpen\b/m.test(content);
  const hasOnClose = /^let _onClose\b/m.test(content);
  const hasOpenScreen = /^export function Open\w+Screen/m.test(content);
  const hasCloseScreen = /^export function Close\w+Screen/m.test(content);
  const hasTickScreen = /^export function Tick\w+Screen/m.test(content);
  if (hasIsOpen && hasOnClose && hasOpenScreen) {
    PATTERN_FILES.set(rel, { hasIsOpen, hasOnClose, hasOpenScreen, hasCloseScreen, hasTickScreen });
  }
}

// ─── Constants worth deduplicating (e.g. FONT_NORMAL, STD_FRAME_TILE) ───────

const REUSABLE_CONSTANTS = new Set([
  'FONT_NORMAL', 'FONT_NARROW', 'FONT_SHORT', 'FONT_SMALL', 'FONT_SMALL_NARROW', 'FONT_BOLD',
  'TEXT_SKIP_DRAW', 'TEXT_COLOR_TRANSPARENT', 'TEXT_COLOR_WHITE', 'TEXT_COLOR_DARK_GRAY',
  'TEXT_COLOR_LIGHT_GRAY', 'TEXT_COLOR_RED', 'TEXT_COLOR_LIGHT_RED', 'TEXT_COLOR_GREEN',
  'TEXT_COLOR_LIGHT_GREEN', 'TEXT_COLOR_BLUE', 'TEXT_COLOR_LIGHT_BLUE',
  'STD_FRAME_TILE', 'STD_FRAME_PAL',
  'STD_WINDOW_BASE_TILE_NUM', 'STD_WINDOW_PALETTE_NUM',
  'DLG_WINDOW_BASE_TILE_NUM', 'DLG_WINDOW_PALETTE_NUM',
  'COLOR_MAIN', 'COLOR_MAIN_3', 'COLOR_RED', 'COLOR_YELLOW',
  'PIXEL_FILL_TRANSPARENT', 'PIXEL_FILL_WHITE',
  'A_BUTTON', 'B_BUTTON', 'START_BUTTON', 'SELECT_BUTTON',
  'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT',
  'L_BUTTON', 'R_BUTTON',
]);

const reusableDuped = dupConsts.filter(d => REUSABLE_CONSTANTS.has(d.name));

// ─── Output ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const outputArg = args.find(a => a.startsWith('--output='));
const outputFile = outputArg?.split('=')[1];

function fmtMd() {
  let out = '# Duplicate helpers audit\n\n';
  out += `Generated : ${new Date().toISOString()}\n\n`;
  out += `Files scanned : ${tsFiles.length}\n\n`;

  out += '## Reusable constants duplicated (= prime candidates for `decomp-constants.ts`)\n\n';
  out += `Total: ${reusableDuped.length}\n\n`;
  for (const d of reusableDuped) {
    out += `### \`${d.name}\` — defined ${d.locations.length}× :\n`;
    for (const loc of d.locations) out += `  - ${loc.file}:${loc.line}\n`;
    out += '\n';
  }

  out += '## Open/Close/Tick screen pattern (= prime candidates for CB2 swap)\n\n';
  out += `Files using this pattern : ${PATTERN_FILES.size}\n\n`;
  for (const [file, p] of PATTERN_FILES) {
    out += `- \`${file}\` : Open=${p.hasOpenScreen} Close=${p.hasCloseScreen} Tick=${p.hasTickScreen}\n`;
  }
  out += '\n';

  out += '## All duplicated function names (top 30)\n\n';
  out += `Total : ${dupFns.length}\n\n`;
  for (const d of dupFns.slice(0, 30)) {
    out += `### \`${d.name}\` — defined ${d.locations.length}× :\n`;
    for (const loc of d.locations.slice(0, 5)) out += `  - ${loc.file}:${loc.line}\n`;
    if (d.locations.length > 5) out += `  - ... +${d.locations.length - 5} more\n`;
    out += '\n';
  }

  out += '## All duplicated const names (top 30)\n\n';
  out += `Total : ${dupConsts.length}\n\n`;
  for (const d of dupConsts.slice(0, 30)) {
    out += `### \`${d.name}\` — defined ${d.locations.length}× :\n`;
    for (const loc of d.locations.slice(0, 5)) out += `  - ${loc.file}:${loc.line}\n`;
    if (d.locations.length > 5) out += `  - ... +${d.locations.length - 5} more\n`;
    out += '\n';
  }

  return out;
}

if (outputFile?.endsWith('.md')) {
  writeFileSync(outputFile, fmtMd());
  console.error(`Markdown report written to ${outputFile}`);
} else if (outputFile?.endsWith('.json')) {
  writeFileSync(outputFile, JSON.stringify({
    reusableConstants: reusableDuped,
    patternFiles: [...PATTERN_FILES.entries()],
    dupFns, dupConsts, dupLets,
  }, null, 2));
  console.error(`JSON report written to ${outputFile}`);
} else {
  // Default : print to stdout
  console.log('=== Reusable constants duplicated ===');
  for (const d of reusableDuped) {
    console.log(`${d.name} (${d.locations.length}×): ${d.locations.map(l => `${l.file}:${l.line}`).join(', ')}`);
  }
  console.log('');
  console.log('=== Open/Close screen pattern files (CB2 swap candidates) ===');
  for (const [file] of PATTERN_FILES) console.log(`  - ${file}`);
  console.log('');
  console.log('=== Top duplicated function names ===');
  for (const d of dupFns.slice(0, 20)) {
    console.log(`${d.name} (${d.locations.length}×): ${d.locations.slice(0, 3).map(l => l.file).join(', ')}${d.locations.length > 3 ? '...' : ''}`);
  }
  console.log('');
  console.log('=== Top duplicated const names ===');
  for (const d of dupConsts.slice(0, 20)) {
    console.log(`${d.name} (${d.locations.length}×): ${d.locations.slice(0, 3).map(l => l.file).join(', ')}${d.locations.length > 3 ? '...' : ''}`);
  }
}
