/**
 * src/m4a_tables.ts — miroir 1:1 `src/m4a_tables.c` (tables du moteur m4a).
 *
 * Tables numériques, template PokemonCrySong (sérialisée : la séquence du cri
 * s'exécute DANS la structure) et tables de pointeurs de fonctions
 * (gMPlayJumpTableTemplate, gXcmdTable). Les imports croisés m4a/m4a_1 sont
 * des function declarations (hoistées) : sains dans le cycle ESM.
 */

import type { MusicPlayerInfo, MusicPlayerTrack } from '../include/gba/m4a_internal';
import {
  ply_bend,
  ply_bendr,
  ply_endtie,
  ply_fine,
  ply_goto,
  ply_keysh,
  ply_lfodl,
  ply_lfos,
  ply_mod,
  ply_modt,
  ply_pan,
  ply_patt,
  ply_pend,
  ply_port,
  ply_prio,
  ply_rept,
  ply_tempo,
  ply_tune,
  ply_voice,
  ply_vol,
  RealClearChain,
  SoundMainBTM,
  TrackStop,
} from './m4a_1';
import {
  FadeOutBody,
  ply_xatta,
  ply_xcmd_0D,
  ply_xdeca,
  ply_xiecl,
  ply_xiecv,
  ply_xleng,
  ply_xrele,
  ply_xswee,
  ply_xsust,
  ply_xtype,
  ply_xwait,
  ply_xwave,
  ply_xxx,
  SampleFreqSet,
  TrkVolPitSet,
} from './m4a';
import {
  C_V,
  CRYSONG_OFF_BLOCK_COUNT,
  CRYSONG_OFF_CONT,
  CRYSONG_OFF_END,
  CRYSONG_OFF_GAP,
  CRYSONG_OFF_GOTO_CMD,
  CRYSONG_OFF_GOTO_TARGET,
  CRYSONG_OFF_LENGTH,
  CRYSONG_OFF_PAN_CMD,
  CRYSONG_OFF_PAN_VALUE,
  CRYSONG_OFF_PART0,
  CRYSONG_OFF_PART0_PTR,
  CRYSONG_OFF_PART1,
  CRYSONG_OFF_PART1_PTR,
  CRYSONG_OFF_PRIORITY,
  CRYSONG_OFF_RELEASE_VALUE,
  CRYSONG_OFF_REVERB,
  CRYSONG_OFF_TIE_CMD,
  CRYSONG_OFF_TIE_KEY_VALUE,
  CRYSONG_OFF_TIE_VELOCITY_VALUE,
  CRYSONG_OFF_TONE,
  CRYSONG_OFF_TRACK_COUNT,
  CRYSONG_OFF_TUNE_VALUE,
  CRYSONG_OFF_TUNE_VALUE2,
  CRYSONG_OFF_UNK_CMD_0D,
  CRYSONG_OFF_UNK_CMD_0D_PARAM,
  CRYSONG_OFF_VOLUME_VALUE,
  CRYSONG_OFF_VOL_CMD,
  CRYSONG_OFF_XRELE_CMD,
  CRYSONG_OFF_XWAIT_CMD,
} from '../include/gba/m4a_internal';

// Some of these functions have different signatures, so we need to make this
// an array of void pointers or a struct. It's simpler to just make it an array
// for now.
export const gMPlayJumpTableTemplate: ReadonlyArray<(...args: never[]) => void> = [
  ply_fine,
  ply_goto,
  ply_patt,
  ply_pend,
  ply_rept,
  ply_fine,
  ply_fine,
  ply_fine,
  ply_fine,
  ply_prio,
  ply_tempo,
  ply_keysh,
  ply_voice,
  ply_vol,
  ply_pan,
  ply_bend,
  ply_bendr,
  ply_lfos,
  ply_lfodl,
  ply_mod,
  ply_modt,
  ply_fine,
  ply_fine,
  ply_tune,
  ply_fine,
  ply_fine,
  ply_fine,
  ply_port,
  ply_fine,
  ply_endtie,
  SampleFreqSet as unknown as (...args: never[]) => void,
  TrackStop,
  FadeOutBody as unknown as (...args: never[]) => void,
  TrkVolPitSet,
  RealClearChain as unknown as (...args: never[]) => void,
  SoundMainBTM as unknown as (...args: never[]) => void,
];

// This is a table of deltas between sample values in compressed PCM data.
export const gDeltaEncodingTable: Int8Array = Int8Array.from([
  0,
  1,
  4,
  9,
  16,
  25,
  36,
  49,
  -64,
  -49,
  -36,
  -25,
  -16,
  -9,
  -4,
  -1,
]);

export const gScaleTable: Uint8Array = Uint8Array.from([
  0xe0, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xeb,
  0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xdb,
  0xc0, 0xc1, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xcb,
  0xb0, 0xb1, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xbb,
  0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xab,
  0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b,
  0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x8b,
  0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b,
  0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b,
  0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5b,
  0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b,
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b,
  0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b,
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
]);

export const gFreqTable: Uint32Array = Uint32Array.from([
  2147483648,
  2275179671,
  2410468894,
  2553802834,
  2705659852,
  2866546760,
  3037000500,
  3217589947,
  3408917802,
  3611622603,
  3826380858,
  4053909305,
]);

export const gPcmSamplesPerVBlankTable: Uint16Array = Uint16Array.from([
  96,
  132,
  176,
  224,
  264,
  304,
  352,
  448,
  528,
  608,
  672,
  704,
]);

export const gCgbScaleTable: Uint8Array = Uint8Array.from([
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b,
  0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b,
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b,
  0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x4b,
  0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5b,
  0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b,
  0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b,
  0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x8b,
  0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b,
  0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xab,
]);

export const gCgbFreqTable: Int16Array = Int16Array.from([
  -2004,
  -1891,
  -1785,
  -1685,
  -1591,
  -1501,
  -1417,
  -1337,
  -1262,
  -1192,
  -1125,
  -1062,
]);

export const gNoiseTable: Uint8Array = Uint8Array.from([
  0xd7, 0xd6, 0xd5, 0xd4,
  0xc7, 0xc6, 0xc5, 0xc4,
  0xb7, 0xb6, 0xb5, 0xb4,
  0xa7, 0xa6, 0xa5, 0xa4,
  0x97, 0x96, 0x95, 0x94,
  0x87, 0x86, 0x85, 0x84,
  0x77, 0x76, 0x75, 0x74,
  0x67, 0x66, 0x65, 0x64,
  0x57, 0x56, 0x55, 0x54,
  0x47, 0x46, 0x45, 0x44,
  0x37, 0x36, 0x35, 0x34,
  0x27, 0x26, 0x25, 0x24,
  0x17, 0x16, 0x15, 0x14,
  0x07, 0x06, 0x05, 0x04,
  0x03, 0x02, 0x01, 0x00,
]);

export const gCgb3Vol: Uint8Array = Uint8Array.from([
  0x00, 0x00,
  0x60, 0x60, 0x60, 0x60,
  0x40, 0x40, 0x40, 0x40,
  0x80, 0x80, 0x80, 0x80,
  0x20, 0x20,
]);

export const gClockTable: Uint8Array = Uint8Array.from([
  0x00,
  0x01,
  0x02,
  0x03,
  0x04,
  0x05,
  0x06,
  0x07,
  0x08,
  0x09,
  0x0a,
  0x0b,
  0x0c,
  0x0d,
  0x0e,
  0x0f,
  0x10,
  0x11,
  0x12,
  0x13,
  0x14,
  0x15,
  0x16,
  0x17,
  0x18,
  0x1c,
  0x1e,
  0x20,
  0x24,
  0x28,
  0x2a,
  0x2c,
  0x30,
  0x34,
  0x36,
  0x38,
  0x3c,
  0x40,
  0x42,
  0x44,
  0x48,
  0x4c,
  0x4e,
  0x50,
  0x54,
  0x58,
  0x5a,
  0x5c,
  0x60,
]);

// Opcodes de séquence mp2k (m4a_tables.c #define) — partagés avec m4a.ts/m4a_1.ts.
export const FINE = 0xb1;
export const GOTO = 0xb2;
export const PATT = 0xb3;
export const PEND = 0xb4;
export const REPT = 0xb5;
export const MEMACC = 0xb9;
export const PRIO = 0xba;
export const TEMPO = 0xbb;
export const KEYSH = 0xbc;
export const VOICE = 0xbd;
export const VOL = 0xbe;
export const PAN = 0xbf;
export const BEND = 0xc0;
export const BENDR = 0xc1;
export const LFOS = 0xc2;
export const LFODL = 0xc3;
export const MOD = 0xc4;
export const MODT = 0xc5;
export const TUNE = 0xc8;

export const XCMD = 0xcd;
export const xRELE = 0x07;
export const xIECV = 0x08;
export const xIECL = 0x09;
export const xWAIT = 0x0c;

export const EOT = 0xce;
export const TIE = 0xcf;

export type XcmdFunc = (mplayInfo: MusicPlayerInfo, track: MusicPlayerTrack) => void;

export const gXcmdTable: readonly XcmdFunc[] = [
  ply_xxx,
  ply_xwave,
  ply_xtype,
  ply_xxx,
  ply_xatta,
  ply_xdeca,
  ply_xsust,
  ply_xrele,
  ply_xiecv,
  ply_xiecl,
  ply_xleng,
  ply_xswee,
  ply_xwait,
  ply_xcmd_0D,
];

/** 1:1 `gPokemonCrySongTemplate` (m4a_tables.c:259) — la struct constante,
 *  SÉRIALISÉE aux offsets exacts du layout C (la séquence du cri s'exécute DANS
 *  la structure : cmdPtr parcourt part0/gotoCmd/…). `tone` = &voicegroup_dummy
 *  en C : offset résolu au chargement de l'image son, écrit ici en paramètre.
 *  `gotoTarget` (= adresse absolue de `cont` en C) est posé par le code m4a.c
 *  au moment de la copie (comme sur GBA où la template contient l'adresse ROM
 *  de son propre champ — non transposable statiquement en offsets). */
export function writePokemonCrySongTemplate(mem: Uint8Array, off: number, voicegroupDummyOff: number): void {
  const w32 = (o: number, v: number): void => {
    mem[o] = v & 0xff; mem[o + 1] = (v >>> 8) & 0xff; mem[o + 2] = (v >>> 16) & 0xff; mem[o + 3] = (v >>> 24) & 0xff;
  };
  mem[off + CRYSONG_OFF_TRACK_COUNT] = 1;
  mem[off + CRYSONG_OFF_BLOCK_COUNT] = 0;
  mem[off + CRYSONG_OFF_PRIORITY] = 255;
  mem[off + CRYSONG_OFF_REVERB] = 0;
  w32(off + CRYSONG_OFF_TONE, voicegroupDummyOff); // .tone = &voicegroup_dummy
  w32(off + CRYSONG_OFF_PART0_PTR, 0); // .part = {NULL, NULL}
  w32(off + CRYSONG_OFF_PART1_PTR, 0);
  mem[off + CRYSONG_OFF_GAP] = 0;
  mem[off + CRYSONG_OFF_PART0] = TUNE;
  mem[off + CRYSONG_OFF_TUNE_VALUE] = C_V;
  mem[off + CRYSONG_OFF_GOTO_CMD] = GOTO;
  w32(off + CRYSONG_OFF_GOTO_TARGET, 0);
  mem[off + CRYSONG_OFF_PART1] = TUNE;
  mem[off + CRYSONG_OFF_TUNE_VALUE2] = C_V + 16;
  mem[off + CRYSONG_OFF_CONT] = VOICE; // part0 jumps here with gotoCmd
  mem[off + CRYSONG_OFF_CONT + 1] = 0;
  mem[off + CRYSONG_OFF_VOL_CMD] = VOL;
  mem[off + CRYSONG_OFF_VOLUME_VALUE] = 127;
  mem[off + CRYSONG_OFF_UNK_CMD_0D] = XCMD;
  mem[off + CRYSONG_OFF_UNK_CMD_0D + 1] = 0x0d;
  w32(off + CRYSONG_OFF_UNK_CMD_0D_PARAM, 0);
  mem[off + CRYSONG_OFF_XRELE_CMD] = XCMD;
  mem[off + CRYSONG_OFF_XRELE_CMD + 1] = xRELE;
  mem[off + CRYSONG_OFF_RELEASE_VALUE] = 0;
  mem[off + CRYSONG_OFF_PAN_CMD] = PAN;
  mem[off + CRYSONG_OFF_PAN_VALUE] = C_V;
  mem[off + CRYSONG_OFF_TIE_CMD] = TIE;
  mem[off + CRYSONG_OFF_TIE_KEY_VALUE] = 60; // default is Cn3
  mem[off + CRYSONG_OFF_TIE_VELOCITY_VALUE] = 127;
  mem[off + CRYSONG_OFF_XWAIT_CMD] = XCMD;
  mem[off + CRYSONG_OFF_XWAIT_CMD + 1] = xWAIT;
  mem[off + CRYSONG_OFF_LENGTH] = 60; // frames to wait (u16 LE)
  mem[off + CRYSONG_OFF_LENGTH + 1] = 0;
  mem[off + CRYSONG_OFF_END] = EOT;
  mem[off + CRYSONG_OFF_END + 1] = FINE;
}
