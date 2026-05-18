/**
 * save-system.ts — Save system 1:1 décomp `src/save.c` + `src/load_save.c`.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/save.c` (TrySavingData, ReadFlashSector,
 *     CalculateChecksum, GetSaveValidStatus)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/save.h` (SECTOR_*, SaveSector struct)
 *
 * Sémantique 1:1 décomp préservée :
 *   - 2 SLOTS (= sectors 0..13 et 14..27 dans la ROM ; localStorage keys ici).
 *   - Alternation : save écrit dans le slot OPPOSÉ au dernier slot écrit
 *     (= si current save corrupt, fallback sur l'autre slot).
 *   - COUNTER : incrémenté à chaque save. Load pick le slot avec le plus haut
 *     counter valide.
 *   - SIGNATURE : 0x8012025 — sentinel pour slot valide.
 *   - CHECKSUM : sum-based (= 1:1 décomp CalculateChecksum sur les bytes).
 *
 * Adaptation web :
 *   - Pas de flash sectors réels. Stockage en localStorage as JSON.
 *   - Checksum calculé sur le JSON serialized (= equivalent sémantique).
 *   - Pas de secteurs split (= SaveBlock1 split en 4 chunks dans le décomp
 *     pour fit dans des sectors 4KB ; on stocke d'un bloc en JSON).
 *
 * Compat : ancien format `em_save_v1` migré au load si trouvé.
 */

import {
  type SaveBlock1,
  type SaveBlock2,
  emptySaveBlock1,
  emptySaveBlock2,
} from './save-blocks';
import { emptyBag } from './bag';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

/** 1:1 décomp `#define SECTOR_SIGNATURE 0x8012025` (save.h). */
export const SECTOR_SIGNATURE = 0x8012025;

/** 1:1 décomp `#define NUM_SAVE_SLOTS 2`. */
export const NUM_SAVE_SLOTS = 2;

/** SAVE_STATUS_* values 1:1 décomp (save.h). */
export const SAVE_STATUS_EMPTY = 0;
export const SAVE_STATUS_OK = 1;
export const SAVE_STATUS_CORRUPT = 2;
export const SAVE_STATUS_NO_FLASH = 4;
export const SAVE_STATUS_ERROR = 0xFF;

// ─── Storage keys ────────────────────────────────────────────────────────────

const STORAGE_KEY_SLOT0 = 'em_save_v2_slot0';
const STORAGE_KEY_SLOT1 = 'em_save_v2_slot1';
const STORAGE_KEY_LAST_SLOT = 'em_save_v2_last_slot';
/** Ancien format MVP — migré au load si trouvé. */
const STORAGE_KEY_LEGACY_V1 = 'em_save_v1';

// ─── Slot envelope ───────────────────────────────────────────────────────────

interface SaveSlot {
  /** 1:1 décomp `SaveSector.signature` — magic value pour valider le slot. */
  signature: number;
  /** 1:1 décomp `SaveSector.counter` — incrémenté à chaque save. Load pick max. */
  counter: number;
  /** 1:1 décomp `SaveSector.checksum` — sum-based hash de block1+block2. */
  checksum: number;
  /** 1:1 décomp version : on ajoute une version pour migration future. */
  version: number;
  /** 1:1 décomp `SaveBlock2`. */
  block2: SaveBlock2;
  /** 1:1 décomp `SaveBlock1`. */
  block1: SaveBlock1;
}

const SAVE_FORMAT_VERSION = 2;

// ─── Module state ────────────────────────────────────────────────────────────

/** Counter global (= incrementé à chaque TrySavingData). */
let sSaveCounter = 0;
/** Last slot écrit (0 ou 1). Read au boot pour alternation. */
let sLastSavedSlot = -1;
/** Block2 + block1 en mémoire (= 1:1 décomp gSaveBlock1Ptr / gSaveBlock2Ptr). */
let sCurrentBlock1: SaveBlock1 | null = null;
let sCurrentBlock2: SaveBlock2 | null = null;
/** Save file status (= SAVE_STATUS_*). */
let sSaveFileStatus = SAVE_STATUS_EMPTY;

// ─── Checksum (= 1:1 décomp save.c CalculateChecksum) ───────────────────────

/** Sum-based hash sur la string JSON. 1:1 décomp esprit (= u32 sum + carry).
 *  Pas byte-exact car notre format est JSON, pas binary. */
function calculateChecksum(serialized: string): number {
  let sum = 0;
  for (let i = 0; i < serialized.length; i += 4) {
    const c0 = serialized.charCodeAt(i) | 0;
    const c1 = serialized.charCodeAt(i + 1) | 0;
    const c2 = serialized.charCodeAt(i + 2) | 0;
    const c3 = serialized.charCodeAt(i + 3) | 0;
    const word = (c0 | (c1 << 8) | (c2 << 16) | (c3 << 24)) >>> 0;
    sum = (sum + word) >>> 0;
  }
  // 1:1 décomp : `return (checksum >> 16) + checksum;` — folded to 16-bit.
  return ((sum >>> 16) + (sum & 0xFFFF)) & 0xFFFF;
}

// ─── Slot serialization ──────────────────────────────────────────────────────

function serializeSlot(slot: SaveSlot): string {
  return JSON.stringify(slot);
}

function deserializeSlot(raw: string): SaveSlot | null {
  try {
    const obj = JSON.parse(raw) as SaveSlot;
    if (typeof obj.signature !== 'number' || obj.signature !== SECTOR_SIGNATURE) return null;
    if (typeof obj.counter !== 'number') return null;
    if (typeof obj.block1 !== 'object' || typeof obj.block2 !== 'object') return null;
    return obj;
  } catch {
    return null;
  }
}

/** Lit un slot depuis localStorage. Retourne null si absent ou corrompu. */
function readSlot(slotIdx: number): SaveSlot | null {
  const key = slotIdx === 0 ? STORAGE_KEY_SLOT0 : STORAGE_KEY_SLOT1;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const slot = deserializeSlot(raw);
    if (!slot) return null;
    // Verify checksum.
    const expected = slot.checksum;
    // Re-compute checksum sur les blocks seuls (= sans le checksum field).
    const slotForChecksum: SaveSlot = { ...slot, checksum: 0 };
    const computed = calculateChecksum(JSON.stringify(slotForChecksum));
    if (computed !== expected) {
      console.warn(`[save-system] slot ${slotIdx} checksum mismatch : computed=${computed} expected=${expected}`);
      return null;
    }
    return slot;
  } catch (e) {
    console.warn(`[save-system] readSlot(${slotIdx}) failed:`, e);
    return null;
  }
}

/** Écrit un slot dans localStorage. Calcule le checksum + counter. */
function writeSlot(slotIdx: number, block1: SaveBlock1, block2: SaveBlock2, counter: number): boolean {
  const key = slotIdx === 0 ? STORAGE_KEY_SLOT0 : STORAGE_KEY_SLOT1;
  const slot: SaveSlot = {
    signature: SECTOR_SIGNATURE,
    counter,
    checksum: 0,  // computed below
    version: SAVE_FORMAT_VERSION,
    block1,
    block2,
  };
  // Compute checksum sur tout le slot SANS le checksum (= 1:1 décomp pattern).
  slot.checksum = calculateChecksum(serializeSlot(slot));
  try {
    localStorage.setItem(key, serializeSlot(slot));
    localStorage.setItem(STORAGE_KEY_LAST_SLOT, String(slotIdx));
    return true;
  } catch (e) {
    console.warn(`[save-system] writeSlot(${slotIdx}) failed:`, e);
    return false;
  }
}

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `LoadGameSave(saveType)` (load_save.c).
 *  Read both slots, validate, pick the highest valid counter.
 *  Updates sCurrentBlock1/2 + sSaveCounter + sLastSavedSlot.
 *  Returns SAVE_STATUS_*. */
export function LoadGameSave(): number {
  const slot0 = readSlot(0);
  const slot1 = readSlot(1);

  let chosen: SaveSlot | null = null;
  let chosenIdx = -1;
  if (slot0 && slot1) {
    chosen = slot0.counter >= slot1.counter ? slot0 : slot1;
    chosenIdx = slot0.counter >= slot1.counter ? 0 : 1;
  } else if (slot0) {
    chosen = slot0;
    chosenIdx = 0;
  } else if (slot1) {
    chosen = slot1;
    chosenIdx = 1;
  }

  if (!chosen) {
    // 1:1 décomp : pas de save trouvée → init defaults + status EMPTY.
    sCurrentBlock2 = emptySaveBlock2();
    sCurrentBlock1 = emptySaveBlock1(emptyBag());
    sSaveCounter = 0;
    sLastSavedSlot = -1;
    sSaveFileStatus = SAVE_STATUS_EMPTY;
    // Tentative migration depuis l'ancien format v1.
    _tryMigrateLegacyV1();
    return sSaveFileStatus;
  }

  sCurrentBlock1 = chosen.block1;
  sCurrentBlock2 = chosen.block2;
  sSaveCounter = chosen.counter;
  sLastSavedSlot = chosenIdx;
  sSaveFileStatus = SAVE_STATUS_OK;
  console.log(`[save-system] loaded slot ${chosenIdx} (counter=${chosen.counter})`);
  // 1:1 RTC : l'offset vit dans `sCurrentBlock2.localTimeOffset` (struct
  // Time) — déjà restauré ci-dessus avec block2. On rafraîchit juste
  // gLocalTime (= RtcCalcLocalTime lit gSaveBlock2.localTimeOffset). Plus
  // de champ ms parallèle (modèle 1:1 décomp rtc.c).
  void import('./rtc').then(({ RtcCalcLocalTime }) => {
    if (sCurrentBlock2) RtcCalcLocalTime();
  });
  return SAVE_STATUS_OK;
}

/** 1:1 décomp `TrySavingData(saveType)` (save.c).
 *  Save current blocks vers le slot opposite au dernier saved.
 *  Increment counter. Return true si OK. */
export function TrySavingData(): boolean {
  if (!sCurrentBlock1 || !sCurrentBlock2) {
    console.warn('[save-system] TrySavingData called but no current blocks');
    return false;
  }
  // 1:1 RTC : l'offset est `sCurrentBlock2.localTimeOffset` (struct Time),
  // écrit par rtc.ts (RtcCalcLocalTimeOffset) et sérialisé tel quel dans
  // block2 par writeSlot → round-trip automatique, plus de sync ms.
  // Alternate slots : si dernier = 0, écrire en 1 ; sinon 0.
  const targetSlot = (sLastSavedSlot === 0) ? 1 : 0;
  sSaveCounter++;
  const ok = writeSlot(targetSlot, sCurrentBlock1, sCurrentBlock2, sSaveCounter);
  if (ok) {
    sLastSavedSlot = targetSlot;
    sSaveFileStatus = SAVE_STATUS_OK;
    console.log(`[save-system] saved slot ${targetSlot} (counter=${sSaveCounter})`);
  }
  return ok;
}

/** 1:1 décomp `gSaveFileStatus` (save.c). */
export function GetSaveFileStatus(): number {
  return sSaveFileStatus;
}

/** 1:1 décomp `gSaveBlock1Ptr` accessor. Init si null (= boot ou post-NewGame). */
export function GetSaveBlock1(): SaveBlock1 {
  if (!sCurrentBlock1) sCurrentBlock1 = emptySaveBlock1(emptyBag());
  return sCurrentBlock1;
}

/** 1:1 décomp `gSaveBlock2Ptr` accessor. */
export function GetSaveBlock2(): SaveBlock2 {
  if (!sCurrentBlock2) sCurrentBlock2 = emptySaveBlock2();
  return sCurrentBlock2;
}

/** 1:1 décomp `Sav2_ClearSetDefault` + `ClearSav1` — reset complet pour
 *  nouvelle partie. Reset counter aussi (= NewGame écrit en slot 0). */
export function ResetSaveBlocks(): void {
  sCurrentBlock2 = emptySaveBlock2();
  sCurrentBlock1 = emptySaveBlock1(emptyBag());
  sSaveCounter = 0;
  sLastSavedSlot = -1;
  sSaveFileStatus = SAVE_STATUS_EMPTY;
}

/** Test helper : delete both slots + last saved tracker. */
export function DeleteAllSaves(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SLOT0);
    localStorage.removeItem(STORAGE_KEY_SLOT1);
    localStorage.removeItem(STORAGE_KEY_LAST_SLOT);
    localStorage.removeItem(STORAGE_KEY_LEGACY_V1);
  } catch { /* ignore */ }
  sCurrentBlock1 = null;
  sCurrentBlock2 = null;
  sSaveCounter = 0;
  sLastSavedSlot = -1;
  sSaveFileStatus = SAVE_STATUS_EMPTY;
}

/** Returns true si une save existe (= au moins un slot valide). */
export function HasValidSave(): boolean {
  if (sSaveFileStatus === SAVE_STATUS_OK) return true;
  return readSlot(0) !== null || readSlot(1) !== null;
}

// ─── Migration legacy v1 → v2 ───────────────────────────────────────────────

/** Si une save ancienne format v1 (= em_save_v1 = JSON ad-hoc gameState) est
 *  trouvée, la migrer vers le nouveau format. Une seule fois. */
function _tryMigrateLegacyV1(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEGACY_V1);
    if (!raw) return;
    const legacy = JSON.parse(raw) as Record<string, unknown>;
    if (!sCurrentBlock1 || !sCurrentBlock2) return;
    // Migrate fields connus.
    if (typeof legacy.playerName === 'string') sCurrentBlock2.playerName = legacy.playerName;
    if (legacy.gender === 'FEMALE') sCurrentBlock2.playerGender = 1;
    else if (legacy.gender === 'MALE') sCurrentBlock2.playerGender = 0;
    if (legacy.flags && typeof legacy.flags === 'object') {
      sCurrentBlock1.flags = legacy.flags as Record<string, true>;
    }
    if (legacy.vars && typeof legacy.vars === 'object') {
      sCurrentBlock1.vars = legacy.vars as Record<string, number>;
    }
    if (legacy.options && typeof legacy.options === 'object') {
      const o = legacy.options as Record<string, number>;
      if (typeof o.textSpeed === 'number') sCurrentBlock2.optionsTextSpeed = o.textSpeed;
      if (typeof o.battleSceneOff === 'number') sCurrentBlock2.optionsBattleSceneOff = o.battleSceneOff;
      if (typeof o.battleStyle === 'number') sCurrentBlock2.optionsBattleStyle = o.battleStyle;
      if (typeof o.sound === 'number') sCurrentBlock2.optionsSound = o.sound;
      if (typeof o.buttonMode === 'number') sCurrentBlock2.optionsButtonMode = o.buttonMode;
      if (typeof o.windowFrameType === 'number') sCurrentBlock2.optionsWindowFrameType = o.windowFrameType;
    }
    if (legacy.bag && typeof legacy.bag === 'object') {
      sCurrentBlock1.bag = legacy.bag as SaveBlock1['bag'];
    }
    // Migrate map (= legacy.map = { name, x, y, facing }).
    if (legacy.map && typeof legacy.map === 'object') {
      const m = legacy.map as { name?: string; x?: number; y?: number; facing?: number };
      if (m.name && typeof m.x === 'number' && typeof m.y === 'number') {
        // Map name → location.mapGroup/mapNum mapping pas trivial.
        // Stockons juste continueGameWarp avec x/y et un placeholder.
        sCurrentBlock1.continueGameWarp = {
          mapGroup: 0, mapNum: 0, warpId: -1,
          x: m.x, y: m.y,
        };
        sCurrentBlock1.pos = { x: m.x, y: m.y };
      }
    }
    sSaveFileStatus = SAVE_STATUS_OK;
    console.log('[save-system] migrated legacy v1 save → v2');
    // Save migrated data + delete legacy key.
    TrySavingData();
    localStorage.removeItem(STORAGE_KEY_LEGACY_V1);
  } catch (e) {
    console.warn('[save-system] legacy migration failed:', e);
  }
}

// ─── Debug exposure ─────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).saveSystem = {
    Load: LoadGameSave,
    Save: TrySavingData,
    Status: GetSaveFileStatus,
    Block1: GetSaveBlock1,
    Block2: GetSaveBlock2,
    Reset: ResetSaveBlocks,
    DeleteAll: DeleteAllSaves,
    HasValid: HasValidSave,
  };
}
