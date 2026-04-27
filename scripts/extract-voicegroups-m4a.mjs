#!/usr/bin/env node
/**
 * extract-voicegroups-m4a.mjs
 * ---------------------------
 * Parse les fichiers `sound/voicegroups/*.inc` du décomp pokeemeraude et
 * génère des `.ts` consommables côté browser pour le M4A audio engine.
 *
 * Format source 1:1 décomp :
 *   voice_group abandoned_ship
 *       voice_keysplit_all voicegroup_route110_drumset
 *       voice_keysplit voicegroup_piano_keysplit, keysplit_piano
 *       voice_square_1 60, 0, 0, 2, 0, 0, 15, 0
 *       voice_directsound 60, 0, DirectSoundWaveData_sc88pro_tubular_bell, 255, 216, 90, 242
 *       ...
 *
 * Format output : src/engine/m4a/voicegroups-data/<name>.ts avec
 *   export const VOICEGROUP: VoiceGroup = { name: '...', voices: [...] };
 *
 * Plus un index `_all-voicegroups-index.ts` pour discover.
 *
 * Usage : node scripts/extract-voicegroups-m4a.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDir = resolve(projectRoot, 'src', 'engine', 'm4a', 'voicegroups-data');

const NOW = new Date().toISOString().slice(0, 10);

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

/** Strip @ comments from a line. */
function stripComment(line) {
  const idx = line.indexOf('@');
  return (idx >= 0 ? line.slice(0, idx) : line).trim();
}

/** Parse une voice depuis ses tokens (après le voice_X). */
function parseVoiceArgs(type, args) {
  const a = args.map(s => s.trim());
  switch (type) {
    case 'directsound':
    case 'directsound_no_resample': {
      // baseKey, pan, sampleSymbol, attack, decay, sustain, release
      return {
        type, baseKey: parseInt(a[0]), pan: parseInt(a[1]),
        sampleSymbol: a[2],
        envelope: { attack: parseInt(a[3]), decay: parseInt(a[4]), sustain: parseInt(a[5]), release: parseInt(a[6]) },
      };
    }
    case 'square_1':
    case 'square_1_alt': {
      // baseKey, panSweep, sweep, squarePattern, length, attack, decay, sustain
      // (square_1_alt sans sweep)
      const offset = type === 'square_1_alt' ? 0 : 0;
      void offset;
      return {
        type, baseKey: parseInt(a[0]), panSweep: parseInt(a[1]),
        sweep: type === 'square_1' ? parseInt(a[2]) : 0,
        squarePattern: parseInt(type === 'square_1' ? a[3] : a[2]),
        length: parseInt(type === 'square_1' ? a[4] : a[3]),
        envelope: type === 'square_1'
          ? { attack: parseInt(a[5]), decay: parseInt(a[6]), sustain: parseInt(a[7]), release: parseInt(a[8] ?? '0') }
          : { attack: parseInt(a[4]), decay: parseInt(a[5]), sustain: parseInt(a[6]), release: parseInt(a[7] ?? '0') },
      };
    }
    case 'square_2':
    case 'square_2_alt': {
      // baseKey, panSweep, squarePattern, length, attack, decay, sustain
      return {
        type, baseKey: parseInt(a[0]), panSweep: parseInt(a[1]),
        sweep: 0,
        squarePattern: parseInt(a[2]),
        length: parseInt(a[3]),
        envelope: { attack: parseInt(a[4]), decay: parseInt(a[5]), sustain: parseInt(a[6]), release: parseInt(a[7] ?? '0') },
      };
    }
    case 'noise':
    case 'noise_alt': {
      // baseKey, panSweep, period, length, attack, decay, sustain
      return {
        type, baseKey: parseInt(a[0]), panSweep: parseInt(a[1]),
        period: parseInt(a[2]), length: parseInt(a[3]),
        envelope: { attack: parseInt(a[4]), decay: parseInt(a[5]), sustain: parseInt(a[6]), release: parseInt(a[7] ?? '0') },
      };
    }
    case 'programmable_wave': {
      // baseKey, panSweep, waveSymbol, length, attack, decay, sustain
      return {
        type, baseKey: parseInt(a[0]), panSweep: parseInt(a[1]),
        waveSymbol: a[2], length: parseInt(a[3]),
        envelope: { attack: parseInt(a[4]), decay: parseInt(a[5]), sustain: parseInt(a[6]), release: parseInt(a[7] ?? '0') },
      };
    }
    case 'keysplit': {
      // subVoicegroupName, splitTableSymbol
      return { type, subVoicegroupName: a[0], splitTableSymbol: a[1] };
    }
    case 'keysplit_all': {
      // subVoicegroupName
      return { type, subVoicegroupName: a[0] };
    }
    default:
      return { type: 'unknown', raw: args.join(', ') };
  }
}

/** Parse un fichier .inc voicegroup → VoiceGroup object. */
function parseVoicegroupFile(path) {
  const src = readFileSync(path, 'utf8');
  const lines = src.split('\n');
  let name = null;
  let currentOffset = 0;  // tracked dans la closure pour le voice_group X, offset
  const voices = [];

  for (const rawLine of lines) {
    const line = stripComment(rawLine);
    if (!line) continue;

    if (line.startsWith('voice_group ')) {
      // Format : `voice_group X` ou `voice_group X, offset` (drumsets)
      // L'offset (si présent) est l'index MIDI de la première voice (= note où
      // commence le drumkit). Les voices suivantes correspondent à offset+1, +2...
      let raw = line.slice('voice_group '.length).trim();
      const commaIdx = raw.indexOf(',');
      if (commaIdx >= 0) {
        name = raw.slice(0, commaIdx).trim();
        const offsetStr = raw.slice(commaIdx + 1).trim();
        const offsetVal = parseInt(offsetStr, 10);
        if (!isNaN(offsetVal)) currentOffset = offsetVal;
      } else {
        name = raw;
      }
      continue;
    }

    if (line.startsWith('voice_')) {
      // Extract voice type (between voice_ and first whitespace)
      const m = line.match(/^voice_(\w+)\s*(.*)$/);
      if (!m) continue;
      const type = m[1];
      const argsStr = m[2].trim();
      const args = argsStr ? argsStr.split(',').map(s => s.trim()) : [];
      voices.push(parseVoiceArgs(type, args));
    }
  }

  return { name, voices, offset: currentOffset };
}

/** Render VoiceGroup → TS file content. */
function renderVoiceGroupTs(vg, sourceRel) {
  const lines = [
    `// AUTO-GENERATED from ${sourceRel} by extract-voicegroups-m4a.mjs`,
    `// Generated: ${NOW}`,
    `import type { VoiceGroup } from '../voice-types';`,
    '',
    `export const VOICEGROUP: VoiceGroup = {`,
    `  name: ${JSON.stringify(vg.name)},`,
  ];
  if (vg.offset && vg.offset > 0) {
    lines.push(`  offset: ${vg.offset},`);
  }
  lines.push(`  voices: [`);
  for (const v of vg.voices) {
    lines.push(`    ${JSON.stringify(v)},`);
  }
  lines.push(`  ] as VoiceGroup['voices'],`);
  lines.push(`};`);
  lines.push('');
  return lines.join('\n');
}

// ─── Parse keysplit_tables.inc ───────────────────────────────────────────────
//
// Format :
//   keysplit <name>, <offsetBytes>
//       split <subVoiceIdx>, <maxNote>
//       split <subVoiceIdx>, <maxNote>
//       ...
//
// Logique : pour une note N, trouve le 1er split dont `maxNote >= N`. Le
// `subVoiceIdx` est l'index dans le sub-voicegroup à utiliser.

function parseKeysplitTables() {
  const path = join(decompRoot, 'sound', 'keysplit_tables.inc');
  if (!existsSync(path)) {
    console.warn('[keysplit-tables] file not found, skip');
    return [];
  }
  const src = readFileSync(path, 'utf8');
  const tables = [];
  let current = null;
  for (const rawLine of src.split('\n')) {
    const line = stripComment(rawLine);
    if (!line) continue;
    if (line.startsWith('keysplit ')) {
      // keysplit name, offsetBytes
      if (current) tables.push(current);
      const m = line.match(/^keysplit\s+(\w+)\s*,\s*(\d+)$/);
      if (m) current = { name: m[1], offset: parseInt(m[2]), splits: [] };
    } else if (line.startsWith('split ')) {
      // split subVoiceIdx, maxNote
      const m = line.match(/^split\s+(\d+)\s*,\s*(\d+)$/);
      if (m && current) current.splits.push({ idx: parseInt(m[1]), maxNote: parseInt(m[2]) });
    }
  }
  if (current) tables.push(current);
  return tables;
}

const keysplitTables = parseKeysplitTables();
console.log(`[keysplit-tables] Parsed ${keysplitTables.length} key split tables`);

// Render keysplit tables in single TS file
{
  const lines = [
    `// AUTO-GENERATED from sound/keysplit_tables.inc by extract-voicegroups-m4a.mjs`,
    `// Generated: ${NOW}`,
    `// Format : pour une note MIDI N, trouver le 1er split dont \`maxNote >= N\`,`,
    `// puis utiliser \`subVoiceIdx\` comme index dans le sub-voicegroup.`,
    '',
    `export interface KeysplitEntry { idx: number; maxNote: number; }`,
    `export interface KeysplitTable { name: string; offset: number; splits: KeysplitEntry[]; }`,
    '',
    `export const KEYSPLIT_TABLES: Record<string, KeysplitTable> = {`,
  ];
  for (const t of keysplitTables) {
    lines.push(`  ${JSON.stringify('keysplit_' + t.name)}: ${JSON.stringify(t)},`);
  }
  lines.push(`};`);
  lines.push('');

  // Helper résolution
  lines.push(`/** Résout une note MIDI → sub-voice index dans un keysplit table. */`);
  lines.push(`export function resolveKeysplitNote(tableName: string, note: number): number | null {`);
  lines.push(`  const t = KEYSPLIT_TABLES[tableName];`);
  lines.push(`  if (!t) return null;`);
  lines.push(`  for (const s of t.splits) if (note <= s.maxNote) return s.idx;`);
  lines.push(`  return null;`);
  lines.push(`}`);
  lines.push('');

  writeFileSync(join(outDir, '_keysplit-tables.ts'), lines.join('\n'));
}

// ─── Run ─────────────────────────────────────────────────────────────────────

// Glob inclut les sub-dirs keysplits/ et drumsets/ pour avoir TOUS les voicegroups
const sourceFiles = globSync('sound/voicegroups/**/*.inc', { cwd: decompRoot });
console.log(`[m4a-voicegroups] Found ${sourceFiles.length} voicegroup files (incl keysplits + drumsets)`);

let okCount = 0, errCount = 0;
const indexEntries = [];

for (const rel of sourceFiles) {
  try {
    const abs = join(decompRoot, rel);
    const vg = parseVoicegroupFile(abs);
    if (!vg.name) {
      console.warn(`[skip] ${rel}: no voice_group directive`);
      continue;
    }

    const tsContent = renderVoiceGroupTs(vg, rel);
    // Output : flatten les sub-dirs (keysplits/X.inc → ks_X.ts, drumsets/Y.inc → drum_Y.ts).
    // Sur Windows, rel utilise backslash → normalize avant include().
    const stem = basename(rel, '.inc');
    const relPosix = rel.replace(/\\/g, '/');
    let prefixedStem = stem;
    if (relPosix.includes('keysplits/')) prefixedStem = `ks_${stem}`;
    else if (relPosix.includes('drumsets/')) prefixedStem = `drum_${stem}`;
    const outAbs = join(outDir, `${prefixedStem}.ts`);
    writeFileSync(outAbs, tsContent);
    okCount++;
    indexEntries.push({ stem: prefixedStem, name: vg.name, voiceCount: vg.voices.length });
  } catch (e) {
    errCount++;
    console.error(`[err] ${rel}: ${e.message}`);
  }
}

// Build index : 2 export styles
//   - namespace exports (export { VOICEGROUP as bArena } from './b_arena')
//   - lookup map by canonical name (mappe `voicegroup_X` → import resolved)
const idxLines = [
  `// AUTO-GENERATED by extract-voicegroups-m4a.mjs — Generated: ${NOW}`,
  `// Re-export tous les voicegroups parsés depuis sound/voicegroups/ (incl. keysplits/ + drumsets/)`,
  `import type { VoiceGroup } from '../voice-types';`,
  '',
];
const allImports = [];
indexEntries.sort((a, b) => a.stem.localeCompare(b.stem));
for (const e of indexEntries) {
  const ns = e.stem.replace(/[\-_]+(.)/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, '');
  idxLines.push(`export { VOICEGROUP as ${ns} } from './${e.stem}';`);
  allImports.push({ ns, name: e.name });
}

// Lookup map by canonical name (voicegroup_X → imported VOICEGROUP)
idxLines.push('');
idxLines.push(`// ─── Imports for lookup map (raw imports) ──────────────────────────────────`);
for (const imp of allImports) {
  idxLines.push(`import { VOICEGROUP as _${imp.ns} } from './${indexEntries.find(e => e.stem.replace(/[\-_]+(.)/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, '') === imp.ns)?.stem}';`);
}
idxLines.push('');
idxLines.push(`/** Lookup map : voicegroup canonical name → VoiceGroup. */`);
idxLines.push(`export const VOICEGROUPS_BY_NAME: Record<string, VoiceGroup> = {`);
for (const imp of allImports) {
  // Normaliser le nom : enlever préfixe `voicegroup_` si présent
  idxLines.push(`  ${JSON.stringify(imp.name)}: _${imp.ns},`);
  idxLines.push(`  ${JSON.stringify('voicegroup_' + imp.name)}: _${imp.ns},`);
}
idxLines.push(`};`);
idxLines.push('');
idxLines.push(`/** Helper : résout un voicegroup par nom (avec ou sans préfixe \`voicegroup_\`). */`);
idxLines.push(`export function lookupVoicegroup(name: string): VoiceGroup | null {`);
idxLines.push(`  return VOICEGROUPS_BY_NAME[name] ?? VOICEGROUPS_BY_NAME[name.replace(/^voicegroup_/, '')] ?? null;`);
idxLines.push(`}`);
idxLines.push('');
writeFileSync(join(outDir, '_all-voicegroups-index.ts'), idxLines.join('\n'));

console.log(`[m4a-voicegroups] Done: ${okCount}/${sourceFiles.length} parsed (${errCount} err)`);
console.log(`  Total voices : ${indexEntries.reduce((s, e) => s + e.voiceCount, 0)}`);
console.log(`  Output: ${outDir.replace(/\\/g, '/')}`);
