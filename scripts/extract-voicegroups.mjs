#!/usr/bin/env node
/**
 * Parse les voicegroups du décomp pour la lecture MIDI authentique.
 *
 * Sorties dans public/decomp/em/music/ :
 *   - samples.json       : DirectSoundWaveData_X → "sfx/foo.wav"
 *   - keysplits.json     : keysplit_X → [byte, byte, ...] (mapping note → slot)
 *   - voicegroups.json   : voicegroup_X → { start, voices: Voice[] }
 *   - song-voicegroups.json : mus_X → "voicegroup_Y"
 *
 * Voice format :
 *   { type: 'square', rootKey, pan, duty, a, d, s, r }
 *   { type: 'directsound', rootKey, pan, sample, a, d, s, r, resample: bool }
 *   { type: 'noise', rootKey, pan, period, timbre, a, d, s, r }
 *   { type: 'pwave', rootKey, pan, a, d, s, r }
 *   { type: 'keysplit_all', target: 'voicegroup_X' }
 *   { type: 'keysplit', target: 'voicegroup_X', split: 'keysplit_Y' }
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDir = join(projectRoot, 'public', 'decomp', 'em', 'music');

mkdirSync(outDir, { recursive: true });

// --- 1. direct_sound_data.inc → Map<symbol, wav path> ---
const samples = {};
{
  const text = readFileSync(join(decompPath, 'sound', 'direct_sound_data.inc'), 'utf8');
  const re = /(\w+)::\s*\n\s*\.incbin\s+"sound\/(direct_sound_samples\/[^"]+)\.bin"/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    samples[m[1]] = 'sfx/' + basename(m[2]) + '.wav';
  }
}
writeFileSync(join(outDir, 'samples.json'), JSON.stringify(samples));

// --- 2. keysplit_tables.inc → Map<keysplit_X, { [noteNumber]: slotIndex }> ---
// Format : `keysplit NAME, START_NOTE` puis `split SLOT, MAX_NOTE` par tranche.
// Chaque tranche va de (prevMax+1) à MAX_NOTE et utilise SLOT.
const keysplits = {};
{
  const text = readFileSync(join(decompPath, 'sound', 'keysplit_tables.inc'), 'utf8');
  const lines = text.split(/\r?\n/);
  let currentName = null;
  let prevMax = -1;
  let table = {};
  const flush = () => { if (currentName) keysplits['keysplit_' + currentName] = table; };
  for (const raw of lines) {
    const line = raw.replace(/@.*$/, '').trim();
    if (!line) continue;
    const ks = line.match(/^keysplit\s+(\w+)(?:\s*,\s*(\d+))?/);
    if (ks) {
      flush();
      currentName = ks[1];
      prevMax = (ks[2] ? Number(ks[2]) : 0) - 1;
      table = {};
      continue;
    }
    const sp = line.match(/^split\s+(\d+)\s*,\s*(\d+)/);
    if (sp && currentName) {
      const slot = Number(sp[1]);
      const maxNote = Number(sp[2]);
      for (let n = prevMax + 1; n <= maxNote; n++) table[n] = slot;
      prevMax = maxNote;
    }
  }
  flush();
}
writeFileSync(join(outDir, 'keysplits.json'), JSON.stringify(keysplits));

// --- 3. Parser les voicegroups ---
function parseVoicegroupFile(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const out = { start: 0, voices: [], label: null };
  for (const raw of lines) {
    const line = raw.replace(/@.*$/, '').trim();
    if (!line) continue;

    // Capture le LABEL réel : `voice_group rs_drumset, 36` → label="rs_drumset"
    // Le caller utilise `voicegroup_rs_drumset` (avec préfixe).
    const vg = line.match(/^voice_group\s+(\w+)(?:\s*,\s*(\d+))?/);
    if (vg) {
      out.label = vg[1];
      if (vg[2]) out.start = Number(vg[2]);
      continue;
    }

    if (!line.startsWith('voice_')) continue;
    const tokens = line.split(/[\s,]+/).filter(Boolean);
    const op = tokens[0];
    const n = (i) => Number(tokens[i]);

    if (op === 'voice_keysplit_all') {
      out.voices.push({ type: 'keysplit_all', target: tokens[1] });
    } else if (op === 'voice_keysplit') {
      out.voices.push({ type: 'keysplit', target: tokens[1], split: tokens[2] });
    } else if (op === 'voice_square_1' || op === 'voice_square_1_alt') {
      // Cf. asm/macros/music_voice.inc:31 :
      // voice_square_1 base_midi_key, pan, sweep, duty_cycle, attack, decay, sustain, release
      // Indices : 0=op, 1=rootKey, 2=pan, 3=sweep, 4=duty, 5=a, 6=d, 7=s, 8=r
      // Encoding GBA : a/d/r 3-bit (0-7), sustain 4-bit (0-15).
      out.voices.push({ type: 'square', duty: n(4) ?? 2, rootKey: n(1), pan: n(2),
        a: n(5), d: n(6), s: n(7), r: n(8) });
    } else if (op === 'voice_square_2' || op === 'voice_square_2_alt') {
      // Cf. music_voice.inc:56 :
      // voice_square_2 base_midi_key, pan, duty_cycle, attack, decay, sustain, release (PAS de sweep)
      // Indices : 0=op, 1=rootKey, 2=pan, 3=duty, 4=a, 5=d, 6=s, 7=r
      out.voices.push({ type: 'square', duty: n(3) ?? 1, rootKey: n(1), pan: n(2),
        a: n(4), d: n(5), s: n(6), r: n(7) });
    } else if (op === 'voice_directsound' || op === 'voice_directsound_alt' || op === 'voice_directsound_no_resample') {
      out.voices.push({ type: 'directsound', rootKey: n(1), pan: n(2),
        sample: tokens[3],
        a: n(4), d: n(5), s: n(6), r: n(7),
        resample: op !== 'voice_directsound_no_resample' });
    } else if (op === 'voice_noise' || op === 'voice_noise_alt') {
      out.voices.push({ type: 'noise', rootKey: n(1), pan: n(2),
        a: n(tokens.length - 4), d: n(tokens.length - 3),
        s: n(tokens.length - 2), r: n(tokens.length - 1) });
    } else if (op === 'voice_programmable_wave' || op === 'voice_programmable_wave_alt') {
      // Format : voice_programmable_wave_alt rootKey, pan, ProgrammableWaveData_X, a, d, s, r
      // Le sample s'appelle "ProgrammableWaveData_N" → on extrait juste N (pour matcher pwave-samples.json keys)
      const sampleRef = (tokens[3] ?? '').replace(/^ProgrammableWaveData_/, '');
      out.voices.push({ type: 'pwave', rootKey: n(1), pan: n(2),
        sample: sampleRef.padStart(2, '0'), // "1" → "01" pour match les clés JSON
        a: n(tokens.length - 4), d: n(tokens.length - 3),
        s: n(tokens.length - 2), r: n(tokens.length - 1) });
    } else {
      out.voices.push({ type: 'unknown', op });
    }
  }
  return out;
}

const voicegroups = {};
function walkAndParse(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) { walkAndParse(p); continue; }
    if (!entry.endsWith('.inc')) continue;
    const fileName = entry.replace(/\.inc$/, '');
    const parsed = parseVoicegroupFile(p);
    if (parsed.voices.length === 0 && !parsed.start) continue;
    // Nom canonique = label du `voice_group X, Y` directive (ex. "rs_drumset"),
    // préfixé par "voicegroup_" (= comme le caller référence : voicegroup_rs_drumset).
    // Fallback au nom de fichier si pas de label.
    const baseName = parsed.label ?? fileName;
    voicegroups['voicegroup_' + baseName] = { start: parsed.start, voices: parsed.voices };
  }
}
walkAndParse(join(decompPath, 'sound', 'voicegroups'));
writeFileSync(join(outDir, 'voicegroups.json'), JSON.stringify(voicegroups));

// --- 3.5. Extract programmable_wave_samples (.pcm) ---
// Format : 16 bytes = 32 nibbles 4-bit unsigned = wavetable single cycle.
// Sortie : pwave-samples.json = { "01": [n0, n1, ..., n31], ... } (nibbles 0-15)
const pwaveDir = join(decompPath, 'sound', 'programmable_wave_samples');
const pwaveSamples = {};
if (existsSync(pwaveDir)) {
  for (const f of readdirSync(pwaveDir)) {
    if (!f.endsWith('.pcm')) continue;
    const buf = readFileSync(join(pwaveDir, f));
    const nibbles = [];
    for (let i = 0; i < buf.length; i++) {
      nibbles.push((buf[i] >> 4) & 0xF); // high nibble first
      nibbles.push(buf[i] & 0xF);
    }
    pwaveSamples[f.replace(/\.pcm$/, '')] = nibbles;
  }
}
writeFileSync(join(outDir, 'pwave-samples.json'), JSON.stringify(pwaveSamples));

// --- 4. midi.cfg → song → voicegroup (mus_* ET se_* sound effects) ---
const songVoicegroups = {};
{
  const text = readFileSync(join(decompPath, 'sound', 'songs', 'midi', 'midi.cfg'), 'utf8');
  // Match mus_* (musics) et se_* (sound effects), tous deux ont un voicegroup
  const re = /^((?:mus|se)_\w+)\.mid:\s*(.+)$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const song = m[1];
    const gm = m[2].match(/-G(\w+)/);
    if (gm) songVoicegroups[song] = 'voicegroup_' + gm[1].replace(/^_/, '');
  }
}
writeFileSync(join(outDir, 'song-voicegroups.json'), JSON.stringify(songVoicegroups));

// --- 5. voice_groups.inc → voicegroup → bank index dans le SF2 ---
// Le SF2 ripped par GBAMusRiper assigne 1 bank par voicegroup principal.
// L'ordre des banks suit l'ordre des .include de voice_groups.inc, en sautant :
//   - drumsets/ et keysplits/ (inlinés dans leurs parents, pas de bank propre)
//   - voicegroups vides ou de debug que GBAMusRiper exclut.
// Validation empirique :
//   - voicegroup_title doit donner bank 48 (test mus_title sonnait juste avec bank 48)
// L'écart entre 181 voicegroups uniques et 176 banks SF2 = 5 voicegroups skipped.
// Identifiés par : (a) cry_tables n'a pas de fichier .inc ; (b) bard, unused_2, rg_unused,
// rg_unused_2 = noms "test/unused" non-référencés par aucune song ni SFX.
const SKIP_VOICEGROUPS = new Set([
  'voicegroup_cry_tables',  // pas de .inc (table de cries, pas un vrai voicegroup)
  'voicegroup_bard',        // bard easter-egg, non-référencé
  'voicegroup_unused_2',    // unused
  'voicegroup_rg_unused',   // unused FRLG
  'voicegroup_rg_unused_2', // unused FRLG
]);
const voicegroupBanks = {};
{
  const text = readFileSync(join(decompPath, 'sound', 'voice_groups.inc'), 'utf8');
  const re = /\.include "([^"]+)"/g;
  const seen = new Set();
  let bankIdx = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const path = m[1];
    if (path.includes('/drumsets/') || path.includes('/keysplits/')) continue;
    const name = 'voicegroup_' + basename(path, '.inc');
    if (seen.has(name)) continue; // dedup (certains voicegroups includes 2× pour FRLG)
    seen.add(name);
    if (SKIP_VOICEGROUPS.has(name)) continue; // non-rippé par GBAMusRiper
    voicegroupBanks[name] = bankIdx++;
  }
}
writeFileSync(join(outDir, 'voicegroup-banks.json'), JSON.stringify(voicegroupBanks));

console.log('[voicegroups]', {
  samples: Object.keys(samples).length,
  keysplits: Object.keys(keysplits).length,
  voicegroups: Object.keys(voicegroups).length,
  songs: Object.keys(songVoicegroups).length,
  banks: Object.keys(voicegroupBanks).length
});
