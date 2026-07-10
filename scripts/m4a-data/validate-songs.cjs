/**
 * scripts/m4a-data/validate-songs.cjs — oracle du lot données son : génère
 * chaque chanson depuis les SOURCES du décomp (.mid → mid2agb.cjs →
 * mplay-assembler.cjs) et exige l'égalité BYTE À BYTE avec la ROM matching
 * (D:\Projet 1\rom\pokeemerald_us.gba, sha1 vérifié).
 *
 *   node scripts/m4a-data/validate-songs.cjs [--only mus_intro] [--max N]
 *
 * Localisation de gSongTable : parse de sound/song_table.inc (l'index de
 * mus_intro y est compté), scan ROM du u32 0x0892D978 (= adresse ROM du
 * SongHeader de MUS_INTRO, connue de l'oracle mGBA), base = hit - 8*index.
 * L'adresse du voicegroup de chaque song est lue dans le header ROM (word
 * @+4) et fournie à l'assembleur comme symbole externe : la séquence
 * générée doit donc être identique, pointeurs compris.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { mid2agb } = require('./mid2agb.cjs');
const { assemble } = require('./mplay-assembler.cjs');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const ROM_PATH = 'D:/Projet 1/rom/pokeemerald_us.gba';
const ROM_BASE = 0x08000000;
const MUS_INTRO_HEADER = 0x0892D978;

const rom = fs.readFileSync(ROM_PATH);
const mplayDefText = fs.readFileSync(path.join(DECOMP, 'sound/MPlayDef.s'), 'utf8');

// ---- song_table.inc : liste ordonnée {label, ms, me} ----
function parseSongTable() {
  const text = fs.readFileSync(path.join(DECOMP, 'sound/song_table.inc'), 'utf8');
  const entries = [];
  for (const raw of text.split('\n')) {
    const m = raw.match(/^\s*song\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*(\d+)/);
    if (m) entries.push({ label: m[1], ms: m[2], me: parseInt(m[3], 10) });
  }
  return entries;
}

// ---- midi.cfg : label → options mid2agb ----
function parseMidiCfg() {
  const text = fs.readFileSync(path.join(DECOMP, 'sound/songs/midi/midi.cfg'), 'utf8');
  const cfg = new Map();
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    // L'extension .mid est optionnelle : midi.cfg:103 (mus_rg_encounter_gym_leader)
    // l'omet — coquille du fork, mais les options restent celles du song.
    const m = line.match(/^([A-Za-z0-9_]+?)(?:\.mid)?:\s*(.*)$/);
    if (m) cfg.set(m[1], m[2].trim().split(/\s+/).filter(Boolean));
  }
  return cfg;
}

// ---- localisation de gSongTable ----
function findSongTable(entries) {
  const idx = entries.findIndex((e) => e.label === 'mus_intro');
  if (idx < 0) throw new Error('mus_intro absent de song_table.inc');
  for (let off = 0; off + 4 <= rom.length; off += 4) {
    if (rom.readUInt32LE(off) === MUS_INTRO_HEADER) {
      const tableOff = off - 8 * idx;
      if (tableOff < 0) continue;
      // Sanité : toutes les entrées doivent pointer en ROM.
      let ok = true;
      for (let i = 0; i < entries.length; i++) {
        const h = rom.readUInt32LE(tableOff + 8 * i);
        if (h < ROM_BASE || h >= ROM_BASE + rom.length) { ok = false; break; }
      }
      if (ok) return { tableOff, idx };
    }
  }
  throw new Error('gSongTable introuvable (scan 0x0892D978)');
}

// ---- validation d'un song ----
function validateSong(label, headerAddr, cfg) {
  // dummy_song_header : défini en queue de song_table.inc (.align 2 +
  // .byte 0,0,0,0) — pas un .mid. Vérifié directement.
  if (label === 'dummy_song_header') {
    const off = headerAddr - ROM_BASE;
    const ok = rom.readUInt32LE(off) === 0;
    return { label, status: ok ? 'OK' : 'DIFF', size: 4, firstDiff: 0, diffCount: ok ? 0 : 4 };
  }
  const midPath = path.join(DECOMP, 'sound/songs/midi', `${label}.mid`);
  if (!fs.existsSync(midPath)) return { label, status: 'NO_MID' };
  const options = cfg.get(label);
  if (!options) return { label, status: 'NO_CFG' };

  const sText = mid2agb(midPath, options, `${label}.s`);

  const headerOff = headerAddr - ROM_BASE;
  const groupAddr = rom.readUInt32LE(headerOff + 4);
  // Nom du symbole externe : "voicegroup" + suffixe -G (défaut "_dummy").
  let voiceGroup = '_dummy';
  for (let i = 0; i < options.length; i++) {
    if (options[i].startsWith('-G')) {
      voiceGroup = options[i].length > 2 ? options[i].slice(2) : options[++i];
    }
  }

  const { bytes, base } = assemble(sText, {
    mplayDefText,
    headerAddr,
    externs: { [`voicegroup${voiceGroup}`]: groupAddr },
  });

  const romStart = base - ROM_BASE;
  if (romStart < 0) return { label, status: 'BASE_OOB', base };

  let firstDiff = -1;
  let diffCount = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] !== rom[romStart + i]) {
      diffCount++;
      if (firstDiff < 0) firstDiff = i;
    }
  }

  if (diffCount === 0) return { label, status: 'OK', size: bytes.length };
  return { label, status: 'DIFF', size: bytes.length, firstDiff, diffCount, bytes, romStart, sText };
}

// ---- main ----
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const max = args.includes('--max') ? parseInt(args[args.indexOf('--max') + 1], 10) : Infinity;

const entries = parseSongTable();
const cfg = parseMidiCfg();
const { tableOff, idx } = findSongTable(entries);
console.log(`gSongTable @ROM 0x${(ROM_BASE + tableOff).toString(16).toUpperCase()} (mus_intro=index ${idx}, ${entries.length} entrées)`);

// Dédoublonnage : la table répète des labels (pointeurs partagés) — on ne
// valide chaque .mid qu'une fois.
const seen = new Set();
const results = { OK: 0, DIFF: 0, NO_MID: 0, NO_CFG: 0, ERROR: 0 };
const diffs = [];
let tested = 0;

for (let i = 0; i < entries.length && tested < max; i++) {
  const { label } = entries[i];
  if (seen.has(label)) continue;
  seen.add(label);
  if (only && label !== only) continue;

  const headerAddr = rom.readUInt32LE(tableOff + 8 * i);
  let r;
  try {
    r = validateSong(label, headerAddr, cfg);
  } catch (e) {
    r = { label, status: 'ERROR', error: e.message };
  }
  results[r.status] = (results[r.status] || 0) + 1;
  tested++;

  if (r.status === 'DIFF') {
    diffs.push(r);
    if (diffs.length <= 5) {
      const i0 = r.firstDiff;
      const ctx = 8;
      const lo = Math.max(0, i0 - ctx);
      console.log(`❌ ${label}: ${r.diffCount}/${r.size} octets divergent, 1er @+0x${i0.toString(16)}`);
      console.log(`   gen: ${r.bytes.subarray(lo, i0 + ctx).toString('hex')}`);
      console.log(`   rom: ${rom.subarray(r.romStart + lo, r.romStart + i0 + ctx).toString('hex')}`);
    }
  } else if (r.status === 'ERROR') {
    console.log(`💥 ${label}: ${r.error}`);
  } else if (only || r.status !== 'OK') {
    console.log(`${r.status === 'OK' ? '✅' : '⚠️'} ${label}: ${r.status}${r.size ? ` (${r.size} octets)` : ''}`);
  }
}

console.log(`\n=== ${tested} songs testés ===`);
console.log(Object.entries(results).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(' '));
if (results.OK === tested && tested > 0) console.log('\n🏆 TOUS BYTE-EXACTS vs ROM');
