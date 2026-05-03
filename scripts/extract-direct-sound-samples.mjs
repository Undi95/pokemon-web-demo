#!/usr/bin/env node
/**
 * extract-direct-sound-samples.mjs
 * --------------------------------
 * Copy les WAV samples du décomp pokeemeraude → public/decomp/em/sound/.
 * Génère aussi un manifest JSON listant tous les samples + leurs URLs.
 *
 * Source : decomps/pokeemeraude/sound/direct_sound_samples/ (105 WAV top-level
 *          + cries/ + phonemes/ subdirs)
 * Output : public/decomp/em/sound/direct_sound_samples/<name>.wav
 *          public/decomp/em/sound/direct_sound_samples/_manifest.json
 *          public/decomp/em/sound/programmable_wave_samples/<name>.bin
 *
 * Le manifest mappe le symbole asm (DirectSoundWaveData_X) → URL WAV.
 * Le M4A engine côté browser fait : voicegroup.voice.sampleSymbol → manifest →
 * fetch WAV → AudioBuffer.
 *
 * Usage : node scripts/extract-direct-sound-samples.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcDsDir = resolve(decompRoot, 'sound', 'direct_sound_samples');
const srcPwDir = resolve(decompRoot, 'sound', 'programmable_wave_samples');
const outDsDir = resolve(projectRoot, 'public', 'decomp', 'em', 'sound', 'direct_sound_samples');
const outPwDir = resolve(projectRoot, 'public', 'decomp', 'em', 'sound', 'programmable_wave_samples');

const NOW = new Date().toISOString().slice(0, 10);

mkdirSync(outDsDir, { recursive: true });
mkdirSync(outPwDir, { recursive: true });

/** Walk recursive : retourne tous les fichiers d'un certain extension. */
function walkFiles(dir, ext, baseDir = dir, results = []) {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      walkFiles(abs, ext, baseDir, results);
    } else if (entry.toLowerCase().endsWith(ext)) {
      results.push({ abs, relFromBase: relative(baseDir, abs).replace(/\\/g, '/') });
    }
  }
  return results;
}

/** Convertit un nom de fichier WAV en symbole asm DirectSoundWaveData_X.
 *  Fallback heuristic seulement : si direct_sound_data.inc parsing échoue ou
 *  manque un sample, on génère plusieurs candidats préfixés. */
function makeSymbolCandidates(stem) {
  const candidates = [
    `DirectSoundWaveData_${stem}`,
    `DirectSoundWaveData_sc88pro_${stem}`,
    `DirectSoundWaveData_drums_${stem}`,
    `DirectSoundWaveData_${stem}_2`,
  ];
  return candidates;
}

/** Parse direct_sound_data.inc → mapping authoritative `symbol → bin path`.
 *  Format :
 *    DirectSoundWaveData_<symbol>::
 *      .incbin "sound/direct_sound_samples/<file>.bin"
 *  Le symbole peut différer du nom de fichier (= e.g. `unknown_8` → `unknown_08.bin`).
 *  Cette mapping est utilisée par le linker GBA, donc c'est la source de vérité. */
function parseDirectSoundDataInc(incPath) {
  if (!existsSync(incPath)) {
    console.warn(`  [warning] ${incPath} not found, skip authoritative mapping`);
    return new Map();
  }
  const txt = readFileSync(incPath, 'utf-8');
  const map = new Map();  // symbol → bin file basename (no extension)
  const lines = txt.split('\n');
  let pendingSymbol = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // Symbol declaration : `DirectSoundWaveData_X::` or `DirectSoundWaveData_X:`
    const symMatch = line.match(/^([A-Za-z0-9_]+)::?$/);
    if (symMatch && symMatch[1].startsWith('DirectSoundWaveData_')) {
      pendingSymbol = symMatch[1];
      continue;
    }
    // .incbin "path" — bind to the most recent symbol
    const incMatch = line.match(/^\.incbin\s+"([^"]+)"/);
    if (incMatch && pendingSymbol) {
      const path = incMatch[1];
      // Extract basename without extension (.bin or .wav)
      const stem = basename(path).replace(/\.(bin|wav)$/i, '');
      map.set(pendingSymbol, stem);
      pendingSymbol = null;
    }
  }
  return map;
}

// ─── Direct Sound Samples ────────────────────────────────────────────────────

console.log('[direct-sound] Scanning samples...');
const wavFiles = walkFiles(srcDsDir, '.wav');
console.log(`  Found ${wavFiles.length} WAV samples`);

// Parse authoritative symbol → file mapping from direct_sound_data.inc
const incMap = parseDirectSoundDataInc(resolve(decompRoot, 'sound', 'direct_sound_data.inc'));
console.log(`  Parsed ${incMap.size} authoritative symbol bindings from direct_sound_data.inc`);

const dsManifest = {};
let copied = 0;
// Index WAV stems for lookup
const wavByStem = new Map();
for (const { abs, relFromBase } of wavFiles) {
  const out = join(outDsDir, relFromBase);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(abs, out);
  copied++;
  const stem = basename(relFromBase, '.wav');
  wavByStem.set(stem, relFromBase);
  // Heuristic candidates (= fallback for symbols not in direct_sound_data.inc)
  const url = `/decomp/em/sound/direct_sound_samples/${relFromBase}`;
  for (const sym of makeSymbolCandidates(stem)) {
    if (!dsManifest[sym]) dsManifest[sym] = url;  // don't override authoritative
  }
}

// Apply authoritative mappings (= overrides heuristic). Symbol → file as
// declared in direct_sound_data.inc, even if names diverge (`unknown_8` →
// `unknown_08.wav`).
let authoritativeApplied = 0;
let authoritativeMissing = 0;
for (const [symbol, stem] of incMap) {
  const relPath = wavByStem.get(stem);
  if (!relPath) {
    authoritativeMissing++;
    if (authoritativeMissing <= 3) {
      console.warn(`  [missing] ${symbol} → ${stem}.wav not on disk`);
    }
    continue;
  }
  dsManifest[symbol] = `/decomp/em/sound/direct_sound_samples/${relPath}`;
  authoritativeApplied++;
}
console.log(`  Authoritative bindings applied: ${authoritativeApplied} (missing wav: ${authoritativeMissing})`);

writeFileSync(
  join(outDsDir, '_manifest.json'),
  JSON.stringify({ generatedAt: NOW, sampleCount: copied, samples: dsManifest }, null, 2),
);
console.log(`[direct-sound] Copied ${copied} WAVs, ${Object.keys(dsManifest).length} symbol candidates`);

// ─── Programmable Wave Samples ───────────────────────────────────────────────

console.log('[programmable-wave] Scanning samples...');
const pwFiles = walkFiles(srcPwDir, '.bin');
console.log(`  Found ${pwFiles.length} programmable wave .bin files`);

const pwManifest = {};
copied = 0;
for (const { abs, relFromBase } of pwFiles) {
  const out = join(outPwDir, relFromBase);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(abs, out);
  copied++;

  const stem = basename(relFromBase, '.bin');
  const url = `/decomp/em/sound/programmable_wave_samples/${relFromBase}`;
  pwManifest[`ProgrammableWaveData_${stem}`] = url;
  pwManifest[stem] = url;
}

writeFileSync(
  join(outPwDir, '_manifest.json'),
  JSON.stringify({ generatedAt: NOW, sampleCount: copied, samples: pwManifest }, null, 2),
);
console.log(`[programmable-wave] Copied ${copied} BINs`);

console.log('\n[done] Samples copied to public/decomp/em/sound/');
console.log('  Direct sound : ' + outDsDir.replace(/\\/g, '/'));
console.log('  Programmable : ' + outPwDir.replace(/\\/g, '/'));
