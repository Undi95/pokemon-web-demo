/**
 * src/music_player_table.ts — miroir 1:1 `sound/music_player_table.inc`.
 *
 * .bss : les 4 tableaux de pistes (tailles vérifiées dans le .inc) — construits
 * au module-load, donc leurs `addrOrder` (m4a_internal.ts) croissent dans
 * l'ordre du link décomp BGM < SE1 < SE2 < SE3, AVANT gPokemonCryTracks
 * (m4a.ts, évalué après ce module dans le graphe d'imports).
 *
 * .rodata : gMPlayTable — `music_player info, tracks, numTracks, unk_A`.
 * ⚠️ Cycle ESM assumé m4a.ts ⟷ ce module : `info` est un GETTER (lecture
 * différée du live binding) car ce module est évalué PENDANT l'évaluation de
 * m4a.ts — lire gMPlayInfo_BGM au top-level serait une bombe TDZ (cf. mémoire
 * « nouvelle arête d'import tôt »). Usage inchangé : gMPlayTable[i].info.
 */

import { MusicPlayer, MusicPlayerTrack } from '../include/gba/m4a_internal';
import { gMPlayInfo_BGM, gMPlayInfo_SE1, gMPlayInfo_SE2, gMPlayInfo_SE3 } from './m4a';

export const NUM_TRACKS_BGM = 10;
export const NUM_TRACKS_SE1 = 3;
export const NUM_TRACKS_SE2 = 9;
export const NUM_TRACKS_SE3 = 1;

const mkTracks = (n: number): MusicPlayerTrack[] =>
  Array.from({ length: n }, () => new MusicPlayerTrack());

export const gMPlayTrack_BGM = mkTracks(NUM_TRACKS_BGM);
export const gMPlayTrack_SE1 = mkTracks(NUM_TRACKS_SE1);
export const gMPlayTrack_SE2 = mkTracks(NUM_TRACKS_SE2);
export const gMPlayTrack_SE3 = mkTracks(NUM_TRACKS_SE3);

export const gMPlayTable: MusicPlayer[] = [
  { get info() { return gMPlayInfo_BGM; }, track: gMPlayTrack_BGM, numTracks: NUM_TRACKS_BGM, unk_A: 0 },
  { get info() { return gMPlayInfo_SE1; }, track: gMPlayTrack_SE1, numTracks: NUM_TRACKS_SE1, unk_A: 1 },
  { get info() { return gMPlayInfo_SE2; }, track: gMPlayTrack_SE2, numTracks: NUM_TRACKS_SE2, unk_A: 1 },
  { get info() { return gMPlayInfo_SE3; }, track: gMPlayTrack_SE3, numTracks: NUM_TRACKS_SE3, unk_A: 0 },
];
