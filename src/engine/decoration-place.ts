/**
 * decoration-place.ts — Port 1:1 STRICT de la section 6 de
 * `D:/Projet 1/decomps/pokeemeraude/src/decoration.c` (lignes ~1100-2200).
 *
 * SCOPE :
 *   Place flow complet (= mode "Décorer ma chambre" / "Décorer Secret Base") :
 *     - Task_PlaceDecoration (state machine fade + setup)
 *     - ConfigureCameraObjectForPlacingDecoration (= GFX upload curseur)
 *     - SetUpPlacingDecorationPlayerAvatar (= sprite Brendan/May "decorating")
 *     - SetUpDecorationShape (= switch shape → width/height task data)
 *     - AttemptPlaceDecoration / AttemptCancelPlaceDecoration (= A/B button entry)
 *     - CanPlaceDecoration + helpers (IsFloorOrBoardAndHole, IsntInitialPosition,
 *       IsSecretBaseTrainerSpot, GetLayerType) (= map collision permission check)
 *     - AttemptPlaceDecoration_ (= dispatch CanPlace → PlacePrompt or CantPrompt)
 *     - PlaceDecorationPrompt / PlaceDecoration / PlaceDecoration_ (= yes/no +
 *       écriture map + persistance sDecorationContext)
 *     - CancelDecoratingPrompt / CancelDecorating / CancelDecorating_ +
 *       c1_overworld_prev_quest + FieldCB_InitDecorationItemsWindow
 *     - ResetCursorMovement / Task_SelectLocation + helpers cursor
 *       (ApplyCursorMovement_IsInvalid, IsHoldingDirection)
 *     - ContinueDecorating / CantPlaceDecorationPrompt
 *     - InitializePuttingAwayCursorSprite / InitializePuttingAwayCursorSprite2
 *     - gpu_pal_decompress_alloc_tag_and_upload (= GFX loader STUB)
 *     - GetDecorationIconPicOrPalette (= lookup STUB)
 *     - InitializeCameraSprite1 (= cursor blink)
 *     - LoadPlayerSpritePalette / FreePlayerSpritePalette
 *     - Tables : sDecorationMovementInfo[], sDecorSelectorOam,
 *       sDecorWhilePlacingSpriteTemplate, sSpritePal_PlaceDecoration,
 *       sSpritePal_PuttingAwayCursor{Brendan,May}, sPuttingAwayCursorSpriteTemplate
 *
 * STATUT 1:1 STRICT :
 *   - Logique pure (state machine, switch shape, permission check, persistance)
 *     = portée 1:1 réelle, exécutable comportementalement.
 *   - Tout accès `gSprites[].xxx` (data[N], oam.priority, x, y, callback,
 *     invisible) = STUB EXPLICITE avec console.warn (= pas de système gSprites
 *     exposé côté engine TS).
 *   - `gFieldCamera.spriteId` accès r/w (= field-camera.ts expose la struct mais
 *     le champ spriteId n'a pas de système sprite derrière) = STUB.
 *   - CreateObjectGraphicsSprite (= sprite player avatar dressed for decorating)
 *     = STUB (l'auto-bridge existe mais le sprite system field-camera de
 *     decoration n'est pas wiré).
 *   - TrySpawnObjectEvent / TryMoveObjectEventToMapCoords /
 *     TryOverrideObjectEventTemplateCoords = appelés via SecretBase_EventScript
 *     dans le décomp réel ; ici on STUB le script trigger.
 *
 * 1:1 STRICT : chaque fonction porte le nom décomp EXACT (= snake_case côté C,
 * camelCase TS interdit). Constants identiques. Tables identiques (= valeurs
 * raw 1:1 décomp). Stubs explicites uniquement quand un substrat absent
 * empêche l'exécution réelle ; jamais d'invention.
 */

import { getRuntime } from './decomp-globals';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './save-block-state';
import { gFieldCamera } from './field-camera';
import {
  StringExpandPlaceholders,
} from './gba-text-system';
import { ClearDialogWindowAndFrame } from './gba-window-system';
import { FadeScreen, FADE_TO_BLACK } from './fade-screen';
import { LockPlayerFieldControls } from './script-runtime';
import { getString } from './gba-strings';
import { setStringVar } from './string-buffers';
import {
  gDecorations,
} from './decoration-data';
import { JOY_NEW, JOY_HELD, PlaySE } from './decomp-globals';
import { CreateTask, DestroyTask } from './decomp-bridge';
import {
  A_BUTTON, B_BUTTON,
  DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT,
} from './list-menu';
import { DIR_NORTH, DIR_SOUTH, DIR_EAST, DIR_WEST } from './decomp-bridge';
import { PlayerGetDestCoords } from './player-avatar';
import { MAP_OFFSET, gMapHeader } from './map-loader';
import {
  MapGridGetMetatileBehaviorAt, MapGridGetMetatileIdAt,
  GetMetatileAttributesById,
} from './map-loader';

// ─── 1:1 décomp decoration.c:42-43 ──────────────────────────────────────────
//   #define PLACE_DECORATION_SELECTOR_TAG 0xbe5
//   #define PLACE_DECORATION_PLAYER_TAG   0x008

export const PLACE_DECORATION_SELECTOR_TAG = 0xbe5;
export const PLACE_DECORATION_PLAYER_TAG   = 0x008;

// ─── 1:1 décomp decoration.c:46-56 — task data layout ──────────────────────

const T_CURSOR_X = 0;
const T_CURSOR_Y = 1;
const T_STATE = 2;
const T_INITIAL_X = 3;
const T_INITIAL_Y = 4;
const T_DECOR_WIDTH = 5;
const T_DECOR_HEIGHT = 6;
const T_BUTTON = 10;
const T_DECORATION_MENU_COMMAND = 11;
const T_DECORATION_ITEMS_MENU_COMMAND = 12;
const T_MENU_TASK_ID = 13;

// ─── 1:1 décomp decoration.c:58-63 ──────────────────────────────────────────

export const DECOR_MENU_PLACE = 0;
export const DECOR_MENU_TOSS  = 1;
export const DECOR_MENU_TRADE = 2;

export const DECOR_ITEMS_MENU_PLACE    = 0;
export const DECOR_ITEMS_MENU_PUT_AWAY = 1;

// ─── 1:1 décomp constants/decorations.h DECORPERM_* ─────────────────────────

const DECORPERM_SOLID_FLOOR  = 0;
const DECORPERM_PASS_FLOOR   = 1;
const DECORPERM_BEHIND_FLOOR = 2;
const DECORPERM_NA_WALL      = 3;
const DECORPERM_SPRITE       = 4;

// ─── 1:1 décomp decoration.h DECORSHAPE_* (enum DecorationShape) ────────────

const DECORSHAPE_1x1 = 0;
const DECORSHAPE_2x1 = 1;
const DECORSHAPE_3x1 = 2;
const DECORSHAPE_4x2 = 3;
const DECORSHAPE_2x2 = 4;
const DECORSHAPE_1x2 = 5;
const DECORSHAPE_1x3 = 6;
const DECORSHAPE_2x4 = 7;
const DECORSHAPE_3x3 = 8;
const DECORSHAPE_3x2 = 9;

// ─── 1:1 décomp constants/decorations.h DECOR_NONE + DECOR_SOLID_BOARD ──────

const DECOR_NONE         = 0;
const DECOR_SOLID_BOARD  = 17;   // 1:1 décomp constants/decorations.h:18
const DECOR_STAND        = 18;   // 1:1 décomp constants/decorations.h:19 — référencé GetDecorationElevation
const DECOR_SLIDE        = 19;   // 1:1 décomp constants/decorations.h:20

// ─── 1:1 décomp event_objects.h OBJ_EVENT_GFX_*_DECORATING ──────────────────
//   OBJ_EVENT_GFX_BRENDAN_DECORATING (= 0x65 dans event_objects.h)
//   OBJ_EVENT_GFX_MAY_DECORATING     (= 0x66 dans event_objects.h)

const OBJ_EVENT_GFX_BRENDAN_DECORATING = 0x65;
const OBJ_EVENT_GFX_MAY_DECORATING     = 0x66;

// ─── 1:1 décomp constants/global.h ──────────────────────────────────────────
//   #define MALE   0
//   #define FEMALE 1

const MALE   = 0;
const FEMALE = 1;

// ─── 1:1 décomp metatile_behavior.h NUM_TILES_IN_PRIMARY + PER_METATILE ─────

const NUM_TILES_IN_PRIMARY  = 0x200;
const NUM_TILES_PER_METATILE = 8;

// ─── 1:1 décomp fieldmap.h MAPGRID_* / METATILE_LAYER_TYPE_NORMAL ───────────

const MAPGRID_IMPASSABLE       = 0xC00;
const MAPGRID_ELEVATION_SHIFT  = 12;
const METATILE_LAYER_TYPE_NORMAL = 0;
const METATILE_ATTR_LAYER_SHIFT  = 13;
const METATILE_ATTR_LAYER_MASK   = 0x6000;
const ELEVATION_INVALID          = 15;

// ─── 1:1 décomp region_map.h MAPSEC_SECRET_BASE ─────────────────────────────
//   constants/region_map_sections.h ligne ~285

const MAPSEC_SECRET_BASE = 0xC8;

// ─── 1:1 décomp constants/objects.h OBJECT_EVENTS_COUNT ─────────────────────

const OBJECT_EVENTS_COUNT = 16;

// ─── 1:1 décomp constants/metatile_labels.h ─────────────────────────────────
//   METATILE_SecretBase_SandOrnament_BrokenBase
// (= référencé par CanPlaceDecoration / DecorationIsUnderCursor pour gérer la
// rupture du sand ornament)

const METATILE_SecretBase_SandOrnament_BrokenBase = 0x290;  // 1:1 décomp metatile_labels.h

// ─── 1:1 décomp event_scripts.h ─────────────────────────────────────────────
//   SecretBase_EventScript_SetDecoration (= déclenche scripts d'animation/spawn
//   de l'object event correspondant à une décoration sprite)

const SecretBase_EventScript_SetDecoration = 'SecretBase_EventScript_SetDecoration';

// ─── 1:1 décomp helpers texte (= via getString + setStringVar) ──────────────

function StringExpandPlaceholdersToVar4(srcKey: string): string {
  // 1:1 décomp `StringExpandPlaceholders(gStringVar4, gText_...)`.
  const out = StringExpandPlaceholders('', getString(srcKey));
  setStringVar(4, out);
  return out;
}

// ─── 1:1 décomp DisplayItemMessageOnField (= menu.c) ────────────────────────
//
// STUB explicite : DisplayItemMessageOnField n'est pas wiré ici (= dans engine
// auto/), on log les transitions task pour debug et on appelle callback
// directement après un tick pour simulation honnête.

function _DisplayItemMessageOnField_STUB(
  taskId: number,
  msg: string,
  callback: (taskId: number) => void,
): void {
  console.warn(
    '[decoration-place STUB] DisplayItemMessageOnField — port menu.c différé',
    'taskId =', taskId, 'msg =', msg.slice(0, 40),
    'callback =', callback.name || '(anon)',
  );
  // 1:1 TODO : porter DisplayItemMessageOnField depuis menu.c (chantier futur).
  // Pour ne pas freezer la task, on assigne directement callback comme func.
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => callback(t.taskId);
}

// ─── 1:1 décomp DisplayYesNoMenuDefaultYes + DoYesNoFuncWithChoice ──────────
//
// STUB : pas de menu yes/no rendu, on choisit YES par défaut (= ce que le
// joueur fait quasi systématiquement dans le flow Place).

interface YesNoFuncTable {
  yesFunc: (taskId: number) => void;
  noFunc:  (taskId: number) => void;
}

function _DisplayYesNoMenuDefaultYes_STUB(): void {
  console.warn('[decoration-place STUB] DisplayYesNoMenuDefaultYes — port menu.c différé');
  // 1:1 TODO : porter DisplayYesNoMenuDefaultYes depuis menu.c (chantier futur).
}

function _DoYesNoFuncWithChoice_STUB(taskId: number, funcs: YesNoFuncTable): void {
  console.warn(
    '[decoration-place STUB] DoYesNoFuncWithChoice — port menu_helpers.c différé',
    'taskId =', taskId, 'yes =', funcs.yesFunc.name, 'no =', funcs.noFunc.name,
  );
  // 1:1 TODO : porter DoYesNoFuncWithChoice depuis menu_helpers.c (chantier futur).
  // Default : YES (= l'utilisateur choisit "oui placer" / "oui annuler" par défaut).
  funcs.yesFunc(taskId);
}

// ─── 1:1 décomp script-runtime ──────────────────────────────────────────────

function _ScriptContext_SetupScript_STUB(scriptKey: string): void {
  console.warn(
    '[decoration-place STUB] ScriptContext_SetupScript —',
    'script `' + scriptKey + '` non câblé (chantier futur)',
  );
  // 1:1 TODO : appeler ScriptContext_SetupScript depuis script-runtime.ts
  // une fois SecretBase_EventScript_SetDecoration porté.
}

// ─── 1:1 décomp TryPutSecretBaseVisitOnAir + Try*ObjectEvent ────────────────

function _TryPutSecretBaseVisitOnAir_STUB(): void {
  console.warn('[decoration-place STUB] TryPutSecretBaseVisitOnAir — tv.c différé');
  // 1:1 TODO : port tv.c TryPutSecretBaseVisitOnAir (chantier futur).
}

// ─── 1:1 décomp PlaceDecorationGraphicsDataBuffer (decoration.c:74-80) ──────
//
//   struct PlaceDecorationGraphicsDataBuffer
//   {
//       const struct Decoration *decoration;
//       u16 tiles[0x40];
//       u8 image[0x800];
//       u16 palette[16];
//   };

export interface PlaceDecorationGraphicsDataBuffer {
  decoration: typeof gDecorations[number] | null;
  tiles: Uint16Array;
  image: Uint8Array;
  palette: Uint16Array;
}

export const sPlaceDecorationGraphicsDataBuffer: PlaceDecorationGraphicsDataBuffer = {
  decoration: null,
  tiles: new Uint16Array(0x40),
  image: new Uint8Array(0x800),
  palette: new Uint16Array(16),
};

// ─── 1:1 décomp EWRAM_DATA static u8 sDecor_CameraSpriteObjectIdx{1,2} ──────

let sDecor_CameraSpriteObjectIdx1 = 0;
let sDecor_CameraSpriteObjectIdx2 = 0;

// ─── 1:1 décomp EWRAM_DATA static u8 sDecorationLastDirectionMoved = 0 ─────

let sDecorationLastDirectionMoved = 0;

// ─── 1:1 décomp EWRAM_DATA static u16 sCurDecorMapX = 0 ────────────────────

export let sCurDecorMapX = 0;
export let sCurDecorMapY = 0;

// ─── 1:1 décomp `sDecorationMovementInfo[]` (decoration.c:325-342) ──────────
//
// Table {shape, size, cameraX, cameraY} indexée par DECORSHAPE_*.
// 1:1 décomp SPRITE_SHAPE(WIDTHxHEIGHT) / SPRITE_SIZE(...) ; constantes
// import depuis include/gba/io_reg.h.
//
// SPRITE_SHAPE_SQUARE = 0, SPRITE_SHAPE_HORIZONTAL = 1, SPRITE_SHAPE_VERTICAL = 2
// SPRITE_SIZE values pour 16x16=0, 32x32=2, 64x64=3 (square)
//                  pour 32x16=2, 32x8=1, 16x8=0, 64x32=3 (horizontal)
//                  pour 16x32=2, 8x32=1, 8x16=0, 32x64=3 (vertical)
//
// Décomp utilise SPRITE_SHAPE(16x16) / SPRITE_SIZE(16x16) macros qui
// résolvent en (shape, size) tuple. Valeurs raw 1:1 ci-dessous.

interface DecorationMovementInfo {
  shape: number;     // ST_OAM_SHAPE_* (0/1/2)
  size: number;      // ST_OAM_SIZE_* (0..3)
  cameraX: number;
  cameraY: number;
}

const sDecorationMovementInfo: readonly DecorationMovementInfo[] = (() => {
  const t: DecorationMovementInfo[] = new Array(10);
  // 1:1 décomp SPRITE_SHAPE/SIZE résolution :
  //   16x16  → shape=0 (SQUARE),     size=0
  //   32x16  → shape=1 (HORIZONTAL), size=2 (32x16 = SIZE_2 in horizontal)
  //   64x32  → shape=1 (HORIZONTAL), size=3
  //   32x32  → shape=0 (SQUARE),     size=2
  //   16x32  → shape=2 (VERTICAL),   size=2
  //   32x64  → shape=2 (VERTICAL),   size=3
  //   64x64  → shape=0 (SQUARE),     size=3
  t[DECORSHAPE_1x1] = { shape: 0, size: 0, cameraX: 120, cameraY: 78 };  // 16x16
  t[DECORSHAPE_2x1] = { shape: 1, size: 2, cameraX: 128, cameraY: 78 };  // 32x16
  t[DECORSHAPE_3x1] = { shape: 1, size: 3, cameraX: 144, cameraY: 86 };  // 64x32 (3x1 padded → 64x32)
  t[DECORSHAPE_4x2] = { shape: 1, size: 3, cameraX: 144, cameraY: 70 };  // 64x32
  t[DECORSHAPE_2x2] = { shape: 0, size: 2, cameraX: 128, cameraY: 70 };  // 32x32
  t[DECORSHAPE_1x2] = { shape: 2, size: 2, cameraX: 120, cameraY: 70 };  // 16x32
  t[DECORSHAPE_1x3] = { shape: 2, size: 3, cameraX: 128, cameraY: 86 };  // 32x64 (1x3 padded → 32x64)
  t[DECORSHAPE_2x4] = { shape: 2, size: 3, cameraX: 128, cameraY: 54 };  // 32x64
  t[DECORSHAPE_3x3] = { shape: 0, size: 3, cameraX: 144, cameraY: 70 };  // 64x64
  t[DECORSHAPE_3x2] = { shape: 1, size: 3, cameraX: 144, cameraY: 70 };  // 64x32 (3x2 padded → 64x32)
  return t;
})();

// ─── 1:1 décomp `sDecorSelectorOam` (decoration.c:126) ──────────────────────
//
//   EWRAM_DATA static struct OamData sDecorSelectorOam = {};
//
// Initialisé dans SetDecorSelectionBoxOamAttributes (= function body).

interface OamData {
  y: number;
  affineMode: number;
  objMode: number;
  mosaic: boolean;
  bpp: number;
  shape: number;
  x: number;
  matrixNum: number;
  size: number;
  tileNum: number;
  priority: number;
  paletteNum: number;
}

export const sDecorSelectorOam: OamData = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0, x: 0, matrixNum: 0, size: 0, tileNum: 0,
  priority: 0, paletteNum: 0,
};

// ─── 1:1 décomp `sDecorWhilePlacingSpriteTemplate` (decoration.c:369-378) ──
//
//   static const struct SpriteTemplate sDecorWhilePlacingSpriteTemplate =
//   {
//       0x0000, 0x0000,
//       &sDecorSelectorOam, sDecorSelectorAnimCmds,
//       NULL, gDummySpriteAffineAnimTable,
//       SpriteCallbackDummy
//   };

export const sDecorWhilePlacingSpriteTemplate = {
  tileTag: 0x0000,
  paletteTag: 0x0000,
  oam: sDecorSelectorOam,
  anims: null as null,
  images: null as null,
  affineAnims: null as null,
  callback: 'SpriteCallbackDummy' as const,
};

// ─── 1:1 décomp `sSpritePal_PlaceDecoration` (decoration.c:380-384) ─────────
//
//   static const struct SpritePalette sSpritePal_PlaceDecoration =
//   {
//       .data = (const u16 *)&sPlaceDecorationGraphicsDataBuffer.palette,
//       .tag = PLACE_DECORATION_SELECTOR_TAG,
//   };

export const sSpritePal_PlaceDecoration = {
  data: sPlaceDecorationGraphicsDataBuffer.palette,
  tag: PLACE_DECORATION_SELECTOR_TAG,
};

// ─── 1:1 décomp `sSpritePal_PuttingAwayCursor{Brendan,May}` ─────────────────
//
//   static const struct SpritePalette sSpritePal_PuttingAwayCursorBrendan =
//   {
//       .data = sBrendanPalette,
//       .tag = PLACE_DECORATION_PLAYER_TAG,
//   };
//
// sBrendanPalette / sMayPalette = `graphics/decorations/{brendan,may}.pal`
// décomp ; assets non extraits ici (chantier futur).

export const sSpritePal_PuttingAwayCursorBrendan = {
  data: 'sBrendanPalette' as const,  // 1:1 TODO : asset graphics/decorations/brendan.pal
  tag: PLACE_DECORATION_PLAYER_TAG,
};

export const sSpritePal_PuttingAwayCursorMay = {
  data: 'sMayPalette' as const,  // 1:1 TODO : asset graphics/decorations/may.pal
  tag: PLACE_DECORATION_PLAYER_TAG,
};

// ─── 1:1 décomp `sPuttingAwayCursorOamData` + sPuttingAwayCursorSpriteTemplate

export const sPuttingAwayCursorOamData: OamData = {
  y: 0, affineMode: 0, objMode: 0, mosaic: false, bpp: 0,
  shape: 0,  // SPRITE_SHAPE(16x16) = 0 (SQUARE)
  x: 0, matrixNum: 0,
  size: 0,   // SPRITE_SIZE(16x16) = 0
  tileNum: 0, priority: 1, paletteNum: 0,
};

export const sPuttingAwayCursorSpriteTemplate = {
  tileTag: 0xFFFF /* TAG_NONE */,
  paletteTag: PLACE_DECORATION_PLAYER_TAG,
  oam: sPuttingAwayCursorOamData,
  anims: null as null,
  images: 'sPuttingAwayCursorPicTable' as const,  // 1:1 TODO : asset put_away_cursor.png
  affineAnims: null as null,
  callback: 'InitializeCameraSprite1' as const,
};

// ─── 1:1 décomp `sPlaceDecorationYesNoFunctions` (decoration.c:386-390) ─────

const sPlaceDecorationYesNoFunctions: YesNoFuncTable = {
  yesFunc: (taskId) => PlaceDecoration(taskId),
  noFunc:  (taskId) => ContinueDecorating(taskId),
};

// ─── 1:1 décomp `sCancelDecoratingYesNoFunctions` (decoration.c:392-396) ────

const sCancelDecoratingYesNoFunctions: YesNoFuncTable = {
  yesFunc: (taskId) => CancelDecorating(taskId),
  noFunc:  (taskId) => ContinueDecorating(taskId),
};

// ─── 1:1 décomp `sPlacePutAwayYesNoFunctions[]` (decoration.c:398-408) ──────
//
//   [0] = { AttemptPlaceDecoration, AttemptCancelPlaceDecoration }
//   [1] = { AttemptPutAwayDecoration, AttemptCancelPutAwayDecoration }
//
// [1] = Put-Away flow (= section 7 décomp, hors scope) = stub avec warn.

const sPlacePutAwayYesNoFunctions: readonly YesNoFuncTable[] = [
  {
    yesFunc: (taskId) => AttemptPlaceDecoration(taskId),
    noFunc:  (taskId) => AttemptCancelPlaceDecoration(taskId),
  },
  {
    // 1:1 TODO : Put-Away flow (= decoration.c section 7, chantier futur)
    yesFunc: (taskId) => {
      console.warn('[decoration-place STUB] AttemptPutAwayDecoration — port section 7 différé', 'taskId =', taskId);
    },
    noFunc:  (taskId) => {
      console.warn('[decoration-place STUB] AttemptCancelPutAwayDecoration — port section 7 différé', 'taskId =', taskId);
    },
  },
];

// ─── 1:1 décomp `sDecorationStandElevations[]` (decoration.c:410-414) ───────

const sDecorationStandElevations: readonly number[] = [
  4, 4, 4, 4,
  0, 3, 3, 0,
];

// ─── 1:1 décomp `sDecorationSlideElevation[]` (decoration.c:416-422) ────────

const sDecorationSlideElevation: readonly number[] = [
  4, 4,
  4, 4,
  0, 4,
  3, 0,
];

// ─── Helpers internes 1:1 décomp ────────────────────────────────────────────

/** 1:1 décomp `static void SetInitialPositions(u8 taskId)` (decoration.c:1178-1183).
 *
 *    tInitialX = gSaveBlock1Ptr->pos.x;
 *    tInitialY = gSaveBlock1Ptr->pos.y;
 *    PlayerGetDestCoords(&tCursorX, &tCursorY);
 *
 *  Helper privé partagé entre Task_PlaceDecoration et le PutAway flow. */
function SetInitialPositions(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  const data = task.data;
  data[T_INITIAL_X] = gSaveBlock1Ptr.pos?.x ?? 0;
  data[T_INITIAL_Y] = gSaveBlock1Ptr.pos?.y ?? 0;
  const dest = PlayerGetDestCoords();
  data[T_CURSOR_X] = dest.x;
  data[T_CURSOR_Y] = dest.y;
}

/** 1:1 décomp `static void WarpToInitialPosition(u8 taskId)` (decoration.c:1185-1190).
 *
 *    DrawWholeMapView();
 *    SetWarpDestination(mapGroup, mapNum, WARP_ID_NONE, tInitialX, tInitialY);
 *    WarpIntoMap();
 *
 *  STUB partiel — DrawWholeMapView dispo via field-camera.ts mais SetWarpDestination
 *  + WarpIntoMap pas pleinement câblés au niveau overworld TS. */
function WarpToInitialPosition(taskId: number): void {
  console.warn(
    '[decoration-place STUB] WarpToInitialPosition — SetWarpDestination/WarpIntoMap déférés',
    'taskId =', taskId,
  );
  // 1:1 TODO : câbler overworld.c SetWarpDestination + WarpIntoMap (chantier futur).
}

/** 1:1 décomp `static u16 GetDecorationElevation(u8 decoration, u8 tileIndex)`
 *  (decoration.c:1192-1206).
 *
 *    switch (decoration) {
 *    case DECOR_STAND: return sDecorationStandElevations[tileIndex] << SHIFT;
 *    case DECOR_SLIDE: return sDecorationSlideElevation[tileIndex] << SHIFT;
 *    default:          return ELEVATION_INVALID;
 *    } */
function GetDecorationElevation(decoration: number, tileIndex: number): number {
  switch (decoration) {
    case DECOR_STAND:
      return sDecorationStandElevations[tileIndex] << MAPGRID_ELEVATION_SHIFT;
    case DECOR_SLIDE:
      return sDecorationSlideElevation[tileIndex] << MAPGRID_ELEVATION_SHIFT;
    default:
      return ELEVATION_INVALID;
  }
}

// ─── 1:1 décomp PORT SECTION 6 — Place flow ─────────────────────────────────

/** 1:1 décomp `static void Task_PlaceDecoration(u8 taskId)` (decoration.c:1361-1389).
 *
 *    State 0 : wait gPaletteFade !active → SetInitialPositions + tState=1
 *    State 1 : bufferTransferDisabled=TRUE + ConfigureCameraObject +
 *              SetUpDecorationShape + SetUpPlayerAvatar + FadeInFromBlack +
 *              bufferTransferDisabled=FALSE + tState=2
 *    State 2 : wait IsWeatherNotFadingIn → tDecorationItemsMenuCommand=PLACE +
 *              ContinueDecorating(taskId)
 */
export function Task_PlaceDecoration(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  const data = task.data;

  switch (data[T_STATE]) {
    case 0:
      if (!rt.gPaletteFade.active) {
        SetInitialPositions(taskId);
        data[T_STATE] = 1;
      }
      break;
    case 1: {
      rt.gPaletteFade.bufferTransferDisabled = true;
      const decor = _getCurDecorItem();
      ConfigureCameraObjectForPlacingDecoration(sPlaceDecorationGraphicsDataBuffer, decor);
      SetUpDecorationShape(taskId);
      SetUpPlacingDecorationPlayerAvatar(taskId, sPlaceDecorationGraphicsDataBuffer);
      _FadeInFromBlack_STUB();
      rt.gPaletteFade.bufferTransferDisabled = false;
      data[T_STATE] = 2;
      break;
    }
    case 2:
      if (_IsWeatherNotFadingIn_STUB() === true) {
        data[T_DECORATION_ITEMS_MENU_COMMAND] = DECOR_ITEMS_MENU_PLACE;
        ContinueDecorating(taskId);
      }
      break;
  }
}

/** 1:1 décomp `static void ConfigureCameraObjectForPlacingDecoration(...)`
 *  (decoration.c:1391-1399).
 *
 *    sDecor_CameraSpriteObjectIdx1 = gSprites[gFieldCamera.spriteId].data[0];
 *    gFieldCamera.spriteId = gpu_pal_decompress_alloc_tag_and_upload(data, decor);
 *    gSprites[gFieldCamera.spriteId].oam.priority = 1;
 *    gSprites[gFieldCamera.spriteId].callback = InitializePuttingAwayCursorSprite;
 *    gSprites[gFieldCamera.spriteId].x = sDecorationMovementInfo[...].cameraX;
 *    gSprites[gFieldCamera.spriteId].y = sDecorationMovementInfo[...].cameraY;
 *
 *  STUB pour les accès gSprites[].xxx (= système sprite TS non câblé pour
 *  field camera) ; on porte la logique (= alloc sprite + capture idx1). */
export function ConfigureCameraObjectForPlacingDecoration(
  data: PlaceDecorationGraphicsDataBuffer,
  decor: number,
): void {
  console.warn(
    '[decoration-place STUB] ConfigureCameraObjectForPlacingDecoration —',
    'gSprites[gFieldCamera.spriteId].xxx accès non câblés (decoration.c:1391).',
    'decor =', decor,
  );
  // 1:1 TODO : porter gSprites runtime + field-camera spriteId wire (chantier futur).

  // sDecor_CameraSpriteObjectIdx1 = gSprites[gFieldCamera.spriteId].data[0];
  //  → STUB : on capture juste l'ancien spriteId (= comme si data[0] le portait).
  sDecor_CameraSpriteObjectIdx1 = gFieldCamera.spriteId;

  // gFieldCamera.spriteId = gpu_pal_decompress_alloc_tag_and_upload(data, decor);
  gFieldCamera.spriteId = gpu_pal_decompress_alloc_tag_and_upload(data, decor);

  // gSprites[gFieldCamera.spriteId].oam.priority = 1; (= STUB)
  // gSprites[gFieldCamera.spriteId].callback = InitializePuttingAwayCursorSprite; (= STUB)
  // gSprites[gFieldCamera.spriteId].x = sDecorationMovementInfo[shape].cameraX; (= STUB)
  // gSprites[gFieldCamera.spriteId].y = sDecorationMovementInfo[shape].cameraY; (= STUB)
  const info = sDecorationMovementInfo[data.decoration!.shape];
  void info;  // 1:1 TODO : appliquer info.cameraX / info.cameraY au sprite.
}

/** 1:1 décomp `static void SetUpPlacingDecorationPlayerAvatar(u8 taskId, ...)`
 *  (decoration.c:1401-1417).
 *
 *    x = 16 * tDecorWidth + sDecorationMovementInfo[shape].cameraX - 8 * (tDecorWidth - 1);
 *    if (shape ∈ {3x1, 3x3, 3x2}) x -= 8;
 *    if (gender == MALE) sIdx2 = CreateObjectGraphicsSprite(OBJ_EVENT_GFX_BRENDAN_DECORATING, ...);
 *    else                sIdx2 = CreateObjectGraphicsSprite(OBJ_EVENT_GFX_MAY_DECORATING, ...);
 *    gSprites[sIdx2].oam.priority = 1;
 *    DestroySprite(&gSprites[sIdx1]);
 *    sIdx1 = gFieldCamera.spriteId; */
export function SetUpPlacingDecorationPlayerAvatar(
  taskId: number,
  data: PlaceDecorationGraphicsDataBuffer,
): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  const tdata = task.data;
  const shape = data.decoration!.shape;
  const width = tdata[T_DECOR_WIDTH] & 0xFF;

  let x = 16 * width + sDecorationMovementInfo[shape].cameraX - 8 * (width - 1);
  if (shape === DECORSHAPE_3x1 || shape === DECORSHAPE_3x3 || shape === DECORSHAPE_3x2) {
    x -= 8;
  }

  console.warn(
    '[decoration-place STUB] SetUpPlacingDecorationPlayerAvatar —',
    'CreateObjectGraphicsSprite + gSprites[].oam.priority + DestroySprite stubs',
    '(decoration.c:1401, gender =', (gSaveBlock2Ptr.playerGender === MALE ? 'MALE' : 'FEMALE'),
    'x =', x, ').',
  );
  // 1:1 TODO : porter CreateObjectGraphicsSprite + sprite wire (chantier futur).

  const gfx = (gSaveBlock2Ptr.playerGender === MALE)
    ? OBJ_EVENT_GFX_BRENDAN_DECORATING
    : OBJ_EVENT_GFX_MAY_DECORATING;

  // sDecor_CameraSpriteObjectIdx2 = CreateObjectGraphicsSprite(gfx, SpriteCallbackDummy, x, 72, 0);
  void gfx; // capturé symboliquement
  sDecor_CameraSpriteObjectIdx2 = 0;  // STUB id

  // DestroySprite(&gSprites[sDecor_CameraSpriteObjectIdx1]);
  // sDecor_CameraSpriteObjectIdx1 = gFieldCamera.spriteId;
  sDecor_CameraSpriteObjectIdx1 = gFieldCamera.spriteId;
}

/** 1:1 décomp `static void SetUpDecorationShape(u8 taskId)` (decoration.c:1419-1465).
 *
 *  Switch sur `gDecorations[gCurDecorationItems[gCurDecorationIndex]].shape` →
 *  set tDecorWidth/tDecorHeight + (cas DECORSHAPE_1x3) tCursorY++. */
export function SetUpDecorationShape(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  const data = task.data;
  const shape = gDecorations[_getCurDecorItem()].shape;

  switch (shape) {
    case DECORSHAPE_1x1: data[T_DECOR_WIDTH] = 1; data[T_DECOR_HEIGHT] = 1; break;
    case DECORSHAPE_2x1: data[T_DECOR_WIDTH] = 2; data[T_DECOR_HEIGHT] = 1; break;
    case DECORSHAPE_3x1: data[T_DECOR_WIDTH] = 3; data[T_DECOR_HEIGHT] = 1; break;
    case DECORSHAPE_4x2: data[T_DECOR_WIDTH] = 4; data[T_DECOR_HEIGHT] = 2; break;
    case DECORSHAPE_2x2: data[T_DECOR_WIDTH] = 2; data[T_DECOR_HEIGHT] = 2; break;
    case DECORSHAPE_1x2: data[T_DECOR_WIDTH] = 1; data[T_DECOR_HEIGHT] = 2; break;
    case DECORSHAPE_1x3:
      data[T_DECOR_WIDTH] = 1;
      data[T_DECOR_HEIGHT] = 3;
      data[T_CURSOR_Y]++;
      break;
    case DECORSHAPE_2x4: data[T_DECOR_WIDTH] = 2; data[T_DECOR_HEIGHT] = 4; break;
    case DECORSHAPE_3x3: data[T_DECOR_WIDTH] = 3; data[T_DECOR_HEIGHT] = 3; break;
    case DECORSHAPE_3x2: data[T_DECOR_WIDTH] = 3; data[T_DECOR_HEIGHT] = 2; break;
  }
}

/** 1:1 décomp `static void AttemptPlaceDecoration(u8 taskId)` (decoration.c:1467-1474).
 *
 *    tButton = 0;
 *    gSprites[sIdx1].data[7] = 1;
 *    gSprites[sIdx2].data[7] = 1;
 *    ResetCursorMovement();
 *    AttemptPlaceDecoration_(taskId); */
export function AttemptPlaceDecoration(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  task.data[T_BUTTON] = 0;

  console.warn('[decoration-place STUB] AttemptPlaceDecoration —',
    'gSprites[idx1/2].data[7]=1 stubs (decoration.c:1470-1471).');
  // 1:1 TODO : porter `gSprites[sIdx1].data[7] = 1; gSprites[sIdx2].data[7] = 1;`

  ResetCursorMovement();
  AttemptPlaceDecoration_(taskId);
}

/** 1:1 décomp `static void AttemptCancelPlaceDecoration(u8 taskId)` (decoration.c:1476-1484). */
export function AttemptCancelPlaceDecoration(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  task.data[T_BUTTON] = 0;

  console.warn('[decoration-place STUB] AttemptCancelPlaceDecoration —',
    'gSprites[idx1/2].data[7]=1 stubs (decoration.c:1479-1480).');
  // 1:1 TODO : porter `gSprites[sIdx1].data[7] = 1; gSprites[sIdx2].data[7] = 1;`

  ResetCursorMovement();
  const msg = StringExpandPlaceholdersToVar4('gText_CancelDecorating');
  _DisplayItemMessageOnField_STUB(taskId, msg, CancelDecoratingPrompt);
}

/** 1:1 décomp `static bool8 IsSecretBaseTrainerSpot(u8 behaviorAt, u16 layerType)`
 *  (decoration.c:1486-1491). */
function IsSecretBaseTrainerSpot(behaviorAt: number, layerType: number): boolean {
  if (!(_MetatileBehavior_IsSecretBaseTrainerSpot_STUB(behaviorAt) === true
      && layerType === METATILE_LAYER_TYPE_NORMAL)) {
    return false;
  }
  return true;
}

/** 1:1 décomp `static bool8 IsntInitialPosition(u8 taskId, s16 x, s16 y, u16 layerType)`
 *  (decoration.c:1494-1501). Vérifie que la position cible n'est PAS la
 *  position initiale du joueur (= pour éviter de placer sous le joueur). */
function IsntInitialPosition(
  taskId: number,
  x: number,
  y: number,
  layerType: number,
): boolean {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return true;
  const data = task.data;

  if (x === data[T_INITIAL_X] + MAP_OFFSET
   && y === data[T_INITIAL_Y] + MAP_OFFSET
   && layerType !== METATILE_LAYER_TYPE_NORMAL) {
    return false;
  }
  return true;
}

/** 1:1 décomp `static bool8 IsFloorOrBoardAndHole(u16 behaviorAt, const struct Decoration *decoration)`
 *  (decoration.c:1503-1515). */
function IsFloorOrBoardAndHole(
  behaviorAt: number,
  decoration: typeof gDecorations[number],
): boolean {
  if (_MetatileBehavior_IsSecretBaseTrainerSpot_STUB(behaviorAt) !== true) {
    if (decoration.id === DECOR_SOLID_BOARD
     && _MetatileBehavior_IsSecretBaseHole_STUB(behaviorAt) === true) {
      return true;
    }
    if (_MetatileBehavior_IsNormal_STUB(behaviorAt)) {
      return true;
    }
  }
  return false;
}

/** 1:1 décomp `#define GetLayerType(tileId)` (decoration.c:1517-1526).
 *  Avec BUGFIX = UNPACK_LAYER_TYPE(GetMetatileAttributesById(tileId)). */
function GetLayerType(tileId: number): number {
  // 1:1 décomp UNPACK_LAYER_TYPE(attr) = (attr & METATILE_ATTR_LAYER_MASK) >> METATILE_ATTR_LAYER_SHIFT
  return (GetMetatileAttributesById(tileId) & METATILE_ATTR_LAYER_MASK) >> METATILE_ATTR_LAYER_SHIFT;
}

/** 1:1 décomp `static bool8 CanPlaceDecoration(u8 taskId, const struct Decoration *decoration)`
 *  (decoration.c:1528-1640).
 *
 *  Switch sur permission (4 cas) :
 *   - DECORPERM_SOLID_FLOOR / DECORPERM_PASS_FLOOR : vérifie chaque tile dans
 *     la zone décoration (= w*h) IsFloorOrBoardAndHole + IsntInitialPosition
 *     + pas d'object event.
 *   - DECORPERM_BEHIND_FLOOR : vérifie les rangées 0..h-2 (= normal) puis
 *     dernière rangée (= peut être wall ou normal).
 *   - DECORPERM_NA_WALL : vérifie chaque tile = SecretBaseNorthWall +
 *     pas de SandOrnament_BrokenBase juste en dessous.
 *   - DECORPERM_SPRITE : vérifie chaque tile holds Large/Small Decoration +
 *     pas d'object event.
 */
function CanPlaceDecoration(taskId: number, decoration: typeof gDecorations[number]): boolean {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return false;
  const data = task.data;
  let behaviorAt: number;
  let layerType: number;
  let curX: number;
  let curY: number;
  const mapY = data[T_DECOR_HEIGHT] & 0xFF;
  const mapX = data[T_DECOR_WIDTH] & 0xFF;

  switch (decoration.permission) {
    case DECORPERM_SOLID_FLOOR:
    case DECORPERM_PASS_FLOOR:
      for (let i = 0; i < mapY; i++) {
        curY = data[T_CURSOR_Y] - i;
        for (let j = 0; j < mapX; j++) {
          curX = data[T_CURSOR_X] + j;
          behaviorAt = MapGridGetMetatileBehaviorAt(curX, curY);
          layerType = GetLayerType(NUM_TILES_IN_PRIMARY + _decorTileAt(decoration, (mapY - 1 - i) * mapX + j));
          if (!IsFloorOrBoardAndHole(behaviorAt, decoration)) return false;
          if (!IsntInitialPosition(taskId, curX, curY, layerType)) return false;
          behaviorAt = _GetObjectEventIdByPosition_STUB(curX, curY, 0);
          if (behaviorAt !== 0 && behaviorAt !== OBJECT_EVENTS_COUNT) return false;
        }
      }
      break;
    case DECORPERM_BEHIND_FLOOR:
      for (let i = 0; i < mapY - 1; i++) {
        curY = data[T_CURSOR_Y] - i;
        for (let j = 0; j < mapX; j++) {
          curX = data[T_CURSOR_X] + j;
          behaviorAt = MapGridGetMetatileBehaviorAt(curX, curY);
          layerType = GetLayerType(NUM_TILES_IN_PRIMARY + _decorTileAt(decoration, (mapY - 1 - i) * mapX + j));
          if (!_MetatileBehavior_IsNormal_STUB(behaviorAt)
              && !IsSecretBaseTrainerSpot(behaviorAt, layerType)) {
            return false;
          }
          if (!IsntInitialPosition(taskId, curX, curY, layerType)) return false;
          if (_GetObjectEventIdByPosition_STUB(curX, curY, 0) !== OBJECT_EVENTS_COUNT) return false;
        }
      }
      curY = data[T_CURSOR_Y] - mapY + 1;
      for (let j = 0; j < mapX; j++) {
        curX = data[T_CURSOR_X] + j;
        behaviorAt = MapGridGetMetatileBehaviorAt(curX, curY);
        layerType = GetLayerType(NUM_TILES_IN_PRIMARY + _decorTileAt(decoration, j));
        if (!_MetatileBehavior_IsNormal_STUB(behaviorAt)
            && !_MetatileBehavior_IsSecretBaseNorthWall_STUB(behaviorAt)) {
          return false;
        }
        if (!IsntInitialPosition(taskId, curX, curY, layerType)) return false;
        behaviorAt = _GetObjectEventIdByPosition_STUB(curX, curY, 0);
        if (behaviorAt !== 0 && behaviorAt !== OBJECT_EVENTS_COUNT) return false;
      }
      break;
    case DECORPERM_NA_WALL:
      for (let i = 0; i < mapY; i++) {
        curY = data[T_CURSOR_Y] - i;
        for (let j = 0; j < mapX; j++) {
          curX = data[T_CURSOR_X] + j;
          if (!_MetatileBehavior_IsSecretBaseNorthWall_STUB(MapGridGetMetatileBehaviorAt(curX, curY))) {
            return false;
          }
          if (MapGridGetMetatileIdAt(curX, curY + 1) === METATILE_SecretBase_SandOrnament_BrokenBase) {
            return false;
          }
        }
      }
      break;
    case DECORPERM_SPRITE:
      curY = data[T_CURSOR_Y];
      for (let j = 0; j < mapX; j++) {
        curX = data[T_CURSOR_X] + j;
        behaviorAt = MapGridGetMetatileBehaviorAt(curX, curY);
        if (decoration.shape === DECORSHAPE_1x2) {
          if (!_MetatileBehavior_HoldsLargeDecoration_STUB(behaviorAt)) return false;
        } else if (!_MetatileBehavior_HoldsSmallDecoration_STUB(behaviorAt)) {
          if (!_MetatileBehavior_HoldsLargeDecoration_STUB(behaviorAt)) return false;
        }
        if (_GetObjectEventIdByPosition_STUB(curX, curY, 0) !== OBJECT_EVENTS_COUNT) return false;
      }
      break;
  }
  return true;
}

/** 1:1 décomp `static void AttemptPlaceDecoration_(u8 taskId)` (decoration.c:1642-1655).
 *
 *    if (CanPlaceDecoration(...)) {
 *        gText_PlaceItHere → DisplayMessage → PlaceDecorationPrompt;
 *    } else {
 *        PlaySE(SE_FAILURE);
 *        gText_CantBePlacedHere → DisplayMessage → CantPlaceDecorationPrompt;
 *    } */
function AttemptPlaceDecoration_(taskId: number): void {
  const item = _getCurDecorItem();
  if (CanPlaceDecoration(taskId, gDecorations[item]) === true) {
    const msg = StringExpandPlaceholdersToVar4('gText_PlaceItHere');
    _DisplayItemMessageOnField_STUB(taskId, msg, PlaceDecorationPrompt);
  } else {
    PlaySE(_SE_FAILURE);
    const msg = StringExpandPlaceholdersToVar4('gText_CantBePlacedHere');
    _DisplayItemMessageOnField_STUB(taskId, msg, CantPlaceDecorationPrompt);
  }
}

/** 1:1 décomp `static void PlaceDecorationPrompt(u8 taskId)` (decoration.c:1657-1661).
 *
 *    DisplayYesNoMenuDefaultYes();
 *    DoYesNoFuncWithChoice(taskId, &sPlaceDecorationYesNoFunctions); */
function PlaceDecorationPrompt(taskId: number): void {
  _DisplayYesNoMenuDefaultYes_STUB();
  _DoYesNoFuncWithChoice_STUB(taskId, sPlaceDecorationYesNoFunctions);
}

/** 1:1 décomp `static void PlaceDecoration(u8 taskId)` (decoration.c:1663-1683).
 *
 *    ClearDialogWindowAndFrame(0, FALSE);
 *    PlaceDecoration_(taskId);
 *    if (permission != DECORPERM_SPRITE)
 *        ShowDecorationOnMap(tCursorX, tCursorY, decoration);
 *    else {
 *        sCurDecorMapX = tCursorX - MAP_OFFSET;
 *        sCurDecorMapY = tCursorY - MAP_OFFSET;
 *        ScriptContext_SetupScript(SecretBase_EventScript_SetDecoration);
 *    }
 *    gSprites[sIdx1].y += 2;
 *    if (gMapHeader.regionMapSectionId == MAPSEC_SECRET_BASE)
 *        TryPutSecretBaseVisitOnAir();
 *    CancelDecorating_(taskId); */
function PlaceDecoration(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  const data = task.data;
  const item = _getCurDecorItem();

  ClearDialogWindowAndFrame(0, false);
  PlaceDecoration_(taskId);
  if (gDecorations[item].permission !== DECORPERM_SPRITE) {
    _ShowDecorationOnMap_STUB(data[T_CURSOR_X], data[T_CURSOR_Y], item);
  } else {
    sCurDecorMapX = data[T_CURSOR_X] - MAP_OFFSET;
    sCurDecorMapY = data[T_CURSOR_Y] - MAP_OFFSET;
    _ScriptContext_SetupScript_STUB(SecretBase_EventScript_SetDecoration);
  }

  console.warn('[decoration-place STUB] PlaceDecoration — gSprites[sIdx1].y += 2 stub (decoration.c:1678).');
  // 1:1 TODO : porter `gSprites[sDecor_CameraSpriteObjectIdx1].y += 2;`

  if (gMapHeader && (gMapHeader as any).regionMapSectionId === MAPSEC_SECRET_BASE) {
    _TryPutSecretBaseVisitOnAir_STUB();
  }

  CancelDecorating_(taskId);
}

/** 1:1 décomp `static void PlaceDecoration_(u8 taskId)` (decoration.c:1685-1721).
 *
 *  Persiste la décoration dans sDecorationContext + Buffer indices :
 *    - Trouve premier slot DECOR_NONE dans sDecorationContext.items[] :
 *        items[i] = decor; pos[i] = ((tCursorX-MAP_OFFSET) << 4) + (tCursorY-MAP_OFFSET);
 *    - Si !isPlayerRoom : ajoute gCurDecorationIndex+1 dans
 *      sSecretBaseItemsIndicesBuffer[] premier slot DECOR_NONE.
 *    - Sinon : ajoute dans sPlayerRoomItemsIndicesBuffer[].
 *
 *  Le helper accède au state du module decoration.ts (= sDecorationContext,
 *  sSecretBaseItemsIndicesBuffer, sPlayerRoomItemsIndicesBuffer, gCurDecorationIndex)
 *  via globalThis (= 1:1 EWRAM partagé). */
function PlaceDecoration_(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  const data = task.data;
  const ctx = _getDecorationContext();
  if (!ctx || !ctx.items || !ctx.pos) {
    console.warn('[decoration-place STUB] PlaceDecoration_ — sDecorationContext non initialisé');
    return;
  }

  const item = _getCurDecorItem();
  const idx = _getCurDecorationIndex();

  // Slot DECOR_NONE dans ctx.items[] :
  for (let i = 0; i < ctx.size; i++) {
    if (ctx.items[i] === DECOR_NONE) {
      ctx.items[i] = item;
      ctx.pos[i] = ((data[T_CURSOR_X] - MAP_OFFSET) << 4) + (data[T_CURSOR_Y] - MAP_OFFSET);
      break;
    }
  }

  // Index buffer (= UI tracking) :
  if (!ctx.isPlayerRoom) {
    const buf = _getSecretBaseItemsIndicesBuffer();
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] === DECOR_NONE) {
        buf[i] = idx + 1;
        break;
      }
    }
  } else {
    const buf = _getPlayerRoomItemsIndicesBuffer();
    for (let i = 0; i < buf.length; i++) {
      if (buf[i] === DECOR_NONE) {
        buf[i] = idx + 1;
        break;
      }
    }
  }
}

/** 1:1 décomp `static void CancelDecoratingPrompt(u8 taskId)` (decoration.c:1723-1727). */
function CancelDecoratingPrompt(taskId: number): void {
  _DisplayYesNoMenuDefaultYes_STUB();
  _DoYesNoFuncWithChoice_STUB(taskId, sCancelDecoratingYesNoFunctions);
}

/** 1:1 décomp `static void CancelDecorating(u8 taskId)` (decoration.c:1729-1733). */
function CancelDecorating(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  CancelDecorating_(taskId);
}

/** 1:1 décomp `static void CancelDecorating_(u8 taskId)` (decoration.c:1735-1740).
 *
 *    FadeScreen(FADE_TO_BLACK, 0);
 *    tState = 0;
 *    task.func = c1_overworld_prev_quest; */
function CancelDecorating_(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;

  FadeScreen(FADE_TO_BLACK, 0);
  task.data[T_STATE] = 0;
  task.func = (t) => c1_overworld_prev_quest(t.taskId);
}

/** 1:1 décomp `static void c1_overworld_prev_quest(u8 taskId)` (decoration.c:1742-1762).
 *
 *    state 0 : LockPlayerFieldControls + wait fade → WarpToInitialPosition + state=1
 *    state 1 : FreePlayerSpritePalette + FreeSpritePaletteByTag(SELECTOR_TAG) +
 *              gFieldCallback = FieldCB_InitDecorationItemsWindow +
 *              SetMainCallback2(CB2_ReturnToField) + DestroyTask. */
function c1_overworld_prev_quest(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  const data = task.data;

  switch (data[T_STATE]) {
    case 0:
      LockPlayerFieldControls();
      if (!rt.gPaletteFade.active) {
        WarpToInitialPosition(taskId);
        data[T_STATE] = 1;
      }
      break;
    case 1:
      FreePlayerSpritePalette();
      _FreeSpritePaletteByTag_STUB(PLACE_DECORATION_SELECTOR_TAG);
      console.warn(
        '[decoration-place STUB] c1_overworld_prev_quest state=1 —',
        'gFieldCallback = FieldCB_InitDecorationItemsWindow + SetMainCallback2(CB2_ReturnToField) stubs',
        '(decoration.c:1757-1758)',
      );
      // 1:1 TODO : porter gFieldCallback + SetMainCallback2 + CB2_ReturnToField wire (chantier futur).
      DestroyTask(taskId);
      break;
  }
}

/** 1:1 décomp `static void FieldCB_InitDecorationItemsWindow(void)` (decoration.c:1788-1797).
 *
 *    LockPlayerFieldControls();
 *    FadeInFromBlack();
 *    taskId = CreateTask(Task_InitDecorationItemsWindow, 8);
 *    AddDecorationItemsWindow(taskId);
 *    gTasks[taskId].tState = 0; */
export function FieldCB_InitDecorationItemsWindow(): void {
  LockPlayerFieldControls();
  _FadeInFromBlack_STUB();
  console.warn(
    '[decoration-place STUB] FieldCB_InitDecorationItemsWindow —',
    'Task_InitDecorationItemsWindow + AddDecorationItemsWindow non câblés (decoration.c:1788).',
  );
  // 1:1 TODO : référencer Task_InitDecorationItemsWindow + AddDecorationItemsWindow
  // depuis decoration.ts (= sections 4-5 déjà portées, à exposer).
  const taskId = CreateTask(() => { /* Task_InitDecorationItemsWindow STUB */ }, 8);
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.data[T_STATE] = 0;
}

/** 1:1 décomp `static bool8 ApplyCursorMovement_IsInvalid(u8 taskId)`
 *  (decoration.c:1799-1827).
 *
 *  Si le mouvement dernier (= sDecorationLastDirectionMoved) sort de la map,
 *  on annule (= incrémente/décrémente tCursorX/Y pour le ramener et retourne
 *  FALSE pour signaler bord-de-map atteint). */
function ApplyCursorMovement_IsInvalid(taskId: number): boolean {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return true;
  const data = task.data;
  const map = gMapHeader;
  const mapHeight = (map as any)?.mapLayout?.height ?? 100;
  const mapWidth = (map as any)?.mapLayout?.width ?? 100;

  if (sDecorationLastDirectionMoved === DIR_SOUTH
   && data[T_CURSOR_Y] - data[T_DECOR_HEIGHT] - 6 < 0) {
    data[T_CURSOR_Y]++;
    return false;
  }
  if (sDecorationLastDirectionMoved === DIR_NORTH
   && data[T_CURSOR_Y] - 7 >= mapHeight) {
    data[T_CURSOR_Y]--;
    return false;
  }
  if (sDecorationLastDirectionMoved === DIR_WEST
   && data[T_CURSOR_X] - 7 < 0) {
    data[T_CURSOR_X]++;
    return false;
  }
  if (sDecorationLastDirectionMoved === DIR_EAST
   && data[T_CURSOR_X] + data[T_DECOR_WIDTH] - 8 >= mapWidth) {
    data[T_CURSOR_X]--;
    return false;
  }
  return true;
}

/** 1:1 décomp `static bool8 IsHoldingDirection(void)` (decoration.c:1829-1836).
 *
 *  heldKeys = JOY_HELD(DPAD_ANY);
 *  return heldKeys ∈ {DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT}; */
function IsHoldingDirection(): boolean {
  const DPAD_ANY = DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT;
  const heldKeys = JOY_HELD(DPAD_ANY);
  if (heldKeys !== DPAD_UP && heldKeys !== DPAD_DOWN
   && heldKeys !== DPAD_LEFT && heldKeys !== DPAD_RIGHT) {
    return false;
  }
  return true;
}

/** 1:1 décomp `static void ResetCursorMovement(void)` (decoration.c:1838-1843).
 *
 *    sDecorationLastDirectionMoved = 0;
 *    gSprites[sIdx1].data[2] = 0;
 *    gSprites[sIdx1].data[3] = 0; */
export function ResetCursorMovement(): void {
  sDecorationLastDirectionMoved = 0;
  console.warn('[decoration-place STUB] ResetCursorMovement —',
    'gSprites[sIdx1].data[2/3]=0 stubs (decoration.c:1841-1842).');
  // 1:1 TODO : porter `gSprites[sDecor_CameraSpriteObjectIdx1].data[2/3] = 0;`
}

/** 1:1 décomp `static void Task_SelectLocation(u8 taskId)` (decoration.c:1845-1912).
 *
 *  Loop principale du Place flow :
 *    - Si !gSprites[sIdx1].data[4] :
 *        Si tButton == A_BUTTON : sPlacePutAwayYesNoFunctions[cmd].yesFunc(taskId);
 *        Si tButton == B_BUTTON : sPlacePutAwayYesNoFunctions[cmd].noFunc(taskId);
 *        Sinon : capture DPAD held → sDecorationLastDirectionMoved + sprite vel +
 *                tCursorX/Y--/++ + IsHoldingDirection + ApplyCursorMovement_IsInvalid.
 *    - Si sDecorationLastDirectionMoved : incrément frame counter (sprite.data[4] & 7).
 *    - Si !tButton : capture JOY_NEW(A/B) → tButton.
 *
 *  STUB partiel : accès gSprites[].data[2/3/4] stubs ; reste de la logique
 *  cursor 1:1 réel. */
function Task_SelectLocation(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  const data = task.data;

  // STUB : gSprites[sIdx1].data[4] (= frame counter cursor animation).
  // On considère que data[4] est toujours 0 (= toujours dispo pour input)
  // pour ne pas bloquer la task.
  const spriteData4 = 0;
  if (!spriteData4) {
    if (data[T_BUTTON] === A_BUTTON) {
      sPlacePutAwayYesNoFunctions[data[T_DECORATION_ITEMS_MENU_COMMAND]].yesFunc(taskId);
      return;
    }
    if (data[T_BUTTON] === B_BUTTON) {
      sPlacePutAwayYesNoFunctions[data[T_DECORATION_ITEMS_MENU_COMMAND]].noFunc(taskId);
      return;
    }

    const DPAD_ANY = DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT;
    const held = JOY_HELD(DPAD_ANY);

    if (held === DPAD_UP) {
      sDecorationLastDirectionMoved = DIR_SOUTH;
      _setSpriteVelocity_STUB(sDecor_CameraSpriteObjectIdx1, 0, -2);
      data[T_CURSOR_Y]--;
    }
    if (held === DPAD_DOWN) {
      sDecorationLastDirectionMoved = DIR_NORTH;
      _setSpriteVelocity_STUB(sDecor_CameraSpriteObjectIdx1, 0, 2);
      data[T_CURSOR_Y]++;
    }
    if (held === DPAD_LEFT) {
      sDecorationLastDirectionMoved = DIR_WEST;
      _setSpriteVelocity_STUB(sDecor_CameraSpriteObjectIdx1, -2, 0);
      data[T_CURSOR_X]--;
    }
    if (held === DPAD_RIGHT) {
      sDecorationLastDirectionMoved = DIR_EAST;
      _setSpriteVelocity_STUB(sDecor_CameraSpriteObjectIdx1, 2, 0);
      data[T_CURSOR_X]++;
    }

    if (!IsHoldingDirection() || !ApplyCursorMovement_IsInvalid(taskId)) {
      ResetCursorMovement();
    }
  }

  if (sDecorationLastDirectionMoved) {
    // STUB : gSprites[sIdx1].data[4]++; gSprites[sIdx1].data[4] &= 7;
    console.warn('[decoration-place STUB] Task_SelectLocation — sprite.data[4] frame counter stub');
    // 1:1 TODO : porter `gSprites[sDecor_CameraSpriteObjectIdx1].data[4]++ &= 7;`
  }

  if (!data[T_BUTTON]) {
    if (JOY_NEW(A_BUTTON)) data[T_BUTTON] = A_BUTTON;
    if (JOY_NEW(B_BUTTON)) data[T_BUTTON] = B_BUTTON;
  }
}

/** 1:1 décomp `static void ContinueDecorating(u8 taskId)` (decoration.c:1914-1920).
 *
 *    ClearDialogWindowAndFrame(0, TRUE);
 *    gSprites[sIdx1].data[7] = 0;
 *    tButton = 0;
 *    task.func = Task_SelectLocation; */
export function ContinueDecorating(taskId: number): void {
  ClearDialogWindowAndFrame(0, true);
  console.warn('[decoration-place STUB] ContinueDecorating —',
    'gSprites[sIdx1].data[7]=0 stub (decoration.c:1917).');
  // 1:1 TODO : porter `gSprites[sDecor_CameraSpriteObjectIdx1].data[7] = 0;`

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (!task) return;
  task.data[T_BUTTON] = 0;
  task.func = (t) => Task_SelectLocation(t.taskId);
}

/** 1:1 décomp `static void CantPlaceDecorationPrompt(u8 taskId)` (decoration.c:1922-1926).
 *
 *    if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON))
 *        ContinueDecorating(taskId); */
function CantPlaceDecorationPrompt(taskId: number): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON)) {
    ContinueDecorating(taskId);
  }
}

// ─── 1:1 décomp sprite callbacks (decoration.c:2021-2048) ───────────────────

/** 1:1 décomp `static void InitializePuttingAwayCursorSprite(struct Sprite *sprite)`
 *  (decoration.c:2021-2030). Reset sprite->data[2..7]=0 + chain callback. */
export function InitializePuttingAwayCursorSprite(sprite: any): void {
  if (sprite) {
    if (sprite.data) {
      sprite.data[2] = 0;
      sprite.data[3] = 0;
      sprite.data[4] = 0;
      sprite.data[5] = 0;
      sprite.data[6] = 0;
      sprite.data[7] = 0;
    }
    sprite.callback = InitializePuttingAwayCursorSprite2;
  }
}

/** 1:1 décomp `static void InitializePuttingAwayCursorSprite2(struct Sprite *sprite)`
 *  (decoration.c:2032-2048). Cursor blink animation (= invisible toggle). */
export function InitializePuttingAwayCursorSprite2(sprite: any): void {
  if (!sprite || !sprite.data) return;

  if (sprite.data[7] === 0) {
    if (sprite.data[6] < 15) {
      sprite.invisible = 0;
    } else {
      sprite.invisible = 1;
    }
    sprite.data[6]++;
    sprite.data[6] &= 0x1F;
  } else {
    sprite.invisible = false;
  }
}

/** 1:1 décomp `static u8 gpu_pal_decompress_alloc_tag_and_upload(...)`
 *  (decoration.c:2050-2064).
 *
 *    ClearPlaceDecorationGraphicsDataBuffer(data);
 *    data->decoration = &gDecorations[decor];
 *    if (permission == DECORPERM_SPRITE)
 *        return CreateObjectGraphicsSprite(data->decoration->tiles[0], SpriteCallbackDummy, 0, 0, 1);
 *    FreeSpritePaletteByTag(SELECTOR_TAG);
 *    SetDecorSelectionMetatiles(data);
 *    SetDecorSelectionBoxOamAttributes(data->decoration->shape);
 *    SetDecorSelectionBoxTiles(data);
 *    CopyPalette(data->palette, ((u16 *)gTilesetPointer_SecretBaseRedCave->metatiles)[(tiles[0]*8)+7] >> 12);
 *    LoadSpritePalette(&sSpritePal_PlaceDecoration);
 *    return CreateSprite(&sDecorationSelectorSpriteTemplate, 0, 0, 0);
 *
 *  STUB : Set*Metatiles/Tiles/Oam manipulent gTilesetPointer_SecretBase{,RedCave}
 *  + le buffer image[0x800] (= tiles décompressés du tileset secret base).
 *  Pas porté ici (= assets tilesets décomp non extraits).
 *
 *  On retourne un spriteId STUB 0 pour ne pas freezer le flow. */
export function gpu_pal_decompress_alloc_tag_and_upload(
  data: PlaceDecorationGraphicsDataBuffer,
  decor: number,
): number {
  console.warn(
    '[decoration-place STUB] gpu_pal_decompress_alloc_tag_and_upload —',
    'gTilesetPointer_SecretBase* + sprite create non câblés (decoration.c:2050).',
    'decor =', decor,
  );
  // 1:1 TODO : porter SetDecorSelectionMetatiles + SetDecorSelectionBoxOamAttributes +
  // SetDecorSelectionBoxTiles + CopyPalette + LoadSpritePalette + CreateSprite
  // (= chantier futur, dépend gTilesetPointer_SecretBase + gTilesetPointer_SecretBaseRedCave).

  // ClearPlaceDecorationGraphicsDataBuffer(data) :
  data.tiles.fill(0);
  data.image.fill(0);
  data.palette.fill(0);
  data.decoration = gDecorations[decor];

  if (data.decoration?.permission === DECORPERM_SPRITE) {
    // return CreateObjectGraphicsSprite(...) - STUB
    return 0;
  }
  // FreeSpritePaletteByTag(SELECTOR_TAG) - STUB
  _FreeSpritePaletteByTag_STUB(PLACE_DECORATION_SELECTOR_TAG);
  // ... + CreateSprite(...) - STUB
  return 0;
}

/** 1:1 décomp `static const u32 *GetDecorationIconPicOrPalette(u16 decor, u8 mode)`
 *  (decoration.c:2095-2101).
 *
 *    if (decor > NUM_DECORATIONS) decor = DECOR_NONE;
 *    return gDecorIconTable[decor][mode]; */
export function GetDecorationIconPicOrPalette(decor: number, mode: number): string | null {
  const NUM_DECORATIONS = 121;  // 1:1 décomp constants/decorations.h
  if (decor > NUM_DECORATIONS) decor = DECOR_NONE;
  console.warn(
    '[decoration-place STUB] GetDecorationIconPicOrPalette —',
    'gDecorIconTable non câblée (data/decoration/icon.h).',
    'decor =', decor, 'mode =', mode,
  );
  // 1:1 TODO : porter gDecorIconTable[decor][mode] depuis data/decoration/icon.h.
  return null;
}

/** 1:1 décomp `static void InitializeCameraSprite1(struct Sprite *sprite)`
 *  (decoration.c:2696-2704).
 *
 *    sprite->data[0]++; sprite->data[0] &= 0x1F;
 *    sprite->invisible = (sprite->data[0] > 15) ? TRUE : FALSE; */
export function InitializeCameraSprite1(sprite: any): void {
  if (!sprite || !sprite.data) return;
  sprite.data[0]++;
  sprite.data[0] &= 0x1F;
  sprite.invisible = (sprite.data[0] > 15);
}

/** 1:1 décomp `static void LoadPlayerSpritePalette(void)` (decoration.c:2706-2712).
 *
 *    if (gender == MALE) LoadSpritePalette(&sSpritePal_PuttingAwayCursorBrendan);
 *    else                LoadSpritePalette(&sSpritePal_PuttingAwayCursorMay); */
export function LoadPlayerSpritePalette(): void {
  console.warn(
    '[decoration-place STUB] LoadPlayerSpritePalette —',
    'sBrendanPalette/sMayPalette assets non extraits (graphics/decorations/{brendan,may}.pal).',
  );
  // 1:1 TODO : extraire assets graphics/decorations/{brendan,may}.pal + appeler
  // LoadSpritePalette(sSpritePal_PuttingAwayCursor{Brendan,May}) (chantier futur).
  const pal = (gSaveBlock2Ptr.playerGender === MALE)
    ? sSpritePal_PuttingAwayCursorBrendan
    : sSpritePal_PuttingAwayCursorMay;
  void pal;  // capturé symboliquement
}

/** 1:1 décomp `static void FreePlayerSpritePalette(void)` (decoration.c:2714-2717).
 *
 *    FreeSpritePaletteByTag(PLACE_DECORATION_PLAYER_TAG); */
export function FreePlayerSpritePalette(): void {
  _FreeSpritePaletteByTag_STUB(PLACE_DECORATION_PLAYER_TAG);
}

// ─── Helpers privés accessoires (= STUBS pour symboles non exposés) ─────────

/** STUB : accès à `gCurDecorationItems[gCurDecorationIndex]` côté decoration.ts
 *  (= state EWRAM partagé). Évite import circulaire. */
function _getCurDecorItem(): number {
  const dec = (globalThis as any).gCurDecorationItems as number[] | null | undefined;
  const idx = (globalThis as any).gCurDecorationIndex as number | undefined;
  if (!dec || idx == null) return DECOR_NONE;
  return dec[idx] ?? DECOR_NONE;
}

/** STUB : accès à `gCurDecorationIndex` côté decoration.ts. */
function _getCurDecorationIndex(): number {
  return ((globalThis as any).gCurDecorationIndex as number | undefined) ?? 0;
}

/** STUB : accès à `sDecorationContext` côté decoration.ts (= EWRAM module-state). */
function _getDecorationContext(): {
  items: number[];
  pos: number[];
  size: number;
  isPlayerRoom: boolean;
} | null {
  return ((globalThis as any).sDecorationContext as any) ?? null;
}

/** STUB : accès à `sSecretBaseItemsIndicesBuffer[]` côté decoration.ts. */
function _getSecretBaseItemsIndicesBuffer(): number[] {
  return ((globalThis as any).sSecretBaseItemsIndicesBuffer as number[] | undefined) ?? [];
}

/** STUB : accès à `sPlayerRoomItemsIndicesBuffer[]` côté decoration.ts. */
function _getPlayerRoomItemsIndicesBuffer(): number[] {
  return ((globalThis as any).sPlayerRoomItemsIndicesBuffer as number[] | undefined) ?? [];
}

/** STUB : accès à `decoration.tiles[N]` (tiles est typé `string` dans
 *  decoration-data.ts car les assets sont des clés). On retourne 0 pour
 *  ne pas crasher le calcul (= 1:1 TODO : extraire data/decoration/tiles.h). */
function _decorTileAt(_decoration: typeof gDecorations[number], _tileIndex: number): number {
  // 1:1 TODO : porter data/decoration/tiles.h vers un Uint16Array[].
  return 0;
}

// ─── STUBS metatile_behavior.c (= helpers de classification metatile) ────────
//
// Tous ces helpers sont dans metatile_behavior.c, ~50 helpers boolean qui
// classifient les metatiles. Pas tous portés en TS, donc STUB explicite.

function _MetatileBehavior_IsSecretBaseTrainerSpot_STUB(_behaviorAt: number): boolean {
  console.warn('[decoration-place STUB] MetatileBehavior_IsSecretBaseTrainerSpot — metatile_behavior.c différé');
  return false;
}
function _MetatileBehavior_IsSecretBaseHole_STUB(_behaviorAt: number): boolean {
  console.warn('[decoration-place STUB] MetatileBehavior_IsSecretBaseHole — metatile_behavior.c différé');
  return false;
}
function _MetatileBehavior_IsNormal_STUB(_behaviorAt: number): boolean {
  console.warn('[decoration-place STUB] MetatileBehavior_IsNormal — metatile_behavior.c différé');
  return false;
}
function _MetatileBehavior_IsSecretBaseNorthWall_STUB(_behaviorAt: number): boolean {
  console.warn('[decoration-place STUB] MetatileBehavior_IsSecretBaseNorthWall — metatile_behavior.c différé');
  return false;
}
function _MetatileBehavior_HoldsLargeDecoration_STUB(_behaviorAt: number): boolean {
  console.warn('[decoration-place STUB] MetatileBehavior_HoldsLargeDecoration — metatile_behavior.c différé');
  return false;
}
function _MetatileBehavior_HoldsSmallDecoration_STUB(_behaviorAt: number): boolean {
  console.warn('[decoration-place STUB] MetatileBehavior_HoldsSmallDecoration — metatile_behavior.c différé');
  return false;
}

// ─── STUB GetObjectEventIdByPosition (= object-events.ts existe mais signature
//     diffère ; on STUB ici pour rester contained) ─────────────────────────

function _GetObjectEventIdByPosition_STUB(_x: number, _y: number, _z: number): number {
  console.warn('[decoration-place STUB] GetObjectEventIdByPosition — wire object-events.ts différé');
  return OBJECT_EVENTS_COUNT;  // = no object event found
}

// ─── STUB FadeInFromBlack / IsWeatherNotFadingIn ────────────────────────────

function _FadeInFromBlack_STUB(): void {
  console.warn('[decoration-place STUB] FadeInFromBlack — field_screen_effect.c différé');
  // 1:1 TODO : porter FadeInFromBlack depuis field_screen_effect.c.
}

function _IsWeatherNotFadingIn_STUB(): boolean {
  // STUB : on retourne TRUE direct pour ne pas freezer la task (= simulation
  // honnête, fade weather est instant chez nous).
  return true;
}

// ─── STUB FreeSpritePaletteByTag / ShowDecorationOnMap ──────────────────────

function _FreeSpritePaletteByTag_STUB(_tag: number): void {
  console.warn('[decoration-place STUB] FreeSpritePaletteByTag — sprite.c différé', 'tag =', _tag);
  // 1:1 TODO : porter FreeSpritePaletteByTag depuis sprite.c (ou utiliser
  // l'import auto/src-all/sprite-all-auto.ts).
}

/** STUB : `void ShowDecorationOnMap(u16 mapX, u16 mapY, u16 decoration)`
 *  (decoration.c:1245-1280). Écrit le metatile de la décoration sur la map.
 *  Logique complète portable mais dépend de MapGridSetMetatileIdAt et
 *  GetDecorationElevation (= fait), + `gDecorations[].tiles[]` qui est typé
 *  string ici (= 1:1 TODO data/decoration/tiles.h). */
function _ShowDecorationOnMap_STUB(_mapX: number, _mapY: number, _decoration: number): void {
  console.warn(
    '[decoration-place STUB] ShowDecorationOnMap —',
    'gDecorations[].tiles[] typé string (data/decoration/tiles.h non porté).',
    'mapX =', _mapX, 'mapY =', _mapY, 'decoration =', _decoration,
  );
  // 1:1 TODO : extraire data/decoration/tiles.h vers Uint16Array[] + appeler
  // GetDecorationElevation + MapGridSetMetatileEntryAt 1:1 (decoration.c:1208-1280).
}

// ─── STUB sprite velocity / SE_FAILURE constant ─────────────────────────────

function _setSpriteVelocity_STUB(_spriteId: number, _dx: number, _dy: number): void {
  // 1:1 TODO : porter `gSprites[id].data[2]=dx; gSprites[id].data[3]=dy;`
}

// 1:1 décomp constants/songs.h SE_FAILURE (= bip "no").
const _SE_FAILURE = 17;

// ─── 1:1 décomp note de portabilité ─────────────────────────────────────────
//
// Sections restantes (= hors scope de ce port) :
//   - Section 7 (decoration.c:2260-2700) : Put-Away flow (Task_PutAwayDecoration,
//     ContinuePuttingAwayDecorations, AttemptPutAway*, ReturnDecorationPrompt,
//     PutAwayDecoration, StopPuttingAwayDecorations*, AttemptMarkDecor*,
//     MarkSpriteDecorsInBoundsForRemoval, ClearRearrangementNonSprites,
//     SetDecorRearrangementShape, SetCameraSpritePosition,
//     DecorationIsUnderCursor, SetDecorRearrangementFlagIdIfFlagUnset,
//     Task_StopPuttingAwayDecorations, Task_ReinitializeDecorationMenuHandler,
//     FieldCB_StopPuttingAwayDecorations).
//   - Section 8 (decoration.c:2719-2749) : Toss flow (DecorationItemsMenuAction_AttemptToss,
//     TossDecorationPrompt, TossDecoration).
//   - data/decoration/tiles.h : assets graphiques (= gDecorations[].tiles[]).
//   - data/decoration/icon.h : gDecorIconTable[][].
//   - graphics/decorations/{brendan,may}.pal : palettes player decorating.
//   - SecretBase_EventScript_SetDecoration : script trigger spawn object event.
//   - gTilesetPointer_SecretBase{,RedCave} : tilesets décomp pour tile decompression.
//
// Pour ces sections, ce port expose les fonctions nommées 1:1 décomp avec
// `console.warn` + commentaire `// 1:1 TODO : ...` pour signaler la dette.
