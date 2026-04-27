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
  const voices = [];

  for (const rawLine of lines) {
    const line = stripComment(rawLine);
    if (!line) continue;

    if (line.startsWith('voice_group ')) {
      name = line.slice('voice_group '.length).trim();
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

  return { name, voices };
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
    `  voices: [`,
  ];
  for (const v of vg.voices) {
    lines.push(`    ${JSON.stringify(v)},`);
  }
  lines.push(`  ] as VoiceGroup['voices'],`);
  lines.push(`};`);
  lines.push('');
  return lines.join('\n');
}

// ─── Run ─────────────────────────────────────────────────────────────────────

const sourceFiles = globSync('sound/voicegroups/*.inc', { cwd: decompRoot });
console.log(`[m4a-voicegroups] Found ${sourceFiles.length} voicegroup files`);

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
    // Output filename : nom du voicegroup (slug-safe)
    const stem = basename(rel, '.inc');
    const outAbs = join(outDir, `${stem}.ts`);
    writeFileSync(outAbs, tsContent);
    okCount++;
    indexEntries.push({ stem, name: vg.name, voiceCount: vg.voices.length });
  } catch (e) {
    errCount++;
    console.error(`[err] ${rel}: ${e.message}`);
  }
}

// Build index
const idxLines = [
  `// AUTO-GENERATED by extract-voicegroups-m4a.mjs — Generated: ${NOW}`,
  `// Re-export tous les voicegroups parsés depuis sound/voicegroups/`,
  '',
];
indexEntries.sort((a, b) => a.stem.localeCompare(b.stem));
for (const e of indexEntries) {
  // Camel-case namespace
  const ns = e.stem.replace(/[\-_]+(.)/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, '');
  idxLines.push(`export { VOICEGROUP as ${ns} } from './${e.stem}';`);
}
idxLines.push('');
writeFileSync(join(outDir, '_all-voicegroups-index.ts'), idxLines.join('\n'));

console.log(`[m4a-voicegroups] Done: ${okCount}/${sourceFiles.length} parsed (${errCount} err)`);
console.log(`  Total voices : ${indexEntries.reduce((s, e) => s + e.voiceCount, 0)}`);
console.log(`  Output: ${outDir.replace(/\\/g, '/')}`);
