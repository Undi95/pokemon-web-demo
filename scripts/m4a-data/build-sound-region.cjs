/**
 * scripts/m4a-data/build-sound-region.cjs — génère la région ROM de
 * data/sound_data.s ENTIÈRE depuis les sources du décomp et la diffe byte à
 * byte contre la ROM matching :
 *   voice_groups.inc (196 includes, cry_tables.inc imbriqué) →
 *   keysplit_tables.inc → programmable_wave_data.inc →
 *   music_player_table.inc → song_table.inc (+dummy_song_header) →
 *   direct_sound_data.inc (544 .incbin : .wav → wav2agb.cjs en mémoire).
 *
 *   node scripts/m4a-data/build-sound-region.cjs [--emit blob.bin index.json]
 *
 * Ancrage : base = adresse ROM de gSongTable (0x086B49F0, validée par
 * validate-songs.cjs) - offset de gSongTable dans le flux généré. Tous les
 * pointeurs internes (samples, keysplits, sous-groupes, cris) se résolvent
 * sur cette base → adresses ROM absolues identiques au link décomp.
 *
 * ⚠️ Exemption documentée : gMPlayTable (music_player_table.inc, 48 octets)
 * contient les adresses RAM GBA de gMPlayInfo_x et gMPlayTrack_x — irrésolvables
 * sans le link GBA et JAMAIS lues par le moteur TS (gMPlayTable natif dans
 * src/music_player_table.ts). Ces 48 octets sont copiés de la ROM (romcopy).
 *
 * Les macros transcrites viennent de asm/macros/music_voice.inc et
 * asm/macros/m4a.inc (song, voice_*, keysplit/split, cry/cry_reverse).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { convert } = require('./wav2agb.cjs');

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const ROM_PATH = 'D:/Projet 1/rom/pokeemerald_us.gba';
const ROM_BASE = 0x08000000;
const G_SONG_TABLE_ADDR = 0x086B49F0; // validé par validate-songs.cjs

const rom = fs.readFileSync(ROM_PATH);

// ---------------- émetteur ----------------
const chunks = []; // Buffers dans l'ordre
let offset = 0;
const labels = new Map(); // nom → offset flux
const relocs = []; // {offset, symbol} → u32 à patcher (base + labels/extern)
const romcopies = []; // {offset, size} → copiés de la ROM après ancrage
const fileMap = []; // {file, start} pour situer les divergences

function emit(buf) {
  chunks.push(buf);
  offset += buf.length;
}
function emitBytes(...vals) {
  emit(Buffer.from(vals.map((v) => v & 0xFF)));
}
function align(pow2) {
  const a = 1 << pow2;
  const pad = (a - (offset % a)) % a;
  if (pad) emit(Buffer.alloc(pad));
}
function defLabel(name) {
  if (labels.has(name)) throw new Error(`label dupliqué : ${name}`);
  labels.set(name, offset);
}
function emitPtr(symbol) {
  relocs.push({ offset, symbol });
  emit(Buffer.alloc(4));
}

// ---------------- macros music_voice.inc ----------------
// _voice_directsound : type, key, 0, pan — le pan est l'octet 3 (après un
// .byte 0 fixe), CONTRAIREMENT aux voix CGB où il est l'octet 2 (music_voice.inc).
function voiceDirectsound(type, [key, pan, ptr, a, d, s, r]) {
  emitBytes(type, num(key), 0, num(pan) !== 0 ? 0x80 | num(pan) : 0);
  emitPtr(ptr);
  emitBytes(num(a), num(d), num(s), num(r));
}
function voiceSquare1(type, [key, pan, sweep, duty, a, d, s, r]) {
  emitBytes(type, num(key), num(pan) !== 0 ? 0x80 | num(pan) : 0, num(sweep),
    num(duty) & 0x3, 0, 0, 0, num(a) & 0x7, num(d) & 0x7, num(s) & 0xF, num(r) & 0x7);
}
function voiceSquare2(type, [key, pan, duty, a, d, s, r]) {
  emitBytes(type, num(key), num(pan) !== 0 ? 0x80 | num(pan) : 0, 0,
    num(duty) & 0x3, 0, 0, 0, num(a) & 0x7, num(d) & 0x7, num(s) & 0xF, num(r) & 0x7);
}
function voiceProgrammableWave(type, [key, pan, ptr, a, d, s, r]) {
  emitBytes(type, num(key), num(pan) !== 0 ? 0x80 | num(pan) : 0, 0);
  emitPtr(ptr);
  emitBytes(num(a) & 0x7, num(d) & 0x7, num(s) & 0xF, num(r) & 0x7);
}
function voiceNoise(type, [key, pan, period, a, d, s, r]) {
  emitBytes(type, num(key), num(pan) !== 0 ? 0x80 | num(pan) : 0, 0,
    num(period) & 0x1, 0, 0, 0, num(a) & 0x7, num(d) & 0x7, num(s) & 0xF, num(r) & 0x7);
}

function num(s) {
  const v = s.startsWith('0x') || s.startsWith('0X') ? parseInt(s, 16) : parseInt(s, 10);
  if (Number.isNaN(v)) throw new Error(`argument non numérique : ${s}`);
  return v;
}

// état des macros keysplit/split (m4a.inc)
let _last_note = 0;

// ---------------- parseur de lignes ----------------
function processFile(incPath) {
  const full = path.join(DECOMP, incPath);
  const text = fs.readFileSync(full, 'utf8');
  fileMap.push({ file: incPath, start: offset });

  let inBss = false;

  for (const raw of text.split('\n')) {
    const at = raw.indexOf('@');
    const line = (at >= 0 ? raw.slice(0, at) : raw).trim();
    if (!line) continue;

    // sections : music_player_table.inc passe par .bss (ignoré) puis .rodata
    if (line === '.bss') { inBss = true; continue; }
    if (line.startsWith('.section')) { inBss = false; continue; }
    if (inBss) continue; // .space/.size/labels du BSS n'occupent pas la ROM
    if (line.startsWith('.equiv') || line.startsWith('.size')) continue;

    const inc = line.match(/^\.include\s+"(.+)"$/);
    if (inc) { processFile(inc[1]); continue; }

    const alignM = line.match(/^\.align\s+(\d+)$/);
    if (alignM) { align(parseInt(alignM[1], 10)); continue; }

    const labelM = line.match(/^([A-Za-z_][A-Za-z0-9_]*)::?$/);
    if (labelM) { defLabel(labelM[1]); continue; }

    const incbinM = line.match(/^\.incbin\s+"(.+)"$/);
    if (incbinM) { emit(loadIncbin(incbinM[1])); continue; }

    const byteM = line.match(/^\.byte\s+(.*)$/);
    if (byteM) {
      for (const a of byteM[1].split(',')) emitBytes(num(a.trim()));
      continue;
    }

    // macro générique : nom arg1, arg2, ...
    const m = line.match(/^([a-z_0-9]+)\s*(.*)$/);
    if (!m) throw new Error(`ligne non reconnue (${incPath}) : "${line}"`);
    const macro = m[1];
    const args = m[2] ? m[2].split(',').map((s) => s.trim()) : [];

    switch (macro) {
      case 'voice_group': {
        // .align 2 puis label (rétro-offset de starting_note*0xC si fourni)
        align(2);
        const name = `voicegroup_${args[0]}`;
        if (args.length > 1) labels.set(name, offset - num(args[1]) * 0xC);
        else defLabel(name);
        break;
      }
      case 'voice_directsound': voiceDirectsound(0, args); break;
      case 'voice_directsound_no_resample': voiceDirectsound(8, args); break;
      case 'voice_directsound_alt': voiceDirectsound(16, args); break;
      case 'voice_square_1': voiceSquare1(1, args); break;
      case 'voice_square_1_alt': voiceSquare1(9, args); break;
      case 'voice_square_2': voiceSquare2(2, args); break;
      case 'voice_square_2_alt': voiceSquare2(10, args); break;
      case 'voice_programmable_wave': voiceProgrammableWave(3, args); break;
      case 'voice_programmable_wave_alt': voiceProgrammableWave(11, args); break;
      case 'voice_noise': voiceNoise(4, args); break;
      case 'voice_noise_alt': voiceNoise(12, args); break;
      case 'voice_keysplit':
        emitBytes(0x40, 0, 0, 0);
        emitPtr(args[0]);
        emitPtr(args[1]);
        break;
      case 'voice_keysplit_all':
        emitBytes(0x80, 0, 0, 0);
        emitPtr(args[0]);
        emit(Buffer.alloc(4)); // .4byte 0
        break;
      case 'cry':
        emitBytes(0x20, 60, 0, 0);
        emitPtr(args[0]);
        emitBytes(0xFF, 0, 0xFF, 0);
        break;
      case 'cry_reverse':
        emitBytes(0x30, 60, 0, 0);
        emitPtr(args[0]);
        emitBytes(0xFF, 0, 0xFF, 0);
        break;
      case 'keysplit': {
        const name = `keysplit_${args[0]}`;
        if (args.length > 1) {
          labels.set(name, offset - num(args[1]));
          _last_note = num(args[1]);
        } else {
          defLabel(name);
          _last_note = 0;
        }
        break;
      }
      case 'split': {
        const [index, ending] = [num(args[0]), num(args[1])];
        if (ending < _last_note) throw new Error(`split invalide (${incPath})`);
        for (let i = 0; i < ending - _last_note; i++) emitBytes(index);
        _last_note = ending;
        break;
      }
      case 'music_player':
        // gMPlayTable : 12 octets/entrée, pointeurs RAM GBA → romcopy (cf. bandeau)
        romcopies.push({ offset, size: 12 });
        emit(Buffer.alloc(12));
        break;
      case 'song':
        // .4byte label ; .2byte ms ; .2byte me — label = header d'un song .o
        // externe (adresse résolue via la table ROM, contenu validé par
        // validate-songs.cjs) ou dummy_song_header (local).
        emitPtr(args[0]);
        emit(Buffer.from([num(args[1].replace('MUSIC_PLAYER_BGM', '0')
          .replace('MUSIC_PLAYER_SE1', '1').replace('MUSIC_PLAYER_SE2', '2')
          .replace('MUSIC_PLAYER_SE3', '3')) & 0xFF, 0, num(args[2]) & 0xFF, 0]));
        break;
      default:
        throw new Error(`macro inconnue (${incPath}) : "${macro}" ligne "${line}"`);
    }
  }
}

// ---------------- .incbin → génération en mémoire ----------------
const incbinCache = new Map();
function loadIncbin(rel) {
  if (incbinCache.has(rel)) return incbinCache.get(rel);
  let buf;
  if (rel.endsWith('.pcm')) {
    // programmable_wave_samples : committés bruts
    buf = fs.readFileSync(path.join(DECOMP, rel));
  } else if (rel.endsWith('.bin')) {
    // générés au build depuis le .wav voisin (audio_rules.mk) :
    // cries : wav2agb -b -c -l 1 --no-pad ; le reste : wav2agb -b
    const wav = path.join(DECOMP, rel.replace(/\.bin$/, '.wav'));
    const isCry = rel.includes('/cries/');
    buf = convert(wav, isCry ? { compress: true, lookahead: 1, noPad: true } : {});
  } else {
    throw new Error(`.incbin inattendu : ${rel}`);
  }
  incbinCache.set(rel, buf);
  return buf;
}

// ---------------- main ----------------
// Ordre de data/sound_data.s (music_player_table AVANT song_table).
processFile('sound/voice_groups.inc');
processFile('sound/keysplit_tables.inc');
processFile('sound/programmable_wave_data.inc');
processFile('sound/music_player_table.inc');
processFile('sound/song_table.inc');
processFile('sound/direct_sound_data.inc');

const blob = Buffer.concat(chunks);
if (!labels.has('gSongTable')) throw new Error('gSongTable non défini');
const base = G_SONG_TABLE_ADDR - labels.get('gSongTable');
console.log(`flux: ${blob.length} octets · base ROM = 0x${base.toString(16).toUpperCase()} (mod 4 = ${base % 4})`);

// Externes : headers des songs, résolus depuis la table ROM (contenu des
// songs validé indépendamment par validate-songs.cjs).
const songTableOff = G_SONG_TABLE_ADDR - ROM_BASE;
const externs = new Map();
{
  const text = fs.readFileSync(path.join(DECOMP, 'sound/song_table.inc'), 'utf8');
  let i = 0;
  for (const raw of text.split('\n')) {
    const m = raw.match(/^\s*song\s+([A-Za-z0-9_]+)\s*,/);
    if (!m) continue;
    const addr = rom.readUInt32LE(songTableOff + 8 * i);
    if (!externs.has(m[1])) externs.set(m[1], addr);
    i++;
  }
}

// Patch des relocs.
for (const { offset: o, symbol } of relocs) {
  let addr;
  if (labels.has(symbol)) addr = base + labels.get(symbol);
  else if (externs.has(symbol)) addr = externs.get(symbol);
  else throw new Error(`symbole irrésolu : ${symbol}`);
  blob.writeUInt32LE(addr >>> 0, o);
}

// romcopy (gMPlayTable).
const romStart = base - ROM_BASE;
for (const { offset: o, size } of romcopies) {
  rom.copy(blob, o, romStart + o, romStart + o + size);
}

// ---------------- diff ----------------
let diffCount = 0;
let firstDiff = -1;
for (let i = 0; i < blob.length; i++) {
  if (blob[i] !== rom[romStart + i]) {
    diffCount++;
    if (firstDiff < 0) firstDiff = i;
  }
}

function whereIs(off) {
  let where = fileMap[0];
  for (const f of fileMap) if (f.start <= off) where = f;
  let lbl = '';
  let best = -1;
  for (const [name, lo] of labels) {
    if (lo <= off && lo > best) { best = lo; lbl = name; }
  }
  return `${where.file} (${lbl}+0x${(off - best).toString(16)})`;
}

if (diffCount === 0) {
  console.log(`\n🏆 RÉGION ENTIÈRE BYTE-EXACTE : ${blob.length} octets (0x${base.toString(16)}–0x${(base + blob.length).toString(16)})`);
} else {
  console.log(`\n❌ ${diffCount} octets divergent · 1er @+0x${firstDiff.toString(16)} = ${whereIs(firstDiff)}`);
  const lo = Math.max(0, firstDiff - 8);
  console.log(`   gen: ${blob.subarray(lo, firstDiff + 12).toString('hex')}`);
  console.log(`   rom: ${rom.subarray(romStart + lo, romStart + firstDiff + 12).toString('hex')}`);
  // divergences par composante
  const perFile = new Map();
  for (let i = 0; i < blob.length; i++) {
    if (blob[i] !== rom[romStart + i]) {
      let where = fileMap[0];
      for (const f of fileMap) if (f.start <= i) where = f;
      perFile.set(where.file, (perFile.get(where.file) || 0) + 1);
    }
  }
  for (const [f, n] of perFile) console.log(`   ${f}: ${n}`);
}

// ---------------- émission optionnelle ----------------
const argv = process.argv.slice(2);
if (argv[0] === '--emit' && diffCount === 0) {
  const blobPath = argv[1] || 'public/assets/m4a/sound-region.bin';
  const indexPath = argv[2] || 'public/assets/m4a/sound-region.json';
  fs.writeFileSync(blobPath, blob);
  const index = {
    base, size: blob.length,
    gSongTable: G_SONG_TABLE_ADDR,
    numSongs: 610,
    labels: Object.fromEntries([...labels].map(([k, v]) => [k, base + v])),
    songs: Object.fromEntries(externs),
  };
  fs.writeFileSync(indexPath, JSON.stringify(index));
  console.log(`émis : ${blobPath} (${blob.length} o) + ${indexPath}`);
}
