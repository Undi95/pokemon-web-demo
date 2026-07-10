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
  gCgbChans,
  gMPlayInfo_BGM,
  gMPlayInfo_SE1,
  gMPlayInfo_SE2,
  gMPlayInfo_SE3,
  gPokemonCryMusicPlayers,
  gPokemonCryTracks,
  gSoundInfo,
  m4aSoundMain,
  m4aSoundMode,
  MPlayExtender,
  MPlayOpen,
  MPlayStart,
  SoundInit,
} from '../../src/m4a';
import { m4aSoundVSync, setSoundMemory } from '../../src/m4a_1';
import {
  MusicPlayerTrack,
  PCM_DMA_BUF_SIZE,
  SOUND_MODE_DA_BIT_8,
  SOUND_MODE_FREQ_13379,
  SOUND_MODE_MASVOL_SHIFT,
  SOUND_MODE_MAXCHN_SHIFT,
} from '../../include/gba/m4a_internal';

const ROM_PATH = 'D:/Projet 1/rom/pokeemerald_us.gba';
const OUT_PATH = 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-bgm.jsonl';
const PCM_PATH = 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-pcm.bin';
const WAV_PATH = 'D:/Projet 1/pokemon-web-demo/scripts/m4a-oracle/trace-ts-bgm.wav';

// sh observé dans la trace mGBA (MUS_INTRO : 0x0892D0F8, adresse ROM du SongHeader).
const SONG_HEADER = Number(process.argv[2] ?? 143841656) >>> 0;
const FRAMES = Number(process.argv[3] ?? 1500);

// ── gSoundMemory = identité d'adressage GBA ─────────────────────────────────
const rom = readFileSync(ROM_PATH);
const mem = new Uint8Array(0x08000000 + rom.length);
mem.set(rom, 0x08000000);
setSoundMemory(mem);

// ── m4aSoundInit (m4a.c:70-100), CpuCopy32 du mixeur exclue ─────────────────
SoundInit(gSoundInfo);
MPlayExtender(gCgbChans);
m4aSoundMode(
  SOUND_MODE_DA_BIT_8 | SOUND_MODE_FREQ_13379
  | (12 << SOUND_MODE_MASVOL_SHIFT) | (5 << SOUND_MODE_MAXCHN_SHIFT),
);

// gMPlayTable (sound/music_player_table.inc) : {info, track, numTracks, unk_A}.
// Les gMPlayTrack_* n'existent pas encore côté données (lot données) → créés
// ICI dans l'ordre du .inc : addrOrder croît BGM < SE1 < SE2 < SE3, fidèle aux
// adresses GBA (gMPlayTrack_BGM @0x03001340 mesuré). Les gPokemonCryTracks du
// module m4a.ts ont des addrOrder PLUS BAS — sans effet sur cette trace : les
// cris ne jouent jamais, aucun canal ne pointe sur leurs tracks (à re-vérifier
// contre le link réel au câblage, cf. mémoire chantier-son-m4a).
const mkTracks = (n: number): MusicPlayerTrack[] =>
  Array.from({ length: n }, () => new MusicPlayerTrack());
const gMPlayTable = [
  { info: gMPlayInfo_BGM, track: mkTracks(10), numTracks: 10, unk_A: 0 },
  { info: gMPlayInfo_SE1, track: mkTracks(3), numTracks: 3, unk_A: 1 },
  { info: gMPlayInfo_SE2, track: mkTracks(9), numTracks: 9, unk_A: 1 },
  { info: gMPlayInfo_SE3, track: mkTracks(1), numTracks: 1, unk_A: 0 },
];
// Zone memacc : m4aSoundInit fait memAccArea = gMPlayMemAccArea (pointeur) ;
// côté port c'est un OFFSET gSoundMemory → 0x40 dans la RAM audio basse
// (libre : crySongs @0x100+). Jamais lu tant que ply_memacc ne tire pas.
const MEMACC_RAM_OFF = 0x40;
for (const mp of gMPlayTable) {
  MPlayOpen(mp.info, mp.track, mp.numTracks);
  mp.info.unk_B = mp.unk_A;
  mp.info.memAccArea = MEMACC_RAM_OFF;
}
// memcpy(&gPokemonCrySong, &gPokemonCrySongTemplate) : N/A ici (cris muets) ;
// l'OUVERTURE des 2 cry players, elle, participe à la chaîne MPlayMain → 1:1.
for (let i = 0; i < 2; i++) {
  MPlayOpen(
    gPokemonCryMusicPlayers[i],
    [gPokemonCryTracks[i * 2], gPokemonCryTracks[i * 2 + 1]],
    2,
  );
  gPokemonCryTracks[i * 2].chan = null; // track->chan = 0 (m4a.c:98)
}

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
