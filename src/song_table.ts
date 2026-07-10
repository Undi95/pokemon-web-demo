/**
 * src/song_table.ts — accès 1:1 à `sound/song_table.inc` (gSongTable).
 *
 * La table vit en « ROM » : 622 entrées Song de 8 octets {header u32 @0,
 * ms u16 @4, me u16 @6} DANS gSoundMemory. Le chargeur du lot données pose
 * l'offset de la première entrée via setGSongTable ; tant qu'il vaut 0, les
 * m4aSongNum* liront du zéro (header 0 → MPlayStart lit un SongHeader nul,
 * trackCount 0 → no-op) : INERTE et sans danger.
 */

export const SONG_TABLE_ENTRY_SIZE = 8;
export const SONG_OFF_HEADER = 0; // u32
export const SONG_OFF_MS = 4; // u16 — index music player
export const SONG_OFF_ME = 6; // u16

/** Offset gSoundMemory de gSongTable[0] (0 = données pas chargées). */
export let gSongTable = 0;

export function setGSongTable(off: number): void {
  gSongTable = off >>> 0;
}
