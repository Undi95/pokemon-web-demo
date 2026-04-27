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
 *  Convention décomp : `tubular_bell.wav` → `DirectSoundWaveData_sc88pro_tubular_bell`
 *  ou similar. La règle exacte dépend du voicegroup (préfixe variable selon set).
 *  Pour simplifier : on génère plusieurs symboles candidats. Le M4A engine
 *  essaie chacun jusqu'à trouver un match. */
function makeSymbolCandidates(stem) {
  const candidates = [
    `DirectSoundWaveData_${stem}`,
    `DirectSoundWaveData_sc88pro_${stem}`,
    `DirectSoundWaveData_drums_${stem}`,
    `DirectSoundWaveData_${stem}_2`,
  ];
  return candidates;
}

// ─── Direct Sound Samples ────────────────────────────────────────────────────

console.log('[direct-sound] Scanning samples...');
const wavFiles = walkFiles(srcDsDir, '.wav');
console.log(`  Found ${wavFiles.length} WAV samples`);

const dsManifest = {};
let copied = 0;
for (const { abs, relFromBase } of wavFiles) {
  const out = join(outDsDir, relFromBase);
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(abs, out);
  copied++;

  const stem = basename(relFromBase, '.wav');
  const url = `/decomp/em/sound/direct_sound_samples/${relFromBase}`;
  // Map TOUS les candidats vers la même URL (le M4A engine résoudra)
  for (const sym of makeSymbolCandidates(stem)) {
    dsManifest[sym] = url;
  }
}

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
