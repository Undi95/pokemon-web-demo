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
  const out = { start: 0, voices: [] };
  for (const raw of lines) {
    const line = raw.replace(/@.*$/, '').trim();
    if (!line) continue;

    const vg = line.match(/^voice_group\s+\w+(?:\s*,\s*(\d+))?/);
    if (vg) { if (vg[1]) out.start = Number(vg[1]); continue; }

    if (!line.startsWith('voice_')) continue;
    const tokens = line.split(/[\s,]+/).filter(Boolean);
    const op = tokens[0];
    const n = (i) => Number(tokens[i]);

    if (op === 'voice_keysplit_all') {
      out.voices.push({ type: 'keysplit_all', target: tokens[1] });
    } else if (op === 'voice_keysplit') {
      out.voices.push({ type: 'keysplit', target: tokens[1], split: tokens[2] });
    } else if (op === 'voice_square_1' || op === 'voice_square_1_alt') {
      // square_1 root pan sweep timbre length a d s r
      out.voices.push({ type: 'square', duty: n(4) ?? 2, rootKey: n(1), pan: n(2),
        a: n(6), d: n(7), s: n(8), r: n(9) });
    } else if (op === 'voice_square_2' || op === 'voice_square_2_alt') {
      // square_2 root pan timbre length a d s r (pas de sweep)
      const offset = op === 'voice_square_2_alt' ? -1 : 0;
      out.voices.push({ type: 'square', duty: n(3) ?? 1, rootKey: n(1), pan: n(2),
        a: n(5 + offset), d: n(6 + offset), s: n(7 + offset), r: n(8 + offset) });
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
      out.voices.push({ type: 'pwave', rootKey: n(1), pan: n(2),
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
    const name = entry.replace(/\.inc$/, '');
    const parsed = parseVoicegroupFile(p);
    if (parsed.voices.length > 0 || parsed.start) {
      voicegroups['voicegroup_' + name] = parsed;
    }
  }
}
walkAndParse(join(decompPath, 'sound', 'voicegroups'));
writeFileSync(join(outDir, 'voicegroups.json'), JSON.stringify(voicegroups));

// --- 4. midi.cfg → song → voicegroup ---
const songVoicegroups = {};
{
  const text = readFileSync(join(decompPath, 'sound', 'songs', 'midi', 'midi.cfg'), 'utf8');
  const re = /^(mus_\w+)\.mid:\s*(.+)$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const song = m[1];
    const gm = m[2].match(/-G(\w+)/);
    if (gm) songVoicegroups[song] = 'voicegroup_' + gm[1].replace(/^_/, '');
  }
}
writeFileSync(join(outDir, 'song-voicegroups.json'), JSON.stringify(songVoicegroups));

console.log('[voicegroups]', {
  samples: Object.keys(samples).length,
  keysplits: Object.keys(keysplits).length,
  voicegroups: Object.keys(voicegroups).length,
  songs: Object.keys(songVoicegroups).length
});
