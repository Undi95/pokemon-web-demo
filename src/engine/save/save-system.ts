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
  type PokemonStorage,
  emptySaveBlock1,
  emptySaveBlock2,
  emptyPokemonStorage,
  TOTAL_BOXES_COUNT,
} from './save-blocks';
import { emptyBag, SetBagItemsPointers, migrateBlock1BagFormat } from '../bag/bag';
import { SetDecorationInventoriesPointers } from '../../decoration_inventory';
import {
  WriteSaveSlot, TryLoadSaveSlot, GetSaveValidStatus, Save_ResetSaveCounters,
  __flashClear, type BlockKey,
  SAVE_STATUS_EMPTY as SS_EMPTY, SAVE_STATUS_OK as SS_OK,
  SAVE_STATUS_CORRUPT as SS_CORRUPT, SAVE_STATUS_NO_FLASH as SS_NOFLASH,
  SAVE_STATUS_ERROR as SS_ERR, SECTOR_SIGNATURE as SECT_SIG,
  NUM_SAVE_SLOTS as NSLOTS,
} from './save-sectors';
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
} from './save-block-state';

// ─── Constants 1:1 décomp (ré-exports pour les callers existants) ────────────

export const SECTOR_SIGNATURE = SECT_SIG;
export const NUM_SAVE_SLOTS = NSLOTS;
export const SAVE_STATUS_EMPTY = SS_EMPTY;
export const SAVE_STATUS_OK = SS_OK;
export const SAVE_STATUS_CORRUPT = SS_CORRUPT;
export const SAVE_STATUS_NO_FLASH = SS_NOFLASH;
export const SAVE_STATUS_ERROR = SS_ERR;

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
    console.log('[save-system] loaded (sector engine, counter max slot)');
    // 1:1 RTC : offset dans gSaveBlock2.localTimeOffset (struct Time),
    // déjà restauré ci-dessus. Rafraîchir gLocalTime (rtc.c RtcCalcLocalTime).
    void import('../system/rtc').then(({ RtcCalcLocalTime }) => { RtcCalcLocalTime(); });
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
    const mapMod = await import('../../fieldmap');
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
}
