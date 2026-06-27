// ─────────────────────────────────────────────────────────────────────────────
// battle_pyramid.c — port FOCALISÉ sur la génération d'étage (Battle Pyramid, Frontier).
//
// Périmètre : GenerateBattlePyramidFloorLayout + ses 3 helpers (GetPyramidFloorTemplateId,
// GetPyramidFloorLayoutOffsets, GetPyramidEntranceAndExitSquareIds) + les tables de données.
// C'est la dépendance requise par `InitBattlePyramidMap` (fieldmap.c). Le reste du Battle
// Pyramid (combats, objets, scripts) n'est PAS porté — contenu post-game injouable pour l'instant.
//
// ⚠️ Adaptation connue (assumée) : la décomp lit `gMapLayouts[offset + LAYOUT_..._PYRAMID_FLOOR]`
// = jusqu'à 16 layouts d'étage distincts. Notre extraction n'a qu'UN layout
// (`BattleFrontier_BattlePyramidFloor`). On le sert pour tous les offsets via `getPyramidFloorLayout`
// (variété dégradée, LOGIQUE 1:1). Quand les 16 variantes seront extraites + indexées par offset,
// la génération deviendra parfaite SANS toucher à la logique ci-dessous.
// ─────────────────────────────────────────────────────────────────────────────

import {
  gBackupMapLayout, MAP_OFFSET, MAPGRID_METATILE_ID_MASK,
  MAPGRID_ELEVATION_MASK, MAPGRID_COLLISION_MASK, loadLayout,
  type MapLayout,
} from './fieldmap';
import { RunOnLoadMapScript } from './script';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';

// ─── Constantes (1:1 décomp) ─────────────────────────────────────────────────
/** include/constants/battle_pyramid.h:20-22. */
const PYRAMID_FLOOR_SQUARES_WIDE = 4;
const PYRAMID_FLOOR_SQUARES_HIGH = 4;
const NUM_PYRAMID_FLOOR_SQUARES = PYRAMID_FLOOR_SQUARES_WIDE * PYRAMID_FLOOR_SQUARES_HIGH;
/** battle_pyramid.c:41. */
const NUM_LAYOUT_OFFSETS = 8;
/** include/constants/metatile_labels.h:74-75. */
const METATILE_BattlePyramid_Exit = 0x28E;
const METATILE_BattlePyramid_Floor = 0x28D;
/** FRONTIER_STAGES_PER_CHALLENGE (include/constants/battle_frontier.h). */
const FRONTIER_STAGES_PER_CHALLENGE = 7;

/** 1:1 décomp `MOD(a, n)` (include/global.h:103) : `(n & (n-1)) ? (a % n) : (a & (n-1))`. */
function MOD(a: number, n: number): number {
  return (n & (n - 1)) ? (a % n) : (a & (n - 1));
}

// ─── Données (1:1 décomp battle_pyramid.c) ───────────────────────────────────
/** 1:1 décomp `struct PyramidFloorTemplate` (battle_pyramid.c:53-61). */
interface PyramidFloorTemplate {
  numItems: number;
  numTrainers: number;
  itemPositions: number;
  trainerPositions: number;
  runMultiplier: number;
  layoutOffsets: readonly number[];  // [NUM_LAYOUT_OFFSETS]
}

// OBJ_POSITIONS_* (include/constants/battle_pyramid.h:27-31).
const U = 0;   // OBJ_POSITIONS_UNIFORM
const INE = 1; // OBJ_POSITIONS_IN_AND_NEAR_ENTRANCE
const IXE = 2; // OBJ_POSITIONS_IN_AND_NEAR_EXIT
const NXE = 4; // OBJ_POSITIONS_NEAR_EXIT

/** 1:1 décomp `sPyramidFloorTemplates[]` (battle_pyramid.c:107-237) — 16 templates. */
const sPyramidFloorTemplates: readonly PyramidFloorTemplate[] = [
  { numItems: 7, numTrainers: 3, itemPositions: U, trainerPositions: U,   runMultiplier: 128, layoutOffsets: [0, 0, 1, 1, 2, 2, 3, 3] },
  { numItems: 6, numTrainers: 3, itemPositions: U, trainerPositions: U,   runMultiplier: 128, layoutOffsets: [1, 1, 2, 2, 3, 3, 4, 4] },
  { numItems: 5, numTrainers: 3, itemPositions: U, trainerPositions: U,   runMultiplier: 120, layoutOffsets: [2, 2, 3, 3, 4, 4, 5, 5] },
  { numItems: 4, numTrainers: 4, itemPositions: U, trainerPositions: U,   runMultiplier: 120, layoutOffsets: [3, 3, 4, 4, 5, 5, 6, 6] },
  { numItems: 4, numTrainers: 4, itemPositions: U, trainerPositions: INE, runMultiplier: 112, layoutOffsets: [4, 4, 5, 5, 6, 6, 7, 7] },
  { numItems: 3, numTrainers: 5, itemPositions: U, trainerPositions: IXE, runMultiplier: 112, layoutOffsets: [5, 6, 7, 8, 9, 10, 11, 12] },
  { numItems: 3, numTrainers: 5, itemPositions: U, trainerPositions: U,   runMultiplier: 104, layoutOffsets: [6, 7, 8, 9, 10, 11, 12, 13] },
  { numItems: 2, numTrainers: 4, itemPositions: U, trainerPositions: INE, runMultiplier: 104, layoutOffsets: [7, 8, 9, 10, 11, 12, 13, 14] },
  { numItems: 4, numTrainers: 5, itemPositions: U, trainerPositions: IXE, runMultiplier: 96,  layoutOffsets: [8, 9, 10, 11, 12, 13, 14, 15] },
  { numItems: 3, numTrainers: 6, itemPositions: U, trainerPositions: NXE, runMultiplier: 96,  layoutOffsets: [8, 9, 10, 11, 12, 13, 14, 15] },
  { numItems: 2, numTrainers: 3, itemPositions: U, trainerPositions: U,   runMultiplier: 88,  layoutOffsets: [12, 13, 14, 12, 13, 14, 12, 13] },
  { numItems: 4, numTrainers: 5, itemPositions: U, trainerPositions: U,   runMultiplier: 88,  layoutOffsets: [11, 11, 11, 11, 11, 11, 11, 11] },
  { numItems: 3, numTrainers: 7, itemPositions: U, trainerPositions: U,   runMultiplier: 80,  layoutOffsets: [12, 12, 12, 12, 12, 12, 12, 12] },
  { numItems: 2, numTrainers: 4, itemPositions: U, trainerPositions: U,   runMultiplier: 80,  layoutOffsets: [13, 13, 13, 13, 13, 13, 13, 13] },
  { numItems: 3, numTrainers: 6, itemPositions: U, trainerPositions: U,   runMultiplier: 80,  layoutOffsets: [14, 14, 14, 14, 14, 14, 14, 14] },
  { numItems: 3, numTrainers: 8, itemPositions: U, trainerPositions: U,   runMultiplier: 80,  layoutOffsets: [15, 15, 15, 15, 15, 15, 15, 15] },
];

/** 1:1 décomp `sPyramidFloorTemplateOptions[][2]` (battle_pyramid.c:239-282) — {seuil, templateId}.
 *  Indexé par étage via sFloorTemplateOffsets : floor 0 = [0..3], floor 1 = [4..8], … */
const sPyramidFloorTemplateOptions: readonly (readonly [number, number])[] = [
  [40, 0], [70, 1], [90, 2], [100, 3],                  // Floor 0
  [35, 1], [55, 2], [75, 3], [90, 4], [100, 10],        // Floor 1
  [35, 2], [55, 3], [75, 4], [90, 5], [100, 11],        // Floor 2
  [35, 3], [55, 4], [75, 5], [90, 6], [100, 12],        // Floor 3
  [35, 4], [55, 5], [75, 6], [90, 7], [100, 13],        // Floor 4
  [35, 5], [55, 6], [75, 7], [90, 8], [100, 14],        // Floor 5
  [35, 6], [55, 7], [75, 8], [90, 9], [100, 15],        // Floor 6
];

/** 1:1 décomp `sFloorTemplateOffsets[FRONTIER_STAGES_PER_CHALLENGE]` (battle_pyramid.c:284-287). */
const sFloorTemplateOffsets: readonly number[] = [0, 4, 9, 14, 19, 24, 29];

// ─── gMapLayouts (adaptateur étage pyramide) ─────────────────────────────────
// 1:1 décomp : `gMapLayouts[offset + LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR]`.
// Notre modèle map est string-keyé/async → on cache le(s) layout(s) d'étage. Tant qu'une seule
// variante est extraite, tous les offsets renvoient le même (variété dégradée, logique 1:1).
const PYRAMID_FLOOR_LAYOUT_NAME = 'BattleFrontier_BattlePyramidFloor';
let _pyramidFloorLayout: MapLayout | null = null;

/** Précharge le layout d'étage de la pyramide (à appeler quand le Frontier devient atteignable,
 *  AVANT InitBattlePyramidMap — la génération est synchrone). */
export async function preloadBattlePyramidLayouts(): Promise<void> {
  if (_pyramidFloorLayout) return;
  try {
    _pyramidFloorLayout = await loadLayout(PYRAMID_FLOOR_LAYOUT_NAME);
  } catch {
    _pyramidFloorLayout = null;
  }
}

/** Équivalent de `gMapLayouts[offset + BASE]` pour les étages de pyramide (cache sync). */
function getPyramidFloorLayout(_offset: number): MapLayout | null {
  // TODO(frontier-data) : indexer par _offset quand les 16 variantes seront extraites.
  return _pyramidFloorLayout;
}

// ─── Helpers RNG d'étage (1:1 décomp) ────────────────────────────────────────
/** 1:1 décomp `GetPyramidFloorTemplateId` (battle_pyramid.c:1917-1929). */
function GetPyramidFloorTemplateId(): number {
  const rand = gSaveBlock2Ptr.frontier.pyramidRandoms[3] % 100;
  const floor = gSaveBlock2Ptr.frontier.curChallengeBattleNum;
  for (let i = sFloorTemplateOffsets[floor]; i < sPyramidFloorTemplateOptions.length; i++) {
    if (rand < sPyramidFloorTemplateOptions[i][0])
      return sPyramidFloorTemplateOptions[i][1];
  }
  return 0;
}

/** 1:1 décomp `GetPyramidFloorLayoutOffsets` (battle_pyramid.c:1899-1915). */
function GetPyramidFloorLayoutOffsets(layoutOffsets: Uint8Array): void {
  let rand = (gSaveBlock2Ptr.frontier.pyramidRandoms[0]) | (gSaveBlock2Ptr.frontier.pyramidRandoms[1] << 16);
  const id = GetPyramidFloorTemplateId();
  for (let i = 0; i < NUM_PYRAMID_FLOOR_SQUARES; i++) {
    layoutOffsets[i] = sPyramidFloorTemplates[id].layoutOffsets[MOD(rand, NUM_LAYOUT_OFFSETS)];
    rand >>= 3;
    if (i === 7) {
      rand = (gSaveBlock2Ptr.frontier.pyramidRandoms[2]) | (gSaveBlock2Ptr.frontier.pyramidRandoms[3] << 16);
      rand >>= 8;
    }
  }
}

/** 1:1 décomp `GetPyramidEntranceAndExitSquareIds` (battle_pyramid.c:1636-1646).
 *  Renvoie [entranceSquareId, exitSquareId] (out-params dans la décomp). */
function GetPyramidEntranceAndExitSquareIds(): [number, number] {
  let entranceSquareId = gSaveBlock2Ptr.frontier.pyramidRandoms[3] % NUM_PYRAMID_FLOOR_SQUARES;
  let exitSquareId = gSaveBlock2Ptr.frontier.pyramidRandoms[0] % NUM_PYRAMID_FLOOR_SQUARES;
  if (entranceSquareId === exitSquareId) {
    entranceSquareId = (gSaveBlock2Ptr.frontier.pyramidRandoms[3] + 1) % NUM_PYRAMID_FLOOR_SQUARES;
    exitSquareId = (gSaveBlock2Ptr.frontier.pyramidRandoms[0] + NUM_PYRAMID_FLOOR_SQUARES - 1) % NUM_PYRAMID_FLOOR_SQUARES;
  }
  return [entranceSquareId, exitSquareId];
}

// ─── Génération de l'étage (1:1 décomp) ──────────────────────────────────────
/** 1:1 STRICT décomp `GenerateBattlePyramidFloorLayout(u16 *backupMapData, bool8 setPlayerPosition)`
 *  (battle_pyramid.c:1522-1574) : assemble une grille 4×4 de "squares" (layouts d'étage) dans
 *  le backup map, en remplaçant la case Exit par Floor sauf sur le square de sortie, et en posant
 *  la position joueur sur le square d'entrée. */
export function GenerateBattlePyramidFloorLayout(backupMapData: Uint16Array, setPlayerPosition: boolean): void {
  // 1:1 include/fieldmap.h:19-20 — calculés ici (et non au top-level) pour éviter un TDZ :
  // MAP_OFFSET vient de fieldmap, qui importe ce module (cycle ESM) → lecture au call-time seulement.
  const MAP_OFFSET_W = MAP_OFFSET * 2 + 1;
  const MAP_OFFSET_H = MAP_OFFSET * 2;
  const floorLayoutOffsets = new Uint8Array(NUM_PYRAMID_FLOOR_SQUARES);
  GetPyramidFloorLayoutOffsets(floorLayoutOffsets);
  const [entranceSquareId, exitSquareId] = GetPyramidEntranceAndExitSquareIds();

  for (let i = 0; i < NUM_PYRAMID_FLOOR_SQUARES; i++) {
    const mapLayout = getPyramidFloorLayout(floorLayoutOffsets[i]);
    if (!mapLayout) continue;  // layout pas (encore) préchargé → square laissé en MAPGRID_UNDEFINED
    const layoutMap = mapLayout.map;

    gBackupMapLayout.map = backupMapData;
    gBackupMapLayout.width = mapLayout.width * PYRAMID_FLOOR_SQUARES_WIDE + MAP_OFFSET_W;
    gBackupMapLayout.height = mapLayout.height * PYRAMID_FLOOR_SQUARES_HIGH + MAP_OFFSET_H;
    const map = backupMapData;
    const yOffset = (((i / PYRAMID_FLOOR_SQUARES_WIDE | 0) * mapLayout.height) + MAP_OFFSET) * gBackupMapLayout.width;
    const xOffset = ((i % PYRAMID_FLOOR_SQUARES_WIDE) * mapLayout.width) + MAP_OFFSET;
    const base = yOffset + xOffset;

    let li = 0;  // index dans layoutMap (parcouru ligne par ligne)
    for (let y = 0; y < mapLayout.height; y++) {
      for (let x = 0; x < mapLayout.width; x++) {
        const dst = base + y * gBackupMapLayout.width + x;
        if ((layoutMap[li + x] & MAPGRID_METATILE_ID_MASK) !== METATILE_BattlePyramid_Exit) {
          map[dst] = layoutMap[li + x];
        } else if (i !== exitSquareId) {
          if (i === entranceSquareId && setPlayerPosition === false) {
            gSaveBlock1Ptr.pos.x = (mapLayout.width * (i % PYRAMID_FLOOR_SQUARES_WIDE)) + x;
            gSaveBlock1Ptr.pos.y = (mapLayout.height * ((i / PYRAMID_FLOOR_SQUARES_WIDE) | 0)) + y;
          }
          // Conserve élévation + collision, remplace l'id de metatile par Floor.
          map[dst] = (layoutMap[li + x] & (MAPGRID_ELEVATION_MASK | MAPGRID_COLLISION_MASK)) | METATILE_BattlePyramid_Floor;
        } else {
          map[dst] = layoutMap[li + x];
        }
      }
      li += mapLayout.width;  // 1:1 décomp `layoutMap += mapLayout->width` (avance d'une ligne)
    }
  }
  RunOnLoadMapScript();
}

// Sonde dev (port injouable pour l'instant) — sans effet sur le jeu courant.
(globalThis as Record<string, unknown>).__GenerateBattlePyramidFloorLayout = GenerateBattlePyramidFloorLayout;
