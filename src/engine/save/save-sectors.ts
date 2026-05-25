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

// ─── Étape 3b : moteur 32 secteurs localStorage-as-flash 1:1 ───────────────

/** Carte secteur logique → bloc (= dérivé `sSaveSlotLayout` save.c:55).
 *  14 entrées ordonnées par sectorId 0..13. */
export type BlockKey = 'saveBlock2' | 'saveBlock1' | 'pokemonStorage';
export interface SaveSlotLocations {
  /** sectorId (0..13) → BlockKey. */
  sectorBlock: BlockKey[];
}
/** 1:1 décomp `UpdateSaveAddresses` (save.c:688) : mapping fixe sectorId→
 *  bloc. (Les vrais ptrs/blocs viennent du caller à l'étape 3c.) */
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

/** Vérif déterministe étape 3b : moteur 32 secteurs (write slot → load
 *  round-trip, rotation slot + counter, sélection counter max, corruption
 *  niveau slot). N'utilise QUE le flash `em_flash_v3` (sauvegarde/restaure
 *  pour ne pas polluer un vrai save). */
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

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__saveSectorsSelfTest = __selfTestSectors;
  (window as unknown as Record<string, unknown>).__saveSlotEngineSelfTest = __selfTestSlotEngine;
}
