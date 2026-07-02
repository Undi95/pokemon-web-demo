// ─────────────────────────────────────────────────────────────────────────────
// trainer_hill.c — port FOCALISÉ sur la génération d'étage (Trainer Hill, e-Reader/post-game).
//
// Périmètre : GenerateTrainerHillFloorLayout + helpers (GetCurrentTrainerHillMapId, GetFloorId,
// GetMapDataForFloor, SetUpDataStruct, FreeDataStruct). Dépendance requise par `InitTrainerHillMap`
// (fieldmap.c). Le reste de Trainer Hill (challenge, combats, prix, timer) n'est PAS porté.
//
// ⚠️ Adaptations connues (assumées, contenu injouable) :
//  1) `mapLayoutId` est une STRING chez nous (pas l'enum numérique du décomp) → GetFloorId /
//     GetCurrentTrainerHillMapId mappent la string vers l'index/le mapId.
//  2) La décomp copie les layouts d'étage depuis `sChallengeData[mode]` (data/battle_frontier/
//     trainer_hill.h) — NON extrait chez nous. `SetUpDataStruct` alloue donc des étages ZÉRO
//     (sol vide) ; la LOGIQUE de génération est 1:1, et deviendra correcte une fois la data
//     extraite (sans toucher au code ci-dessous).
// ─────────────────────────────────────────────────────────────────────────────

import {
  gBackupMapLayout, gMapHeader, NUM_METATILES_IN_PRIMARY, InitMapFromSavedGame,
  MAPGRID_COLLISION_MASK, MAPGRID_ELEVATION_MASK, MAPGRID_METATILE_ID_MASK,
} from './fieldmap';
import { RunOnLoadMapScript } from './script';

// ─── Constantes (1:1 décomp) ─────────────────────────────────────────────────
/** include/constants/trainer_hill.h:4-9 — mapId courant de l'étage. */
const TRAINER_HILL_ROOF = 5;
const TRAINER_HILL_ENTRANCE = 6;
/** include/constants/trainer_hill.h:17,61-64. */
const NUM_TRAINER_HILL_FLOORS = 4;
const HILL_FLOOR_WIDTH = 16;
const HILL_FLOOR_HEIGHT_MAIN = 16;
const HILL_FLOOR_HEIGHT_MARGIN = 5;
/** include/global.fieldmap.h:18 `ELEVATION_DEFAULT = 3`. */
const ELEVATION_DEFAULT = 3;
/** include/global.fieldmap.h:11-12 (shifts). */
const MAPGRID_COLLISION_SHIFT = 10;
const MAPGRID_ELEVATION_SHIFT = 12;

/** mapLayoutId (string) → mapId TRAINER_HILL_* (1F=1..ROOF=5, ENTRANCE=6 ; 0 sinon). */
const _LAYOUT_TO_HILL_MAPID: Readonly<Record<string, number>> = {
  LAYOUT_TRAINER_HILL_1F: 1, LAYOUT_TRAINER_HILL_2F: 2, LAYOUT_TRAINER_HILL_3F: 3,
  LAYOUT_TRAINER_HILL_4F: 4, LAYOUT_TRAINER_HILL_ROOF: 5, LAYOUT_TRAINER_HILL_ENTRANCE: 6,
};

// ─── Struct d'étage (1:1 décomp include/trainer_hill.h:18-27) ────────────────
interface TrainerHillFloorMap {
  /** metatileData[HILL_FLOOR_WIDTH * HILL_FLOOR_HEIGHT_MAIN] (u8) ; +NUM_METATILES_IN_PRIMARY = id. */
  metatileData: Uint8Array;
  /** collisionData[HILL_FLOOR_WIDTH] (u16) : 1 bit/colonne par ligne (MSB = colonne 0). */
  collisionData: Uint16Array;
}
interface TrainerHillFloor { map: TrainerHillFloorMap }
interface HillData { floorId: number; floors: TrainerHillFloor[] }

/** 1:1 décomp `EWRAM_DATA static struct {...} *sHillData = NULL`. */
let sHillData: HillData | null = null;

/** 1:1 décomp `GetCurrentTrainerHillMapId` (trainer_hill.c:750-771). */
export function GetCurrentTrainerHillMapId(): number {
  return _LAYOUT_TO_HILL_MAPID[gMapHeader?.mapLayoutId ?? ''] ?? 0;
}

/** 1:1 décomp `GetFloorId` (trainer_hill.c:291-294) : `mapLayoutId - LAYOUT_TRAINER_HILL_1F`.
 *  Adapté : mapId(1F=1..4F=4) − 1 = index d'étage 0..3. */
function GetFloorId(): number {
  return (GetCurrentTrainerHillMapId() - 1) & 0xFF;
}

/** 1:1 décomp `SetUpDataStruct` (trainer_hill.c:347-362).
 *  ⚠️ La copie `CpuCopy32(sChallengeData[mode], &challenge, ...)` est remplacée par une alloc
 *  ZÉRO : la data de challenge (layouts d'étage) n'est pas extraite → sol vide (cf. en-tête). */
function SetUpDataStruct(): void {
  if (sHillData === null) {
    sHillData = {
      floorId: GetFloorId(),
      floors: Array.from({ length: NUM_TRAINER_HILL_FLOORS }, () => ({
        map: { metatileData: new Uint8Array(HILL_FLOOR_WIDTH * HILL_FLOOR_HEIGHT_MAIN), collisionData: new Uint16Array(HILL_FLOOR_WIDTH) },
      })),
    };
  }
}

/** 1:1 décomp `FreeDataStruct` (trainer_hill.c:364-367) : `TRY_FREE_AND_SET_NULL(sHillData)`. */
function FreeDataStruct(): void {
  sHillData = null;
}

/** 1:1 STRICT décomp `GetMapDataForFloor(u8 floorId, u32 x, u32 y, u32 floorWidth)`
 *  (trainer_hill.c:672-683). */
function GetMapDataForFloor(floorId: number, x: number, y: number, floorWidth: number): number {
  const floors = sHillData!.floors;
  const impassable = (floors[floorId].map.collisionData[y] >> (15 - x)) & 1;
  const metatileId = floors[floorId].map.metatileData[floorWidth * y + x] + NUM_METATILES_IN_PRIMARY;
  const elevation = (ELEVATION_DEFAULT << MAPGRID_ELEVATION_SHIFT) & MAPGRID_ELEVATION_MASK;  // PACK_ELEVATION
  return ((impassable << MAPGRID_COLLISION_SHIFT) & MAPGRID_COLLISION_MASK)  // PACK_COLLISION
       | elevation
       | (metatileId & MAPGRID_METATILE_ID_MASK);                            // PACK_METATILE
}

// ─── Génération de l'étage (1:1 décomp) ──────────────────────────────────────
/** 1:1 STRICT décomp `GenerateTrainerHillFloorLayout(u16 *mapArg)` (trainer_hill.c:685-733) :
 *  ENTRANCE/ROOF → InitMapFromSavedGame ; sinon assemble les 5 lignes de marge (depuis la map de
 *  base) + les 16 lignes d'étage (depuis sHillData via GetMapDataForFloor) dans le backup map. */
export function GenerateTrainerHillFloorLayout(mapArg: Uint16Array): void {
  let mapId = GetCurrentTrainerHillMapId();

  if (mapId === TRAINER_HILL_ENTRANCE) {
    InitMapFromSavedGame();
    return;
  }

  SetUpDataStruct();
  if (mapId === TRAINER_HILL_ROOF) {
    InitMapFromSavedGame();
    FreeDataStruct();
    return;
  }

  mapId = GetFloorId();
  const src = gMapHeader!.mapLayout.map;
  gBackupMapLayout.map = mapArg;
  // Dimensions incluent la border (= 1:1 décomp +15 / +14).
  gBackupMapLayout.width = HILL_FLOOR_WIDTH + 15;
  gBackupMapLayout.height = (HILL_FLOOR_HEIGHT_MAIN + HILL_FLOOR_HEIGHT_MARGIN) + 14;
  let dst = 224;     // 1:1 décomp `dst = mapArg + 224`
  let srcIdx = 0;    // 1:1 décomp `src` avance de 16 (= HILL_FLOOR_WIDTH) par ligne

  // 5 premières lignes (Entrance/Exit) toujours identiques (copiées de la map de base).
  for (let y = 0; y < HILL_FLOOR_HEIGHT_MARGIN; y++) {
    for (let x = 0; x < HILL_FLOOR_WIDTH; x++)
      mapArg[dst + x] = src[srcIdx + x];
    dst += 31;
    srcIdx += 16;
  }

  // Les 16 lignes du layout 16×16 spécifique à l'étage.
  for (let y = 0; y < HILL_FLOOR_HEIGHT_MAIN; y++) {
    for (let x = 0; x < HILL_FLOOR_WIDTH; x++)
      mapArg[dst + x] = GetMapDataForFloor(mapId, x, y, HILL_FLOOR_WIDTH);
    dst += 31;
  }

  RunOnLoadMapScript();
  FreeDataStruct();
}

// Sonde dev (port injouable pour l'instant) — sans effet sur le jeu courant.
(globalThis as Record<string, unknown>).__GenerateTrainerHillFloorLayout = GenerateTrainerHillFloorLayout;

// ─── Seeding new-game (NewGameInitData, new_game.c:205) ─────────────────────

import { gSaveBlock1Ptr as _sb1NewGame, gSaveBlock2Ptr as _sb2NewGame } from './engine/save/save-block-state';
import { NUM_TRAINER_HILL_MODES as _NUM_TH_MODES } from './engine/save/save-blocks';

// 1:1 décomp trainer_hill.c:35 — 60 * 60 * 60 - 1 frames.
const HILL_MAX_TIME = 215999;

/** 1:1 décomp `static void SetTimerValue(u32 *dst, u32 val)` (trainer_hill.c:626-629). */
function SetTimerValue(dst: number[], index: number, val: number): void {
  dst[index] = val;
}

/** 1:1 décomp `void ResetTrainerHillResults(void)` (trainer_hill.c:280-289). */
export function ResetTrainerHillResults(): void {
  _sb2NewGame.frontier.savedGame = 0;
  _sb2NewGame.frontier.unk_EF9 = 0;
  _sb1NewGame.trainerHill.bestTime = 0;
  for (let i = 0; i < _NUM_TH_MODES; i++)
    SetTimerValue(_sb1NewGame.trainerHillTimes, i, HILL_MAX_TIME);
}
