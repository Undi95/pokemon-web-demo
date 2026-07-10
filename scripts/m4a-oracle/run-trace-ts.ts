/**
 * scripts/m4a-oracle/run-trace-ts.ts — Oracle son étage A, côté port.
 *
 * Exécute le séquenceur transcrit (src/m4a_1.ts + src/m4a.ts) sur la VRAIE ROM
 * US (matching, sha1 f3ae0881…) et dumpe le MÊME JSONL que trace-m4a-bgm.lua
 * côté mGBA : {"f":N,"sh":…,"st":…,"tr":[[flags,wait,key,velocity,gateTime,
 * keyM,pitM,volMR,volML,patternLevel,cmdPtr,chanNonNull]×trackCount]}.
 *
 * Modèle mémoire du runner : IDENTITÉ d'adressage GBA — gSoundMemory fait
 * 0x08000000 + taille ROM et la ROM est posée à 0x08000000. Tous les pointeurs
 * ROM (songHeader, tone, part[], cmdPtr, wav…) sont valides TELS QUELS
 * (byte-exact par construction, zéro extraction) et cmdPtr se compare à mGBA
 * sans conversion. (Le jeu web utilisera un blob compact — choix propre à
 * l'oracle, documenté dans la mémoire chantier-son-m4a.)
 *
 * Init : miroir m4aSoundInit (m4a.c:70-100) sans la CpuCopy32 de SoundMainRAM
 * (mixeur = lot 2, N/A ici). Boucle : le vrai flux appelle SoundMain chaque
 * frame, qui fait MPlayMain(musicPlayerHead) (m4a_1.s SoundMain) — sans mixeur
 * on appelle MPlayMain directement sur la tête de chaîne. La frame 0 dumpe
 * l'état post-MPlayStart AVANT le premier MPlayMain (ancre d'alignement).
 *
 * Usage :
 *   npx esbuild scripts/m4a-oracle/run-trace-ts.ts --bundle --format=esm \
 *     --platform=node --outfile=<scratch>/run-trace-ts.mjs
 *   node <scratch>/run-trace-ts.mjs [songHeaderAddr] [frames]
 * Puis : node scripts/m4a-oracle/compare-traces.cjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import {
  gMPlayInfo_BGM,
  gSoundInfo,
  m4aSoundInit,
  m4aSoundMain,
  MPlayStart,
} from '../../src/m4a';
import { m4aSoundVSync, setSoundMemory, setSoundMemoryTranslate } from '../../src/m4a_1';
import { SOUND_RAM_SIZE } from '../../src/m4a';
import { MusicPlayerTrack, PCM_DMA_BUF_SIZE } from '../../include/gba/m4a_internal';

const ROM_PATH = 'D:/Projet 1/rom/pokeemerald_us.gba';
const OUT_PATH = 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-bgm.jsonl';
const PCM_PATH = 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-pcm.bin';
const WAV_PATH = 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-bgm.wav';
const CHANS_PATH = 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-chans.bin';

/** Sérialise un SoundChannel au layout GBA exact (64 bytes, m4a_constants.inc)
 *  pour le diff binaire avec trace-m4a-chans.lua. Les pointeurs RAM
 *  (track/prev/next) sont normalisés en présence 0/1. */
function serializeChan(b: Buffer, off: number, c: import('../../include/gba/m4a_internal').SoundChannel): void {
  b.writeUInt8(c.statusFlags & 0xff, off + 0x00);
  b.writeUInt8(c.type & 0xff, off + 0x01);
  b.writeUInt8(c.rightVolume & 0xff, off + 0x02);
  b.writeUInt8(c.leftVolume & 0xff, off + 0x03);
  b.writeUInt8(c.attack & 0xff, off + 0x04);
  b.writeUInt8(c.decay & 0xff, off + 0x05);
  b.writeUInt8(c.sustain & 0xff, off + 0x06);
  b.writeUInt8(c.release & 0xff, off + 0x07);
  b.writeUInt8(c.key & 0xff, off + 0x08);
  b.writeUInt8(c.envelopeVolume & 0xff, off + 0x09);
  b.writeUInt8(c.envelopeVolumeRight & 0xff, off + 0x0a);
  b.writeUInt8(c.envelopeVolumeLeft & 0xff, off + 0x0b);
  b.writeUInt8(c.pseudoEchoVolume & 0xff, off + 0x0c);
  b.writeUInt8(c.pseudoEchoLength & 0xff, off + 0x0d);
  b.writeUInt8(c.gateTime & 0xff, off + 0x10);
  b.writeUInt8(c.midiKey & 0xff, off + 0x11);
  b.writeUInt8(c.velocity & 0xff, off + 0x12);
  b.writeUInt8(c.priority & 0xff, off + 0x13);
  b.writeUInt8(c.rhythmPan & 0xff, off + 0x14);
  b.writeUInt32LE(c.count >>> 0, off + 0x18);
  b.writeUInt32LE(c.fw >>> 0, off + 0x1c);
  b.writeUInt32LE(c.frequency >>> 0, off + 0x20);
  b.writeUInt32LE(c.wav >>> 0, off + 0x24);
  b.writeUInt32LE(c.currentPointer >>> 0, off + 0x28);
  b.writeUInt32LE(c.track ? 1 : 0, off + 0x2c);
  b.writeUInt32LE(0, off + 0x30);
  b.writeUInt32LE(c.nextChannelPointer ? 1 : 0, off + 0x34);
  b.writeUInt32LE(c.xpi >>> 0, off + 0x3c);
}

// sh observé dans la trace mGBA (MUS_INTRO : 0x0892D0F8, adresse ROM du SongHeader).
const SONG_HEADER = Number(process.argv[2] ?? 143841656) >>> 0;
const FRAMES = Number(process.argv[3] ?? 1500);

// ── gSoundMemory : identité d'adressage GBA (défaut) ou mode --blob ────────
// --blob : le blob du lot données (sound-data.bin, byte-exact ROM) posé à
// SOUND_RAM_SIZE + translation d'adresses — EXACTEMENT le modèle mémoire du
// jeu. Les traces produites doivent rester identiques au mode ROM : c'est la
// certification de la translation.
if (process.argv.includes('--blob')) {
  const blob = readFileSync('D:/Projet 1/pokemon-web-demo/public/decomp/em/m4a/sound-data.bin');
  const index = JSON.parse(readFileSync('D:/Projet 1/pokemon-web-demo/public/decomp/em/m4a/sound-data.json', 'utf8'));
  const mem = new Uint8Array(SOUND_RAM_SIZE + blob.length);
  mem.set(blob, SOUND_RAM_SIZE);
  setSoundMemory(mem);
  setSoundMemoryTranslate(index.base - SOUND_RAM_SIZE);
} else {
  const rom = readFileSync(ROM_PATH);
  const mem = new Uint8Array(0x08000000 + rom.length);
  mem.set(rom, 0x08000000);
  setSoundMemory(mem);
}

// ── Init 1:1 : m4aSoundInit transcrit (m4a.c:70-100) — tracks et gMPlayTable
// viennent de src/music_player_table.ts ; l'ordre d'évaluation ESM (la table
// AVANT le corps de m4a.ts) donne des addrOrder fidèles au link décomp :
// BGM < SE1 < SE2 < SE3 < gPokemonCryTracks.
m4aSoundInit();

// ── MPlayStart + boucle frames ──────────────────────────────────────────────
MPlayStart(gMPlayInfo_BGM, SONG_HEADER);

function dumpFrame(f: number): string {
  const sh = gMPlayInfo_BGM.songHeader >>> 0;
  const st = gMPlayInfo_BGM.status >>> 0;
  const tracks = gMPlayInfo_BGM.tracks as MusicPlayerTrack[];
  const parts: string[] = [];
  for (let i = 0; i < gMPlayInfo_BGM.trackCount; i++) {
    const t = tracks[i];
    // Masquages u8/u32 : mGBA lit la mémoire brute — on compare byte à byte.
    parts.push(`[${t.flags & 0xff},${t.wait & 0xff},${t.key & 0xff},${t.velocity & 0xff},${t.gateTime & 0xff},${t.keyM & 0xff},${t.pitM & 0xff},${t.volMR & 0xff},${t.volML & 0xff},${t.patternLevel & 0xff},${t.cmdPtr >>> 0},${t.chan !== null ? 1 : 0}]`);
  }
  return `{"f":${f},"sh":${sh},"st":${st},"tr":[${parts.join(',')}]}`;
}

// Flux réel par frame vidéo : VCountIntr (main.c:386) → m4aSoundVSync, puis
// VBlankIntr (main.c:355) → m4aSoundMain (= SoundMain : MPlayMain(tête) +
// CgbSound + SoundMainRAM sur la tranche pcmDmaCounter du double buffer).
// Étage B : chaque frame, on dumpe pcmBuffer au format de trace-m4a-pcm.lua
// et on concatène la tranche écrite (flux audio continu) pour le WAV témoin.
const lines: string[] = [dumpFrame(0)];
const pcmChunks: Buffer[] = [];
const chanChunks: Buffer[] = [];
const wavL: number[] = [];
const wavR: number[] = [];
const spv = gSoundInfo.pcmSamplesPerVBlank;
pcmChunks.push((() => {
  const h = Buffer.alloc(8);
  h.writeUInt32LE(0x5041344d, 0); // "M4AP"
  h.writeUInt8(1, 4);
  h.writeUInt8(gSoundInfo.pcmDmaPeriod, 5);
  h.writeUInt16LE(spv, 6);
  return h;
})());
chanChunks.push((() => {
  const h = Buffer.alloc(8);
  h.writeUInt32LE(0x4341344d, 0); // "M4AC"
  h.writeUInt8(2, 4);
  h.writeUInt8(gSoundInfo.pcmDmaPeriod, 5);
  h.writeUInt16LE(spv, 6);
  return h;
})());
for (let f = 1; f <= FRAMES; f++) {
  m4aSoundVSync();
  m4aSoundMain();
  lines.push(dumpFrame(f));
  const rec = Buffer.alloc(12 + PCM_DMA_BUF_SIZE * 2);
  rec.writeUInt32LE(f, 0);
  rec.writeUInt32LE(gMPlayInfo_BGM.songHeader >>> 0, 4);
  rec.writeUInt8(gSoundInfo.pcmDmaCounter, 8); // inchangé par SoundMain : celui qu'il a utilisé
  rec.writeUInt8(gSoundInfo.reverb, 9);
  Buffer.from(gSoundInfo.pcmBuffer.buffer, gSoundInfo.pcmBuffer.byteOffset, PCM_DMA_BUF_SIZE * 2).copy(rec, 12);
  pcmChunks.push(rec);
  // Étage A-bis : les 5 SoundChannels au layout GBA + le pcm (format M4AC v2).
  const crec = Buffer.alloc(12 + 5 * 64 + PCM_DMA_BUF_SIZE * 2);
  rec.copy(crec, 0, 0, 12);
  for (let ci = 0; ci < 5; ci++) serializeChan(crec, 12 + ci * 64, gSoundInfo.chans[ci]);
  rec.copy(crec, 12 + 5 * 64, 12);
  chanChunks.push(crec);
  // Tranche écrite cette frame (même formule que SoundMain) → flux WAV.
  const dc = gSoundInfo.pcmDmaCounter;
  const cur = dc - 1 > 0 ? spv * (gSoundInfo.pcmDmaPeriod - (dc - 1)) : 0;
  for (let i = 0; i < spv; i++) {
    wavR.push(gSoundInfo.pcmBuffer[cur + i]);
    wavL.push(gSoundInfo.pcmBuffer[cur + i + PCM_DMA_BUF_SIZE]);
  }
}
writeFileSync(OUT_PATH, lines.join('\n') + '\n');
writeFileSync(PCM_PATH, Buffer.concat(pcmChunks));
writeFileSync(CHANS_PATH, Buffer.concat(chanChunks));

// WAV témoin : stéréo 8-bit unsigned, pcmFreq réelle du driver.
const nSamples = wavL.length;
const wav = Buffer.alloc(44 + nSamples * 2);
const freq = gSoundInfo.pcmFreq || 13379;
wav.write('RIFF', 0); wav.writeUInt32LE(36 + nSamples * 2, 4); wav.write('WAVE', 8);
wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22); wav.writeUInt32LE(freq, 24); wav.writeUInt32LE(freq * 2, 28);
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(8, 34);
wav.write('data', 36); wav.writeUInt32LE(nSamples * 2, 40);
for (let i = 0; i < nSamples; i++) {
  wav.writeUInt8((wavL[i] + 128) & 0xff, 44 + i * 2);
  wav.writeUInt8((wavR[i] + 128) & 0xff, 45 + i * 2);
}
writeFileSync(WAV_PATH, wav);

console.log(`m4a-oracle TS: ${FRAMES} frames (+ancre f0) -> ${OUT_PATH}`);
console.log(`  pcm: ${PCM_PATH} · wav témoin: ${WAV_PATH} (${(nSamples / freq).toFixed(1)} s @${freq} Hz)`);
console.log(`  sh=0x${SONG_HEADER.toString(16).toUpperCase()} trackCount=${gMPlayInfo_BGM.trackCount}`);
