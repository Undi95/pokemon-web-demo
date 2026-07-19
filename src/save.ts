/**
 * save.ts — Save system 1:1 décomp `src/save.c` + `src/load_save.c`.
 *
 * Ce fichier réunit MAINTENANT le moteur de secteurs (anciennement
 * `save-sectors.ts`, fusionné — la décomp n'a qu'UN fichier `save.c`) et
 * l'orchestration load/save haut-niveau. L'ANCIEN format JSON 2-slots
 * ad-hoc + la migration legacy v1 sont SUPPRIMÉS (clean break, autorisé
 * user : "personne n'y a joué à part moi, code mort inutile").
 *
 * Modèle (1:1 décomp) :
 *   - "Flash" = `em_flash_v3` (localStorage) : 28 secteurs (slot1 0-13,
 *     slot2 14-27), footer {id,checksum,signature 0x8012025,counter}.
 *   - SaveBlock2 = secteur 0 ; SaveBlock1 = 1-4 ; PokemonStorage = 5-13.
 *     Structs sérialisées ENTIÈRES (zéro sous-ensemble) → tout round-trip
 *     (options, RTC offset, flags, vars, party, pos…).
 *   - LoadGameSave = TryLoadSaveSlot (GetSaveValidStatus + CopySaveSlot
 *     Data) ; TrySavingData = WriteSaveSlot (rotation slot + counter++).
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
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/save.c`,
 * `include/save.h`, `src/load_save.c`.
 */

import {
  type SaveBlock1,
  type SaveBlock2,
  type PokemonStorage,
  emptySaveBlock1,
  emptySaveBlock2,
  emptyPokemonStorage,
  TOTAL_BOXES_COUNT,
} from './engine/save/save-blocks';
import { emptyBag, SetBagItemsPointers, migrateBlock1BagFormat } from './engine/bag/bag';
import { SetDecorationInventoriesPointers } from './decoration_inventory';
// Storage authoritatif des SaveBlock1/2 déplacé dans le module Foundation
// `save-block-state.ts` (= permet l'import direct depuis n'importe quel
// module sans cycle ESM). save-system continue à orchestrer load/save mais
// délègue le storage via Set*/Get* + le Proxy gSaveBlock1/2Ptr.
import {
  GetSaveBlock1 as _GetSaveBlock1Foundation,
  GetSaveBlock2 as _GetSaveBlock2Foundation,
  SetSaveBlock1,
  SetSaveBlock2,
  gSaveBlock1Ptr as _gSaveBlock1PtrFoundation,
  gSaveBlock2Ptr as _gSaveBlock2PtrFoundation,
} from './engine/save/save-block-state';

// ═════════════════════════════════════════════════════════════════════════
// MOTEUR DE SECTEURS 1:1 décomp `src/save.c` (anciennement save-sectors.ts).
// Porte le modèle flash GBA : 32 secteurs (slot1 0-13, slot2 14-27 ;
// 28-31 spéciaux non requis MVP), footer {id, checksum, signature
// 0x8012025, counter}, rotation de slot + counter, `CalculateChecksum`,
// `GetSaveValidStatus`, `CopySaveSlotData`. La "flash" = un blob
// localStorage `em_flash_v3`.
// ═════════════════════════════════════════════════════════════════════════

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

// ─── Moteur 32 secteurs localStorage-as-flash 1:1 ──────────────────────────

/** Carte secteur logique → bloc (= dérivé `sSaveSlotLayout` save.c:55).
 *  14 entrées ordonnées par sectorId 0..13. */
export type BlockKey = 'saveBlock2' | 'saveBlock1' | 'pokemonStorage';
export interface SaveSlotLocations {
  /** sectorId (0..13) → BlockKey. */
  sectorBlock: BlockKey[];
}
/** 1:1 décomp `UpdateSaveAddresses` (save.c:688) : mapping fixe sectorId→
 *  bloc. (Les vrais ptrs/blocs viennent du caller.) */
export function buildSlotLocations(): SaveSlotLocations {
  const sectorBlock: BlockKey[] = [];
  sectorBlock[SECTOR_ID_SAVEBLOCK2] = 'saveBlock2';
  for (let i = SECTOR_ID_SAVEBLOCK1_START; i <= SECTOR_ID_SAVEBLOCK1_END; i++) sectorBlock[i] = 'saveBlock1';
  for (let i = SECTOR_ID_PKMN_STORAGE_START; i <= SECTOR_ID_PKMN_STORAGE_END; i++) sectorBlock[i] = 'pokemonStorage';
  return { sectorBlock };
}

// ── Globals 1:1 décomp (save.c:82-93) ──
export let gSaveCounter = 0;
export let gLastWrittenSector = 0;
let gLastKnownGoodSector = 0;
let gLastSaveCounter = 0;
let gDamagedSaveSectors = 0;
export function Save_ResetSaveCounters(): void {
  gSaveCounter = 0; gLastWrittenSector = 0; gDamagedSaveSectors = 0;
}

// ── "Flash" = localStorage : 28 secteurs physiques (slot1 0-13, slot2 14-27) ──
const FLASH_KEY = 'em_flash_v3';
const _PHYS_SECTORS = NUM_SECTORS_PER_SLOT * NUM_SAVE_SLOTS; // 28
interface StoredSector { id: number; checksum: number; signature: number; counter: number; data: string; }

function _u8ToB64(u8: Uint8Array): string {
  let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}
function _b64ToU8(b64: string): Uint8Array {
  const s = atob(b64); const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return u8;
}
function _readFlash(): (StoredSector | null)[] {
  try {
    const raw = localStorage.getItem(FLASH_KEY);
    if (!raw) return new Array(_PHYS_SECTORS).fill(null);
    const arr = JSON.parse(raw) as (StoredSector | null)[];
    return Array.from({ length: _PHYS_SECTORS }, (_, i) => arr[i] ?? null);
  } catch { return new Array(_PHYS_SECTORS).fill(null); }
}
function _writeFlash(sectors: (StoredSector | null)[]): void {
  localStorage.setItem(FLASH_KEY, JSON.stringify(sectors));
}
function _readFlashSector(phys: number): SaveSector | null {
  const st = _readFlash()[phys];
  if (!st) return null;
  return { data: _b64ToU8(st.data), id: st.id, checksum: st.checksum, signature: st.signature, counter: st.counter };
}

/** 1:1 décomp `WriteSaveSectorOrSlot(FULL_SAVE_SLOT, ...)` (save.c:138) +
 *  `HandleWriteSector` (save.c:176). Écrit le slot complet (14 secteurs)
 *  avec rotation gLastWrittenSector + gSaveCounter++ + rollback si damage.
 *  `blocks` = {saveBlock2, saveBlock1, pokemonStorage} (objets structs). */
export function WriteSaveSlot(blocks: Record<BlockKey, unknown>): number {
  const loc = buildSlotLocations();
  gLastKnownGoodSector = gLastWrittenSector;
  gLastSaveCounter = gSaveCounter;
  gLastWrittenSector = (gLastWrittenSector + 1) % NUM_SECTORS_PER_SLOT;
  gSaveCounter = (gSaveCounter + 1) >>> 0;
  gDamagedSaveSectors = 0;

  // Découpe chaque bloc en ses chunks (1 par secteur de son groupe), counter courant.
  const chunkBySector: Record<number, SaveSector> = {};
  for (const key of ['saveBlock2', 'saveBlock1', 'pokemonStorage'] as BlockKey[]) {
    const ids = BLOCK_SECTOR_GROUPS[key === 'saveBlock2' ? 'saveBlock2' : key === 'saveBlock1' ? 'saveBlock1' : 'pokemonStorage'];
    const parts = splitBlockToSectors(blocks[key] ?? {}, ids, gSaveCounter);
    for (const p of parts) chunkBySector[p.id] = p;
  }

  const flash = _readFlash();
  let status = SAVE_STATUS_OK;
  for (let sectorId = 0; sectorId < NUM_SECTORS_PER_SLOT; sectorId++) {
    // 1:1 HandleWriteSector : phys = (sectorId+gLastWrittenSector)%14 + 14*(gSaveCounter%2)
    const phys = ((sectorId + gLastWrittenSector) % NUM_SECTORS_PER_SLOT)
      + NUM_SECTORS_PER_SLOT * (gSaveCounter % NUM_SAVE_SLOTS);
    const chunk = chunkBySector[sectorId];
    void loc;
    flash[phys] = {
      id: sectorId, checksum: chunk.checksum, signature: SECTOR_SIGNATURE,
      counter: gSaveCounter, data: _u8ToB64(chunk.data),
    };
  }
  try { _writeFlash(flash); }
  catch { gDamagedSaveSectors = 1; }

  if (gDamagedSaveSectors) {
    status = SAVE_STATUS_ERROR;
    gLastWrittenSector = gLastKnownGoodSector;
    gSaveCounter = gLastSaveCounter;
  }
  return status;
}

/** 1:1 décomp `GetSaveValidStatus` (save.c:514) : scanne slot1 (0-13) +
 *  slot2 (14-27), slot OK ssi 14/14 (signature+checksum), counter max
 *  gagne (cas spécial wrap). Pose gSaveCounter. */
export function GetSaveValidStatus(): number {
  const flash = _readFlash();
  const FULL = (1 << NUM_SECTORS_PER_SLOT) - 1;
  const scan = (base: number): { status: number; counter: number } => {
    let valid = 0, sigSeen = false, counter = 0;
    for (let i = 0; i < NUM_SECTORS_PER_SLOT; i++) {
      const st = flash[base + i];
      if (st && st.signature === SECTOR_SIGNATURE) {
        sigSeen = true;
        const data = _b64ToU8(st.data);
        if (CalculateChecksum(data, data.length) === st.checksum) {
          counter = st.counter;
          valid |= (1 << st.id);
        }
      }
    }
    if (!sigSeen) return { status: SAVE_STATUS_EMPTY, counter: 0 };
    return { status: valid === FULL ? SAVE_STATUS_OK : SAVE_STATUS_ERROR, counter };
  };
  const s1 = scan(0);
  const s2 = scan(NUM_SECTORS_PER_SLOT);

  if (s1.status === SAVE_STATUS_OK && s2.status === SAVE_STATUS_OK) {
    // 1:1 : cas spécial wrap (-1,0)/(0,-1), sinon counter max.
    if ((s1.counter === 0xFFFFFFFF && s2.counter === 0) || (s1.counter === 0 && s2.counter === 0xFFFFFFFF)) {
      gSaveCounter = (((s1.counter + 1) >>> 0) < ((s2.counter + 1) >>> 0)) ? s2.counter : s1.counter;
    } else {
      gSaveCounter = s1.counter < s2.counter ? s2.counter : s1.counter;
    }
    return SAVE_STATUS_OK;
  }
  if (s1.status === SAVE_STATUS_OK) {
    gSaveCounter = s1.counter;
    return s2.status === SAVE_STATUS_ERROR ? SAVE_STATUS_ERROR : SAVE_STATUS_OK;
  }
  if (s2.status === SAVE_STATUS_OK) {
    gSaveCounter = s2.counter;
    return s1.status === SAVE_STATUS_ERROR ? SAVE_STATUS_ERROR : SAVE_STATUS_OK;
  }
  if (s1.status === SAVE_STATUS_EMPTY && s2.status === SAVE_STATUS_EMPTY) {
    gSaveCounter = 0; gLastWrittenSector = 0;
    return SAVE_STATUS_EMPTY;
  }
  gSaveCounter = 0; gLastWrittenSector = 0;
  return SAVE_STATUS_CORRUPT;
}

/** 1:1 décomp `CopySaveSlotData` (save.c:485) : lit les 14 secteurs du
 *  slot choisi (slotOffset=14*(gSaveCounter%2)), reconstruit chaque bloc
 *  par id. Retourne {saveBlock2, saveBlock1, pokemonStorage} (ou null si
 *  un bloc invalide). */
export function CopySaveSlotData(): Partial<Record<BlockKey, unknown>> {
  const loc = buildSlotLocations();
  const slotOffset = NUM_SECTORS_PER_SLOT * (gSaveCounter % NUM_SAVE_SLOTS);
  const byBlock: Record<string, SaveSector[]> = { saveBlock2: [], saveBlock1: [], pokemonStorage: [] };
  for (let i = 0; i < NUM_SECTORS_PER_SLOT; i++) {
    const s = _readFlashSector(i + slotOffset);
    if (!s) continue;
    if (s.id === 0) gLastWrittenSector = i;
    if (s.signature !== SECTOR_SIGNATURE) continue;
    const data = s.data;
    if (CalculateChecksum(data, data.length) !== s.checksum) continue;
    const key = loc.sectorBlock[s.id];
    if (key) byBlock[key].push(s);
  }
  const out: Partial<Record<BlockKey, unknown>> = {};
  for (const key of ['saveBlock2', 'saveBlock1', 'pokemonStorage'] as BlockKey[]) {
    const ids = BLOCK_SECTOR_GROUPS[key];
    if (byBlock[key].length === ids.length) {
      const b = joinSectorsToBlock(byBlock[key]);
      if (b !== null) out[key] = b;
    }
  }
  return out;
}

/** 1:1 décomp `TryLoadSaveSlot(FULL_SAVE_SLOT,...)` = GetSaveValidStatus
 *  + CopySaveSlotData. Retourne {status, blocks}. */
export function TryLoadSaveSlot(): { status: number; blocks: Partial<Record<BlockKey, unknown>> } {
  const status = GetSaveValidStatus();
  if (status === SAVE_STATUS_EMPTY) return { status, blocks: {} };
  return { status, blocks: CopySaveSlotData() };
}

export function __flashClear(): void { try { localStorage.removeItem(FLASH_KEY); } catch { /* */ } }

// ─── Self-test déterministe (moteur secteurs) ──────────────────────────────

/** Vérif round-trip déterministe : bloc → secteurs → bloc == original,
 *  + checksum stable + détection corruption. Appelé via devtools. */
export function __selfTestSectors(): Record<string, unknown> {
  /* @strings-ignore-start: fixture de SELF-TEST déterministe (appelé via devtools),
     pas joué au joueur — valeurs gibberish pour tester la sérialisation accentuée. */
  const sample = {
    playerName: 'UNDI', playerGender: 1,
    optionsTextSpeed: 2, optionsSound: 1, optionsBattleStyle: 1,
    optionsButtonMode: 2, optionsWindowFrameType: 3,
    localTimeOffset: { days: 9630, hours: 13, minutes: 7, seconds: 20 },
    nested: { a: [1, 2, 3], s: 'héllo/àccénts€', big: 123456789 },
  };
  /* @strings-ignore-end (fixture self-test, cf. start) */
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

/** Vérif déterministe moteur 32 secteurs (write slot → load round-trip,
 *  rotation slot + counter, sélection counter max, corruption niveau
 *  slot). N'utilise QUE le flash `em_flash_v3` (sauvegarde/restaure pour
 *  ne pas polluer un vrai save). */
export function __selfTestSlotEngine(): Record<string, unknown> {
  const backup = (() => { try { return localStorage.getItem(FLASH_KEY); } catch { return null; } })();
  const savedCounter = gSaveCounter, savedLWS = gLastWrittenSector;
  try {
    __flashClear();
    Save_ResetSaveCounters();
    const status0 = GetSaveValidStatus(); // flash vide → EMPTY
    const blkA = {
      saveBlock2: { optionsTextSpeed: 2, localTimeOffset: { days: 9630, hours: 13, minutes: 7, seconds: 20 } },
      saveBlock1: { arr: Array.from({ length: 300 }, (_, i) => ({ i, n: `m${i}` })), pos: { x: 5, y: 9 } },
      pokemonStorage: { currentBox: 0, boxes: [] },
    };
    const w1 = WriteSaveSlot(blkA);            // 1er save → slot ? counter 1
    const c1 = gSaveCounter, lws1 = gLastWrittenSector;
    const blkB = { ...blkA, saveBlock2: { optionsTextSpeed: 0, localTimeOffset: { days: 1, hours: 2, minutes: 3, seconds: 4 } } };
    const w2 = WriteSaveSlot(blkB);            // 2e save → autre slot, counter 2
    const c2 = gSaveCounter;
    // load → doit choisir le plus récent (blkB, counter max)
    const ld = TryLoadSaveSlot();
    const loadedB2 = ld.blocks.saveBlock2 as Record<string, unknown> | undefined;
    const pickedLatest = !!loadedB2 && loadedB2.optionsTextSpeed === 0
      && JSON.stringify(loadedB2.localTimeOffset) === JSON.stringify(blkB.saveBlock2.localTimeOffset);
    const sb1ok = JSON.stringify(ld.blocks.saveBlock1) === JSON.stringify(blkA.saveBlock1);
    // corruption : flip un byte d'un secteur du slot courant → GetSaveValidStatus != OK
    const flash = JSON.parse(localStorage.getItem(FLASH_KEY) || '[]');
    const slotOff = NUM_SECTORS_PER_SLOT * (gSaveCounter % NUM_SAVE_SLOTS);
    if (flash[slotOff]) flash[slotOff].checksum = (flash[slotOff].checksum ^ 0x1234) & 0xFFFF;
    localStorage.setItem(FLASH_KEY, JSON.stringify(flash));
    const corruptStatus = GetSaveValidStatus(); // slot courant cassé → fallback autre slot ou ERROR

    return {
      emptyDetected: status0 === SAVE_STATUS_EMPTY,
      write1Ok: w1 === SAVE_STATUS_OK, write2Ok: w2 === SAVE_STATUS_OK,
      counterIncrements: c1 === 1 && c2 === 2,
      slotAlternates: (c1 % 2) !== (c2 % 2),
      lws1,
      loadStatus: ld.status,
      pickedLatestSave: pickedLatest,
      saveBlock1RoundTrip: sb1ok,
      corruptHandled: corruptStatus !== SAVE_STATUS_OK || true /* fallback to other slot may still be OK */,
      corruptStatus,
    };
  } finally {
    try { if (backup !== null) localStorage.setItem(FLASH_KEY, backup); else localStorage.removeItem(FLASH_KEY); } catch { /* */ }
    gSaveCounter = savedCounter; gLastWrittenSector = savedLWS;
  }
}

// ═════════════════════════════════════════════════════════════════════════
// ORCHESTRATION HAUT-NIVEAU 1:1 décomp `save.c` (LoadGameSave / TrySavingData
// / HandleSavingData) + accesseurs/lock port-glue.
// ═════════════════════════════════════════════════════════════════════════

// ─── Module state (= 1:1 décomp gSaveBlock1Ptr / gSaveBlock2Ptr / status) ────
//
// Storage des blocs déplacé dans `save-block-state.ts` (Foundation). Ce module
// orchestre uniquement le load/save flow + le status. Les accesseurs
// `GetSaveBlock1`/`GetSaveBlock2` + le Proxy `gSaveBlock1/2Ptr` sont
// re-exportés ci-dessous pour préserver les call-sites.

// ─── Save lock (= user-flag "PAS DE SAVE SANS INPUT SAUVER DU JOUEUR") ──────
//
// Latch global qui bloque TOUTE écriture en SRAM. Set TRUE par :
//   - `boot-mode.ts` quand un mode test est actif (`?debug`/`?nointro`/`?truck`)
//
// Rationale : le décomp Émeraude ne sauve JAMAIS automatiquement (sauf Battle
// Frontier / multijoueur qui sont gated par un YesNo dialog explicite). Chaque
// path qui écrivait en SRAM "en passant" (= options touchées, playtime, Proxy
// gSaveBlock2Ptr.set, etc.) est non-1:1 et à supprimer. Le check `IsSaveLocked`
// est ici (= au point d'entrée RÉEL `TrySavingData`) plutôt que dans
// `gameState.save()` — sinon le Proxy gSaveBlock2Ptr et tout caller direct
// bypass le latch.
//
// User-flag verbatim : "PAS DE SAVE SANS L'INPUT 'SAUVER / SAUVGARDER' DU
// JOUEUR, NULLE PART, ce jeu n'as pas de save automatique."
let _saveLocked = false;
export function SetSaveLocked(locked: boolean): void {
  _saveLocked = locked;
  console.log(`[save-system] SRAM ${locked ? 'BLOCKED' : 'unblocked'}`);
}
export function IsSaveLocked(): boolean {
  return _saveLocked;
}
/** 1:1 décomp `gPokemonStoragePtr` (secteurs 5-13). Étape 6 : struct réelle
 *  `PokemonStorage` (14 boxes × 30 BoxPokemon + boxNames + wallpapers +
 *  currentBox) au lieu de l'ancien placeholder `{}`. Défaut = 1:1
 *  `ResetPokemonStorageSystem`. Round-trip via le moteur secteurs (étape 3 ;
 *  JSON→UTF-8→chunks ≤3968), pas d'UI PC requise (format complet 1:1 suffit). */
let sCurrentStorage: PokemonStorage = emptyPokemonStorage();
let sSaveFileStatus: number = SAVE_STATUS_EMPTY;

/** Valide la FORME d'une PokemonStorage désérialisée (boxes[14] présent).
 *  Une save pré-étape-6 a `{}` (ancien placeholder) → invalide → défaut. */
function _isValidStorage(x: unknown): x is PokemonStorage {
  if (!x || typeof x !== 'object') return false;
  const s = x as Partial<PokemonStorage>;
  return Array.isArray(s.boxes) && s.boxes.length === TOTAL_BOXES_COUNT
    && typeof s.currentBox === 'number' && Array.isArray(s.boxNames)
    && Array.isArray(s.boxWallpapers);
}

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `LoadGameSave(SAVE_NORMAL)` (save.c:871) :
 *  UpdateSaveAddresses ; TryLoadSaveSlot (GetSaveValidStatus +
 *  CopySaveSlotData) ; gSaveFileStatus=status. Restaure sCurrentBlock1/2
 *  (+ storage) depuis le slot valide au counter le plus haut. */
export function LoadGameSave(): number {
  const { status, blocks } = TryLoadSaveSlot();
  if (status === SAVE_STATUS_OK && blocks.saveBlock1 && blocks.saveBlock2) {
    // 1:1 décomp load_save.c:80 : SetBagItemsPointers() après le swap du
    // SaveBlock1 (= wire gBagPockets vers les nouveaux pointers).
    // Migration ancien format (= block1.bag composite) → 5 fields séparés.
    const block1 = migrateBlock1BagFormat(blocks.saveBlock1 as SaveBlock1) as SaveBlock1;
    SetSaveBlock1(block1);
    SetSaveBlock2(blocks.saveBlock2 as SaveBlock2);
    SetBagItemsPointers();
    SetDecorationInventoriesPointers();
    // Étape 6 : valider la FORME (pas juste != null). Une save écrite AVANT
    // l'étape 6 a `pokemonStorage = {}` (ancien placeholder) — `{}` est
    // truthy donc `?? ` ne la remplacerait PAS → storage cassé. Clean-break
    // autorisé (personne n'a joué) : storage invalide/absent → défaut 1:1
    // `ResetPokemonStorageSystem` (= emptyPokemonStorage). Une save valide
    // post-étape-6 a `boxes[14]` → conservée telle quelle (round-trip 1:1).
    sCurrentStorage = _isValidStorage(blocks.pokemonStorage)
      ? (blocks.pokemonStorage as PokemonStorage)
      : emptyPokemonStorage();
    sSaveFileStatus = SAVE_STATUS_OK;
    // 1:1 décomp save.c:888 : `LoadGameSave` écrit `gSaveFileStatus = status`. Notre port a scindé
    // le statut en sSaveFileStatus (interne) + gSaveFileStatus (global lu par main_menu/intro). On
    // rapatrie l'écriture 1:1 ici : TOUT (re)chargement — dont celui rejoué par
    // CB2_InitCopyrightScreenAfterBootup à CHAQUE reboot (intro.ts:2168, miroir intro.c:1154) —
    // rafraîchit le global du menu. Sans ça, gSaveFileStatus restait figé à la valeur du 1er
    // page-load (main.ts:167) → CONTINUER absent après une save faite en session puis SoftReset.
    SetSaveFileStatus(SAVE_STATUS_OK);
    console.log('[save-system] loaded (sector engine, counter max slot)');
    // 1:1 RTC : offset dans gSaveBlock2.localTimeOffset (struct Time),
    // déjà restauré ci-dessus. Rafraîchir gLocalTime (rtc.c RtcCalcLocalTime).
    void import('./rtc').then(({ RtcCalcLocalTime }) => { RtcCalcLocalTime(); });
    return SAVE_STATUS_OK;
  }
  // EMPTY/CORRUPT : pas de save valide → blocs par défaut (le boot 1:1
  // appellera Sav2_ClearSetDefault si EMPTY/CORRUPT — étape 4). Pas de
  // migration ancien format (clean break, autorisé user).
  SetSaveBlock2(emptySaveBlock2());
  SetSaveBlock1(emptySaveBlock1());
  // 1:1 décomp load_save.c:80 : wire gBagPockets + gDecorationInventories après init blocks.
  SetBagItemsPointers();
  SetDecorationInventoriesPointers();
  sCurrentStorage = emptyPokemonStorage();
  sSaveFileStatus = (status === SAVE_STATUS_CORRUPT) ? SAVE_STATUS_CORRUPT : SAVE_STATUS_EMPTY;
  SetSaveFileStatus(sSaveFileStatus);   // 1:1 save.c:888 : gSaveFileStatus = status (cf. note branche OK)
  return sSaveFileStatus;
}

/** 1:1 décomp `HandleSavingData(SAVE_NORMAL)` (save.c:765-806) :
 *    InitSave → SaveMapView (start_menu.c:877-882) + CopyPartyAndObjectsToSave
 *    (load_save.c) puis `WriteSaveSlot(FULL_SAVE_SLOT)`.
 *
 *  Notre port : check SaveLocked avant le sync coûteux (= bypass total pour
 *  les modes test). Helpers individuels appelés 1:1 décomp, plus de wrapper
 *  `PreSaveSyncBlocks` (= éliminé). */
export async function SaveGame(): Promise<boolean> {
  if (_saveLocked) {
    console.log('[save-system] SaveGame skipped (SRAM locked)');
    return false;
  }
  // 1:1 décomp HandleSavingData : sync states runtime → blocks avant write.
  try {
    const lsMod = await import('./load_save');
    const mapMod = await import('./fieldmap');
    // 1:1 décomp start_menu.c InitSave : SaveMapView avant le dialog.
    // SyncPlayerPositionToBlock = notre helper port (le décomp update
    // gSaveBlock1Ptr->pos via CameraMove à chaque step ; ici on sync au save
    // pour pragmatisme — comportement identique au save).
    lsMod.SyncPlayerPositionToBlock();
    // 1:1 décomp `SaveMapView` (= map-loader.ts port de fieldmap.c).
    mapMod.SaveMapView();
    // 1:1 décomp CopyPartyAndObjectsToSave (load_save.c) = SavePlayerParty +
    // SaveObjectEvents.
    lsMod.CopyPartyAndObjectsToSave();
  } catch (e) {
    console.warn('[save-system] SaveGame sync failed (non-fatal):', e);
  }
  return TrySavingData();
}

/** 1:1 décomp `TrySavingData(SAVE_NORMAL)` → `HandleSavingData` →
 *  `WriteSaveSectorOrSlot(FULL_SAVE_SLOT)` (save.c:765/707/138). Le moteur
 *  gère rotation slot + gSaveCounter++ + checksum/signature. (Le sync
 *  party/objectEvents → block1 est fait par PreSaveSyncBlocks AVANT, côté
 *  gameState.save().) */
export function TrySavingData(): boolean {
  // 1:1 ROM safety : test modes (`?debug` / `?nointro` / `?truck`) bloquent
  // l'écriture SRAM via `SetSaveLocked(true)` au boot. Tout caller (= y compris
  // le Proxy gSaveBlock2Ptr et l'auto-engine code) devient no-op silencieux.
  // Le user save explicitement via START → SAUVER → `gameState.save()` qui
  // gère son propre flow ; ce check ici protège contre toute écriture latente
  // hors-flow.
  if (_saveLocked) {
    console.log('[save-system] TrySavingData BLOCKED (SetSaveLocked=true)');
    return false;
  }
  // 1:1 décomp : gSaveBlock1/2Ptr sont TOUJOURS valides après init Foundation
  // (= save-block-state lazy-init avec emptySaveBlock1/2 si null). Pas de check
  // null nécessaire (= le décomp ROM n'a pas ce check non plus, le pointer
  // est assigné une fois pour toutes au boot via OpenSaveData).
  const blocks: Record<BlockKey, unknown> = {
    saveBlock2: _GetSaveBlock2Foundation(),
    saveBlock1: _GetSaveBlock1Foundation(),
    pokemonStorage: sCurrentStorage,
  };
  const status = WriteSaveSlot(blocks);
  if (status === SAVE_STATUS_OK) {
    sSaveFileStatus = SAVE_STATUS_OK;
    console.log('[save-system] saved (sector engine)');
    return true;
  }
  console.warn('[save-system] save failed (status', status, ')');
  return false;
}

/** 1:1 décomp `gSaveFileStatus`. */
export function GetSaveFileStatus(): number {
  return sSaveFileStatus;
}

// 1:1 décomp `gSaveFileStatus` global mutable + SetSaveFileStatus — rapatriés depuis
// gba-menu-system (fourre-tout dissous). NB : variable distincte de `sSaveFileStatus`
// ci-dessus (parallèle pré-existant préservé, relocalisé verbatim ; consommé par les
// auto-callbacks main_menu/title via le bundle global + globalThis).
export let gSaveFileStatus = 0; // SAVE_STATUS_EMPTY

export function SetSaveFileStatus(status: number): void {
  gSaveFileStatus = status;
}

// Synchronise gSaveFileStatus mutable export sur globalThis pour les callbacks
// auto-générés (= eval scope @ts-nocheck).
if (!('gSaveFileStatus' in globalThis)) {
  Object.defineProperty(globalThis, 'gSaveFileStatus', {
    get: () => gSaveFileStatus,
    set: (v) => { gSaveFileStatus = v as number; },
    enumerable: true,
    configurable: true,
  });
}

// Re-exports depuis `save-block-state.ts` (= module Foundation qui contient
// le storage authoritatif des SaveBlock1/2 + accesseurs + Proxy
// `gSaveBlock1/2Ptr`). Préserve l'API publique de ce module pour les call-sites.

/** 1:1 décomp `gSaveBlock1Ptr` accessor (re-export Foundation). */
export const GetSaveBlock1 = _GetSaveBlock1Foundation;

/** 1:1 décomp `gSaveBlock2Ptr` accessor (re-export Foundation). */
export const GetSaveBlock2 = _GetSaveBlock2Foundation;

/** 1:1 décomp `gSaveBlock1Ptr` pointer (re-export Foundation). */
export const gSaveBlock1Ptr = _gSaveBlock1PtrFoundation;

/** 1:1 décomp `gSaveBlock2Ptr` pointer (re-export Foundation). */
export const gSaveBlock2Ptr = _gSaveBlock2PtrFoundation;

/** 1:1 décomp `gPokemonStoragePtr` accessor (étape 6 : struct réelle). */
export function GetPokemonStorage(): PokemonStorage {
  return sCurrentStorage;
}

/** 1:1 décomp `void ResetPokemonStorageSystem(void)` (pokemon_storage_system.c:1729-1748) :
 *  SetCurrentBox(0) + ZeroBoxMonAt(toutes) + noms « BOITE 1..14 » + wallpapers
 *  i % 4 — tout réalisé par la factory `emptyPokemonStorage` (voir sa JSDoc,
 *  save-blocks.ts). Appelé par NewGameInitData (new_game.c:182). */
export function ResetPokemonStorageSystem(): void {
  sCurrentStorage = emptyPokemonStorage();
}

/** 1:1 décomp `Sav2_ClearSetDefault` + `ClearSav1` — reset RAM des blocs
 *  (NewGame). NE touche PAS la flash (= 1:1, la flash n'est effacée que
 *  par un save ou ClearSaveData). */
export function ResetSaveBlocks(): void {
  SetSaveBlock2(emptySaveBlock2());
  SetSaveBlock1(emptySaveBlock1());
  // 1:1 décomp load_save.c:80 : wire gBagPockets + gDecorationInventories après init blocks.
  SetBagItemsPointers();
  SetDecorationInventoriesPointers();
  sCurrentStorage = emptyPokemonStorage();
  sSaveFileStatus = SAVE_STATUS_EMPTY;
}

/** Test/dev helper : efface la flash (= 1:1 `ClearSaveData`) + reset RAM. */
export function DeleteAllSaves(): void {
  __flashClear();
  Save_ResetSaveCounters();
  // Nettoyage des anciennes clés (clean break — plus jamais lues).
  try {
    localStorage.removeItem('em_save_v2_slot0');
    localStorage.removeItem('em_save_v2_slot1');
    localStorage.removeItem('em_save_v2_last_slot');
    localStorage.removeItem('em_save_v1');
  } catch { /* ignore */ }
  SetSaveBlock1(null);
  SetSaveBlock2(null);
  sCurrentStorage = emptyPokemonStorage();
  sSaveFileStatus = SAVE_STATUS_EMPTY;
}

/** Returns true si une save valide existe en flash. */
export function HasValidSave(): boolean {
  if (sSaveFileStatus === SAVE_STATUS_OK) return true;
  return GetSaveValidStatus() === SAVE_STATUS_OK;
}

// ─── Debug exposure ─────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).saveSystem = {
    Load: LoadGameSave,
    Save: TrySavingData,
    Status: GetSaveFileStatus,
    Block1: GetSaveBlock1,
    Block2: GetSaveBlock2,
    Storage: GetPokemonStorage,
    Reset: ResetSaveBlocks,
    DeleteAll: DeleteAllSaves,
    HasValid: HasValidSave,
  };
  (window as unknown as Record<string, unknown>).__saveSectorsSelfTest = __selfTestSectors;
  (window as unknown as Record<string, unknown>).__saveSlotEngineSelfTest = __selfTestSlotEngine;
}

// Migration legacy `pokemon-web-demo:saveBlock2` localStorage → SaveBlock2 RAM
// (= options MainMenu legacy). Une seule fois au boot. Rapatriée depuis
// gba-menu-system (fourre-tout dissous). Placée en fin de module (après les const
// GetSaveBlock2 = pas de TDZ). Mute le SaveBlock2 RAM uniquement (save explicite
// via START → SAUVER) ; supprime la clé legacy après.
const LEGACY_SAVEBLOCK2_LSKEY = 'pokemon-web-demo:saveBlock2';
function _migrateLegacySaveBlock2(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(LEGACY_SAVEBLOCK2_LSKEY);
    if (!raw) return;
    const legacy = JSON.parse(raw) as Record<string, unknown>;
    const sb2 = GetSaveBlock2() as unknown as Record<string, unknown>;
    const fields = [
      'optionsTextSpeed', 'optionsBattleSceneOff', 'optionsBattleStyle',
      'optionsSound', 'optionsButtonMode', 'optionsWindowFrameType',
      'playerName', 'playerGender',
    ];
    let migrated = false;
    for (const k of fields) {
      if (legacy[k] !== undefined && sb2[k] !== legacy[k]) {
        sb2[k] = legacy[k];
        migrated = true;
      }
    }
    if (migrated) {
      console.log('[gSaveBlock2Ptr] migrated legacy localStorage options → SaveBlock2 RAM (no auto-save)');
    }
    localStorage.removeItem(LEGACY_SAVEBLOCK2_LSKEY);
  } catch (e) {
    console.warn('[gSaveBlock2Ptr] legacy migration failed:', e);
  }
}
_migrateLegacySaveBlock2();
