/**
 * save-system.ts — Save system 1:1 décomp `src/save.c` + `src/load_save.c`.
 *
 * Étape 3c du chantier SAVE-SYSTEM-1TO1-PLAN.md : wire le moteur de
 * secteurs 1:1 (`save-sectors.ts`) au save live. L'ANCIEN format JSON
 * 2-slots ad-hoc + la migration legacy v1 sont SUPPRIMÉS (clean break,
 * autorisé user : "personne n'y a joué à part moi, code mort inutile").
 *
 * Modèle (1:1 décomp) :
 *   - "Flash" = `em_flash_v3` (localStorage) : 28 secteurs (slot1 0-13,
 *     slot2 14-27), footer {id,checksum,signature 0x8012025,counter}.
 *   - SaveBlock2 = secteur 0 ; SaveBlock1 = 1-4 ; PokemonStorage = 5-13
 *     (placeholder vide jusqu'à l'étape 6). Structs sérialisées ENTIÈRES
 *     (zéro sous-ensemble) → tout round-trip (options, RTC offset, flags,
 *     vars, party, pos…).
 *   - LoadGameSave = TryLoadSaveSlot (GetSaveValidStatus + CopySaveSlot
 *     Data) ; TrySavingData = WriteSaveSlot (rotation slot + counter++).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/save.c`,
 * `include/save.h` (cf. save-sectors.ts pour les primitives 1:1).
 */

import {
  type SaveBlock1,
  type SaveBlock2,
  emptySaveBlock1,
  emptySaveBlock2,
} from './save-blocks';
import { emptyBag } from './bag';
import {
  WriteSaveSlot, TryLoadSaveSlot, GetSaveValidStatus, Save_ResetSaveCounters,
  __flashClear, type BlockKey,
  SAVE_STATUS_EMPTY as SS_EMPTY, SAVE_STATUS_OK as SS_OK,
  SAVE_STATUS_CORRUPT as SS_CORRUPT, SAVE_STATUS_NO_FLASH as SS_NOFLASH,
  SAVE_STATUS_ERROR as SS_ERR, SECTOR_SIGNATURE as SECT_SIG,
  NUM_SAVE_SLOTS as NSLOTS,
} from './save-sectors';

// ─── Constants 1:1 décomp (ré-exports pour les callers existants) ────────────

export const SECTOR_SIGNATURE = SECT_SIG;
export const NUM_SAVE_SLOTS = NSLOTS;
export const SAVE_STATUS_EMPTY = SS_EMPTY;
export const SAVE_STATUS_OK = SS_OK;
export const SAVE_STATUS_CORRUPT = SS_CORRUPT;
export const SAVE_STATUS_NO_FLASH = SS_NOFLASH;
export const SAVE_STATUS_ERROR = SS_ERR;

// ─── Module state (= 1:1 décomp gSaveBlock1Ptr / gSaveBlock2Ptr / status) ────

let sCurrentBlock1: SaveBlock1 | null = null;
let sCurrentBlock2: SaveBlock2 | null = null;
/** Placeholder PokemonStorage (secteurs 5-13). Struct réelle = étape 6 ;
 *  pour l'instant un objet vide round-trip correctement (format 14-sect
 *  complet, 1:1). */
let sCurrentStorage: unknown = {};
let sSaveFileStatus: number = SAVE_STATUS_EMPTY;

// ─── Public API 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `LoadGameSave(SAVE_NORMAL)` (save.c:871) :
 *  UpdateSaveAddresses ; TryLoadSaveSlot (GetSaveValidStatus +
 *  CopySaveSlotData) ; gSaveFileStatus=status. Restaure sCurrentBlock1/2
 *  (+ storage) depuis le slot valide au counter le plus haut. */
export function LoadGameSave(): number {
  const { status, blocks } = TryLoadSaveSlot();
  if (status === SAVE_STATUS_OK && blocks.saveBlock1 && blocks.saveBlock2) {
    sCurrentBlock1 = blocks.saveBlock1 as SaveBlock1;
    sCurrentBlock2 = blocks.saveBlock2 as SaveBlock2;
    sCurrentStorage = blocks.pokemonStorage ?? {};
    sSaveFileStatus = SAVE_STATUS_OK;
    console.log('[save-system] loaded (sector engine, counter max slot)');
    // 1:1 RTC : offset dans sCurrentBlock2.localTimeOffset (struct Time),
    // déjà restauré ci-dessus. Rafraîchir gLocalTime (rtc.c RtcCalcLocalTime).
    void import('./rtc').then(({ RtcCalcLocalTime }) => { if (sCurrentBlock2) RtcCalcLocalTime(); });
    return SAVE_STATUS_OK;
  }
  // EMPTY/CORRUPT : pas de save valide → blocs par défaut (le boot 1:1
  // appellera Sav2_ClearSetDefault si EMPTY/CORRUPT — étape 4). Pas de
  // migration ancien format (clean break, autorisé user).
  sCurrentBlock2 = emptySaveBlock2();
  sCurrentBlock1 = emptySaveBlock1(emptyBag());
  sCurrentStorage = {};
  sSaveFileStatus = (status === SAVE_STATUS_CORRUPT) ? SAVE_STATUS_CORRUPT : SAVE_STATUS_EMPTY;
  return sSaveFileStatus;
}

/** 1:1 décomp `TrySavingData(SAVE_NORMAL)` → `HandleSavingData` →
 *  `WriteSaveSectorOrSlot(FULL_SAVE_SLOT)` (save.c:765/707/138). Le moteur
 *  gère rotation slot + gSaveCounter++ + checksum/signature. (Le sync
 *  party/objectEvents → block1 est fait par PreSaveSyncBlocks AVANT, côté
 *  gameState.save().) */
export function TrySavingData(): boolean {
  if (!sCurrentBlock1 || !sCurrentBlock2) {
    console.warn('[save-system] TrySavingData : pas de blocs courants');
    return false;
  }
  const blocks: Record<BlockKey, unknown> = {
    saveBlock2: sCurrentBlock2,
    saveBlock1: sCurrentBlock1,
    pokemonStorage: sCurrentStorage ?? {},
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

/** 1:1 décomp `gSaveBlock1Ptr` accessor. Init si null. */
export function GetSaveBlock1(): SaveBlock1 {
  if (!sCurrentBlock1) sCurrentBlock1 = emptySaveBlock1(emptyBag());
  return sCurrentBlock1;
}

/** 1:1 décomp `gSaveBlock2Ptr` accessor. Init si null. */
export function GetSaveBlock2(): SaveBlock2 {
  if (!sCurrentBlock2) sCurrentBlock2 = emptySaveBlock2();
  return sCurrentBlock2;
}

/** 1:1 décomp `Sav2_ClearSetDefault` + `ClearSav1` — reset RAM des blocs
 *  (NewGame). NE touche PAS la flash (= 1:1, la flash n'est effacée que
 *  par un save ou ClearSaveData). */
export function ResetSaveBlocks(): void {
  sCurrentBlock2 = emptySaveBlock2();
  sCurrentBlock1 = emptySaveBlock1(emptyBag());
  sCurrentStorage = {};
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
  sCurrentBlock1 = null;
  sCurrentBlock2 = null;
  sCurrentStorage = {};
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
    Reset: ResetSaveBlocks,
    DeleteAll: DeleteAllSaves,
    HasValid: HasValidSave,
  };
}
