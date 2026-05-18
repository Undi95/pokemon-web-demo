/**
 * save-sectors.ts — Moteur de secteurs 1:1 décomp `src/save.c` (étape 3
 * du chantier SAVE-SYSTEM-1TO1-PLAN.md).
 *
 * Porte le modèle flash GBA : 32 secteurs (slot1 0-13, slot2 14-27 ;
 * 28-31 spéciaux non requis MVP), footer {id, checksum, signature
 * 0x8012025, counter}, rotation de slot + counter, `CalculateChecksum`,
 * `GetSaveValidStatus` (slot OK ssi 14/14 valides, counter max gagne),
 * `CopySaveSlotData` (placement par id stocké). La "flash" = un blob
 * localStorage `em_flash_v3`.
 *
 * ── Adaptation web (documentée, NON-fake) ──────────────────────────────
 * Le décomp chunke les structs packées C par tranches de SECTOR_DATA_SIZE
 * (3968 o) car la flash GBA a des secteurs de 4 Ko. Nous sérialisons les
 * structs ENTIÈRES (SaveBlock2/1/Storage) en JSON→UTF-8 (bien plus gros
 * que la struct packée), donc la taille de chunk s'ADAPTE : chaque bloc
 * est découpé en EXACTEMENT N chunks (N = nb de secteurs alloués au bloc :
 * SaveBlock2→1, SaveBlock1→4, PokemonStorage→9), chunkSize =
 * ceil(len/N). C'est la SEULE adaptation : toute la sémantique observable
 * 1:1 est préservée (14 secteurs/slot, checksum par secteur, rotation de
 * slot, sélection par counter max, détection corruption, round-trip des
 * structs ENTIÈRES — zéro sous-ensemble choisi à la main).
 *
 * Étape 3a (ce commit) = primitives isolées + round-trip déterministe.
 * Étape 3b = moteur 32 secteurs (Write/GetValid/CopySlot). Étape 3c =
 * wire LoadGameSave/TrySavingData + migration `em_save_v2_*`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/save.c`,
 * `include/save.h`.
 */

// ─── Constantes 1:1 décomp (save.h) ────────────────────────────────────────

export const SECTOR_DATA_SIZE = 3968;
export const SECTOR_SIGNATURE = 0x8012025;
export const NUM_SECTORS_PER_SLOT = 14;
export const NUM_SAVE_SLOTS = 2;
export const SECTORS_COUNT = 32;

export const SECTOR_ID_SAVEBLOCK2 = 0;
export const SECTOR_ID_SAVEBLOCK1_START = 1;
export const SECTOR_ID_SAVEBLOCK1_END = 4;
export const SECTOR_ID_PKMN_STORAGE_START = 5;
export const SECTOR_ID_PKMN_STORAGE_END = 13;

export const SAVE_STATUS_EMPTY = 0;
export const SAVE_STATUS_OK = 1;
export const SAVE_STATUS_CORRUPT = 2;
export const SAVE_STATUS_NO_FLASH = 4;
export const SAVE_STATUS_ERROR = 0xFF;

/** 1:1 décomp `FULL_SAVE_SLOT 0xFFFF` (save.h). */
export const FULL_SAVE_SLOT = 0xFFFF;

/** Groupes de secteurs par bloc (= dérivé de `sSaveSlotLayout`/SAVEBLOCK
 *  _CHUNK save.c:55). sector 0 → SaveBlock2 ; 1-4 → SaveBlock1 ; 5-13 →
 *  PokemonStorage. */
export const BLOCK_SECTOR_GROUPS = {
  saveBlock2: [SECTOR_ID_SAVEBLOCK2],
  saveBlock1: [1, 2, 3, 4],
  pokemonStorage: [5, 6, 7, 8, 9, 10, 11, 12, 13],
} as const;

// ─── Secteur (= struct SaveSector save.h, footer utile) ────────────────────

/** 1:1 décomp `struct SaveSector` (footer 12 o utiles). `data` = bytes du
 *  chunk (taille adaptée web, cf. en-tête). */
export interface SaveSector {
  data: Uint8Array;
  id: number;        // u16 — sectorId logique (0..13)
  checksum: number;  // u16 — CalculateChecksum(data)
  signature: number; // u32 — SECTOR_SIGNATURE si valide
  counter: number;   // u32 — gSaveCounter au moment de l'écriture
}

// ─── CalculateChecksum 1:1 décomp (save.c:674) ─────────────────────────────

/**
 * 1:1 décomp `static u16 CalculateChecksum(void *data, u16 size)` :
 * ```
 * u32 checksum = 0;
 * for (i = 0; i < (size/4); i++) { checksum += *(u32*)data; data += 4; }
 * return ((checksum >> 16) + checksum);   // tronqué u16
 * ```
 * Lecture des mots u32 en LITTLE-ENDIAN (GBA = LE). Accumulation u32
 * (`>>> 0`), fold 16-bit, retour u16.
 */
export function CalculateChecksum(data: Uint8Array, size: number): number {
  let checksum = 0;
  const words = Math.floor(size / 4);
  for (let i = 0; i < words; i++) {
    const o = i * 4;
    const u32 =
      ((data[o] | (data[o + 1] << 8) | (data[o + 2] << 16) | (data[o + 3] << 24)) >>> 0);
    checksum = (checksum + u32) >>> 0;
  }
  return ((checksum >>> 16) + checksum) & 0xFFFF;
}

// ─── Sérialisation bloc → chunks → reconstruction (round-trip) ─────────────

const _enc = new TextEncoder();
const _dec = new TextDecoder();

/** Sérialise une struct SaveBlock (objet) en bytes UTF-8 déterministes
 *  (JSON ; l'ordre des clés est stable car les structs sont construites
 *  par emptySaveBlockX dans un ordre fixe). */
export function serializeBlock(block: unknown): Uint8Array {
  return _enc.encode(JSON.stringify(block));
}

export function deserializeBlock<T = unknown>(bytes: Uint8Array): T {
  return JSON.parse(_dec.decode(bytes)) as T;
}

/**
 * Découpe les bytes d'un bloc en EXACTEMENT `sectorIds.length` chunks
 * (chunkSize = ceil(len / N)), un par secteur logique. Préfixe chaque
 * chunk de sa longueur réelle (4 o LE) pour reconstruction exacte (le
 * dernier chunk peut être plus court ; padding 0 jusqu'à chunkSize pour
 * un checksum déterministe par secteur, 1:1 esprit "secteur taille fixe").
 */
export function splitBlockToSectors(
  block: unknown, sectorIds: readonly number[], counter: number,
): SaveSector[] {
  const raw = serializeBlock(block);
  const n = sectorIds.length;
  const total = raw.length;
  const chunkSize = Math.ceil(total / n) || 1;
  const sectors: SaveSector[] = [];
  for (let k = 0; k < n; k++) {
    const start = k * chunkSize;
    const end = Math.min(start + chunkSize, total);
    const slice = start < total ? raw.subarray(start, end) : new Uint8Array(0);
    // data = [len u32 LE][slice bytes][pad 0 → chunkSize+4]
    const data = new Uint8Array(chunkSize + 4);
    const len = slice.length;
    data[0] = len & 0xFF; data[1] = (len >> 8) & 0xFF;
    data[2] = (len >> 16) & 0xFF; data[3] = (len >>> 24) & 0xFF;
    data.set(slice, 4);
    sectors.push({
      data,
      id: sectorIds[k],
      checksum: CalculateChecksum(data, data.length),
      signature: SECTOR_SIGNATURE,
      counter: counter >>> 0,
    });
  }
  return sectors;
}

/**
 * Reconstruit le bloc depuis ses secteurs (ordonnés par id croissant =
 * ordre des chunks). Concatène les `len` bytes utiles de chaque chunk.
 * Retourne null si un secteur est invalide (signature/checksum) — 1:1
 * esprit CopySaveSlotData (ne copie que les secteurs valides ; ici un
 * bloc est tout-ou-rien car les chunks se suivent).
 */
export function joinSectorsToBlock<T = unknown>(
  sectors: readonly SaveSector[],
): T | null {
  const ordered = [...sectors].sort((a, b) => a.id - b.id);
  const parts: Uint8Array[] = [];
  for (const s of ordered) {
    if (s.signature !== SECTOR_SIGNATURE) return null;
    if (CalculateChecksum(s.data, s.data.length) !== s.checksum) return null;
    const len = (s.data[0] | (s.data[1] << 8) | (s.data[2] << 16) | (s.data[3] << 24)) >>> 0;
    parts.push(s.data.subarray(4, 4 + len));
  }
  let totalLen = 0;
  for (const p of parts) totalLen += p.length;
  const full = new Uint8Array(totalLen);
  let off = 0;
  for (const p of parts) { full.set(p, off); off += p.length; }
  try {
    return deserializeBlock<T>(full);
  } catch {
    return null;
  }
}

// ─── Self-test déterministe (étape 3a) ─────────────────────────────────────

/** Vérif round-trip déterministe : bloc → secteurs → bloc == original,
 *  + checksum stable + détection corruption. Appelé via devtools. */
export function __selfTestSectors(): Record<string, unknown> {
  const sample = {
    playerName: 'UNDI', playerGender: 1,
    optionsTextSpeed: 2, optionsSound: 1, optionsBattleStyle: 1,
    optionsButtonMode: 2, optionsWindowFrameType: 3,
    localTimeOffset: { days: 9630, hours: 13, minutes: 7, seconds: 20 },
    nested: { a: [1, 2, 3], s: 'héllo/àccénts€', big: 123456789 },
  };
  // SaveBlock1 = 4 secteurs (grosse struct simulée)
  const big = { arr: Array.from({ length: 500 }, (_, i) => ({ i, v: i * i, n: `mon${i}` })) };

  const s2 = splitBlockToSectors(sample, BLOCK_SECTOR_GROUPS.saveBlock2, 7);
  const s1 = splitBlockToSectors(big, BLOCK_SECTOR_GROUPS.saveBlock1, 7);
  const r2 = joinSectorsToBlock(s2);
  const r1 = joinSectorsToBlock(big ? s1 : s1);

  // checksum déterministe (re-split → mêmes checksums)
  const s2b = splitBlockToSectors(sample, BLOCK_SECTOR_GROUPS.saveBlock2, 7);
  const cksStable = s2.every((s, i) => s.checksum === s2b[i].checksum);

  // corruption : flip 1 byte → joinSectorsToBlock renvoie null
  const corrupt = splitBlockToSectors(sample, BLOCK_SECTOR_GROUPS.saveBlock2, 7);
  corrupt[0].data[10] ^= 0xFF;
  const corruptDetected = joinSectorsToBlock(corrupt) === null;

  return {
    sb2_roundTrip: JSON.stringify(r2) === JSON.stringify(sample),
    sb1_roundTrip: JSON.stringify(r1) === JSON.stringify(big),
    sb1_sectorCount: s1.length, // attendu 4
    sb2_sectorCount: s2.length, // attendu 1
    checksumDeterministic: cksStable,
    corruptionDetected: corruptDetected,
    sampleChecksums: s2.map(s => s.checksum),
  };
}

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__saveSectorsSelfTest = __selfTestSectors;
}
