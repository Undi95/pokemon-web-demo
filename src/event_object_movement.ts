/**
 * event_object_movement.ts — miroir 1:1 décomp `src/event_object_movement.c`
 * (NPCs / object events overworld : spawn, MovementType, collision, interact,
 * anims, reflets, palettes object-event).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_object_movement.c`
 *     (TrySpawnObjectEvents, MovementType_*_Step*, GetObjectEventGraphicsInfo,
 *     les MovementAction funcs, GroundEffects/reflets, palettes object-event)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.fieldmap.h` (struct
 *     ObjectEvent, ObjectEventTemplate)
 *
 * ── DÉVIATION M3 assumée (rendu sprite NPC) ──
 * Le rendu du sprite NPC est unifié sur le chemin décomp (AnimateSprite drive
 * oam.tileNum via les AnimCmd ; sprite.anims wired via graphicsInfo, 245/245
 * records) — comme le sprite joueur (chantier M3). Le rendu manuel legacy
 * (NPC_SPRITE_FRAMES) a été retiré (chantier M3-NPC M1, code mort). RESTENT 2 cas
 * spéciaux de cutscène d'intro encore rendus à la main par `updateNpcSpriteFrame`,
 * à porter sur AnimateSprite (M3-NPC M2/M3) :
 *   - Vigoroth 32×32 (`is32x32`, déménageurs de l'intro de Bourg-en-Vol)
 *   - truck 48×48 (`useSubsprites`, camion de l'intro) → syncSubspriteOam
 */
import type { DecompRuntime, DecompSprite } from '../harness/runtime/decomp-runtime';
import { loadIndexedPngStrict, loadGbaPal } from '../harness/gba/png-loader';
import type { LoadedPng } from '../harness/gba/png-loader';
import type { OamEntry } from '../harness/gba/types';
import { AllocSpriteTiles, MarkObjTilesFree, getReservedSpriteTileCount, LoadSpritePalette, FreeAllSpritePalettes, setReservedSpritePaletteCount, sSpritePaletteTags } from './sprite';
import { LoadPalette } from '../harness/runtime/decomp-globals';
import { OBJ_PLTT_ID } from '../harness/runtime/decomp-runtime';
// 1:1 décomp : ObjAffineSet (BIOS, decomp-bridge) + SetOamMatrix (sprite.c:673) pour piloter
// les matrices OAM 0/1 animées par CreateReflectionEffectSprites (= ondulation des reflets eau).
import { ObjAffineSet } from '../harness/runtime/decomp-bridge';
import { SetOamMatrix } from '../harness/runtime/decomp-helpers';
// 1:1 STRICT décomp `base_oam.h` : OAM templates par dimensions (16x32, 32x32,
// 16x16, 48x48-via-16x32). Au CreateSpriteAt, le décomp fait `sprite->oam =
// *template->oam` qui set shape/size/priority depuis ce template. Notre port
// dérive le template depuis frameWidth/frameHeight catalog (= équivalent
// fonctionnel à `graphicsInfo->oam`).
// GetBaseOamForDimensions (helper port non-1:1, ex-object-event-base-oam) défini en bas de ce fichier.
import {
  gObjectEventBaseOam_8x8, gObjectEventBaseOam_16x8, gObjectEventBaseOam_16x16,
  gObjectEventBaseOam_32x8, gObjectEventBaseOam_64x32, gObjectEventBaseOam_16x32,
  gObjectEventBaseOam_32x32, gObjectEventBaseOam_64x64,
} from './data/object_events/base_oam';
import type { OamData } from '../include/gba/types';
// G6 — 1:1 STRICT décomp anim helpers pour MovementType callbacks
// (tickWanderAround, tickLookAround). Use SeekSpriteAnim (= 1:1 sprite.c:1359)
// pour alterner walk1/walk2 entre 2 steps consécutifs.
import { SeekSpriteAnim, StartSpriteAnim, AnimateSprite, ProcessSpriteCopyRequests } from './sprite';
// 1:1 STRICT décomp `gObjectEventGraphicsInfoPointers[]` (= 245 records portés).
// Lookup graphicsId → graphicsInfo record qui contient oam/size/width/height/etc.
// 1:1 décomp pure. Si trouvé, utilise graphicsInfo.oam (= shape/size/priority
// depuis base_oam template authoritative). Fallback dimensions-based pour les
// rares graphicsId absents du décomp (= e.g. OBJ_EVENT_GFX_VAR_* dynamiques).
// GetObjectEventGraphicsInfo (event_object_movement.c:1538) est défini en bas de CE fichier (1:1 décomp).
import { gObjectEventGraphicsInfoPointers } from './data/object_events/object_event_graphics_info_pointers';
import { gBerryTreePicTableBuilders, sAnimTable_BerryTree } from './data/object_events/berry_tree_graphics_tables';
import type { ObjectEventGraphicsInfo } from '../include/global.fieldmap';
// 1:1 décomp : PALSLOT_* (include/event_object_movement.h:11-26) + OBJ_EVENT_PAL_TAG_*
// (enum event_object_movement.c:435-471, hébergé au header-miroir LEAF anti-cycle —
// cf. include/event_object_movement.ts). Utilisées par la chaîne palette des reflets
// (LoadObjectReflectionPalette + sPlayerReflectionPaletteSets + sSpecialObject...).
import {
  PALSLOT_PLAYER, PALSLOT_NPC_SPECIAL, OBJ_PALSLOT_COUNT,
  PALSLOT_NPC_1, PALSLOT_NPC_2, PALSLOT_NPC_3, PALSLOT_NPC_4,
  PALSLOT_PLAYER_REFLECTION,
  PALSLOT_NPC_1_REFLECTION, PALSLOT_NPC_2_REFLECTION,
  PALSLOT_NPC_3_REFLECTION, PALSLOT_NPC_4_REFLECTION,
  PALSLOT_NPC_SPECIAL_REFLECTION,
  OBJ_EVENT_PAL_TAG_BRENDAN, OBJ_EVENT_PAL_TAG_BRENDAN_REFLECTION,
  OBJ_EVENT_PAL_TAG_MAY, OBJ_EVENT_PAL_TAG_MAY_REFLECTION,
  OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER, OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION,
  OBJ_EVENT_PAL_TAG_NPC_1_REFLECTION, OBJ_EVENT_PAL_TAG_NPC_2_REFLECTION,
  OBJ_EVENT_PAL_TAG_NPC_3_REFLECTION, OBJ_EVENT_PAL_TAG_NPC_4_REFLECTION,
  OBJ_EVENT_PAL_TAG_QUINTY_PLUMP, OBJ_EVENT_PAL_TAG_QUINTY_PLUMP_REFLECTION,
  OBJ_EVENT_PAL_TAG_TRUCK, OBJ_EVENT_PAL_TAG_VIGOROTH, OBJ_EVENT_PAL_TAG_MOVING_BOX,
  OBJ_EVENT_PAL_TAG_CABLE_CAR, OBJ_EVENT_PAL_TAG_SSTIDAL,
  OBJ_EVENT_PAL_TAG_KYOGRE, OBJ_EVENT_PAL_TAG_KYOGRE_REFLECTION,
  OBJ_EVENT_PAL_TAG_GROUDON, OBJ_EVENT_PAL_TAG_GROUDON_REFLECTION,
  OBJ_EVENT_PAL_TAG_NPC_3, OBJ_EVENT_PAL_TAG_SUBMARINE_SHADOW, OBJ_EVENT_PAL_TAG_RED_LEAF,
  OBJ_EVENT_PAL_TAG_NONE,
} from '../include/event_object_movement';

/** 1:1 STRICT décomp `gReflectionEffectPaletteMap[16]` (event_object_movement.c:182).
 *  Mappe le slot palette MAIN d'un object event → son slot palette REFLET.
 *  (Rapatrié de engine/field/object-event-graphics-info.ts, unification lot 17a.) */
export const gReflectionEffectPaletteMap: ReadonlyArray<number> = (() => {
  const m = new Array<number>(16).fill(0);
  m[PALSLOT_PLAYER] = PALSLOT_PLAYER_REFLECTION;
  m[PALSLOT_PLAYER_REFLECTION] = PALSLOT_PLAYER_REFLECTION;
  m[PALSLOT_NPC_1] = PALSLOT_NPC_1_REFLECTION;
  m[PALSLOT_NPC_2] = PALSLOT_NPC_2_REFLECTION;
  m[PALSLOT_NPC_3] = PALSLOT_NPC_3_REFLECTION;
  m[PALSLOT_NPC_4] = PALSLOT_NPC_4_REFLECTION;
  m[PALSLOT_NPC_1_REFLECTION] = PALSLOT_NPC_1_REFLECTION;
  m[PALSLOT_NPC_2_REFLECTION] = PALSLOT_NPC_2_REFLECTION;
  m[PALSLOT_NPC_3_REFLECTION] = PALSLOT_NPC_3_REFLECTION;
  m[PALSLOT_NPC_4_REFLECTION] = PALSLOT_NPC_4_REFLECTION;
  m[PALSLOT_NPC_SPECIAL] = PALSLOT_NPC_SPECIAL_REFLECTION;
  m[PALSLOT_NPC_SPECIAL_REFLECTION] = PALSLOT_NPC_SPECIAL_REFLECTION;
  return m;
})();
import {
  type ObjectEventTemplate,
  type MapHeader,
  MAP_OFFSET,
  gMapHeader,
  MapGridGetCollisionAt,
  MapGridGetElevationAt,
  MapGridGetMetatileBehaviorAt,
  GetMapBorderIdAt,
  CanCameraMoveInDirection,
} from './fieldmap';
import { GetCameraTopLeftCoords, gTotalCamera, gCamera, gFieldCamera } from './field_camera';
import { gPlayerAvatar, GetPlayerFacingDirection } from './field_player_avatar';
import {
  DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST,
  DIR_SOUTHWEST, DIR_SOUTHEAST, DIR_NORTHWEST, DIR_NORTHEAST,
} from '../include/global.fieldmap';
import { _registerGObjectEvents, _registerNpcHelpers, _registerUpdateObjectEventsForCameraUpdate, _registerCameraObjectHelpers } from './engine/field/field-globals';
import { FlagGet, FlagSet, VarGet } from './engine/script/script-vars';
import { Random } from './random';
// Pour OBJ_EVENT_GFX_VAR_N resolution au spawn (= rival NPC sprite genre opposé).
import { reverseDecompConstant as _reverseDecompConstant } from '../harness/runtime/decomp-constants';
// 1:1 décomp : accès direct aux vars via `gSaveBlock1Ptr->vars[id - VARS_START]`
// (event_data.c:164-180). Foundation `save-block-state` permet l'import sans
// cycle ESM (= avant on passait par gameState.getVar qui créait
// `object-events → game-state → load_save → object-events`).
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { OBJECT_EVENT_TEMPLATES_COUNT } from '../include/constants/global';
import { GetSaveBlock1 } from './save';
import { GetStageByBerryTreeId, GetBerryTypeByBerryTreeId, BERRY_STAGE_NO_BERRY, BERRY_STAGE_FLOWERING } from './berry';
// Reflets relocalisés au miroir 1:1 (field_effect_helpers.c) — appelé par le spine
// GroundEffect_Water/IceReflection (corps de fonction → cycle ESM sûr).
import { SetUpReflection } from './field_effect_helpers';
import { FieldEffectStart, gFieldEffectArguments, FLDEFF_SHADOW, FLDEFF_EXCLAMATION_MARK_ICON, FLDEFF_QUESTION_MARK_ICON, FLDEFF_HEART_ICON, FLDEFF_TREE_DISGUISE, FLDEFF_MOUNTAIN_DISGUISE,
  FLDEFF_TALL_GRASS, FLDEFF_LONG_GRASS, FLDEFF_RIPPLE, FLDEFF_DUST, FLDEFF_SAND_FOOTPRINTS, FLDEFF_DEEP_SAND_FOOTPRINTS, FLDEFF_BIKE_TIRE_TRACKS,
  FLDEFF_SPLASH, FLDEFF_SAND_PILE, FLDEFF_JUMP_TALL_GRASS, FLDEFF_JUMP_LONG_GRASS, FLDEFF_JUMP_SMALL_SPLASH, FLDEFF_JUMP_BIG_SPLASH, FLDEFF_SHORT_GRASS, FLDEFF_HOT_SPRINGS_WATER, FLDEFF_BUBBLES, FLDEFF_FEET_IN_FLOWING_WATER, FLDEFF_BERRY_TREE_GROWTH_SPARKLE } from './field_effect';
// 1:1 décomp prédicats `MetatileBehavior_Is*` (metatile_behavior.c) — miroir game/.
// Utilisés par le spine ground-effect (GetGroundEffectFlags_* + reflection type).
import {
  MetatileBehavior_IsTallGrass, MetatileBehavior_IsLongGrass, MetatileBehavior_IsShortGrass,
  MetatileBehavior_IsIce, MetatileBehavior_IsReflective, MetatileBehavior_IsDeepSand,
  MetatileBehavior_IsSandOrDeepSand, MetatileBehavior_IsFootprints, MetatileBehavior_IsShallowFlowingWater,
  MetatileBehavior_IsPacifidlogLog, MetatileBehavior_IsPuddle, MetatileBehavior_IsHotSprings,
  MetatileBehavior_IsSeaweed, MetatileBehavior_IsSurfableWaterOrUnderwater, MetatileBehavior_IsATile,
  MetatileBehavior_HasRipples,
  MetatileBehavior_IsSouthBlocked, MetatileBehavior_IsNorthBlocked,
  MetatileBehavior_IsEastBlocked, MetatileBehavior_IsWestBlocked,
} from './metatile_behavior';

const BASE = '/decomp/em';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

export const OBJECT_EVENTS_COUNT = 16;

const sMovementDelaysMedium = [32, 64, 96, 128];
const gStandardDirections = [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST];

// ─── Direction : vecteurs, opposés, anim nums (rapatriés de direction-coords.ts) ──
// Unification miroir : dans le décomp ces tables/fonctions vivent DANS
// event_object_movement.c (sDirectionToVectors :907, sOppositeDirections,
// sFace/sMoveDirection*AnimNums :715-769, MoveCoords, GetOppositeDirection :4991,
// Get*AnimNum :4495-4525). Les tables const sont définies ICI, avant leurs call
// sites top-level (_sDirectionAnimFuncsBySpeed ne fait que RÉFÉRENCER les
// fonctions hoistées → safe). Exportées : fieldmap/field_control_avatar (tables,
// dette : le décomp les garde static et passe par MoveCoords) + bike/trainer_see/
// field_effect_helpers/field_player_avatar (fonctions publiques du .c, 1:1).

/** dx par direction. 1:1 décomp `sDirectionToVectors[N].x` (event_object_movement.c:907). */
export const DIR_TO_DX: readonly number[] = [
  /* DIR_NONE      */  0,
  /* DIR_SOUTH     */  0,
  /* DIR_NORTH     */  0,
  /* DIR_WEST      */ -1,
  /* DIR_EAST      */  1,
  /* DIR_SOUTHWEST */ -1,
  /* DIR_SOUTHEAST */  1,
  /* DIR_NORTHWEST */ -1,
  /* DIR_NORTHEAST */  1,
];

/** dy par direction. 1:1 décomp `sDirectionToVectors[N].y` (event_object_movement.c:907). */
export const DIR_TO_DY: readonly number[] = [
  /* DIR_NONE      */  0,
  /* DIR_SOUTH     */  1,
  /* DIR_NORTH     */ -1,
  /* DIR_WEST      */  0,
  /* DIR_EAST      */  0,
  /* DIR_SOUTHWEST */  1,
  /* DIR_SOUTHEAST */  1,
  /* DIR_NORTHWEST */ -1,
  /* DIR_NORTHEAST */ -1,
];

/** 1:1 décomp `sOppositeDirections` (event_object_movement.c) — indexé par DIR_*
 *  directement (le décomp indexe par direction-1, le slot DIR_NONE absorbe l'écart). */
export const OPPOSITE_DIR: readonly number[] = [
  /* DIR_NONE      */ DIR_NONE,
  /* DIR_SOUTH     */ DIR_NORTH,
  /* DIR_NORTH     */ DIR_SOUTH,
  /* DIR_WEST      */ DIR_EAST,
  /* DIR_EAST      */ DIR_WEST,
  /* DIR_SOUTHWEST */ DIR_NORTHEAST,
  /* DIR_SOUTHEAST */ DIR_NORTHWEST,
  /* DIR_NORTHWEST */ DIR_SOUTHEAST,
  /* DIR_NORTHEAST */ DIR_SOUTHWEST,
];

/** 1:1 décomp `MoveCoords(direction, x, y)` (event_object_movement.c). */
export function MoveCoords(direction: number, x: number, y: number): { x: number; y: number } {
  return {
    x: x + (DIR_TO_DX[direction] ?? 0),
    y: y + (DIR_TO_DY[direction] ?? 0),
  };
}

/** 1:1 décomp `GetOppositeDirection` (event_object_movement.c:4991-5000) :
 *  bounds check 1:1 (direction <= DIR_NONE ou > 8 → unchanged). */
export function GetOppositeDirection(direction: number): number {
  if (direction <= DIR_NONE || direction > 8) return direction;
  return OPPOSITE_DIR[direction]!;
}

/** 1:1 décomp ANIM_STD_* (include/constants/event_object_movement.h). */
const ANIM_STD_FACE_SOUTH      = 0;
const ANIM_STD_FACE_NORTH      = 1;
const ANIM_STD_FACE_WEST       = 2;
const ANIM_STD_FACE_EAST       = 3;
const ANIM_STD_GO_SOUTH        = 4;
const ANIM_STD_GO_NORTH        = 5;
const ANIM_STD_GO_WEST         = 6;
const ANIM_STD_GO_EAST         = 7;
const ANIM_STD_GO_FAST_SOUTH   = 8;
const ANIM_STD_GO_FAST_NORTH   = 9;
const ANIM_STD_GO_FAST_WEST    = 10;
const ANIM_STD_GO_FAST_EAST    = 11;
const ANIM_STD_GO_FASTER_SOUTH = 12;
const ANIM_STD_GO_FASTER_NORTH = 13;
const ANIM_STD_GO_FASTER_WEST  = 14;
const ANIM_STD_GO_FASTER_EAST  = 15;
const ANIM_STD_GO_FASTEST_SOUTH = 16;
const ANIM_STD_GO_FASTEST_NORTH = 17;
const ANIM_STD_GO_FASTEST_WEST  = 18;
const ANIM_STD_GO_FASTEST_EAST  = 19;
// 1:1 décomp ANIM_BUNNY_HOP_BACK_WHEEL_* (= ANIM_STD_COUNT + 0..3 ; ANIM_STD_COUNT = 20).
const ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH = 20;
const ANIM_BUNNY_HOP_BACK_WHEEL_NORTH = 21;
const ANIM_BUNNY_HOP_BACK_WHEEL_WEST  = 22;
const ANIM_BUNNY_HOP_BACK_WHEEL_EAST  = 23;

/** 1:1 décomp `sFaceDirectionAnimNums[]` (event_object_movement.c:715-725).
 *  Diagonales NW/NE = FACE_NORTH (1:1). */
const sFaceDirectionAnimNums: readonly number[] = [
  ANIM_STD_FACE_SOUTH,  // DIR_NONE → fallback SOUTH
  ANIM_STD_FACE_SOUTH,  // DIR_SOUTH
  ANIM_STD_FACE_NORTH,  // DIR_NORTH
  ANIM_STD_FACE_WEST,   // DIR_WEST
  ANIM_STD_FACE_EAST,   // DIR_EAST
  ANIM_STD_FACE_SOUTH,  // DIR_SOUTHWEST
  ANIM_STD_FACE_SOUTH,  // DIR_SOUTHEAST
  ANIM_STD_FACE_NORTH,  // DIR_NORTHWEST
  ANIM_STD_FACE_NORTH,  // DIR_NORTHEAST
];

/** 1:1 décomp `sMoveDirectionAnimNums[]` (event_object_movement.c:726-736). */
const sMoveDirectionAnimNums: readonly number[] = [
  ANIM_STD_GO_SOUTH,
  ANIM_STD_GO_SOUTH,
  ANIM_STD_GO_NORTH,
  ANIM_STD_GO_WEST,
  ANIM_STD_GO_EAST,
  ANIM_STD_GO_SOUTH,
  ANIM_STD_GO_SOUTH,
  ANIM_STD_GO_NORTH,
  ANIM_STD_GO_NORTH,
];

/** 1:1 décomp `sMoveDirectionFastAnimNums[]` (event_object_movement.c:737-747). */
const sMoveDirectionFastAnimNums: readonly number[] = [
  ANIM_STD_GO_FAST_SOUTH,
  ANIM_STD_GO_FAST_SOUTH,
  ANIM_STD_GO_FAST_NORTH,
  ANIM_STD_GO_FAST_WEST,
  ANIM_STD_GO_FAST_EAST,
  ANIM_STD_GO_FAST_SOUTH,
  ANIM_STD_GO_FAST_SOUTH,
  ANIM_STD_GO_FAST_NORTH,
  ANIM_STD_GO_FAST_NORTH,
];

/** 1:1 décomp `sMoveDirectionFasterAnimNums[]`. */
const sMoveDirectionFasterAnimNums: readonly number[] = [
  ANIM_STD_GO_FASTER_SOUTH,
  ANIM_STD_GO_FASTER_SOUTH,
  ANIM_STD_GO_FASTER_NORTH,
  ANIM_STD_GO_FASTER_WEST,
  ANIM_STD_GO_FASTER_EAST,
  ANIM_STD_GO_FASTER_SOUTH,
  ANIM_STD_GO_FASTER_SOUTH,
  ANIM_STD_GO_FASTER_NORTH,
  ANIM_STD_GO_FASTER_NORTH,
];

/** 1:1 décomp `sMoveDirectionFastestAnimNums[]`. */
const sMoveDirectionFastestAnimNums: readonly number[] = [
  ANIM_STD_GO_FASTEST_SOUTH,
  ANIM_STD_GO_FASTEST_SOUTH,
  ANIM_STD_GO_FASTEST_NORTH,
  ANIM_STD_GO_FASTEST_WEST,
  ANIM_STD_GO_FASTEST_EAST,
  ANIM_STD_GO_FASTEST_SOUTH,
  ANIM_STD_GO_FASTEST_SOUTH,
  ANIM_STD_GO_FASTEST_NORTH,
  ANIM_STD_GO_FASTEST_NORTH,
];

/** 1:1 décomp `sAcroWheelieDirectionAnimNums[]` (event_object_movement.c:781). */
const sAcroWheelieDirectionAnimNums: readonly number[] = [
  ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH,  // DIR_NONE
  ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH,  // DIR_SOUTH
  ANIM_BUNNY_HOP_BACK_WHEEL_NORTH,  // DIR_NORTH
  ANIM_BUNNY_HOP_BACK_WHEEL_WEST,   // DIR_WEST
  ANIM_BUNNY_HOP_BACK_WHEEL_EAST,   // DIR_EAST
  ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH,  // DIR_SOUTHWEST
  ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH,  // DIR_SOUTHEAST
  ANIM_BUNNY_HOP_BACK_WHEEL_NORTH,  // DIR_NORTHWEST
  ANIM_BUNNY_HOP_BACK_WHEEL_NORTH,  // DIR_NORTHEAST
];

/** 1:1 décomp `GetFaceDirectionAnimNum` (event_object_movement.c:4495-4498). */
export function GetFaceDirectionAnimNum(direction: number): number {
  return sFaceDirectionAnimNums[direction] ?? ANIM_STD_FACE_SOUTH;
}

/** 1:1 décomp `GetMoveDirectionAnimNum` (event_object_movement.c:4500-4503). */
export function GetMoveDirectionAnimNum(direction: number): number {
  return sMoveDirectionAnimNums[direction] ?? ANIM_STD_GO_SOUTH;
}

/** 1:1 décomp `GetMoveDirectionFastAnimNum` (event_object_movement.c:4505-4508). */
export function GetMoveDirectionFastAnimNum(direction: number): number {
  return sMoveDirectionFastAnimNums[direction] ?? ANIM_STD_GO_FAST_SOUTH;
}

/** 1:1 décomp `GetMoveDirectionFasterAnimNum`. */
export function GetMoveDirectionFasterAnimNum(direction: number): number {
  return sMoveDirectionFasterAnimNums[direction] ?? ANIM_STD_GO_FASTER_SOUTH;
}

/** 1:1 décomp `GetMoveDirectionFastestAnimNum`. */
export function GetMoveDirectionFastestAnimNum(direction: number): number {
  return sMoveDirectionFastestAnimNums[direction] ?? ANIM_STD_GO_FASTEST_SOUTH;
}

/** 1:1 décomp `GetAcroWheelieDirectionAnimNum` (event_object_movement.c:4525). */
export function GetAcroWheelieDirectionAnimNum(direction: number): number {
  return sAcroWheelieDirectionAnimNums[direction] ?? ANIM_BUNNY_HOP_BACK_WHEEL_SOUTH;
}

// ─── 1:1 décomp `IsMetatileDirectionallyImpassable` (event_object_movement.c:4715) ───
// (Rapatrié de l'ex-`metatile-behavior-helpers.ts`, sa vraie maison décomp.)
/** 1:1 décomp `gOppositeDirectionBlockedMetatileFuncs` (event_object_movement.c:893).
 *  Indexé par direction-1. Check si le tile COURANT bloque l'EXIT dans la direction. */
const sOppositeDirectionBlockedFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsSouthBlocked, MetatileBehavior_IsNorthBlocked,
  MetatileBehavior_IsWestBlocked, MetatileBehavior_IsEastBlocked,
];
/** 1:1 décomp `gDirectionBlockedMetatileFuncs` (event_object_movement.c:899). Indexé par
 *  direction-1. Check si le tile TARGET bloque l'ENTRY depuis la direction opposée. */
const sDirectionBlockedFuncs: ReadonlyArray<(b: number) => boolean> = [
  MetatileBehavior_IsNorthBlocked, MetatileBehavior_IsSouthBlocked,
  MetatileBehavior_IsEastBlocked, MetatileBehavior_IsWestBlocked,
];
/** 1:1 décomp `IsMetatileDirectionallyImpassable` (event_object_movement.c:4715).
 *  TRUE si (current bloque l'exit dans la direction) OU (target bloque l'entry depuis
 *  la direction opposée). direction = DIR_SOUTH/NORTH/WEST/EAST (1..4). */
export function IsMetatileDirectionallyImpassable(
  currentBehavior: number, targetBehavior: number, direction: number,
): boolean {
  const idx = direction - 1;
  if (idx < 0 || idx >= 4) return false;
  return sOppositeDirectionBlockedFuncs[idx](currentBehavior)
      || sDirectionBlockedFuncs[idx](targetBehavior);
}

// ─── 1:1 STRICT décomp tables d'anim de PÊCHE (event_object_movement.c:836-868) ───
// Indices dans `sAnimTable_Fishing` : ANIM_TAKE_OUT_ROD_* = 0..3, ANIM_PUT_AWAY_ROD_* = 4..7,
// ANIM_HOOKED_POKEMON_* = 8..11. (Le décomp mappe aussi les diagonales SW/SE→SOUTH, NW/NE→NORTH ;
// le joueur est TOUJOURS cardinal en pêche → on ne liste que les cardinales, le `?? <south>` couvre le reste.)
const sFishingDirectionAnimNums: Readonly<Record<number, number>> = {
  [DIR_NONE]: 0, [DIR_SOUTH]: 0, [DIR_NORTH]: 1, [DIR_WEST]: 2, [DIR_EAST]: 3,  // ANIM_TAKE_OUT_ROD_*
};
/** 1:1 décomp `u8 GetFishingDirectionAnimNum(u8 direction)` (event_object_movement.c:4550). */
export function GetFishingDirectionAnimNum(direction: number): number {
  return sFishingDirectionAnimNums[direction] ?? 0;
}

const sFishingNoCatchDirectionAnimNums: Readonly<Record<number, number>> = {
  [DIR_NONE]: 4, [DIR_SOUTH]: 4, [DIR_NORTH]: 5, [DIR_WEST]: 6, [DIR_EAST]: 7,  // ANIM_PUT_AWAY_ROD_*
};
/** 1:1 décomp `u8 GetFishingNoCatchDirectionAnimNum(u8 direction)` (event_object_movement.c:4555). */
export function GetFishingNoCatchDirectionAnimNum(direction: number): number {
  return sFishingNoCatchDirectionAnimNums[direction] ?? 4;
}

const sFishingBiteDirectionAnimNums: Readonly<Record<number, number>> = {
  [DIR_NONE]: 8, [DIR_SOUTH]: 8, [DIR_NORTH]: 9, [DIR_WEST]: 10, [DIR_EAST]: 11,  // ANIM_HOOKED_POKEMON_*
};
/** 1:1 décomp `u8 GetFishingBiteDirectionAnimNum(u8 direction)` (event_object_movement.c:4560). */
export function GetFishingBiteDirectionAnimNum(direction: number): number {
  return sFishingBiteDirectionAnimNums[direction] ?? 8;
}

/** 1:1 STRICT décomp `ObjectEventTurn(struct ObjectEvent *, u8 direction)` (event_object_movement.c:1779) :
 *    SetObjectEventDirection(objectEvent, direction);
 *    if (!objectEvent->inanimate) { StartSpriteAnim(sprite, GetFaceDirectionAnimNum(facingDirection)); SeekSpriteAnim(sprite, 0); }
 *  Tourne l'object event vers `direction` + (re)lance l'anim « face » depuis la frame 0. */
export function ObjectEventTurn(objectEvent: ObjectEvent, direction: number): void {
  SetObjectEventDirection(objectEvent, direction);
  if (!objectEvent.inanimate && objectEvent.spriteId >= 0) {
    // StartSpriteAnim(...) + SeekSpriteAnim(0) → notre StartSpriteAnim repart déjà de la frame 0.
    getRuntime().StartSpriteAnim(objectEvent.spriteId, GetFaceDirectionAnimNum(objectEvent.facingDirection));
  }
}


/** 1:1 STRICT décomp `sDirectionAnimFuncsBySpeed[]` (movement_action_func_tables.h:605) :
 *  l'anim de pas dépend de MOVE_SPEED. ⚠️ FAST_2 (2) → Fast (PAS Faster) : c'est ce qui rendait
 *  l'acro bike (RIDE_WATER_CURRENT, speed 2) + le mach top speed (WALK_FASTER, speed 2) trop rapides. */
const _sDirectionAnimFuncsBySpeed: ReadonlyArray<(d: number) => number> = [
  GetMoveDirectionAnimNum,         // MOVE_SPEED_NORMAL (0)
  GetMoveDirectionFastAnimNum,     // MOVE_SPEED_FAST_1 (1)
  GetMoveDirectionFastAnimNum,     // MOVE_SPEED_FAST_2 (2)
  GetMoveDirectionFasterAnimNum,   // MOVE_SPEED_FASTER (3)
  GetMoveDirectionFastestAnimNum,  // MOVE_SPEED_FASTEST (4)
];

// 1:1 STRICT décomp `sRunningDirectionAnimNums` (event_object_movement.c:869-878).
// Maps direction → animNum course. ANIM_RUN_SOUTH=20, etc. (= sAnimTable_BrendanMayNormal
// [20..23] → sAnim_RunSouth/North/West/East = frames running 9-17). Utilisé par le
// dash joueur (StartRunningAnim) — distinct de GO_FAST (8-11) qui n'a pas de pic course.
const sRunningDirectionAnimNums: Readonly<Record<number, number>> = {
  [DIR_NONE]: 20,   // ANIM_RUN_SOUTH
  [DIR_SOUTH]: 20,  // ANIM_RUN_SOUTH
  [DIR_NORTH]: 21,  // ANIM_RUN_NORTH
  [DIR_WEST]: 22,   // ANIM_RUN_WEST
  [DIR_EAST]: 23,   // ANIM_RUN_EAST
};

/** 1:1 décomp `u8 GetRunningDirectionAnimNum(u8 direction)` (event_object_movement.c:4565). */
export function GetRunningDirectionAnimNum(direction: number): number {
  return sRunningDirectionAnimNums[direction] ?? 20;
}

// ─── Object event graphics catalog ──────────────────────────────────────────

interface GraphicsInfo {
  png: string;
  frameWidth: number;
  frameHeight: number;
  displayWidth: number;
  displayHeight: number;
}

let _graphicsCatalog: Record<string, GraphicsInfo> | null = null;

// 1:1 STRICT décomp `sPicTable_BrendanNormal` (object_event_pic_tables.h:1-20) +
// `sPicTable_MayNormal` (:992-1011) : ces 4 graphicsId utilisent 2 buffers PNG
// distincts (= gObjectEventPic_X_Normal + gObjectEventPic_X_Running) mixed dans
// un seul SpriteFrameImage[18] (frames 0-8 normal + 9-17 running).
//
// Notre catalog n'a qu'1 PNG par graphicsId (= primary = walking.png). Pour le
// secondaire (= running.png), on définit un mapping explicit ici. Le préload
// charge les 2 PNGs et le spawn passe les 2 buffers convertis au factory.
const MULTI_PNG_SECONDARY_PATHS: Readonly<Record<string, string>> = {
  OBJ_EVENT_GFX_BRENDAN_NORMAL: 'object_events/people/brendan/running.png',
  OBJ_EVENT_GFX_MAY_NORMAL: 'object_events/people/may/running.png',
  OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL: 'object_events/people/brendan/running.png',
  OBJ_EVENT_GFX_RIVAL_MAY_NORMAL: 'object_events/people/may/running.png',
};

async function loadGraphicsCatalog(): Promise<Record<string, GraphicsInfo>> {
  if (_graphicsCatalog) return _graphicsCatalog;
  const r = await fetch(`${BASE}/object-event-graphics.json`);
  if (!r.ok) throw new Error(`object-event-graphics.json load failed: ${r.status}`);
  _graphicsCatalog = await r.json() as Record<string, GraphicsInfo>;
  return _graphicsCatalog;
}

// ─── PNG cache + parallel preload (Phase 4.8 Tâche 2) ───────────────────────
// Décomp's TrySpawnObjectEvents est synchrone — pas d'async PNG loading mid-game.
// Pour matcher : on pré-load TOUTES les PNGs de la map (+ connections) en
// PARALLEL au map init/cross-border, puis SpawnObjectEventsOnMap +
// TrySpawnObjectEvents lisent depuis le cache, sync.

/** Cache des PNGs déjà parsées. Clé = full path (e.g. `/decomp/em/<png>`). */
const _npcPngCache = new Map<string, LoadedPng>();
/** Promises in-flight pour dedupe les loads concurrents. */
const _npcPngLoading = new Map<string, Promise<LoadedPng>>();

/** Load (or reuse cached) une PNG pour NPC graphics. Dedupe via _npcPngLoading. */
async function loadNpcPng(path: string): Promise<LoadedPng> {
  const cached = _npcPngCache.get(path);
  if (cached) return cached;
  let pending = _npcPngLoading.get(path);
  if (!pending) {
    pending = loadIndexedPngStrict(path, 4).then(png => {
      _npcPngCache.set(path, png);
      _npcPngLoading.delete(path);
      return png;
    }).catch(err => {
      _npcPngLoading.delete(path);
      throw err;
    });
    _npcPngLoading.set(path, pending);
  }
  return pending;
}

// ─── Berry tree graphics (cas spécial multi-PNG + swap par baie) ─────────────
/** Répertoire public des PNGs berry tree (dirt_pile, sprout, + 1 par baie). */
const BERRY_TREE_PNG_DIR = `${BASE}/object_events/berry_trees`;

/** Résout les 3 chemins PNG d'un berry tree (dirt_pile + sprout + baie) selon
 *  son berryTreeId. 1:1 décomp `gBerryTreePicTablePointers` : la pic table (et
 *  donc le PNG baie) dépend du berryType = `gSaveBlock1.berryTrees[id].berry`.
 *  Pour un plot vide (stade NO_BERRY → berryType 0) on retombe sur l'entrée 0
 *  (Cheri) ; le sprite sera de toute façon invisible (1:1 SetBerryTreeGraphics
 *  rend invisible si BERRY_STAGE_NO_BERRY). */
function _berryTreePngPaths(berryTreeId: number): string[] {
  const berryType = GetBerryTypeByBerryTreeId(berryTreeId);
  let berryId = berryType - 1;
  if (berryId < 0 || berryId >= gBerryTreePicTableBuilders.length) berryId = 0;
  const berryPng = gBerryTreePicTableBuilders[berryId].png;
  return [
    `${BERRY_TREE_PNG_DIR}/dirt_pile.png`,
    `${BERRY_TREE_PNG_DIR}/sprout.png`,
    `${BERRY_TREE_PNG_DIR}/${berryPng}.png`,
  ];
}

/** Pre-load PARALLEL toutes les PNGs des NPCs templates de mapHeader.
 *  Resolved quand tous les loads done (ou ont silencieusement failed).
 *  Idempotent : si déjà cached, no-op rapide.
 *
 *  Phase 3 session 123 : résout OBJ_EVENT_GFX_VAR_N → réelle gfx via
 *  VAR_OBJ_GFX_ID_N (= rival NPC sprite genre opposé). Sans ça, le PNG du
 *  rival n'était jamais préchargé → spawn returns false → rival invisible. */
export async function preloadNpcGraphicsForMap(mapHeader: MapHeader): Promise<void> {
  const templates = mapHeader.events?.objectEvents ?? [];
  if (templates.length === 0) return;
  const catalog = await loadGraphicsCatalog();
  const paths = new Set<string>();
  for (const template of templates) {
    if (!template.graphicsIdRaw) continue;
    let key = template.graphicsIdRaw;
    // Résolution OBJ_EVENT_GFX_VAR_N → vraie gfx (= 1:1 décomp logic).
    const varMatch = key.match(/^OBJ_EVENT_GFX_VAR_(\d+)$/);
    if (varMatch) {
      const n = Number(varMatch[1]);
      const gfxIdValue = VarGet(`VAR_OBJ_GFX_ID_${n}`);
      if (gfxIdValue !== 0) {
        const resolved = _reverseDecompConstant(gfxIdValue, 'OBJ_EVENT_GFX_');
        if (resolved) key = resolved;
      }
    }
    // Berry tree : cas spécial (pas dans le catalogue, 3 PNGs distincts assemblés
    // au runtime par berryType). Précharge dirt_pile + sprout + la baie.
    if (key === 'OBJ_EVENT_GFX_BERRY_TREE') {
      for (const p of _berryTreePngPaths(template.trainerRange_berryTreeId)) paths.add(p);
      continue;
    }
    const graphics = catalog[key];
    if (!graphics) continue;
    // Phase 4.10 : allow 48×48 (= truck), 32×32 (= Vigoroth) en plus du
    // standard 16×32.
    const is48x48 = graphics.frameWidth === 48 && graphics.frameHeight === 48;
    const is32x32 = graphics.frameWidth === 32 && graphics.frameHeight === 32;
    const is16x32 = graphics.frameWidth === 16 && graphics.frameHeight === 32;
    const is16x16 = graphics.frameWidth === 16 && graphics.frameHeight === 16;
    if (!is48x48 && !is32x32 && !is16x32 && !is16x16) continue;
    if (graphics.displayWidth !== graphics.frameWidth || graphics.displayHeight !== graphics.frameHeight) continue;
    paths.add(`${BASE}/${graphics.png}`);
    // 1:1 STRICT : si graphicsKey utilise 2 buffers PNG (BrendanNormal, MayNormal,
    // RivalBrendan, RivalMay), précharge aussi le secondaire (running.png).
    const secondary = MULTI_PNG_SECONDARY_PATHS[key];
    if (secondary) paths.add(`${BASE}/${secondary}`);
  }
  await Promise.all(
    [...paths].map(p =>
      loadNpcPng(p).catch((e: unknown) => {
        console.warn(`[object-events] preload failed for ${p}:`, e);
        return null;
      }),
    ),
  );
}

// ─── Object Event struct ────────────────────────────────────────────────────

export interface ObjectEvent {
  // ─── Bit flags 1:1 décomp `struct ObjectEvent` (global.fieldmap.h:194-255) ──
  active: boolean;
  /** 1:1 décomp `singleMovementActive:1`. True quand un MovementAction unique
   *  est en cours (= non-held movement). Reset au step end. */
  singleMovementActive: boolean;
  /** 1:1 décomp `triggerGroundEffectsOnMove:1`. Flag pour déclencher ground
   *  effects (= grass rustle, sand kick, water splash) au prochain move. */
  triggerGroundEffectsOnMove: boolean;
  /** 1:1 décomp `triggerGroundEffectsOnStop:1`. Idem mais au stop. */
  triggerGroundEffectsOnStop: boolean;
  /** 1:1 décomp `disableCoveringGroundEffects:1`. */
  disableCoveringGroundEffects: boolean;
  /** 1:1 décomp `landingJump:1`. Jump landing flag. */
  landingJump: boolean;
  /** 1:1 décomp `heldMovementActive:1`. True quand `ObjectEventSetHeldMovement`
   *  a queued un movement action (= used par scripted walks + door warps). */
  heldMovementActive: boolean;
  /** 1:1 décomp `spriteAnimPausedBackup:1` (global.fieldmap.h ObjectEvent struct).
   *  Backup de sprite.animPaused au FreezeObjectEvent ; restored par UnfreezeObject
   *  Event. Permet de pause les anims pendant lockall + reprendre proprement. */
  spriteAnimPausedBackup: boolean;
  /** 1:1 décomp `spriteAffineAnimPausedBackup:1`. Backup affineAnimPaused. */
  spriteAffineAnimPausedBackup: boolean;
  /** 1:1 décomp `heldMovementFinished:1`. True quand le held movement vient
   *  de finir (= read par `ObjectEventClearHeldMovementIfFinished`). */
  heldMovementFinished: boolean;
  /** 1:1 décomp `facingDirectionLocked:1`. Quand TRUE, le sprite face direction
   *  est gelée (= used pendant scripted movements pour pas changer le facing). */
  facingDirectionLocked: boolean;
  /** 1:1 décomp `disableAnim:1`. Disable sprite animation. */
  disableAnim: boolean;
  /** 1:1 décomp `enableAnim:1`. Re-enable anim after disable. */
  enableAnim: boolean;
  /** 1:1 décomp `inanimate:1`. NPC inanimate (= mailbox, vase, etc.). */
  inanimate: boolean;
  invisible: boolean;
  /** 1:1 décomp `offScreen:1`. */
  offScreen: boolean;
  /** 1:1 décomp `trackedByCamera:1`. */
  trackedByCamera: boolean;
  /** 1:1 décomp `isPlayer:1`. True pour le player ObjectEvent. */
  isPlayer: boolean;
  /** 1:1 décomp `hasReflection:1`. Player/NPC sur eau → reflet visible. */
  hasReflection: boolean;
  /** 1:1 décomp `inShortGrass:1`. Player/NPC dans short grass → footprints. */
  inShortGrass: boolean;
  /** 1:1 décomp `inShallowFlowingWater:1`. */
  inShallowFlowingWater: boolean;
  /** 1:1 décomp `inSandPile:1`. Step sur sand → kick effect. */
  inSandPile: boolean;
  /** 1:1 décomp `inHotSprings:1`. Hot springs anim. */
  inHotSprings: boolean;
  /** 1:1 décomp `hasShadow:1`. Player jump → shadow visible. */
  hasShadow: boolean;
  /** 1:1 décomp `disableJumpLandingGroundEffect:1`. */
  disableJumpLandingGroundEffect: boolean;
  /** 1:1 décomp `fixedPriority:1`. */
  fixedPriority: boolean;
  /** 1:1 décomp `hideReflection:1`. */
  hideReflection: boolean;
  // ─── Fields (= u8 + structs 1:1 décomp) ─────────────────────────────────
  spriteId: number;
  graphicsId: string;
  movementType: string;
  localId: number;
  /** Raw local_id from JSON (e.g. 'LOCALID_LITTLEROOT_MOM'). Empty if no
   *  local_id specified. Used par movement-system pour résoudre applymovement
   *  LOCALID_X. */
  localIdRaw: string;
  /** 1:1 décomp `objectEvent->mapNum + mapGroup`. Identifie de quelle map ce
   *  NPC est originaire (= permet dedup quand on cross-border : NPCs old map
   *  conservés, new map's NPCs spawnés à côté). Phase 4.8 connections.
   *  Format : map ID string (e.g. 'MAP_LITTLEROOT_TOWN'). */
  mapId: string;
  /** 1:1 décomp `objectEvent->script` : label du script à run on interact.
   *  Phase 4.5 : ScriptContext_SetupScript(npc.scriptLabel) au A button. */
  scriptLabel: string;
  /** 1:1 décomp `objectEvent->currentCoords`. Pendant un walk : TARGET cell
   *  (= où le NPC va arriver). Hors walk : position stable (= current = previous). */
  currentCoordsX: number;
  currentCoordsY: number;
  /** 1:1 décomp `objectEvent->previousCoords`. Pendant un walk : SOURCE cell
   *  (= où le NPC est parti). Hors walk : = currentCoords (= position stable).
   *  Used par DoesObjectCollideWithObjectAt pour bloquer SOURCE+TARGET pendant
   *  un walk → empêche step-on race entre NPCs et entre player↔NPC. */
  previousCoordsX: number;
  previousCoordsY: number;
  facingDirection: number;
  objTileBase: number;
  /** Nombre de tiles OBJ alloués pour ce NPC (= 1:1 décomp sprite.c:566
   *  `AllocSpriteTiles(images->size / TILE_SIZE_4BPP)` = tiles d'UNE frame pour le
   *  flow images/dynamic-copy ; = TILES_PER_NPC pour les sprites legacy multi-frame).
   *  Sert à libérer EXACTEMENT le bon nombre de tiles au despawn (1:1 décomp
   *  `DestroySprite` sprite.c:625 `tileEnd = images->size / TILE_SIZE_4BPP + tileNum`). */
  objTileCount: number;
  paletteBank: number;
  worldX: number;
  worldY: number;
  /** Phase 4.10 : true si le NPC utilise un subsprite table (= 48×48 truck etc).
   *  Quand true, updateNpcSpriteFrame skip son tileId calculation (= 16×32
   *  frame layout invalide pour un sprite multi-OAM). syncSubspriteOam refresh
   *  les child OAMs chaque frame depuis sprite.tileBase + sub.tileOffset. */
  useSubsprites: boolean;
  /** True si NPC est sprite 32×32 single-OAM (= Vigoroth déménageurs). 16 tiles
   *  par frame ; updateNpcSpriteFrame alterne entre 3 frames consecutivement
   *  chargés en VRAM (face / walk1 / walk2). Pas de direction switch — Vigoroth
   *  affiche toujours la même orientation (= sprite "carrying box" face down,
   *  "facing away" face up). */
  is32x32: boolean;
  /** True si le sprite est 16x16 animate (= NINJA_BOY kids 9-frame standard
   *  anim chargé en VRAM consecutivement). updateNpcSpriteFrame branche
   *  is16x16 cycle oam.tileId entre face/walk1/walk2 par direction. */
  is16x16: boolean;
  movementStep: number;
  movementDelay: number;
  walkFramesLeft: number;
  walkDirection: number;
  walkAnimAlt: 0 | 1;
  /** 1:1 décomp `frozen` field. Si TRUE, state machine skip → NPC reste à
   *  sa facing direction courante. Set par tryInteractWithFacingNPC pour
   *  empêcher NPC de tourner mid-dialogue. Reset par UnfreezeAllNpcs (=
   *  appelé quand player walk = exit interaction). */
  frozen: boolean;
  /** 1:1 décomp `objectEvent->initialCoords`. Position au spawn, utilisée
   *  par WALK_BACK_AND_FORTH pour revenir à l'origin après une step + par
   *  IsCoordOutsideObjectEventMovementRange pour confiner les WANDER NPCs. */
  initialCoordsX: number;
  initialCoordsY: number;
  /** 1:1 décomp `objectEvent->range.rangeX/rangeY` (event_object_movement.c).
   *  Movement range bounds depuis initialCoords : NPCs WANDER/WALK ne peuvent
   *  pas walk hors `[initial - range, initial + range]`. 0 = no range = libre.
   *  Vient du template JSON `movement_range_x/y`. */
  movementRangeX: number;
  movementRangeY: number;
  /** 1:1 décomp `directionSequenceIndex`. WALK_BACK_AND_FORTH : 0 = forward,
   *  1 = backward. ROTATE_* : index dans la sequence rotation. */
  directionSeqIdx: number;
  /** 1:1 décomp `sprite.x2 / sprite.y2` (= secondary OAM offsets, additionnels
   *  à sprite.x/y). Used par `SetObjectEventSpritePosByLocalIdAndMap` pour
   *  bouger un sprite hors-grid (= e.g. truck box bouncing pendant cinematic).
   *  Default 0 = sprite à sa position normale. */
  visualOffsetX: number;
  visualOffsetY: number;
  /** 1:1 décomp `currentElevation:4` (4-bit). 0 = ground level. >0 = bridge/
   *  staircase elevation. Used par `IsElevationMismatchAt` pour bloquer player
   *  passage entre tiles d'elevation différente. */
  currentElevation: number;
  /** 1:1 décomp `previousElevation:4`. Elevation du tile précédent. */
  previousElevation: number;
  /** 1:1 décomp `mapNum` (= map index dans le group). Separate from mapId string.
   *  Used pour ObjectEventTemplate matching + spawn detection. */
  mapNum: number;
  /** 1:1 décomp `mapGroup` (= map group index, e.g. MAP_GROUP_LITTLEROOT). */
  mapGroup: number;
  /** 1:1 décomp `trainerType`. Trainer behavior si NPC est un trainer (=
   *  TRAINER_TYPE_NORMAL = engage si player line of sight, TRAINER_TYPE_SEE_ALL_
   *  DIRECTIONS = engage si player dans range omnidirectional). */
  trainerType: number;
  /** 1:1 décomp `trainerRange_berryTreeId` (= packed u8). Pour trainers : range
   *  de la line of sight (= 1..7 tiles). Pour berry trees : berryTreeId. */
  trainerRange_berryTreeId: number;
  /** 1:1 décomp `currentMetatileBehavior`. Cached metatile behavior à la
   *  position courante. Updated à chaque step end via `ObjectEventUpdateCurrent
   *  MetatileBehavior`. Used par `HideShowWarpArrow` + ground effects + collision. */
  currentMetatileBehavior: number;
  /** 1:1 décomp `previousMetatileBehavior`. Cached metatile behavior du tile
   *  précédent. Used pour detect transition (= e.g. step OFF tall grass). */
  previousMetatileBehavior: number;
  /** 1:1 décomp `movementDirection:4`. Direction de la dernière MovementAction
   *  appliquée (= différent de `facingDirection` qui peut être locked).
   *  Used par `HideShowWarpArrow` pour determine quelle direction d'arrow show. */
  movementDirection: number;
  /** 1:1 décomp `previousMovementDirection`. Direction du dernier MovementAction
   *  COMPLETED. Used par `PlayerAllowForcedMovementIfMovingSameDirection`. */
  previousMovementDirection: number;
  /** 1:1 décomp `fieldEffectSpriteId`. Sprite ID d'un field effect attached
   *  (= e.g. reflection, shadow). MAX_SPRITES (64) = none. */
  fieldEffectSpriteId: number;
  /** 1:1 décomp `warpArrowSpriteId`. Sprite ID de l'arrow warp visual attaché.
   *  MAX_SPRITES (64) = none. Used par `HideShowWarpArrow` + `ShowWarpArrowSprite`.
   *  Set par `CreateWarpArrowSprite` au player object event spawn. */
  warpArrowSpriteId: number;
  /** 1:1 décomp `movementActionId`. Action ID en cours (= e.g. MOVEMENT_ACTION_
   *  WALK_NORMAL_DOWN = 0x09). Used par MovementType state machines + held
   *  movement system. */
  movementActionId: number;
  /** 1:1 décomp `playerCopyableMovement`. Pour le player, indique quel
   *  movement type est "copyable" par les NPCs avec MOVEMENT_TYPE_COPY_*
   *  (= NPCs qui imitent le player). Cf. `COPY_MOVE_*` enum. */
  playerCopyableMovement: number;
  /** 1:1 décomp `sprite->data[7] sBerryTreeFlags`
   *  (event_object_movement.c:3069). Bits BERRY_FLAG_SET_GFX (1<<0) /
   *  BERRY_FLAG_SPARKLING (1<<1) / BERRY_FLAG_JUST_PICKED (1<<2).
   *  Used par MovementType_BerryTreeGrowth state machine. */
  berryTreeFlags: number;
  /** 1:1 décomp `sprite->data[2] sTimer` (event_object_movement.c:3068).
   *  Used par BERRYTREEFUNC_SPARKLE / SPARKLE_END counter (64 frames). */
  berryTreeTimer: number;
  /** 1:1 décomp `sprite->data[7]` pour MovementType_TreeDisguise/MountainDisguise/
   *  Buried (event_object_movement.c:4359/4380/4392). Bool flag "disguise init done".
   *  Sans ce flag, le tick re-trigger FieldEffectStart chaque frame. */
  disguiseStarted: boolean;
  /** 1:1 décomp `sprite->sActionFuncId = data[1]`. Multi-step action state
   *  (= e.g. MovementAction_Delay Step0→Step1→Step2). Different de
   *  movementStep (= sTypeFuncId = MovementType state). */
  actionStep: number;
  /** 1:1 décomp `sprite->data[3]`. Timer générique pour actions multi-step
   *  (= Delay_1/2/4/8/16, WalkNormal duration, etc.). */
  actionTimer: number;
  /** 1:1 décomp `sprite->data[4] sDistance`. Jump distance (IN_PLACE/NORMAL/FAR). */
  jumpDistance: number;
  /** 1:1 décomp `sprite->data[5] sJumpType`. Jump type (HIGH/LOW/NORMAL). */
  jumpType: number;
  /** 1:1 décomp `sprite->data[4] sSpeed` pour walk movement (event_object_movement.c:8223).
   *  MOVE_SPEED_NORMAL/FAST_1/FAST_2/FASTER/FASTEST/SLOWER. */
  walkSpeed: number;
  /** 1:1 décomp `sprite->sNumSteps` pour WalkSlow path (event_object_movement.c
   *  :5152 UpdateWalkSlowAnim). Counter de px shifts effectués (= 16 px = 1 tile
   *  done). Path WalkSlow utilise pattern "1 px every 2 frames" sur 32 frames.
   *  Différent de actionTimer (= sprite.data[3] timer générique) pour préserver
   *  le state machine 1:1 décomp. */
  walkSlowNumSteps: number;
  /** 1:1 décomp `sprite->data[6]` pour Figure8 anim (event_object_movement.c:8385).
   *  Index dans sFigure8XOffsets/YOffsets (= 0..71 = FIGURE_8_LENGTH-1). */
  figure8Idx: number;
  /** 1:1 décomp `sprite->data[7]` pour Figure8 anim. Phase courante (0..4).
   *  Phase 0/1/2/3 = 4 quarts du 8. Phase 4 = finished. */
  figure8Phase: number;
}

/** MAX_SPRITES sentinel value 1:1 décomp src/sprite.c. = 64 (= gSprites array
 *  size). Used pour fields sprite-IDs "absent" (= e.g. fieldEffectSpriteId,
 *  warpArrowSpriteId = MAX_SPRITES = no sprite attached). */
const MAX_SPRITES = 64;

/** 1:1 décomp convention : `gPlayerAvatar.objectEventId` pointe vers le slot
 *  du player dans `gObjectEvents[]`. Notre impl : on réserve `gObjectEvents[0]`
 *  comme slot player. NPCs spawn via `findIndex(o => !o.active)` qui skip
 *  naturellement le slot 0 si le player est `active=true` (= init dans
 *  `InitPlayerAvatar`).
 *
 *  Décomp ROM utilise `SpawnSpecialObjectEvent` qui alloue dynamiquement,
 *  donc le slot peut varier. Notre simplification : slot 0 fixe pour le player.
 *  Identique à `LOCALID_PLAYER = 0xFF` mais pour l'index dans gObjectEvents. */
export const PLAYER_OBJECT_EVENT_SLOT = 0;

export const gObjectEvents: ObjectEvent[] = Array.from({ length: OBJECT_EVENTS_COUNT }, () => ({
  // Bit flags (= 1:1 décomp struct ObjectEvent l.196-223, all init FALSE).
  active: false,
  singleMovementActive: false,
  triggerGroundEffectsOnMove: false,
  triggerGroundEffectsOnStop: false,
  disableCoveringGroundEffects: false,
  landingJump: false,
  heldMovementActive: false,
  spriteAnimPausedBackup: false,
  spriteAffineAnimPausedBackup: false,
  heldMovementFinished: false,
  facingDirectionLocked: false,
  disableAnim: false,
  enableAnim: false,
  inanimate: false,
  invisible: false,
  offScreen: false,
  trackedByCamera: false,
  isPlayer: false,
  hasReflection: false,
  inShortGrass: false,
  inShallowFlowingWater: false,
  inSandPile: false,
  inHotSprings: false,
  hasShadow: false,
  disableJumpLandingGroundEffect: false,
  fixedPriority: false,
  hideReflection: false,
  // Fields u8 + structs.
  spriteId: -1,
  graphicsId: '',
  movementType: '',
  localId: 0,
  localIdRaw: '',
  mapId: '',
  mapNum: 0,
  mapGroup: 0,
  trainerType: 0,
  trainerRange_berryTreeId: 0,
  scriptLabel: '',
  currentCoordsX: 0,
  currentCoordsY: 0,
  previousCoordsX: 0,
  previousCoordsY: 0,
  initialCoordsX: 0,
  initialCoordsY: 0,
  facingDirection: DIR_SOUTH,
  movementDirection: DIR_SOUTH,
  previousMovementDirection: DIR_SOUTH,
  currentElevation: 0,
  previousElevation: 0,
  currentMetatileBehavior: 0,  // MB_NORMAL
  previousMetatileBehavior: 0,
  movementActionId: 0xFF,  // 1:1 décomp MOVEMENT_ACTION_NONE sentinel
  fieldEffectSpriteId: MAX_SPRITES,
  warpArrowSpriteId: MAX_SPRITES,
  playerCopyableMovement: 0,
  berryTreeFlags: 0,
  berryTreeTimer: 0,
  disguiseStarted: false,
  actionStep: 0,
  actionTimer: 0,
  jumpDistance: 0,
  jumpType: 0,
  walkSpeed: 0,
  walkSlowNumSteps: 0,
  figure8Idx: 0,
  figure8Phase: 0,
  objTileBase: 0,
  objTileCount: 0,
  paletteBank: 0,
  worldX: 0,
  worldY: 0,
  movementStep: 0,
  movementDelay: 0,
  walkFramesLeft: 0,
  walkDirection: DIR_NONE,
  walkAnimAlt: 0,
  frozen: false,
  is32x32: false,
  is16x16: false,
  movementRangeX: 0,
  movementRangeY: 0,
  directionSeqIdx: 0,
  useSubsprites: false,
  visualOffsetX: 0,
  visualOffsetY: 0,
}));

// ─── Coord shift helpers 1:1 décomp event_object_movement.c ─────────────────

/** 1:1 décomp `ShiftObjectEventCoords` (event_object_movement.c:2117-2123) :
 *    objectEvent->previousCoords.x = objectEvent->currentCoords.x;
 *    objectEvent->previousCoords.y = objectEvent->currentCoords.y;
 *    objectEvent->currentCoords.x = x;
 *    objectEvent->currentCoords.y = y;
 *  Used au DÉBUT d'un walk : previous = ancienne pos, current = nouvelle target.
 *  Pendant le walk, current/previous restent figés à TARGET/SOURCE. */
export function ShiftObjectEventCoords(npc: ObjectEvent, x: number, y: number): void {
  npc.previousCoordsX = npc.currentCoordsX;
  npc.previousCoordsY = npc.currentCoordsY;
  npc.currentCoordsX = x;
  npc.currentCoordsY = y;
}

/** 1:1 STRICT décomp `ShiftStillObjectEventCoords` (event_object_movement.c:2162-2165) :
 *    ShiftObjectEventCoords(objectEvent, objectEvent->currentCoords.x, objectEvent->currentCoords.y);
 *  Used à la FIN d'un walk : previous = current → NPC stable, plus de
 *  collision sur la source cell. */
export function ShiftStillObjectEventCoords(npc: ObjectEvent): void {
  ShiftObjectEventCoords(npc, npc.currentCoordsX, npc.currentCoordsY);
}

/** 1:1 décomp `ObjectEventUpdateMetatileBehaviors` (event_object_movement.c:7428-7432).
 *
 *  Body décomp :
 *  ```c
 *  static void ObjectEventUpdateMetatileBehaviors(struct ObjectEvent *objEvent) {
 *      objEvent->previousMetatileBehavior = MapGridGetMetatileBehaviorAt(
 *          objEvent->previousCoords.x, objEvent->previousCoords.y);
 *      objEvent->currentMetatileBehavior = MapGridGetMetatileBehaviorAt(
 *          objEvent->currentCoords.x, objEvent->currentCoords.y);
 *  }
 *  ```
 *
 *  Appelée par décomp dans 3 contextes :
 *    - `GetAllGroundEffectFlags_OnSpawn` (= au spawn d'un object event)
 *    - `GetAllGroundEffectFlags_OnBeginStep` (= début d'un step)
 *    - `GetAllGroundEffectFlags_OnFinishStep` (= fin d'un step)
 *
 *  Used par `HideShowWarpArrow` (= warp arrow direction match) + collision
 *  detection + ground effect dispatch (= grass rustle / sand kick / water
 *  splash / etc.).
 *
 *  Note coords : `currentCoords` / `previousCoords` sont en INTERNAL coords
 *  (= +MAP_OFFSET, 1:1 décomp ObjectEvent struct convention). `MapGridGetMetatile
 *  BehaviorAt` prend des internal coords directement. */
/** 1:1 STRICT décomp `MOVEMENT_ACTION_NONE = 0xFF` (include/constants/event_object_movement.h:247).
 *  Sentinel pour `movementActionId` indiquant "no action active".
 *  ⚠️ FIX : valait 0xFE (= la valeur de MOVEMENT_ACTION_STEP_END, l.246 !) → collision +
 *  incohérence avec l'init du slot (0xFF, l.652) et les autres usages hardcodés 0xFF
 *  (2697/6051). Un held cleared portait donc movementActionId=254=STEP_END au lieu de 255. */
const MOVEMENT_ACTION_NONE = 0xFF;

/** 1:1 décomp `ObjectEventIsMovementOverridden` (event_object_movement.c:4854-4860).
 *
 *  Body décomp :
 *  ```c
 *  if (objectEvent->singleMovementActive || objectEvent->heldMovementActive)
 *      return TRUE;
 *  return FALSE;
 *  ```
 *
 *  Used par `ObjectEventSetHeldMovement` pour gate l'application d'un nouveau
 *  movement action (= si déjà override, refuse). */
export function ObjectEventIsMovementOverridden(objectEvent: ObjectEvent): boolean {
  return objectEvent.singleMovementActive || objectEvent.heldMovementActive;
}

/** 1:1 décomp `ObjectEventIsHeldMovementActive` (event_object_movement.c:4862-4868).
 *
 *  Body décomp :
 *  ```c
 *  if (objectEvent->heldMovementActive && objectEvent->movementActionId != MOVEMENT_ACTION_NONE)
 *      return TRUE;
 *  return FALSE;
 *  ```
 *
 *  Used par `UpdateObjectEventCurrentMovement` pour dispatch ExecHeldMovementAction. */
export function ObjectEventIsHeldMovementActive(objectEvent: ObjectEvent): boolean {
  return objectEvent.heldMovementActive && objectEvent.movementActionId !== MOVEMENT_ACTION_NONE;
}

/** 1:1 décomp `ObjectEventSetHeldMovement` (event_object_movement.c:4870-4881).
 *
 *  Body décomp :
 *  ```c
 *  if (ObjectEventIsMovementOverridden(objectEvent))
 *      return TRUE;
 *  UnfreezeObjectEvent(objectEvent);
 *  objectEvent->movementActionId = movementActionId;
 *  objectEvent->heldMovementActive = TRUE;
 *  objectEvent->heldMovementFinished = FALSE;
 *  gSprites[objectEvent->spriteId].sActionFuncId = 0;
 *  return FALSE;
 *  ```
 *
 *  Used par `Task_ExitDoor`, `Task_DoDoorWarp`, scripted movement applymovement
 *  pour queue un movement action sur un ObjectEvent. Returns TRUE si refusé
 *  (= déjà overridden), FALSE si accepté. */
export function ObjectEventSetHeldMovement(objectEvent: ObjectEvent, movementActionId: number): boolean {
  if (ObjectEventIsMovementOverridden(objectEvent)) return true;
  // 1:1 STRICT décomp event_object_movement.c:4875 : UnfreezeObjectEvent(objectEvent)
  // — appel via la fonction pour restore animPaused/affineAnimPaused depuis backups
  // (event_object_movement.c:8175-8183). Inline `frozen=false` aurait raté ces restores.
  UnfreezeObjectEvent(objectEvent);
  objectEvent.movementActionId = movementActionId;
  objectEvent.heldMovementActive = true;
  objectEvent.heldMovementFinished = false;
  // 1:1 décomp `gSprites[objectEvent->spriteId].sActionFuncId = 0` (4880).
  // H1.1+ : on a maintenant actionStep field au niveau de l'ObjectEvent qui
  // sert de sActionFuncId. Reset au début d'une nouvelle action (= multi-step
  // Delay/Walk/etc. recommencent depuis Step0).
  objectEvent.actionStep = 0;
  return false;
}

/** 1:1 décomp `ObjectEventForceSetHeldMovement` (event_object_movement.c:4883-4887).
 *
 *  Body décomp :
 *  ```c
 *  ObjectEventClearHeldMovementIfActive(objectEvent);
 *  ObjectEventSetHeldMovement(objectEvent, movementActionId);
 *  ```
 *
 *  Used pour override un held movement existant (= contrairement à SetHeldMovement
 *  qui refuse si déjà active). */
export function ObjectEventForceSetHeldMovement(objectEvent: ObjectEvent, movementActionId: number): void {
  ObjectEventClearHeldMovementIfActive(objectEvent);
  ObjectEventSetHeldMovement(objectEvent, movementActionId);
}

/** 1:1 décomp `ObjectEventClearHeldMovementIfActive` (event_object_movement.c:4889-4893). */
export function ObjectEventClearHeldMovementIfActive(objectEvent: ObjectEvent): void {
  if (objectEvent.heldMovementActive) {
    ObjectEventClearHeldMovement(objectEvent);
  }
}

/** 1:1 décomp `ObjectEventClearHeldMovement` (event_object_movement.c:4895-4902).
 *
 *  Body décomp :
 *  ```c
 *  objectEvent->movementActionId = MOVEMENT_ACTION_NONE;
 *  objectEvent->heldMovementActive = FALSE;
 *  objectEvent->heldMovementFinished = FALSE;
 *  gSprites[objectEvent->spriteId].sTypeFuncId = 0;
 *  gSprites[objectEvent->spriteId].sActionFuncId = 0;
 *  ```
 */
export function ObjectEventClearHeldMovement(objectEvent: ObjectEvent): void {
  objectEvent.movementActionId = MOVEMENT_ACTION_NONE;
  objectEvent.heldMovementActive = false;
  objectEvent.heldMovementFinished = false;
  // Sprite anim state reset : voir note dans ObjectEventSetHeldMovement.
}

/** 1:1 décomp `ObjectEventCheckHeldMovementStatus` (event_object_movement.c:4904-4910).
 *
 *  Body décomp :
 *  ```c
 *  if (objectEvent->heldMovementActive)
 *      return objectEvent->heldMovementFinished;
 *  return 16;
 *  ```
 *
 *  Retourne :
 *    - `heldMovementFinished` flag (0 ou 1) si held movement active.
 *    - 16 (= "no held movement" sentinel) si pas active.
 *
 *  Used par `ObjectEventClearHeldMovementIfFinished` pour decide d'auto-clear. */
export function ObjectEventCheckHeldMovementStatus(objectEvent: ObjectEvent): number {
  if (objectEvent.heldMovementActive) {
    return objectEvent.heldMovementFinished ? 1 : 0;
  }
  return 16;
}

/** 1:1 décomp `ObjectEventClearHeldMovementIfFinished` (event_object_movement.c:4912-4919).
 *
 *  Body décomp :
 *  ```c
 *  u8 heldMovementStatus = ObjectEventCheckHeldMovementStatus(objectEvent);
 *  if (heldMovementStatus != 0 && heldMovementStatus != 16)
 *      ObjectEventClearHeldMovementIfActive(objectEvent);
 *  return heldMovementStatus;
 *  ```
 *
 *  Used par scripts `waitmovement` opcode pour check si movement done +
 *  auto-clear. Returns same status as Check (= caller distingue done/notDone). */
export function ObjectEventClearHeldMovementIfFinished(objectEvent: ObjectEvent): number {
  const heldMovementStatus = ObjectEventCheckHeldMovementStatus(objectEvent);
  if (heldMovementStatus !== 0 && heldMovementStatus !== 16) {
    ObjectEventClearHeldMovementIfActive(objectEvent);
  }
  return heldMovementStatus;
}

/** 1:1 décomp `ObjectEventGetHeldMovementActionId` (event_object_movement.c:4921-4927). */
export function ObjectEventGetHeldMovementActionId(objectEvent: ObjectEvent): number {
  if (objectEvent.heldMovementActive) {
    return objectEvent.movementActionId;
  }
  return MOVEMENT_ACTION_NONE;
}

/** 1:1 décomp `SpawnSpecialObjectEvent` (event_object_movement.c) helper
 *  spécialisé pour le PLAYER. Init `gObjectEvents[PLAYER_OBJECT_EVENT_SLOT]`
 *  comme player ObjectEvent.
 *
 *  Décomp `InitPlayerAvatar` (field_player_avatar.c:1364-1394) :
 *  ```c
 *  playerObjEventTemplate.localId = LOCALID_PLAYER;
 *  playerObjEventTemplate.graphicsId = GetPlayerAvatarGraphicsIdByStateIdAndGender(...);
 *  playerObjEventTemplate.x = x - MAP_OFFSET;
 *  playerObjEventTemplate.y = y - MAP_OFFSET;
 *  playerObjEventTemplate.elevation = ELEVATION_TRANSITION;
 *  playerObjEventTemplate.movementType = MOVEMENT_TYPE_PLAYER;
 *  ...
 *  objectEventId = SpawnSpecialObjectEvent(&playerObjEventTemplate);
 *  objectEvent = &gObjectEvents[objectEventId];
 *  objectEvent->isPlayer = TRUE;
 *  objectEvent->warpArrowSpriteId = CreateWarpArrowSprite();
 *  ObjectEventTurn(objectEvent, direction);
 *  ```
 *
 *  Used par `InitPlayerAvatar` (player-avatar.ts) au map load + post-warp.
 *
 *  @param mapX        Player position LOGICAL X (= sans MAP_OFFSET).
 *  @param mapY        Player position LOGICAL Y.
 *  @param direction   Initial facing direction (DIR_*).
 *  @param graphicsKey Player graphics ID (= 'Brendan' / 'May'). */
export function InitPlayerObjectEvent(
  mapX: number, mapY: number, direction: number, graphicsKey: string,
): void {
  const npc = gObjectEvents[PLAYER_OBJECT_EVENT_SLOT];
  // 1:1 décomp : init all fields à leur valeur par défaut + override les
  // player-specific.
  npc.active = true;
  npc.invisible = false;
  npc.isPlayer = true;
  npc.localId = 0xFF;  // 1:1 décomp LOCALID_PLAYER = 255 (= sentinel pour
                       // matching scripted movements via 'LOCALID_PLAYER' string).
  npc.localIdRaw = 'LOCALID_PLAYER';
  npc.graphicsId = graphicsKey;
  npc.movementType = 'MOVEMENT_TYPE_PLAYER';
  npc.scriptLabel = '';
  // 1:1 décomp `InitObjectEventStateFromTemplate` (event_object_movement.c:1298) :
  //   x = template->x + MAP_OFFSET;  ← INTERNAL coords storage
  //   objectEvent->currentCoords.x = x;  etc.
  // R3 refactor : `gObjectEvents` stocke maintenant en INTERNAL coords (= +
  // MAP_OFFSET), 1:1 strict path identique au décomp.
  npc.currentCoordsX = mapX + MAP_OFFSET;
  npc.currentCoordsY = mapY + MAP_OFFSET;
  npc.previousCoordsX = mapX + MAP_OFFSET;
  npc.previousCoordsY = mapY + MAP_OFFSET;
  npc.initialCoordsX = mapX + MAP_OFFSET;
  npc.initialCoordsY = mapY + MAP_OFFSET;
  npc.facingDirection = direction;
  npc.movementDirection = direction;
  npc.previousMovementDirection = direction;
  npc.currentElevation = 3;  // 1:1 décomp ELEVATION_TRANSITION (= 3) default
  npc.previousElevation = 3;
  npc.movementActionId = MOVEMENT_ACTION_NONE;
  npc.fieldEffectSpriteId = MAX_SPRITES;
  npc.warpArrowSpriteId = MAX_SPRITES;  // 1:1 décomp CreateWarpArrowSprite()
                                         // appelé séparément par scene (= notre
                                         // archi : loadAndInitMap call DestroyWarp +
                                         // CreateWarpArrowSprite).
  npc.playerCopyableMovement = 0;
  // 1:1 web port : set mapId = current map pour que SaveObjectEvents persist
  // le snap player avec son mapId. Sans ça, snap.mapId='' → LoadObjectEvents
  // filter `if (snap.mapId && currentMapId && snap.mapId !== currentMapId)`
  // est fail-open (mapId vide) → snap player TRUCK ré-appliqué sur warps
  // subséquents → slot0 reset à init coords TRUCK = (2, 2) → player bloqué.
  npc.mapId = gMapHeader?.id ?? '';
  npc.mapNum = 0;
  npc.mapGroup = 0;
  // Bit flags reset.
  npc.singleMovementActive = false;
  // 1:1 décomp `InitObjectEventStateFromTemplate` (event_object_movement.c:1300-1301) :
  // active = TRUE ; triggerGroundEffectsOnMove = TRUE. Le player object event (slot 0)
  // passe par le MÊME init au spawn dans la décomp (SpawnSpecialObjectEvent → …). Sans
  // ça, le joueur ne reflète/rustle PAS au spawn/warp/reprise-save tant qu'il n'a pas
  // bougé (= le bug signalé "il ne se reflète que s'il a bougé"). Le 1er DoGroundEffects_
  // OnSpawn (TickObjectEventMovements) consomme ce flag → reflet immédiat.
  npc.triggerGroundEffectsOnMove = true;
  npc.triggerGroundEffectsOnStop = false;
  npc.disableCoveringGroundEffects = false;
  npc.landingJump = false;
  npc.heldMovementActive = false;
  npc.heldMovementFinished = false;
  npc.facingDirectionLocked = false;
  npc.disableAnim = false;
  npc.enableAnim = false;
  npc.inanimate = false;
  npc.offScreen = false;
  npc.trackedByCamera = false;  // 1:1 décomp : player n'est PAS trackedByCamera
                                 // (= la camera FOLLOW le player via _camPos =
                                 // gSaveBlock1Ptr.pos, pas via objectEvent flag).
  npc.hasReflection = false;
  npc.inShortGrass = false;
  npc.inShallowFlowingWater = false;
  npc.inSandPile = false;
  npc.inHotSprings = false;
  npc.hasShadow = false;
  npc.disableJumpLandingGroundEffect = false;
  npc.fixedPriority = false;
  npc.hideReflection = false;
  npc.frozen = false;
  npc.is32x32 = false;
  npc.is16x16 = false;
  npc.useSubsprites = false;
  // 1:1 décomp `GetAllGroundEffectFlags_OnSpawn` (event_object_movement.c:7389)
  // → ObjectEventUpdateMetatileBehaviors(objEvent) au spawn.
  ObjectEventUpdateMetatileBehaviors(npc);
}

/** Sync `gObjectEvents[PLAYER_OBJECT_EVENT_SLOT]` avec `gPlayerAvatar`. À
 *  call à chaque step boundary (= step end) + au facing change. Maintient
 *  les fields lus par décomp helpers (= `currentCoords`, `facingDirection`,
 *  `movementDirection`, `currentMetatileBehavior`, etc.).
 *
 *  @param mapX        Logical X (= gPlayerAvatar.x).
 *  @param mapY        Logical Y.
 *  @param facing      gPlayerAvatar.facing.
 *  @param movementDir Direction du step en cours (= optional, default = facing).
 *  @param shiftCoords TRUE = shift previous from current (= ShiftObjectEventCoords
 *                     style 1:1 décomp au step start). FALSE = no shift (= keep
 *                     previous as-is).
 */
export function SyncPlayerObjectEvent(
  mapX: number, mapY: number, facing: number,
  movementDir?: number, shiftCoords: boolean = false,
): void {
  const npc = gObjectEvents[PLAYER_OBJECT_EVENT_SLOT];
  if (!npc.active || !npc.isPlayer) return;
  // R3 refactor : currentCoords stockés en INTERNAL (= +MAP_OFFSET) 1:1 décomp.
  if (shiftCoords) {
    // 1:1 décomp event_object_movement.c:2117-2123 : ShiftObjectEventCoords
    // (previous = old current, current = new).
    ShiftObjectEventCoords(npc, mapX + MAP_OFFSET, mapY + MAP_OFFSET);
  } else {
    npc.currentCoordsX = mapX + MAP_OFFSET;
    npc.currentCoordsY = mapY + MAP_OFFSET;
  }
  npc.facingDirection = facing;
  if (movementDir !== undefined) {
    npc.movementDirection = movementDir;
  }
  // 1:1 décomp `ObjectEventUpdateMetatileBehaviors` au step end (=
  // GetAllGroundEffectFlags_OnFinishStep event_object_movement.c:7415).
  ObjectEventUpdateMetatileBehaviors(npc);
}

export function ObjectEventUpdateMetatileBehaviors(npc: ObjectEvent): void {
  // 1:1 décomp `MapGridGetMetatileBehaviorAt(objEvent->currentCoords.x, ...)` :
  // décomp stocke `currentCoords` en INTERNAL coords (= +MAP_OFFSET), le
  // `MapGridGet` reçoit directement les internal coords.
  //
  // Post R3 refactor : notre `gObjectEvents` stocke aussi INTERNAL → call direct
  // sans conversion. 1:1 strict path identique au décomp.
  npc.previousMetatileBehavior = MapGridGetMetatileBehaviorAt(
    npc.previousCoordsX, npc.previousCoordsY);
  npc.currentMetatileBehavior = MapGridGetMetatileBehaviorAt(
    npc.currentCoordsX, npc.currentCoordsY);
}

/** 1:1 décomp `GetObjectEventIdByLocalIdAndMapInternal` (event_object_movement.c:1263).
 *  Cherche l'object event actif par (localId, mapNum, mapGroup). Retourne
 *  OBJECT_EVENTS_COUNT si absent. */
function GetObjectEventIdByLocalIdAndMapInternal(localId: number, mapNum: number, mapGroup: number): number {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const o = gObjectEvents[i];
    if (o.active && o.localId === localId && o.mapNum === mapNum && o.mapGroup === mapGroup) return i;
  }
  return OBJECT_EVENTS_COUNT;
}

/** 1:1 décomp `static u8 GetObjectEventIdByLocalId(u8 localId)` (event_object_movement.c:1275)
 *  — lookup par localId seul (ids spéciaux ≥ LOCALID_PLAYER : joueur/caméra). */
function GetObjectEventIdByLocalId(localId: number): number {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    if (gObjectEvents[i].active && gObjectEvents[i].localId === localId) return i;
  }
  return OBJECT_EVENTS_COUNT;
}

/** 1:1 décomp `u8 GetObjectEventIdByLocalIdAndMap(u8, u8, u8)` (event_object_movement.c:1234).
 *  (Fix drift : l'ancienne version implémentait Internal SANS le dispatch des
 *  localIds spéciaux — LOCALID_PLAYER=0xFF ne résolvait jamais le joueur.) */
export function GetObjectEventIdByLocalIdAndMap(localId: number, mapNum: number, mapGroup: number): number {
  if (localId < 0xFF /* LOCALID_PLAYER */)
    return GetObjectEventIdByLocalIdAndMapInternal(localId, mapNum, mapGroup);
  return GetObjectEventIdByLocalId(localId);
}

/** 1:1 décomp `TryGetObjectEventIdByLocalIdAndMap` (event_object_movement.c:1242).
 *  La décomp retourne bool8 (= TRUE si INTROUVABLE) + écrit *objectEventId. Notre TS :
 *  retourne `{ notFound, objectEventId }` (notFound ≡ le TRUE décomp). */
export function TryGetObjectEventIdByLocalIdAndMap(localId: number, mapNum: number, mapGroup: number): { notFound: boolean; objectEventId: number } {
  const objectEventId = GetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  return { notFound: objectEventId === OBJECT_EVENTS_COUNT, objectEventId };
}

// Phase 4.6 audit Opus §5 : register vers field-globals (= type-safe lookup).
// gObjectEvents reste exposé sur globalThis pour back-compat avec les
// auto-callbacks décomp générés (= castent en `any`), mais les call-sites
// internes (player-avatar, warp-system) doivent utiliser `getGObjectEvents`.
_registerGObjectEvents(gObjectEvents);
(globalThis as Record<string, unknown>).__gObjectEvents = gObjectEvents;

// ─── OBJ tile/palette allocation ────────────────────────────────────────────
// 1:1 STRICT décomp event_object_movement.c → src/sprite.c:CreateSpriteAt
// (sprite.c:540-589). NPCs ont graphicsInfo->tileTag == TAG_NONE → branch
// "images" : `AllocSpriteTiles(images[0].size / TILE_SIZE_4BPP)` depuis le
// bitmap général `sSpriteTileAllocBitmap`, pas de pool séparé. Free via
// `DestroySprite` (sprite.c:622-628) qui appelle `FREE_SPRITE_TILE` pour
// chaque tile dans la range.
//
// Notre implémentation : on alloue TILES_PER_NPC tiles consécutifs pour
// pré-charger plusieurs frames en VRAM (= éviter RequestSpriteFrameImageCopy
// à chaque change frame = optim web acceptable, doc dette). Le bitmap est
// la source de vérité unique.
//
// Pour la palette : 1:1 décomp LoadObjectEventPalette (event_object_movement.c
// :2014-2025) → LoadSpritePaletteIfTagExists (sprite.c:1610) → LoadSpritePalette
// (sprite.c:1589-1608). Le tag system gère first-free + dedup automatique.

const TILES_PER_NPC = 72;

export function resetObjectEventAllocations(): void {
  for (let i = 0; i < gObjectEvents.length; i++) {
    const npc = gObjectEvents[i];
    // 1:1 décomp : ne PAS reset le player ObjectEvent slot (= survit aux map
    // switches). Décomp utilise `SpawnSpecialObjectEvent` qui alloue le slot
    // au boot + le préserve. Le map switch reset les NPCs mais pas le player.
    if (i === PLAYER_OBJECT_EVENT_SLOT && npc.isPlayer) continue;
    npc.active = false;
    npc.spriteId = -1;
    // 1:1 décomp : reset visualOffsetX/Y (= sprite.x2/y2) sinon les NPCs de
    // la nouvelle map héritent des offsets des truck boxes (= bug session 123 :
    // Mère décalée d'1 pixel sur grid car visualOffsetX hérité de Box1).
    npc.visualOffsetX = 0;
    npc.visualOffsetY = 0;
    // Reset autres flags qui peuvent leak entre maps.
    npc.invisible = false;
    npc.frozen = false;
    npc.useSubsprites = false;
    npc.is32x32 = false;
    npc.walkFramesLeft = 0;
    npc.movementStep = 0;
    npc.movementDelay = 0;
    // Audit session 126 : reset COMPLET des champs identifiants. Sans ça les
    // slots `active=false` gardent leurs anciens graphicsId/coords/mapId →
    // 1) zombies dans `__gObjectEvents` (= les MOVING_BOX du Truck visibles
    //    après warp Brendan/MaysHouse_1F),
    // 2) potentiel bug collision si un check parcourt le array sans filtrer
    //    sur active (= rare mais possible),
    // 3) débug live difficile (= confusion sur identité du slot).
    npc.graphicsId = '';
    npc.movementType = '';
    npc.localId = 0;
    npc.localIdRaw = '';
    npc.mapId = '';
    npc.scriptLabel = '';
    npc.currentCoordsX = 0;
    npc.currentCoordsY = 0;
    npc.previousCoordsX = 0;
    npc.previousCoordsY = 0;
    npc.initialCoordsX = 0;
    npc.initialCoordsY = 0;
    npc.facingDirection = DIR_SOUTH;
    npc.movementRangeX = 0;
    npc.movementRangeY = 0;
    npc.directionSeqIdx = 0;
    npc.objTileBase = 0;
    npc.objTileCount = 0;
    npc.paletteBank = 0;
    npc.worldX = 0;
    npc.worldY = 0;
    npc.walkDirection = DIR_NONE;
    npc.walkAnimAlt = 0;
  }
}

/** Phase 4.6 : libère les sprites OAM des NPCs avant un warp / map switch.
 *  resetObjectEventAllocations seul reset l'array logique mais laisse les
 *  sprites dans rt.gSprites et leur tileBase/paletteBank occupé → leak +
 *  collision palette quand on re-spawn la map suivante. Cette fonction kill
 *  proprement chaque sprite avant le reset.
 *
 *  À appeler AVANT resetObjectEventAllocations + SpawnObjectEventsOnMap. */
export function destroyAllNpcSprites(rt: { gSprites: ({ oamIndex: number; inUse: boolean } | undefined)[]; gba: { oam: Array<{ visible: boolean }> } }): void {
  for (const npc of gObjectEvents) {
    // [M3] Ne PAS détruire le sprite du joueur : son slot le POSSÈDE désormais
    // (slot.spriteId = gPlayerAvatar.spriteId, unifié), mais le sprite est (re)créé
    // par `InitPlayerAvatar` (qui tourne AVANT ce reset au map-load) et détruit par
    // `DestroyPlayerAvatar`. Sans ce skip, ce reset NPC tuerait le sprite joueur
    // fraîchement créé (= id libéré → repris par le 1er NPC → collision). 1:1
    // décomp : ResetObjectEvents reset les NPCs, le player object event est géré à part.
    if (npc.isPlayer) continue;
    if (npc.active && npc.spriteId >= 0) {
      const sprite = rt.gSprites[npc.spriteId];
      if (sprite) {
        rt.gba.oam[sprite.oamIndex].visible = false;
        sprite.inUse = false;
      }
      // 1:1 STRICT décomp sprite.c:622-628 `DestroySprite` branch `if (!usingSheet)` :
      //   u16 tileEnd = (sprite->images->size / TILE_SIZE_4BPP) + sprite->oam.tileNum;
      //   for (i = sprite->oam.tileNum; i < tileEnd; i++) FREE_SPRITE_TILE(i);
      // Libère EXACTEMENT le nombre de tiles alloués (= npc.objTileCount, posé au
      // spawn) pour qu'AllocSpriteTiles puisse les ré-utiliser au prochain spawn.
      // Fallback TILES_PER_NPC pour les NPCs spawnés avant le tracking (= 0).
      if (npc.objTileBase > 0) {
        MarkObjTilesFree(npc.objTileBase * 32, (npc.objTileCount > 0 ? npc.objTileCount : TILES_PER_NPC) * 32);
      }
      npc.spriteId = -1;
    }
  }
  // Phase 4.10 fix critique : cleanup child OAMs des NPCs subsprite-driven
  // (= truck 48×48). Sans ce cleanup, les 12 child OAMs du truck persistent
  // au map switch → on voit le truck en haut-droite à la sortie OU à l'intérieur
  // de la nouvelle map (= bug session 119).
  // 1:1 décomp `RemoveAllObjectEventsOAM` + `FreeAllSpritePalettes` au map exit.
  clearAllSubspriteTables();
}

// ─── PNG → OBJ 1D layout helper ─────────────────────────────────────────────

function pngTo1dObjLayout(pngCharData: Uint8Array, numFrames: number, pngWidthTiles: number, framePxW: number, framePxH: number): Uint8Array {
  const TILE_BYTES = 32;
  const FRAME_W_TILES = framePxW / 8;
  const FRAME_H_TILES = framePxH / 8;
  const TILES_PER_FRAME = FRAME_W_TILES * FRAME_H_TILES;
  const out = new Uint8Array(numFrames * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < numFrames; f++) {
    for (let row = 0; row < FRAME_H_TILES; row++) {
      for (let col = 0; col < FRAME_W_TILES; col++) {
        const pngTileIdx = row * pngWidthTiles + (f * FRAME_W_TILES) + col;
        const objTileIdx = f * TILES_PER_FRAME + row * FRAME_W_TILES + col;
        out.set(
          pngCharData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
          objTileIdx * TILE_BYTES,
        );
      }
    }
  }
  return out;
}

/**
 * Like `pngTo1dObjLayout` but only extracts a single frame (= avoid loading
 * unused frames into VRAM). Used for 32×32 NPCs où le PNG contient plusieurs
 * frames partagés (= Vigoroth has 5 frames split between CarryingBox/FacingAway).
 *
 * Session 124 fix Bug 1.
 */
function pngTo1dObjLayoutSingleFrame(
  pngCharData: Uint8Array, frameIdx: number, pngWidthTiles: number,
  framePxW: number, framePxH: number,
): Uint8Array {
  const TILE_BYTES = 32;
  const FRAME_W_TILES = framePxW / 8;
  const FRAME_H_TILES = framePxH / 8;
  const TILES_PER_FRAME = FRAME_W_TILES * FRAME_H_TILES;
  const out = new Uint8Array(TILES_PER_FRAME * TILE_BYTES);
  for (let row = 0; row < FRAME_H_TILES; row++) {
    for (let col = 0; col < FRAME_W_TILES; col++) {
      const pngTileIdx = row * pngWidthTiles + (frameIdx * FRAME_W_TILES) + col;
      const objTileIdx = row * FRAME_W_TILES + col;
      out.set(
        pngCharData.subarray(pngTileIdx * TILE_BYTES, (pngTileIdx + 1) * TILE_BYTES),
        objTileIdx * TILE_BYTES,
      );
    }
  }
  return out;
}

/**
 * Convertit un PNG entier (row-major, multi-frames horizontaux) → format 1D OBJ
 * frames consécutifs (= ce que `gObjectEventPic_*` est en décomp ROM).
 *
 * Pour un PNG 144x16 = 18 tiles wide, frames 16x16 (= 2 tiles wide) :
 *   Input  (row-major)    : row 0 = [F0.TL, F0.TR, F1.TL, F1.TR, ...]
 *                            row 1 = [F0.BL, F0.BR, F1.BL, F1.BR, ...]
 *   Output (frames consec) : frame 0 = [F0.TL, F0.TR, F0.BL, F0.BR]
 *                            frame 1 = [F1.TL, F1.TR, F1.BL, F1.BR]
 *                            ...
 *
 * Utilisé pour pré-convertir le PNG avant d'appeler `GetObjectEventGraphicsInfo`
 * (= les factories pic_table assument frames consec via `subarray(N*sz, (N+1)*sz)`).
 *
 * 1:1 STRICT : le format frames consec est ce que décomp ROM stocke (= INCBIN
 * `gObjectEventPic_X` du build pipeline). Notre PNG row-major est un artefact
 * de notre asset loader → reformater à load time pour matcher décomp.
 */
function pngTo1dObjLayoutAllFrames(
  pngCharData: Uint8Array, pngWidthTiles: number,
  framePxW: number, framePxH: number,
): Uint8Array {
  const TILE_BYTES = 32;
  const FRAME_W_TILES = framePxW / 8;
  const TILES_PER_FRAME = FRAME_W_TILES * (framePxH / 8);
  const numFrames = Math.floor(pngWidthTiles / FRAME_W_TILES);
  const out = new Uint8Array(numFrames * TILES_PER_FRAME * TILE_BYTES);
  for (let f = 0; f < numFrames; f++) {
    const frame = pngTo1dObjLayoutSingleFrame(pngCharData, f, pngWidthTiles, framePxW, framePxH);
    out.set(frame, f * TILES_PER_FRAME * TILE_BYTES);
  }
  return out;
}

// ─── Sprite frame layout 1:1 player-avatar.ts ───────────────────────────────

const NPC_SPRITE_FRAMES: Record<number, { face: number; walk1: number; walk2: number; hFlip: boolean }> = {
  [DIR_SOUTH]: { face: 0, walk1: 3, walk2: 4, hFlip: false },
  [DIR_NORTH]: { face: 1, walk1: 5, walk2: 6, hFlip: false },
  [DIR_WEST]:  { face: 2, walk1: 7, walk2: 8, hFlip: false },
  [DIR_EAST]:  { face: 2, walk1: 7, walk2: 8, hFlip: true },
};

const TILES_PER_FRAME_16x32 = 8;

// ─── Subsprite tables (= 1:1 décomp `src/data/object_events/object_event_subsprites.h`) ──
//
// Pour les NPCs > 16×32 (= truck 48×48, vigoroth carrying box, etc.), le décomp
// utilise un système de subsprites : un sprite logique unique avec N OAMs
// child positionnés relativement au center du parent. Sans ça, on ne pourrait
// pas rendre 48×48 (= pas une OAM size hardware single).
//
// `sOamTable_48x48` (object_event_subsprites.h:228) : 12 subsprites couvrant
// 6 rows × 8 px = 48 px height. Chaque row : 32×8 left (4 tiles) + 16×8 right
// (2 tiles) = 6 tiles per row × 6 rows = 36 tiles total. Used by truck.
//
// Format NamingSubsprite (= compatible avec SetSubspriteTables in decomp-globals) :
//   { x, y, shape, size, tileOffset, priority }
//   - shape : 0=square, 1=wide (w>h), 2=tall (h>w)
//   - size : 0..3 selon dimensions (cf. oamShapeSizeFromWH)
//     32×8 → shape=1 (wide) size=1
//     16×8 → shape=1 (wide) size=0
import type { NamingSubsprite } from '../harness/runtime/decomp-globals';
import { SetSubspriteTables, syncSubspriteOam, clearAllSubspriteTables, getRuntime } from '../harness/runtime/decomp-globals';

/**
 * 1:1 décomp `sOamTable_16x16_2` (object_event_subsprites.h:38-58). Used pour
 * les NPCs/caisses avec elevation tels que `sElevationToSubspriteTableNum`
 * retourne 2 (= elevation 4, 6, 8, 10, 12 → split subsprite layout).
 *
 * Split horizontal du sprite 16x16 en 2 demi-OAMs 16x8 :
 *   - Top half (y=-8..0) : priority 2 (= rendered ABOVE bottom)
 *   - Bottom half (y=0..8) : priority 3 (= rendered BEHIND top + behind autres
 *     sprites priority 2)
 *
 * Use case : permet à la moitié BOTTOM de passer derrière player/autres
 * sprites priority 2 → effet "le bas de la caisse est camouflé par
 * tile/sprite plus bas dans la scène".
 *
 * Session 124 fix Bug 3 (= 1-pixel artifact lors du trajet camion).
 */
export const sOamTable_16x16_2: ReadonlyArray<NamingSubsprite> = [
  { x: -8, y: -8, shape: 1, size: 0, tileOffset: 0, priority: 2 }, // top half 16x8
  { x: -8, y:  0, shape: 1, size: 0, tileOffset: 2, priority: 3 }, // bottom half 16x8
];

export const sOamTable_48x48: ReadonlyArray<NamingSubsprite> = [
  { x: -24, y: -24, shape: 1, size: 1, tileOffset:  0, priority: 2 }, // 32×8 row 0 left
  { x:   8, y: -24, shape: 1, size: 0, tileOffset:  4, priority: 2 }, // 16×8 row 0 right
  { x: -24, y: -16, shape: 1, size: 1, tileOffset:  6, priority: 2 }, // 32×8 row 1 left
  { x:   8, y: -16, shape: 1, size: 0, tileOffset: 10, priority: 2 }, // 16×8 row 1 right
  { x: -24, y:  -8, shape: 1, size: 1, tileOffset: 12, priority: 2 }, // 32×8 row 2 left
  { x:   8, y:  -8, shape: 1, size: 0, tileOffset: 16, priority: 2 }, // 16×8 row 2 right
  { x: -24, y:   0, shape: 1, size: 1, tileOffset: 18, priority: 2 }, // 32×8 row 3 left
  { x:   8, y:   0, shape: 1, size: 0, tileOffset: 22, priority: 2 }, // 16×8 row 3 right
  { x: -24, y:   8, shape: 1, size: 1, tileOffset: 24, priority: 2 }, // 32×8 row 4 left
  { x:   8, y:   8, shape: 1, size: 0, tileOffset: 28, priority: 2 }, // 16×8 row 4 right
  { x: -24, y:  16, shape: 1, size: 1, tileOffset: 30, priority: 2 }, // 32×8 row 5 left
  { x:   8, y:  16, shape: 1, size: 0, tileOffset: 34, priority: 2 }, // 16×8 row 5 right
];

// Re-export pour autres modules (e.g. TestOverworldScene qui call syncSubspriteOam).
export { syncSubspriteOam };

// ─── Movement type → initial facing direction ──────────────────────────────

/** 1:1 décomp `gInitialMovementTypeFacingDirections[]`
 *  (event_object_movement.c:351-433). Read par `InitObjectEventStateFromTemplate`
 *  (line 1320) pour init `previousMovementDirection` au spawn, et utilisé par
 *  les `MovementType_*_Step0` (e.g. MovementType_WalkInPlace_Step0 line 4422)
 *  pour set le facing initial du sprite avant la première anim.
 *
 *  Ancienne impl heuristique `includes('FACE_DOWN')` etc. : fallback DIR_SOUTH
 *  pour les patterns sans 'FACE_*' → bug Vigoroth FACING_AWAY/CARRYING_BOX dans
 *  MaysHouse_1F : mt=WALK_IN_PLACE_UP était mappé à DIR_SOUTH au lieu de
 *  DIR_NORTH → sprite stuck sur frame face-down (= n'existe pas dans assets
 *  VIGOROTH_FACING_AWAY) → Vigoroth ne s'anime pas (user-flag : "Un ne bouge
 *  pas, l'autre slide"). */
const _INITIAL_FACING_BY_MT: ReadonlyMap<string, number> = new Map([
  // FACE_* (= reste statique facing direction)
  ['MOVEMENT_TYPE_FACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_FACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_FACE_RIGHT', DIR_EAST],
  // FACE_*_AND_* (= face direction principale + range autour)
  ['MOVEMENT_TYPE_FACE_DOWN_AND_UP', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT', DIR_WEST],
  ['MOVEMENT_TYPE_FACE_UP_AND_LEFT', DIR_NORTH],
  ['MOVEMENT_TYPE_FACE_UP_AND_RIGHT', DIR_NORTH],
  ['MOVEMENT_TYPE_FACE_DOWN_AND_LEFT', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_DOWN_UP_AND_LEFT', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_DOWN_UP_AND_RIGHT', DIR_SOUTH],
  ['MOVEMENT_TYPE_FACE_UP_LEFT_AND_RIGHT', DIR_NORTH],
  ['MOVEMENT_TYPE_FACE_DOWN_LEFT_AND_RIGHT', DIR_SOUTH],
  // WANDER_*
  ['MOVEMENT_TYPE_WANDER_AROUND', DIR_SOUTH],
  ['MOVEMENT_TYPE_WANDER_UP_AND_DOWN', DIR_NORTH],
  ['MOVEMENT_TYPE_WANDER_DOWN_AND_UP', DIR_SOUTH],
  ['MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT', DIR_WEST],
  ['MOVEMENT_TYPE_WANDER_RIGHT_AND_LEFT', DIR_EAST],
  // WALK_*
  ['MOVEMENT_TYPE_WALK_UP_AND_DOWN', DIR_NORTH],
  ['MOVEMENT_TYPE_WALK_DOWN_AND_UP', DIR_SOUTH],
  ['MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT', DIR_WEST],
  ['MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT', DIR_EAST],
  // WALK_IN_PLACE_*
  ['MOVEMENT_TYPE_WALK_IN_PLACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_WALK_IN_PLACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_WALK_IN_PLACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT', DIR_EAST],
  // JOG_IN_PLACE_*
  ['MOVEMENT_TYPE_JOG_IN_PLACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_JOG_IN_PLACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_JOG_IN_PLACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_JOG_IN_PLACE_RIGHT', DIR_EAST],
  // RUN_IN_PLACE_*
  ['MOVEMENT_TYPE_RUN_IN_PLACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_RUN_IN_PLACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_RUN_IN_PLACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_RUN_IN_PLACE_RIGHT', DIR_EAST],
  // WALK_SLOWLY_IN_PLACE_*
  ['MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_DOWN', DIR_SOUTH],
  ['MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_UP', DIR_NORTH],
  ['MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_LEFT', DIR_WEST],
  ['MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_RIGHT', DIR_EAST],
  // COPY_PLAYER (= NPC copie le mvt joueur, facing init dérive du premier
  // movement de chaîne).
  ['MOVEMENT_TYPE_COPY_PLAYER', DIR_NORTH],
  ['MOVEMENT_TYPE_COPY_PLAYER_OPPOSITE', DIR_SOUTH],
  ['MOVEMENT_TYPE_COPY_PLAYER_COUNTERCLOCKWISE', DIR_WEST],
  ['MOVEMENT_TYPE_COPY_PLAYER_CLOCKWISE', DIR_EAST],
  ['MOVEMENT_TYPE_COPY_PLAYER_IN_GRASS', DIR_NORTH],
  ['MOVEMENT_TYPE_COPY_PLAYER_OPPOSITE_IN_GRASS', DIR_SOUTH],
  ['MOVEMENT_TYPE_COPY_PLAYER_COUNTERCLOCKWISE_IN_GRASS', DIR_WEST],
  ['MOVEMENT_TYPE_COPY_PLAYER_CLOCKWISE_IN_GRASS', DIR_EAST],
  // Misc statiques
  ['MOVEMENT_TYPE_NONE', DIR_SOUTH],
  ['MOVEMENT_TYPE_LOOK_AROUND', DIR_SOUTH],
  ['MOVEMENT_TYPE_PLAYER', DIR_SOUTH],
  ['MOVEMENT_TYPE_BERRY_TREE_GROWTH', DIR_SOUTH],
  ['MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE', DIR_SOUTH],
  ['MOVEMENT_TYPE_ROTATE_CLOCKWISE', DIR_SOUTH],
  ['MOVEMENT_TYPE_TREE_DISGUISE', DIR_SOUTH],
  ['MOVEMENT_TYPE_MOUNTAIN_DISGUISE', DIR_SOUTH],
  ['MOVEMENT_TYPE_BURIED', DIR_SOUTH],
  ['MOVEMENT_TYPE_INVISIBLE', DIR_SOUTH],
]);

function movementTypeToInitialFacing(movementType: string): number {
  const mapped = _INITIAL_FACING_BY_MT.get(movementType);
  if (mapped !== undefined) return mapped;
  // WALK_SEQUENCE_* (= 24 variantes) : DIR = première lettre de la séquence
  // (UP→DIR_NORTH, DOWN→DIR_SOUTH, LEFT→DIR_WEST, RIGHT→DIR_EAST). 1:1 décomp
  // event_object_movement.c:381-404.
  if (movementType.startsWith('MOVEMENT_TYPE_WALK_SEQUENCE_')) {
    const rest = movementType.slice('MOVEMENT_TYPE_WALK_SEQUENCE_'.length);
    if (rest.startsWith('UP_')) return DIR_NORTH;
    if (rest.startsWith('DOWN_')) return DIR_SOUTH;
    if (rest.startsWith('LEFT_')) return DIR_WEST;
    if (rest.startsWith('RIGHT_')) return DIR_EAST;
  }
  return DIR_SOUTH;
}

// ─── Direction helpers depuis direction-coords (= source unique partagée) ──
// Avant : DIR_TO_DX/DY locaux dupliquaient la table 1:1 décomp `sDirectionToVectors`.
// Migrate vers direction-coords.ts pour cohérence avec player-avatar +
// script-opcodes.

function pickRandomDirection(allowed: ReadonlyArray<number> = gStandardDirections): number {
  // 1:1 décomp `event_object_movement.c:GetRandomDirection` qui fait
  // `Random() % count` sur la table sDirections. Auparavant Math.random() = bug
  // RNG (= séquence non-reproductible, viole le déterminisme du seed=0).
  return allowed[Random() % allowed.length];
}

function pickRandomDelay(): number {
  // 1:1 décomp `event_object_movement.c:GetRandomMovementDelay` qui fait
  // `sMovementDelaysMedium[Random() % ARRAY_COUNT(sMovementDelaysMedium)]`.
  return sMovementDelaysMedium[Random() % sMovementDelaysMedium.length];
}

/** Check si target tile (INTERNAL coords) occupé par player.
 *  1:1 décomp pattern : lit slot 0 (= player ObjectEvent unifié post-refactor)
 *  qui sync currentCoords IMMÉDIATEMENT au Step0. La cell TARGET d'un walk
 *  MOVING est déjà dans `slot0.currentCoords` (= post InitNpcForMovement),
 *  donc pas besoin de logic séparée "player MOVING vers target". */
function isPlayerAt(x: number, y: number): boolean {
  const p = gObjectEvents[PLAYER_OBJECT_EVENT_SLOT];
  if (p && p.active && p.isPlayer) {
    if (p.currentCoordsX === x && p.currentCoordsY === y) return true;
    if (p.previousCoordsX === x && p.previousCoordsY === y) return true;
    return false;
  }
  // Fallback (= slot 0 pas init, early boot) : compare avec pa.x/y converti INTERNAL.
  const paX = gSaveBlock1Ptr.pos.x + MAP_OFFSET;
  const paY = gSaveBlock1Ptr.pos.y + MAP_OFFSET;
  if (paX === x && paY === y) return true;
  if (gPlayerAvatar.runningState === 2 /* MOVING */ && gPlayerAvatar.stepFramesLeft > 0) {
    const sdx = DIR_TO_DX[gPlayerAvatar.stepDirection] ?? 0;
    const sdy = DIR_TO_DY[gPlayerAvatar.stepDirection] ?? 0;
    if (paX + sdx === x && paY + sdy === y) return true;
  }
  return false;
}

// ─── 1:1 décomp collision constants + helpers (global.fieldmap.h:309-319) ─

/** 1:1 décomp `enum Collision` (global.fieldmap.h:309-319). NE PAS modifier
 *  les valeurs : matchent l'index décomp utilisé par sites externes. */
export const COLLISION_NONE                = 0;
export const COLLISION_OUTSIDE_RANGE       = 1;
export const COLLISION_IMPASSABLE          = 2;
export const COLLISION_ELEVATION_MISMATCH  = 3;
export const COLLISION_OBJECT_EVENT        = 4;
export const COLLISION_STOP_SURFING        = 5;
export const COLLISION_LEDGE_JUMP          = 6;
export const COLLISION_PUSHED_BOULDER      = 7;
export const COLLISION_ROTATING_GATE       = 8;
export const COLLISION_WHEELIE_HOP             = 9;
export const COLLISION_ISOLATED_VERTICAL_RAIL  = 10;
export const COLLISION_ISOLATED_HORIZONTAL_RAIL = 11;
export const COLLISION_VERTICAL_RAIL           = 12;
export const COLLISION_HORIZONTAL_RAIL         = 13;

/** 1:1 décomp `enum Elevation` (global.fieldmap.h:14-20). */
export const ELEVATION_TRANSITION  = 0;
export const ELEVATION_DEFAULT     = 3;
export const ELEVATION_MULTI_LEVEL = 15;

/** 1:1 décomp `ObjectEventDoesElevationMatch(objectEvent, elevation)`
 *  (event_object_movement.c:2209-2215).
 *
 *  ```c
 *  if (objectEvent->currentElevation != ELEVATION_TRANSITION
 *      && elevation != ELEVATION_TRANSITION
 *      && objectEvent->currentElevation != elevation)
 *      return FALSE;
 *  return TRUE;
 *  ```
 *
 *  TRANSITION elevation (= 0) match toujours. Else même value requise. */
export function ObjectEventDoesElevationMatch(
  objectEvent: ObjectEvent, elevation: number,
): boolean {
  if (objectEvent.currentElevation !== ELEVATION_TRANSITION
      && elevation !== ELEVATION_TRANSITION
      && objectEvent.currentElevation !== elevation) return false;
  return true;
}

/** 1:1 décomp `GetObjectEventIdByXY(s16 x, s16 y)`
 *  (event_object_movement.c:1251-1261). Returns index dans gObjectEvents
 *  matching position OR `OBJECT_EVENTS_COUNT` (= sentinel "not found"). */
export function GetObjectEventIdByXY(x: number, y: number): number {
  let i: number;
  for (i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    if (gObjectEvents[i].active
        && gObjectEvents[i].currentCoordsX === x
        && gObjectEvents[i].currentCoordsY === y) break;
  }
  return i;
}

/** 1:1 STRICT décomp `AllowObjectAtPosTriggerGroundEffects(s16 x, s16 y)` (event_object_movement.c:1954) :
 *  ré-arme les ground effects (herbe/reflet…) du NPC/mon situé en (x,y). Appelé par FldEff_CutGrass
 *  pour chaque tuile coupée (un objet debout sur l'herbe coupée doit rafraîchir son overlay). */
export function AllowObjectAtPosTriggerGroundEffects(x: number, y: number): void {
  const objectEventId = GetObjectEventIdByXY(x, y);
  if (objectEventId !== OBJECT_EVENTS_COUNT) {
    gObjectEvents[objectEventId].triggerGroundEffectsOnMove = true;
  }
}

/** 1:1 décomp `SetObjectEventDirection` (event_object_movement.c:2361-2371).
 *
 *  ```c
 *  void SetObjectEventDirection(struct ObjectEvent *objectEvent, u8 direction)
 *  {
 *      s8 d2;
 *      objectEvent->previousMovementDirection = objectEvent->facingDirection;
 *      if (!objectEvent->facingDirectionLocked)
 *      {
 *          d2 = direction;
 *          objectEvent->facingDirection = d2;
 *      }
 *      objectEvent->movementDirection = direction;
 *  }
 *  ```
 *
 *  Source unique pour rotater un ObjectEvent (NPC ou player). N'écrire JAMAIS
 *  `obj.facingDirection = X` direct depuis l'extérieur — passer par ce helper
 *  pour maintenir l'invariant `previousMovementDirection` + lock check. */
export function SetObjectEventDirection(obj: ObjectEvent, direction: number): void {
  obj.previousMovementDirection = obj.facingDirection;
  if (!obj.facingDirectionLocked) {
    obj.facingDirection = direction;
  }
  obj.movementDirection = direction;
}

/** 1:1 décomp `GetObjectEventIdByPosition(u16 x, u16 y, u8 elevation)`
 *  (event_object_movement.c:2192-2207). Same que GetObjectEventIdByXY mais
 *  filtre aussi sur `ObjectEventDoesElevationMatch`. */
export function GetObjectEventIdByPosition(
  x: number, y: number, elevation: number,
): number {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    if (gObjectEvents[i].active) {
      if (gObjectEvents[i].currentCoordsX === x
          && gObjectEvents[i].currentCoordsY === y
          && ObjectEventDoesElevationMatch(gObjectEvents[i], elevation)) {
        return i;
      }
    }
  }
  return OBJECT_EVENTS_COUNT;
}

/** 1:1 décomp `AreElevationsCompatible(u8 a, u8 b)`
 *  (event_object_movement.c:7791-7800).
 *
 *  ```c
 *  if (a == ELEVATION_TRANSITION || b == ELEVATION_TRANSITION) return TRUE;
 *  if (a != b) return FALSE;
 *  return TRUE;
 *  ```
 *
 *  ELEVATION_TRANSITION (= 0) signifie "tile traversable peu importe l'élév
 *  du caller" — used pour transitions stairs/bridges. */
export function AreElevationsCompatible(a: number, b: number): boolean {
  if (a === ELEVATION_TRANSITION || b === ELEVATION_TRANSITION) return true;
  if (a !== b) return false;
  return true;
}

/** 1:1 décomp `IsElevationMismatchAt(u8 elevation, s16 x, s16 y)`
 *  (event_object_movement.c:7707-7723).
 *
 *  ```c
 *  if (elevation == ELEVATION_TRANSITION) return FALSE;
 *  mapElevation = MapGridGetElevationAt(x, y);
 *  if (mapElevation == ELEVATION_TRANSITION || mapElevation == ELEVATION_MULTI_LEVEL)
 *      return FALSE;
 *  if (mapElevation != elevation) return TRUE;
 *  return FALSE;
 *  ```
 *
 *  x, y = INTERNAL coords (= déjà +MAP_OFFSET). Bug user session 129 fixé :
 *  tile devant truck cache elev=15 (MULTI_LEVEL) → skip check = passable. */
export function IsElevationMismatchAt(elevation: number, x: number, y: number): boolean {
  if (elevation === ELEVATION_TRANSITION) return false;
  const mapElevation = MapGridGetElevationAt(x, y);
  if (mapElevation === ELEVATION_TRANSITION || mapElevation === ELEVATION_MULTI_LEVEL) return false;
  if (mapElevation !== elevation) return true;
  return false;
}

/** 1:1 décomp `DoesObjectCollideWithObjectAt(struct ObjectEvent *objectEvent, s16 x, s16 y)`
 *  (event_object_movement.c:4724-4742).
 *
 *  ```c
 *  for (i = 0; i < OBJECT_EVENTS_COUNT; i++) {
 *      curObject = &gObjectEvents[i];
 *      if (curObject->active && curObject != objectEvent) {
 *          if ((curObject->currentCoords.x == x && curObject->currentCoords.y == y)
 *              || (curObject->previousCoords.x == x && curObject->previousCoords.y == y)) {
 *              if (AreElevationsCompatible(objectEvent->currentElevation, curObject->currentElevation))
 *                  return TRUE;
 *          }
 *      }
 *  }
 *  ```
 *
 *  Skip self via reference compare. Check `currentCoords` ET `previousCoords`
 *  → couvre TARGET + SOURCE pendant un walk (= step-on race fix). */
export function DoesObjectCollideWithObjectAt(
  objectEvent: ObjectEvent, x: number, y: number,
): boolean {
  // x, y arrivent en INTERNAL coords (= +MAP_OFFSET, convention décomp).
  // Post R3 refactor : `currentCoords` stockés INTERNAL → comparison directe
  // 1:1 strict path identique au décomp event_object_movement.c:4734.
  for (const curObject of gObjectEvents) {
    if (!curObject.active || curObject === objectEvent) continue;
    if ((curObject.currentCoordsX === x && curObject.currentCoordsY === y)
        || (curObject.previousCoordsX === x && curObject.previousCoordsY === y)) {
      if (AreElevationsCompatible(objectEvent.currentElevation, curObject.currentElevation)) {
        return true;
      }
    }
  }
  return false;
}

/** Back-compat wrapper : isOtherNpcAt → DoesObjectCollideWithObjectAt 1:1
 *  strict signature. Used par `canWalk` pour NPCs movement validation. */
function isOtherNpcAt(x: number, y: number, excluding: ObjectEvent): boolean {
  return DoesObjectCollideWithObjectAt(excluding, x, y);
}

/** 1:1 décomp `GetCollisionAtCoords(struct ObjectEvent *objectEvent, s16 x, s16 y, u32 dir)`
 *  (event_object_movement.c:4658-4672).
 *
 *  ```c
 *  if (IsCoordOutsideObjectEventMovementRange(objectEvent, x, y))
 *      return COLLISION_OUTSIDE_RANGE;
 *  else if (MapGridGetCollisionAt(x, y) || GetMapBorderIdAt(x, y) == CONNECTION_INVALID
 *           || IsMetatileDirectionallyImpassable(objectEvent, x, y, direction))
 *      return COLLISION_IMPASSABLE;
 *  else if (objectEvent->trackedByCamera && !CanCameraMoveInDirection(direction))
 *      return COLLISION_IMPASSABLE;
 *  else if (IsElevationMismatchAt(objectEvent->currentElevation, x, y))
 *      return COLLISION_ELEVATION_MISMATCH;
 *  else if (DoesObjectCollideWithObjectAt(objectEvent, x, y))
 *      return COLLISION_OBJECT_EVENT;
 *  return COLLISION_NONE;
 *  ```
 *
 *  CONNECTION_INVALID = -1 (= map border edge). x, y = INTERNAL coords
 *  (= +MAP_OFFSET déjà). Notre convention LOGICAL pour gObjectEvents → caller
 *  doit add MAP_OFFSET avant call (= matche les call-sites décomp). */
export function GetCollisionAtCoords(
  objectEvent: ObjectEvent, x: number, y: number, dir: number,
): number {
  const direction = dir;
  if (IsCoordOutsideObjectEventMovementRange(objectEvent, x, y))
    return COLLISION_OUTSIDE_RANGE;
  const targetBehavior = MapGridGetMetatileBehaviorAt(x, y);
  if (MapGridGetCollisionAt(x, y) !== 0
      || GetMapBorderIdAt(x, y) === -1
      || IsMetatileDirectionallyImpassable(
           objectEvent.currentMetatileBehavior, targetBehavior, direction))
    return COLLISION_IMPASSABLE;
  if (objectEvent.trackedByCamera && !CanCameraMoveInDirection(direction))
    return COLLISION_IMPASSABLE;
  if (IsElevationMismatchAt(objectEvent.currentElevation, x, y))
    return COLLISION_ELEVATION_MISMATCH;
  if (DoesObjectCollideWithObjectAt(objectEvent, x, y))
    return COLLISION_OBJECT_EVENT;
  return COLLISION_NONE;
}

/** 1:1 décomp `GetCollisionFlagsAtCoords(struct ObjectEvent *objectEvent, s16 x, s16 y, u8 direction)`
 *  (event_object_movement.c:4674-4687). Bitfield variant : check ALL conditions
 *  et set 1 bit per collision type (= used par trainer_see + autres callers qui
 *  veulent saber TOUTES les raisons de collision, pas juste la 1ère).
 *
 *  Bit i = (1 << (COLLISION_X - 1)). */
export function GetCollisionFlagsAtCoords(
  objectEvent: ObjectEvent, x: number, y: number, direction: number,
): number {
  let flags = 0;
  if (IsCoordOutsideObjectEventMovementRange(objectEvent, x, y))
    flags |= 1 << (COLLISION_OUTSIDE_RANGE - 1);
  const targetBehavior = MapGridGetMetatileBehaviorAt(x, y);
  if (MapGridGetCollisionAt(x, y) !== 0
      || GetMapBorderIdAt(x, y) === -1
      || IsMetatileDirectionallyImpassable(
           objectEvent.currentMetatileBehavior, targetBehavior, direction)
      || (objectEvent.trackedByCamera && !CanCameraMoveInDirection(direction)))
    flags |= 1 << (COLLISION_IMPASSABLE - 1);
  if (IsElevationMismatchAt(objectEvent.currentElevation, x, y))
    flags |= 1 << (COLLISION_ELEVATION_MISMATCH - 1);
  if (DoesObjectCollideWithObjectAt(objectEvent, x, y))
    flags |= 1 << (COLLISION_OBJECT_EVENT - 1);
  return flags;
}

/** 1:1 décomp `GetCollisionInDirection(struct ObjectEvent *objectEvent, u8 direction)`
 *  (event_object_movement.c:4650-4656). Compute (x, y) target depuis
 *  currentCoords + direction, puis call `GetCollisionAtCoords`. */
export function GetCollisionInDirection(
  objectEvent: ObjectEvent, direction: number,
): number {
  const dx = DIR_TO_DX[direction] ?? 0;
  const dy = DIR_TO_DY[direction] ?? 0;
  const x = objectEvent.currentCoordsX + dx;
  const y = objectEvent.currentCoordsY + dy;
  return GetCollisionAtCoords(objectEvent, x, y, direction);
}

/** 1:1 STRICT décomp `sMovementTypeHasRange[]` (event_object_movement.c:307-349).
 *  Returns TRUE si le movement type doit avoir un range non-nul (= NPCs qui
 *  walk : WANDER_*, WALK_*, WALK_SEQUENCE_*, COPY_PLAYER_*).
 *  FACE/LOOK_AROUND/ROTATE/etc. → no range.
 *
 *  WANDER_AROUND est dans WANDER_ via startsWith. Les 8 COPY_PLAYER_* doivent
 *  être listés explicitement (= pas couverts par les startsWith des autres). */
function movementTypeHasRange(movementType: string): boolean {
  if (!movementType) return false;
  if (movementType.startsWith('MOVEMENT_TYPE_WANDER_')) return true;
  if (movementType.startsWith('MOVEMENT_TYPE_WALK_')) return true;
  if (movementType === 'MOVEMENT_TYPE_WANDER_AROUND') return true;
  // 1:1 décomp event_object_movement.c:341-348 : 8 COPY_PLAYER_* tous TRUE.
  if (movementType.startsWith('MOVEMENT_TYPE_COPY_PLAYER')) return true;
  return false;
}

/** 1:1 décomp `IsCoordOutsideObjectEventMovementRange(objectEvent, x, y)`
 *  (event_object_movement.c:4689). Returns TRUE si la cible (x, y) est hors
 *  du rectangle de movement range défini par initialCoords ± rangeX/rangeY.
 *
 *  Le décomp utilise ce check pour confiner les NPCs WANDER_AROUND /
 *  WANDER_UP_AND_DOWN / WALK_X dans une zone autour de leur spawn. Sans ce
 *  check, les NPCs drift indéfiniment (= Audit Opus §3.1 manquement).
 *
 *  range.rangeX/rangeY = 0 signifie "pas de range" (= NPC libre). */
function IsCoordOutsideObjectEventMovementRange(
  npc: ObjectEvent, x: number, y: number,
): boolean {
  // x, y arrivent en INTERNAL coords. Post R3 refactor : `initialCoords` aussi
  // INTERNAL → comparison directe 1:1 décomp event_object_movement.c:4691-4711.
  if (npc.movementRangeX !== 0) {
    const left = npc.initialCoordsX - npc.movementRangeX;
    const right = npc.initialCoordsX + npc.movementRangeX;
    if (left > x || right < x) return true;
  }
  if (npc.movementRangeY !== 0) {
    const top = npc.initialCoordsY - npc.movementRangeY;
    const bottom = npc.initialCoordsY + npc.movementRangeY;
    if (top > y || bottom < y) return true;
  }
  return false;
}

/** Check si NPC peut walker en `direction` depuis sa position courante.
 *  1:1 STRICT décomp : délègue à `GetCollisionInDirection` (=
 *  event_object_movement.c:4650-4656), qui couvre map collision +
 *  border + IsMetatileDirectionallyImpassable (ledges/walls) + camera
 *  tracking + elevation + DoesObjectCollideWithObjectAt (= player +
 *  autres NPCs, currentCoords ET previousCoords pour step-on race). */
function canWalk(npc: ObjectEvent, direction: number): boolean {
  return GetCollisionInDirection(npc, direction) === COLLISION_NONE;
}

/** 1:1 STRICT décomp `FreezeObjectEvent(struct ObjectEvent *objectEvent)`
 *  (event_object_movement.c:8142-8156) :
 *    if (objectEvent->heldMovementActive || objectEvent->frozen) return TRUE;
 *    objectEvent->frozen = TRUE;
 *    objectEvent->spriteAnimPausedBackup = gSprites[id].animPaused;
 *    objectEvent->spriteAffineAnimPausedBackup = gSprites[id].affineAnimPaused;
 *    gSprites[id].animPaused = TRUE;
 *    gSprites[id].affineAnimPaused = TRUE;
 *    return FALSE;
 *
 *  Sans ça l'anim sprite continue à cycler malgré frozen → NPC "marche à
 *  l'infini" visuellement même en lockall. */
export function FreezeObjectEvent(npc: ObjectEvent): boolean {
  if (npc.heldMovementActive || npc.frozen) return true;
  npc.frozen = true;
  const rt = getRuntime();
  if (rt && npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      npc.spriteAnimPausedBackup = sprite.animPaused;
      npc.spriteAffineAnimPausedBackup = sprite.affineAnimPaused;
      sprite.animPaused = true;
      sprite.affineAnimPaused = true;
    }
  }
  return false;
}

/** 1:1 STRICT décomp `UnfreezeObjectEvent(struct ObjectEvent *objectEvent)`
 *  (event_object_movement.c:8175-8183) :
 *    if (objectEvent->active && objectEvent->frozen) {
 *        objectEvent->frozen = 0;
 *        gSprites[id].animPaused = objectEvent->spriteAnimPausedBackup;
 *        gSprites[id].affineAnimPaused = objectEvent->spriteAffineAnimPausedBackup;
 *    } */
export function UnfreezeObjectEvent(npc: ObjectEvent): void {
  if (!npc.active || !npc.frozen) return;
  npc.frozen = false;
  const rt = getRuntime();
  if (rt && npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.animPaused = npc.spriteAnimPausedBackup;
      sprite.affineAnimPaused = npc.spriteAffineAnimPausedBackup;
    }
  }
}

/** 1:1 STRICT décomp `UnfreezeObjectEvents` (event_object_movement.c:8185-8191) :
 *    for (i = 0; i < OBJECT_EVENTS_COUNT; i++)
 *        if (gObjectEvents[i].active)
 *            UnfreezeObjectEvent(&gObjectEvents[i]);
 */
export function UnfreezeObjectEvents(): void {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const npc = gObjectEvents[i];
    if (npc.active) UnfreezeObjectEvent(npc);
  }
}
/** Back-compat alias (= ancien nom non-décomp). */
export const UnfreezeAllNpcs = UnfreezeObjectEvents;

/** 1:1 STRICT décomp event_object_movement.c:8159-8164 FreezeObjectEvents :
 *    for (i = 0; i < OBJECT_EVENTS_COUNT; i++)
 *        if (gObjectEvents[i].active && i != gPlayerAvatar.objectEventId)
 *            FreezeObjectEvent(&gObjectEvents[i]);
 *
 *  Set frozen=true + pause anim sprite (= 1:1 strict). Skip player. */
export function FreezeObjectEvents(): void {
  const playerSlot = gPlayerAvatar.objectEventId;
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const npc = gObjectEvents[i];
    if (npc.active && i !== playerSlot) {
      FreezeObjectEvent(npc);
    }
  }
}

/** 1:1 STRICT décomp event_object_movement.c:8167-8173 FreezeObjectEventsExceptOne :
 *    for (i = 0; i < OBJECT_EVENTS_COUNT; i++)
 *        if (i != objectEventId && gObjectEvents[i].active && i != gPlayerAvatar.objectEventId)
 *            FreezeObjectEvent(&gObjectEvents[i]);
 *
 *  Gèle tout SAUF le slot `objectEventId` (selected) et le joueur. */
export function FreezeObjectEventsExceptOne(objectEventId: number): void {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    const npc = gObjectEvents[i];
    if (i !== objectEventId && npc.active && i !== gPlayerAvatar.objectEventId) {
      FreezeObjectEvent(npc);
    }
  }
}

/** 1:1 décomp `FreezeObjectEventsExceptTwo(objectEventId1, objectEventId2)`
 *  (event_object_movement.c:8175). Utilisé par event_object_lock.c
 *  Task_FreezeObjectAndPlayer pour figer tout SAUF le dresseur approché + le
 *  joueur (double-battle : les 2 dresseurs restent libres). */
export function FreezeObjectEventsExceptTwo(objectEventId1: number, objectEventId2: number): void {
  for (let i = 0; i < OBJECT_EVENTS_COUNT; i++) {
    if (i !== objectEventId1 && i !== objectEventId2
        && gObjectEvents[i].active && i !== gPlayerAvatar.objectEventId) {
      FreezeObjectEvent(gObjectEvents[i]);
    }
  }
}
// Phase 4.6 audit Opus §5 : back-compat globalThis + register field-globals.
(globalThis as Record<string, unknown>).__UnfreezeAllNpcs = UnfreezeAllNpcs;

// ─── Sprite frame update ────────────────────────────────────────────────────

/** Update OAM sprite frame selon NPC state (face vs walk anim).
 *  Exposé via globalThis __updateNpcSpriteFrame pour interact (= player-avatar
 *  call this après interact pour forcer face-toward-player visible immédiatement). */
function updateNpcSpriteFrame(rt: DecompRuntime, npc: ObjectEvent): void {
  if (npc.spriteId < 0) return;
  // 32×32 NPCs (= Vigoroth déménageurs) : 16 tiles par frame, 3 frames
  // consecutivement en VRAM (face=base, walk1=base+16, walk2=base+32). Pas
  // de direction switching (= le sprite Vigoroth_CarryingBox affiche toujours
  // face down ; Vigoroth_FacingAway toujours face up). 1:1 décomp sAnim_Go*
  // approx : walkFramesLeft >= 8 → walk1/walk2 (selon walkAnimAlt) ; sinon face.
  if (npc.is32x32) {
    const sprite32 = rt.gSprites[npc.spriteId];
    if (!sprite32) return;
    const oam32 = rt.gba.oam[sprite32.oamIndex];
    let frame32 = 0;
    if (npc.walkFramesLeft > 0 && npc.walkFramesLeft >= 8) {
      frame32 = npc.walkAnimAlt === 0 ? 1 : 2;  // walk1 / walk2
    }
    oam32.tileId = npc.objTileBase + frame32 * 16;  // 16 tiles per 32x32 frame
    // hFlip selon facingDirection. 1:1 décomp sAnim_GoEast réutilise les frames
    // de sAnim_GoWest avec .hFlip = TRUE (object_event_anims.h:229-236). Pour
    // Vigoroth_CarryingBox mt=WALK_LEFT_AND_RIGHT, facingDirection alterne
    // DIR_WEST/DIR_EAST → hFlip OFF/ON. Sans ça, sprite reste face WEST même
    // quand walkDirection=EAST → user-flag "ne regarde qu'à gauche".
    const flip = npc.facingDirection === DIR_EAST;
    sprite32.hFlip = flip;
    oam32.flipH = flip;
    return;
  }
  // [M3-NPC M1] Tous les NPCs non-32×32 : le frame OAM est rendu à 100 % par le
  // chemin décomp. `sprite.anims` est TOUJOURS wired (245/245 graphicsInfo ont une
  // anim table — vérifié déterministe + 0 hit legacy sur 57 NPCs/5 villes) → c'est
  // AnimateSprite qui drive `oam.tileNum` via les AnimCmd (1:1 décomp). Les
  // MovementActions managent animNum/animCmdIndex (step start → SetStepAnimHandle
  // Alternation : GO_X + alterne cmdIdx 1↔2/3↔0, animPaused=FALSE ; step end →
  // animPaused=TRUE ; face_X → StartSpriteAnim(FACE_X)) ; câblage dans
  // movement-system.ts (_tickWalk frame 0/end, _setFacing) + ici (tickWanderAround/
  // tickLookAround). useSubsprites (truck) → rendu par syncSubspriteOam ailleurs.
  //
  // Le legacy de rendu MANUEL (NPC_SPRITE_FRAMES → oam.tileId recalculé chaque
  // frame) était du code MORT (`sprite.anims` jamais falsy en pratique) et causait
  // le bug « lévite » pré-G6 (reset cmdIdx → pas d'alternance walk1↔walk2) → retiré.
  // NPC_SPRITE_FRAMES + TILES_PER_FRAME_16x32 restent utilisés pour le frame de
  // départ (= face) au CreateSprite. [M2/M3 : Vigoroth 32×32 + truck subsprites.]
}

(globalThis as Record<string, unknown>).__updateNpcSpriteFrame = (rt: DecompRuntime, npc: ObjectEvent) => updateNpcSpriteFrame(rt, npc);

// Phase 4.6 audit Opus §5 : register field-globals avec helpers type-safe.
// Permet aux call-sites internes (player-avatar, scripts) de lookup les
// helpers sans cast `any` via globalThis.
_registerNpcHelpers(
  (rt, npc) => updateNpcSpriteFrame(rt as DecompRuntime, npc as ObjectEvent),
  UnfreezeAllNpcs,
);

// ─── G6 — 1:1 STRICT anim helpers pour MovementType callbacks ───────────────
//
// Source décomp : event_object_movement.c + sprite.c
//   SetStepAnimHandleAlternation (4582-4598) : alterne animCmdIndex 1↔2 / 3↔0
//     selon `sStepAnimTables[Standard].animPos = {1, 3, 0, 2}`. Permet cycle
//     walk1↔neutral↔walk2↔neutral sur 2 steps consécutifs.
//   InitNpcForMovement (5081-5099) : sprite->animPaused = FALSE au step start.
//   UpdateMovementNormal (5116-5126) : sprite->animPaused = TRUE au step end.
//   FaceDirection (5048) : StartSpriteAnim(GetFaceDirectionAnimNum).

function _npcSetStepAnim(rt: DecompRuntime, npc: ObjectEvent, animNum: number): void {
  if (npc.spriteId < 0) return;
  const sprite = rt.gSprites[npc.spriteId];
  if (!sprite || !sprite.anims) return;
  if (npc.inanimate) return;
  sprite.animNum = animNum;
  // 1:1 SetStepAnimHandleAlternation animPos = {1, 3, 0, 2}.
  if (sprite.animCmdIndex === 1) sprite.animCmdIndex = 2;
  else if (sprite.animCmdIndex === 3) sprite.animCmdIndex = 0;
  // SeekSpriteAnim : back up 1, ContinueAnim advance + apply frame.
  SeekSpriteAnim(rt, sprite as never, sprite.animCmdIndex);
}

/** 1:1 décomp `SetStepAnimHandleAlternation(obj, sprite, animNum)` + `animPaused=FALSE`.
 *  animNum est explicite (= l'anim de la VITESSE voulue : normal/fast/faster), pas
 *  forcé à l'anim normale. Base partagée par `_npcStartWalkAnim` (walk) et
 *  `_InitMoveInPlace` (walk-in-place fast/faster). */
function _npcStartStepAnimWithNum(rt: DecompRuntime, npc: ObjectEvent, animNum: number): void {
  if (npc.spriteId < 0) return;
  const sprite = rt.gSprites[npc.spriteId];
  if (!sprite || !sprite.anims) return;
  if (npc.inanimate) return;
  sprite.animPaused = false;
  _npcSetStepAnim(rt, npc, animNum);
}

function _npcStartWalkAnim(rt: DecompRuntime, npc: ObjectEvent, dir: number): void {
  _npcStartStepAnimWithNum(rt, npc, GetMoveDirectionAnimNum(dir));
}

function _npcEndWalkAnim(rt: DecompRuntime, npc: ObjectEvent): void {
  if (npc.spriteId < 0) return;
  const sprite = rt.gSprites[npc.spriteId];
  if (!sprite || !sprite.anims) return;
  // 1:1 STRICT décomp `UpdateMovementNormal` (event_object_movement.c:5116) fin de pas :
  //   sprite->animPaused = TRUE;  ← SEULEMENT, ne touche PAS animNum/animCmdIndex.
  // L'anim de marche [walk_a, face, walk_b, face] (GO anims) finit naturellement sur une cmd
  // FACE (index impair, un pas = 16 frames = 2 cmds de 8) et `animCmdIndex` est PRÉSERVÉ → le
  // pas SUIVANT (_npcSetStepAnim) lit ce cmdIndex et alterne vers walk_b → les DEUX frames de
  // marche jouent. Le retour à FACE au REPOS vient (1:1) de PlayerNotOnBikeNotMoving→
  // PlayerFaceDirection (joueur) / du MovementType (NPC), PAS d'un reset ici (l'ancien « H4.1 »
  // resetait à walk_a → walk_b jamais joué = régression marche haut/bas, retiré).
  sprite.animPaused = true;
}

function _npcSetFaceAnim(rt: DecompRuntime, npc: ObjectEvent): void {
  if (npc.spriteId < 0) return;
  const sprite = rt.gSprites[npc.spriteId];
  if (!sprite || !sprite.anims) return;
  if (npc.inanimate) return;
  StartSpriteAnim(sprite as never, GetFaceDirectionAnimNum(npc.facingDirection));
}

// Expose pour movement-system.ts (= éviter cycle ESM en passant via globalThis).
(globalThis as Record<string, unknown>).__npcStartWalkAnim = _npcStartWalkAnim;
(globalThis as Record<string, unknown>).__npcEndWalkAnim = _npcEndWalkAnim;
(globalThis as Record<string, unknown>).__npcSetFaceAnim = _npcSetFaceAnim;

// ─── Movement state machines 1:1 décomp ─────────────────────────────────────

/** 1:1 décomp `MovementType_LookAround_Step*`. */
function tickLookAround(rt: DecompRuntime, npc: ObjectEvent, allowedDirections: ReadonlyArray<number>): void {
  switch (npc.movementStep) {
    case 0:
    case 1:
      // 1:1 décomp : step 0 → step 1 instantané, puis pickRandomDelay + step 3.
      npc.movementDelay = pickRandomDelay();
      npc.movementStep = 3;
      break;
    case 3:
      if (npc.movementDelay > 0) {
        npc.movementDelay--;
      } else {
        npc.movementStep = 4;
      }
      break;
    case 4:
      npc.facingDirection = pickRandomDirection(allowedDirections);
      npc.movementStep = 1;
      // G6 — 1:1 STRICT FaceDirection (event_object_movement.c:5048) :
      // StartSpriteAnim(sprite, GetFaceDirectionAnimNum(direction)) pour sync
      // animNum = FACE_X après changement de facing.
      _npcSetFaceAnim(rt, npc);
      break;
  }
}

/** 1:1 décomp `MovementType_WanderAround_Step*`. */
function tickWanderAround(rt: DecompRuntime, npc: ObjectEvent, allowedDirections: ReadonlyArray<number>): void {
  switch (npc.movementStep) {
    case 0:
    case 1:
      // 1:1 décomp `MovementType_WanderAround_Step1` (event_object_movement.c:2573) :
      //   ObjectEventSetSingleMovement(GetFaceDirectionMovementAction(facingDirection))
      //   → MovementAction_FaceX_Step0 → FaceDirection (5048) :
      //     StartSpriteAnim(sprite, GetFaceDirectionAnimNum(direction))
      // G7+ fix : sans ça, le NPC reste avec animNum=GO_X frozen sur la
      // dernière frame walking (= user bug "PNJ freeze sur frame de marche").
      _npcSetFaceAnim(rt, npc);
      // 1:1 décomp : step 0 → step 1 instantané, puis pickRandomDelay + step 3.
      npc.movementDelay = pickRandomDelay();
      npc.movementStep = 3;
      break;
    case 3:
      if (npc.movementDelay > 0) {
        npc.movementDelay--;
      } else {
        npc.movementStep = 4;
      }
      break;
    case 4: {
      const dir = pickRandomDirection(allowedDirections);
      npc.facingDirection = dir;
      if (!canWalk(npc, dir)) {
        npc.movementStep = 1;
      } else {
        // 1:1 décomp `InitNpcForMovement` (event_object_movement.c:5081) :
        // shift coords AU DÉBUT du walk → previous = source, current = target.
        const dx = DIR_TO_DX[dir] ?? 0;
        const dy = DIR_TO_DY[dir] ?? 0;
        ShiftObjectEventCoords(npc, npc.currentCoordsX + dx, npc.currentCoordsY + dy);
        npc.walkDirection = dir;
        npc.walkFramesLeft = 16;
        npc.movementStep = 6;
        // 1:1 décomp `InitNpcForMovement` (event_object_movement.c:5097) : le pas pose
        // triggerGroundEffectsOnMove=TRUE → DoGroundEffects_OnBeginStep tire au step
        // start (= step-grass/reflets/etc.). Sans ça, un NPC WANDER ne déclenchait
        // JAMAIS de ground effect en marchant (la state machine inline saute le flag
        // que le chemin held-movement InitNpcForMovement pose) → grass absent dès qu'il
        // bouge (user-signalé).
        npc.triggerGroundEffectsOnMove = true;
        // G6 — 1:1 STRICT InitMovementNormal (event_object_movement.c:5101-5108) :
        // sprite->animPaused = FALSE + SetStepAnimHandleAlternation(GO_X) au
        // step start. Sinon NPC reste sur FACE_X anim → "glisse" (= TWIN bug).
        _npcStartWalkAnim(rt, npc, dir);
      }
      break;
    }
    case 6: {
      // worldX/Y tick visuel pendant le walk.
      const speedX = DIR_TO_DX[npc.walkDirection] ?? 0;
      const speedY = DIR_TO_DY[npc.walkDirection] ?? 0;
      npc.worldX += speedX;
      npc.worldY += speedY;
      npc.walkFramesLeft--;
      if (npc.walkFramesLeft === 0) {
        // 1:1 décomp `ShiftStillObjectEventCoords` (event_object_movement.c:5120) :
        // previous = current → NPC stable, plus de collision sur SOURCE cell.
        ShiftStillObjectEventCoords(npc);
        npc.walkDirection = DIR_NONE;
        npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
        npc.movementStep = 1;
        // 1:1 décomp `UpdateMovementNormal` step end (event_object_movement.c:5120) :
        // triggerGroundEffectsOnStop=TRUE → DoGroundEffects_OnFinishStep tire au step
        // end (ripple/jump-landing/etc.).
        npc.triggerGroundEffectsOnStop = true;
        // G6 — 1:1 STRICT UpdateMovementNormal step end : animPaused = TRUE.
        _npcEndWalkAnim(rt, npc);
      }
      break;
    }
  }
  void rt;
}

/** 1:1 décomp `gClockwiseDirections` : DIR_SOUTH → WEST → NORTH → EAST → SOUTH...
 *  Indexed by current direction. Used par RotateClockwise. */
const NEXT_DIR_CW: Record<number, number> = {
  [DIR_SOUTH]: DIR_WEST,
  [DIR_WEST]: DIR_NORTH,
  [DIR_NORTH]: DIR_EAST,
  [DIR_EAST]: DIR_SOUTH,
};
const NEXT_DIR_CCW: Record<number, number> = {
  [DIR_SOUTH]: DIR_EAST,
  [DIR_EAST]: DIR_NORTH,
  [DIR_NORTH]: DIR_WEST,
  [DIR_WEST]: DIR_SOUTH,
};

// OPPOSITE_DIR migré vers direction-coords.ts (= source unique partagée).

/** 1:1 décomp `MovementType_RotateClockwise_Step*` (3726-3762) /
 *  `MovementType_RotateCounterclockwise_*` (similar).
 *  4 états : init, face dir, wait 48 frames, rotate to next. */
function tickRotate(rt: DecompRuntime, npc: ObjectEvent, clockwise: boolean): void {
  switch (npc.movementStep) {
    case 0:
    case 1:
      // 1:1 décomp : step 0 → step 1 instantané, puis SetMovementDelay 48 + step 2.
      npc.movementDelay = 48;  // 1:1 décomp SetMovementDelay(sprite, 48)
      npc.movementStep = 2;
      break;
    case 2:
      // Wait delay.
      if (npc.movementDelay > 0) {
        npc.movementDelay--;
      } else {
        npc.movementStep = 3;
      }
      break;
    case 3: {
      // Rotate to next direction (clockwise or counterclockwise).
      const table = clockwise ? NEXT_DIR_CW : NEXT_DIR_CCW;
      npc.facingDirection = table[npc.facingDirection] ?? DIR_SOUTH;
      npc.movementStep = 1;
      // 1:1 décomp `MovementType_RotateCounterclockwise_Step3/Clockwise_Step3`
      // (event_object_movement.c) appelle ObjectEventSetSingleMovement avec
      // GetFaceDirectionMovementAction(newDir) → FaceDirection (5048) →
      // StartSpriteAnim(FACE_X).
      _npcSetFaceAnim(rt, npc);
      break;
    }
  }
}

/** 1:1 décomp `MovementType_WalkBackAndForth_Step*` (event_object_movement.c
 *  3766-3822). NPC walk dans `primaryDir` jusqu'à atteindre la limite du
 *  `movementRange*` (= rangeX/rangeY) puis fait demi-tour et revient à
 *  `initialCoords`, repeat.
 *
 *  Le `directionSequenceIndex` (= `seq`) flag le sens courant :
 *    seq=0 → going outbound (primaryDir)
 *    seq=1 → returning to initial (OPPOSITE(primaryDir))
 *
 *  Seq n'est INCRÉMENTÉ qu'au moment d'un `COLLISION_OUTSIDE_RANGE` dans
 *  Step2 (= NPC a atteint le bord du range). Step3 NE TOUCHE PAS seq.
 *
 *  Bug session 2026-05-21 corrigé : on incrémentait seq dans Step3 dès qu'on
 *  s'éloignait de initialCoords d'1 case → ping-pong 1 pas E / 1 pas W au
 *  lieu de range pas E / range pas W (= user-flag Vigoroth déménageur). */
function tickWalkBackAndForth(rt: DecompRuntime, npc: ObjectEvent, primaryDir: number): void {
  // 1:1 décomp : step 0 → step 1 → step 2 fall-through inline. On merge en
  // appelant la logique step 1 (= set dir+facing) avant case 2 si on entre
  // depuis step <=1, puis on tombe en case 2 logique.
  if (npc.movementStep <= 1) {
    const dir = npc.directionSeqIdx === 0 ? primaryDir : (OPPOSITE_DIR[primaryDir] ?? primaryDir);
    npc.facingDirection = dir;
    npc.movementStep = 2;
    // 1:1 décomp `MovementType_WalkBackAndForth_Step1` (event_object_movement.c
    // :3766) appelle FaceDirection (5048) → StartSpriteAnim(FACE_X). Sans ça,
    // le NPC freeze sur GO_X frame entre 2 walks back-and-forth.
    _npcSetFaceAnim(rt, npc);
  }
  switch (npc.movementStep) {
    case 2: {
      // 1:1 décomp Step2 (3785-3811) :
      // 1. Si seq && currentCoords == initialCoords → reset seq=0 + reverse
      //    movementDirection (= on vient de rentrer à init, on repart outbound).
      if (npc.directionSeqIdx !== 0
          && npc.currentCoordsX === npc.initialCoordsX
          && npc.currentCoordsY === npc.initialCoordsY) {
        npc.directionSeqIdx = 0;
        npc.facingDirection = OPPOSITE_DIR[npc.facingDirection] ?? npc.facingDirection;
      }
      // 2. Compute target cell + check COLLISION_OUTSIDE_RANGE en priorité.
      //    Si dépasse range → seq++ + reverse dir + recompute target dans la
      //    nouvelle direction (= 1:1 décomp ré-appelle GetCollisionInDirection
      //    avec la dir reversée dans la MÊME frame).
      let dir = npc.facingDirection;
      let dx = DIR_TO_DX[dir] ?? 0;
      let dy = DIR_TO_DY[dir] ?? 0;
      let tx = npc.currentCoordsX + dx;
      let ty = npc.currentCoordsY + dy;
      if (IsCoordOutsideObjectEventMovementRange(npc, tx, ty)) {
        npc.directionSeqIdx++;
        dir = OPPOSITE_DIR[dir] ?? dir;
        npc.facingDirection = dir;
        dx = DIR_TO_DX[dir] ?? 0;
        dy = DIR_TO_DY[dir] ?? 0;
        tx = npc.currentCoordsX + dx;
        ty = npc.currentCoordsY + dy;
      }
      // 3. Si la dir choisie peut walk (= wall/NPC/player check) → walk normal.
      //    Sinon (= wall ou NPC) → walk-in-place via retry next tick (1:1 décomp
      //    movementActionId = GetWalkInPlaceNormalMovementAction).
      if (canWalk(npc, dir)) {
        // 1:1 décomp `InitNpcForMovement` : shift current/previous au début.
        ShiftObjectEventCoords(npc, tx, ty);
        npc.walkDirection = dir;
        npc.walkFramesLeft = 16;
        npc.movementStep = 3;
        // 1:1 décomp `InitMovementNormal` : animPaused=FALSE + SetStepAnimHandleAlt.
        _npcStartWalkAnim(rt, npc, dir);
      } else {
        // Wall/NPC collision : pas de progression cette frame, retry next.
        // NE PAS toucher seq (1:1 décomp Step2 garde la même direction quand
        // la collision n'est pas OUTSIDE_RANGE — la wall reste là).
        npc.movementStep = 1;
      }
      break;
    }
    case 3: {
      // Tick walk frames (= worldX/Y visual). 1:1 décomp Step3 ne touche pas
      // directionSequenceIndex (= la transition outbound→return est gérée dans
      // Step2 via COLLISION_OUTSIDE_RANGE).
      const speedX = DIR_TO_DX[npc.walkDirection] ?? 0;
      const speedY = DIR_TO_DY[npc.walkDirection] ?? 0;
      npc.worldX += speedX;
      npc.worldY += speedY;
      npc.walkFramesLeft--;
      if (npc.walkFramesLeft === 0) {
        // 1:1 décomp `ShiftStillObjectEventCoords` : previous = current.
        ShiftStillObjectEventCoords(npc);
        npc.walkDirection = DIR_NONE;
        npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
        npc.movementStep = 1;
        // 1:1 décomp `UpdateMovementNormal` step end : animPaused=TRUE.
        _npcEndWalkAnim(rt, npc);
      }
      break;
    }
  }
}

// ─── G12 — WALK_SEQUENCE 1:1 STRICT (24 patterns) ────────────────────────────
// Source : event_object_movement.c:3824-4020 + movement_type_func_tables.h:200-326
//
// 24 variantes : NPC walk en boucle un pattern de 4 directions fixes
// (= ex. UP_RIGHT_LEFT_DOWN cycle DIR_NORTH → DIR_EAST → DIR_WEST → DIR_SOUTH).
// Décomp MovementType_WalkSequence_Step0/1/2 + MoveNextDirectionInSequence.

// 1:1 décomp `MovementType_WalkSequence*_Step1` guards mid-cycle
// (event_object_movement.c:3871-4155). Chaque variante WALK_SEQUENCE a un
// guard spécifique :
//   if (seqIdx == checkIdx && initialCoords.<axis> == currentCoords.<axis>)
//       seqIdx = targetIdx;
// Force le saut à l'étape suivante quand le NPC est revenu à sa position
// initiale sur l'axe spécifique. Utilisé pour les patterns de patrouille
// où l'NPC doit pivoter sur certaines positions.
type WalkSequenceGuard = { checkIdx: number; axis: 'x' | 'y'; targetIdx: number };
const WALK_SEQUENCE_GUARDS: Record<string, WalkSequenceGuard> = {
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_LEFT_DOWN': { checkIdx: 2, axis: 'x', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_LEFT_DOWN_UP': { checkIdx: 1, axis: 'x', targetIdx: 2 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_UP_RIGHT_LEFT': { checkIdx: 1, axis: 'y', targetIdx: 2 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_UP_RIGHT': { checkIdx: 2, axis: 'y', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_RIGHT_DOWN': { checkIdx: 2, axis: 'x', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_RIGHT_DOWN_UP': { checkIdx: 1, axis: 'x', targetIdx: 2 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_UP_LEFT_RIGHT': { checkIdx: 1, axis: 'y', targetIdx: 2 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_UP_LEFT': { checkIdx: 2, axis: 'y', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_DOWN_RIGHT': { checkIdx: 2, axis: 'y', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_DOWN_RIGHT_LEFT': { checkIdx: 1, axis: 'y', targetIdx: 2 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_LEFT_UP_DOWN': { checkIdx: 1, axis: 'x', targetIdx: 2 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_LEFT_UP': { checkIdx: 2, axis: 'x', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_UP_DOWN_LEFT': { checkIdx: 2, axis: 'y', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_DOWN_LEFT_RIGHT': { checkIdx: 1, axis: 'y', targetIdx: 2 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_RIGHT_UP_DOWN': { checkIdx: 1, axis: 'x', targetIdx: 2 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_RIGHT_UP': { checkIdx: 2, axis: 'x', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_DOWN_RIGHT': { checkIdx: 2, axis: 'y', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_UP_LEFT': { checkIdx: 2, axis: 'y', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_RIGHT_UP': { checkIdx: 2, axis: 'x', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_UP_LEFT_DOWN': { checkIdx: 2, axis: 'x', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_DOWN_LEFT': { checkIdx: 2, axis: 'y', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_UP_RIGHT': { checkIdx: 2, axis: 'y', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN': { checkIdx: 2, axis: 'x', targetIdx: 3 },
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_LEFT_UP': { checkIdx: 2, axis: 'x', targetIdx: 3 },
};

const WALK_SEQUENCE_DIRECTIONS: Record<string, ReadonlyArray<number>> = {
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_LEFT_DOWN': [DIR_NORTH, DIR_EAST, DIR_WEST, DIR_SOUTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_LEFT_DOWN_UP': [DIR_EAST, DIR_WEST, DIR_SOUTH, DIR_NORTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_UP_RIGHT_LEFT': [DIR_SOUTH, DIR_NORTH, DIR_EAST, DIR_WEST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_UP_RIGHT': [DIR_WEST, DIR_SOUTH, DIR_NORTH, DIR_EAST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_RIGHT_DOWN': [DIR_NORTH, DIR_WEST, DIR_EAST, DIR_SOUTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_RIGHT_DOWN_UP': [DIR_WEST, DIR_EAST, DIR_SOUTH, DIR_NORTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_UP_LEFT_RIGHT': [DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_UP_LEFT': [DIR_EAST, DIR_SOUTH, DIR_NORTH, DIR_WEST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_DOWN_RIGHT': [DIR_WEST, DIR_NORTH, DIR_SOUTH, DIR_EAST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_DOWN_RIGHT_LEFT': [DIR_NORTH, DIR_SOUTH, DIR_EAST, DIR_WEST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_LEFT_UP_DOWN': [DIR_EAST, DIR_WEST, DIR_NORTH, DIR_SOUTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_LEFT_UP': [DIR_SOUTH, DIR_EAST, DIR_WEST, DIR_NORTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_UP_DOWN_LEFT': [DIR_EAST, DIR_NORTH, DIR_SOUTH, DIR_WEST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_DOWN_LEFT_RIGHT': [DIR_NORTH, DIR_SOUTH, DIR_WEST, DIR_EAST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_RIGHT_UP_DOWN': [DIR_WEST, DIR_EAST, DIR_NORTH, DIR_SOUTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_RIGHT_UP': [DIR_SOUTH, DIR_WEST, DIR_EAST, DIR_NORTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_DOWN_RIGHT': [DIR_NORTH, DIR_WEST, DIR_SOUTH, DIR_EAST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_UP_LEFT': [DIR_SOUTH, DIR_EAST, DIR_NORTH, DIR_WEST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_RIGHT_UP': [DIR_WEST, DIR_SOUTH, DIR_EAST, DIR_NORTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_UP_LEFT_DOWN': [DIR_EAST, DIR_NORTH, DIR_WEST, DIR_SOUTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_DOWN_LEFT': [DIR_NORTH, DIR_EAST, DIR_SOUTH, DIR_WEST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_UP_RIGHT': [DIR_SOUTH, DIR_WEST, DIR_NORTH, DIR_EAST],
  'MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN': [DIR_WEST, DIR_NORTH, DIR_EAST, DIR_SOUTH],
  'MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_LEFT_UP': [DIR_EAST, DIR_SOUTH, DIR_WEST, DIR_NORTH],
};

/** 1:1 décomp `MoveNextDirectionInSequence` (event_object_movement.c:3831)
 *  + MovementType_WalkSequence_Step0/1/2 + InitMovementNormal/UpdateMovementNormal.
 *
 *  Decomp pattern :
 *    Step0 : ClearObjectEventMovement + sTypeFuncId=1
 *    Step1 : MoveNextDirectionInSequence(route) :
 *      - if seqIdx==3 && currentCoords == initialCoords → seqIdx=0 (wrap)
 *      - SetObjectEventDirection(route[seqIdx])
 *      - If collision OUTSIDE_RANGE → seqIdx++ + retry
 *      - If any collision → walk_in_place anim
 *      - Else → walk_normal start
 *      - sTypeFuncId=2
 *    Step2 : ExecSingleMovementAction → quand done sTypeFuncId=1 (loop)
 *
 *  DETTE 1:1 mineure : les 9 variantes WALK_SEQUENCE ont chacune un guard
 *  mid-cycle additional (e.g. `if (seqIdx == 2 && initialCoords.x == currentCoords.x)
 *  seqIdx = 3`) qui force le saut à une étape spécifique selon la position.
 *  Notre port skip ces guards (= rare edge cases pour NPCs en
 *  WALK_SEQUENCE_X qui hit la border de leur movement range). Le pattern
 *  principal reste correct. */
function tickWalkSequence(rt: DecompRuntime, npc: ObjectEvent, route: ReadonlyArray<number>, guard?: WalkSequenceGuard): void {
  // 1:1 décomp `MovementType_WalkSequence*_Step1` guards mid-cycle :
  //   if (seqIdx == checkIdx && initialCoords.<axis> == currentCoords.<axis>)
  //       seqIdx = targetIdx;
  // Force le saut à l'étape suivante quand le NPC revient à initialCoords
  // sur l'axe spécifique. Variant-specific guard appliqué AVANT MoveNextDirectionInSequence.
  if (guard) {
    const initial = guard.axis === 'x' ? npc.initialCoordsX : npc.initialCoordsY;
    const current = guard.axis === 'x' ? npc.currentCoordsX : npc.currentCoordsY;
    if (npc.directionSeqIdx === guard.checkIdx && initial === current) {
      npc.directionSeqIdx = guard.targetIdx;
    }
  }

  // 1:1 décomp `MovementType_WalkSequence_Step0` (3824) inline-collapsed :
  // ClearObjectEventMovement + sTypeFuncId=1 + return TRUE qui re-call dans
  // la même frame → bascule directement à case 1.
  if (npc.movementStep === 0) npc.movementStep = 1;
  switch (npc.movementStep) {
    case 1: {
      // 1:1 décomp `MoveNextDirectionInSequence` (3831) + MovementType_WalkSequence
      // *_Step1 (= variant-specific).
      // Wrap check : si on est à la fin du cycle (seqIdx==3) et revenu à initial,
      // restart cycle (seqIdx=0).
      if (npc.directionSeqIdx >= 3
          && npc.currentCoordsX === npc.initialCoordsX
          && npc.currentCoordsY === npc.initialCoordsY) {
        npc.directionSeqIdx = 0;
      }
      const idx = Math.min(npc.directionSeqIdx, route.length - 1);
      const dir = route[idx] ?? DIR_SOUTH;
      npc.facingDirection = dir;
      // OUT_OF_RANGE check : si dépasse movement range, avance seqIdx + retry.
      const dx = DIR_TO_DX[dir] ?? 0;
      const dy = DIR_TO_DY[dir] ?? 0;
      let tx = npc.currentCoordsX + dx;
      let ty = npc.currentCoordsY + dy;
      if (IsCoordOutsideObjectEventMovementRange(npc, tx, ty)) {
        npc.directionSeqIdx++;
        const newIdx = Math.min(npc.directionSeqIdx, route.length - 1);
        const newDir = route[newIdx] ?? DIR_SOUTH;
        npc.facingDirection = newDir;
        tx = npc.currentCoordsX + (DIR_TO_DX[newDir] ?? 0);
        ty = npc.currentCoordsY + (DIR_TO_DY[newDir] ?? 0);
      }
      if (canWalk(npc, npc.facingDirection)) {
        // Walk normal start (= 1:1 InitMovementNormal).
        ShiftObjectEventCoords(npc, tx, ty);
        npc.walkDirection = npc.facingDirection;
        npc.walkFramesLeft = 16;
        npc.movementStep = 2;
        _npcStartWalkAnim(rt, npc, npc.facingDirection);
      } else {
        // Wall collision : walk_in_place anim (= 1:1 GetWalkInPlaceNormalMovementAction).
        // Skip cette frame, retry next.
        _npcSetFaceAnim(rt, npc);
        npc.movementStep = 1;
      }
      break;
    }
    case 2: {
      // 1:1 décomp `MovementType_WalkSequence_Step2` (3859) :
      // Exec walk step. Quand done, sTypeFuncId = 1 (loop).
      const speedX = DIR_TO_DX[npc.walkDirection] ?? 0;
      const speedY = DIR_TO_DY[npc.walkDirection] ?? 0;
      npc.worldX += speedX;
      npc.worldY += speedY;
      npc.walkFramesLeft--;
      if (npc.walkFramesLeft === 0) {
        ShiftStillObjectEventCoords(npc);
        npc.walkDirection = DIR_NONE;
        npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
        npc.directionSeqIdx = (npc.directionSeqIdx + 1) & 3;
        npc.movementStep = 1;
        _npcEndWalkAnim(rt, npc);
      }
      break;
    }
  }
}

// ─── BerryTreeGrowth state machine 1:1 décomp ────────────────────────────────
// Source : event_object_movement.c:3060-3182.

/** 1:1 décomp `BERRY_FLAG_SET_GFX` (event_object_movement.c:3071). */
const BERRY_FLAG_SET_GFX     = 1 << 0;
/** 1:1 décomp `BERRY_FLAG_SPARKLING` (event_object_movement.c:3072). */
const BERRY_FLAG_SPARKLING   = 1 << 1;
/** 1:1 décomp `BERRY_FLAG_JUST_PICKED` (event_object_movement.c:3073). */
const BERRY_FLAG_JUST_PICKED = 1 << 2;

/** 1:1 décomp BERRYTREEFUNC_* enum (event_object_movement.c:3060-3066). */
const BERRYTREEFUNC_NORMAL        = 0;
const BERRYTREEFUNC_MOVE          = 1;
const BERRYTREEFUNC_SPARKLE_START = 2;
const BERRYTREEFUNC_SPARKLE       = 3;
const BERRYTREEFUNC_SPARKLE_END   = 4;

/** 1:1 décomp `SetBerryTreeGraphics` (event_object_movement.c:1890). R3 SOLDÉ :
 *  délègue au swap LIVE complet `_applyBerryTreeStageGraphicsLive` (taille OAM 16×16↔
 *  16×32 + pic table + palette par stade + StartSpriteAnim, réutilise objTileBase sans
 *  réalloc VRAM). Couvre le changement de stade en partie (croissance) ET le restart
 *  d'anim même-stade (sway). */
function setBerryTreeGraphics(rt: DecompRuntime, npc: ObjectEvent): void {
  _applyBerryTreeStageGraphicsLive(rt, npc);
}

/** 1:1 décomp `MovementType_BerryTreeGrowth_Normal` (event_object_movement.c:3093). */
function berryTreeNormal(rt: DecompRuntime, npc: ObjectEvent): boolean {
  // ClearObjectEventMovement (4486) : reset state.
  npc.singleMovementActive = false;
  npc.heldMovementActive = false;
  npc.heldMovementFinished = false;
  npc.movementActionId = 0xFF;
  npc.invisible = true;
  const berryStage = GetStageByBerryTreeId(npc.trainerRange_berryTreeId);
  if (berryStage === BERRY_STAGE_NO_BERRY) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite && !(npc.berryTreeFlags & BERRY_FLAG_JUST_PICKED) && sprite.animNum === BERRY_STAGE_FLOWERING) {
      // 1:1 décomp (event_object_movement.c:3102-3110) : flowering → plot vide sans
      // cueillette → étoile scintille + animNum = berryStage.
      _startBerryTreeGrowthSparkle(rt, npc);
      sprite.animNum = berryStage;
    }
    return false;
  }
  npc.invisible = false;
  const berryStageMinusOne = berryStage - 1;
  const sprite = rt.gSprites[npc.spriteId];
  if (sprite && sprite.animNum !== berryStageMinusOne) {
    // Stage changed → sparkle anim.
    npc.movementStep = BERRYTREEFUNC_SPARKLE_START;
    return true;
  }
  // Same stage → ObjectEventSetSingleMovement(MOVEMENT_ACTION_START_ANIM_IN_DIRECTION).
  // DETTE H1 : gMovementActionFuncs[MOVEMENT_ACTION_START_ANIM_IN_DIRECTION] dispatch.
  setBerryTreeGraphics(rt, npc);
  npc.movementStep = BERRYTREEFUNC_MOVE;
  return true;
}

/** 1:1 décomp `MovementType_BerryTreeGrowth_Move` (event_object_movement.c:3128). */
function berryTreeMove(rt: DecompRuntime, npc: ObjectEvent): boolean {
  // 1:1 décomp : if (ObjectEventExecSingleMovementAction) { sTypeFuncId = NORMAL; return TRUE; }
  // L'action en cours est MOVEMENT_ACTION_START_ANIM_IN_DIRECTION (posée en NORMAL),
  // dont l'étape WaitSpriteAnim retourne TRUE quand `SpriteAnimEnded` (= sprite.animEnded).
  // → tant que l'anim joue (= la 4-frame sAnim_BerryTreeStage{0..4} se déroule), on
  // RESTE en MOVE. À la fin (animEnded), retour NORMAL qui relance setBerryTreeGraphics
  // (= StartSpriteAnim restart) → boucle continue = le sway perpétuel du berry tree.
  //
  // ⚠️ Sans cette attente (ancien port qui retournait NORMAL immédiatement),
  // setBerryTreeGraphics était rappelé CHAQUE frame → reset animCmdIndex=0 →
  // sprite figé sur la 1re frame (bug "berry tree pas animé").
  const sprite = rt.gSprites[npc.spriteId];
  if (sprite && sprite.anims && !sprite.animEnded) return false;  // anim en cours → rester en MOVE
  npc.movementStep = BERRYTREEFUNC_NORMAL;
  return true;
}

/** 1:1 décomp setup gFieldEffectArguments + FieldEffectStart(FLDEFF_BERRY_TREE_GROWTH_
 *  SPARKLE) (event_object_movement.c:3104-3108 / 3145-3149) : args[0/1] = currentCoords
 *  (INTERNAL), [2] = subpriority-1, [3] = oam.priority. Chemin 1:1 (dispatcher → FldEff
 *  migré dans game/field_effect_helpers.ts) ; FieldEffectStart déjà importé pour le spine. */
function _startBerryTreeGrowthSparkle(rt: DecompRuntime, npc: ObjectEvent): void {
  const sprite = npc.spriteId >= 0 ? rt.gSprites[npc.spriteId] : null;
  const priority = sprite && sprite.oamIndex >= 0 ? (rt.gba.oam[sprite.oamIndex].priority ?? 2) : 2;
  const subpriority = sprite ? sprite.subpriority : 0;
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = (subpriority - 1) & 0xFF; // 1:1 sprite->subpriority - 1
  gFieldEffectArguments[3] = priority;
  FieldEffectStart(FLDEFF_BERRY_TREE_GROWTH_SPARKLE);
}

/** 1:1 décomp `MovementType_BerryTreeGrowth_SparkleStart` (event_object_movement.c:3139). */
function berryTreeSparkleStart(rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.singleMovementActive = true;
  npc.movementStep = BERRYTREEFUNC_SPARKLE;
  npc.berryTreeTimer = 0;
  npc.berryTreeFlags |= BERRY_FLAG_SPARKLING;
  // 1:1 décomp : FieldEffectStart(FLDEFF_BERRY_TREE_GROWTH_SPARKLE) (l'étoile scintille).
  _startBerryTreeGrowthSparkle(rt, npc);
  return true;
}

/** 1:1 décomp `MovementType_BerryTreeGrowth_Sparkle` (event_object_movement.c:3154). */
function berryTreeSparkle(rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.berryTreeTimer++;
  npc.invisible = ((npc.berryTreeTimer & 2) >> 1) === 1;
  const sprite = rt.gSprites[npc.spriteId];
  if (sprite) sprite.animPaused = true;
  if (npc.berryTreeTimer > 64) {
    setBerryTreeGraphics(rt, npc);
    npc.movementStep = BERRYTREEFUNC_SPARKLE_END;
    npc.berryTreeTimer = 0;
    return true;
  }
  return false;
}

/** 1:1 décomp `MovementType_BerryTreeGrowth_SparkleEnd` (event_object_movement.c:3170). */
function berryTreeSparkleEnd(rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.berryTreeTimer++;
  npc.invisible = ((npc.berryTreeTimer & 2) >> 1) === 1;
  const sprite = rt.gSprites[npc.spriteId];
  if (sprite) sprite.animPaused = true;
  if (npc.berryTreeTimer > 64) {
    npc.movementStep = BERRYTREEFUNC_NORMAL;
    npc.berryTreeFlags &= ~BERRY_FLAG_SPARKLING;
    return true;
  }
  return false;
}

/** 1:1 décomp `MovementType_BerryTreeGrowth` (event_object_movement.c:3075) +
 *  `ObjectEventCB2_BerryTree` (3087). Loop while callback returns TRUE. */
function tickBerryTreeGrowth(rt: DecompRuntime, npc: ObjectEvent): void {
  if (!(npc.berryTreeFlags & BERRY_FLAG_SET_GFX)) {
    setBerryTreeGraphics(rt, npc);
    npc.berryTreeFlags |= BERRY_FLAG_SET_GFX;
  }
  // UpdateObjectEventCurrentMovement loop : while callback returns TRUE, re-dispatch.
  // Safety bound 8 iterations (= state machine n'a que 5 states, never plus de 5 transitions/frame).
  for (let i = 0; i < 8; i++) {
    let cont = false;
    switch (npc.movementStep) {
      case BERRYTREEFUNC_NORMAL:        cont = berryTreeNormal(rt, npc); break;
      case BERRYTREEFUNC_MOVE:          cont = berryTreeMove(rt, npc); break;
      case BERRYTREEFUNC_SPARKLE_START: cont = berryTreeSparkleStart(rt, npc); break;
      case BERRYTREEFUNC_SPARKLE:       cont = berryTreeSparkle(rt, npc); break;
      case BERRYTREEFUNC_SPARKLE_END:   cont = berryTreeSparkleEnd(rt, npc); break;
      default: return;
    }
    if (!cont) break;
  }
}

/** Map MOVEMENT_TYPE_* string → state machine handler + allowed directions.
 *  Ajout 4.4.c.2 : multi-direction look + multi-direction wander.
 *  Ajout 4.4.f : ROTATE_*, WALK_*_AND_*, WALK_IN_PLACE_* (= face static),
 *  INVISIBLE (= sprite hidden). */
const MOVEMENT_HANDLERS: Record<string, { tick: 'look' | 'wander'; dirs: ReadonlyArray<number> }> = {
  // Wander (= roam autour avec all 4 directions)
  'MOVEMENT_TYPE_WANDER_AROUND': { tick: 'wander', dirs: gStandardDirections },
  'MOVEMENT_TYPE_WANDER_UP_AND_DOWN': { tick: 'wander', dirs: [DIR_SOUTH, DIR_NORTH] },
  'MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT': { tick: 'wander', dirs: [DIR_WEST, DIR_EAST] },
  // Look (= juste tourner sans bouger)
  'MOVEMENT_TYPE_LOOK_AROUND': { tick: 'look', dirs: gStandardDirections },
  'MOVEMENT_TYPE_FACE_DOWN_AND_UP': { tick: 'look', dirs: [DIR_SOUTH, DIR_NORTH] },
  'MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT': { tick: 'look', dirs: [DIR_WEST, DIR_EAST] },
  'MOVEMENT_TYPE_FACE_UP_AND_LEFT': { tick: 'look', dirs: [DIR_NORTH, DIR_WEST] },
  'MOVEMENT_TYPE_FACE_UP_AND_RIGHT': { tick: 'look', dirs: [DIR_NORTH, DIR_EAST] },
  'MOVEMENT_TYPE_FACE_DOWN_AND_LEFT': { tick: 'look', dirs: [DIR_SOUTH, DIR_WEST] },
  'MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT': { tick: 'look', dirs: [DIR_SOUTH, DIR_EAST] },
  'MOVEMENT_TYPE_FACE_DOWN_UP_AND_LEFT': { tick: 'look', dirs: [DIR_SOUTH, DIR_NORTH, DIR_WEST] },
  'MOVEMENT_TYPE_FACE_DOWN_UP_AND_RIGHT': { tick: 'look', dirs: [DIR_SOUTH, DIR_NORTH, DIR_EAST] },
  'MOVEMENT_TYPE_FACE_UP_RIGHT_AND_LEFT': { tick: 'look', dirs: [DIR_NORTH, DIR_EAST, DIR_WEST] },
  'MOVEMENT_TYPE_FACE_DOWN_RIGHT_AND_LEFT': { tick: 'look', dirs: [DIR_SOUTH, DIR_EAST, DIR_WEST] },
};

/** Movement type pattern matching pour les types non-LookAround/Wander.
 *  Returns le handler à appliquer + paramètres. Approche string-match évite
 *  un huge map literal. */
function dispatchSpecialMovement(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const mt = npc.movementType;
  // ─── MOVEMENT_TYPE_FACE_DOWN/UP/LEFT/RIGHT (H5) ─────────────────────────────
  // 1:1 strict décomp `MovementType_FaceDirection_Step0/1/2`
  // (event_object_movement.c:3031-3055) :
  //   Step0 : ClearObjectEventMovement(obj, sprite);
  //           ObjectEventSetSingleMovement(GetFaceDirectionMovementAction(facingDirection));
  //           sprite->sTypeFuncId = 1;
  //           return TRUE;
  //   Step1 : if (ObjectEventExecSingleMovementAction(obj, sprite)) {
  //               sprite->sTypeFuncId = 2;
  //               return TRUE;
  //           }
  //           return FALSE;
  //   Step2 : objectEvent->singleMovementActive = FALSE;
  //           return FALSE;
  //
  // FaceDirection action est instant (MovementAction_FaceDown/Up/Left/Right_Step0
  // ne fait que StartSpriteAnim → return TRUE imm). Step0+Step1 collapsent dans
  // une frame, puis Step2 idle indéfini. sTypeFuncId = notre npc.movementStep.
  //
  // Sans H1 (gMovementActionFuncs) refactor, on inline FaceDirection action
  // direct via _npcSetFaceAnim (= StartSpriteAnim(GetFaceDirectionAnimNum)).
  if (mt === 'MOVEMENT_TYPE_FACE_DOWN'
   || mt === 'MOVEMENT_TYPE_FACE_UP'
   || mt === 'MOVEMENT_TYPE_FACE_LEFT'
   || mt === 'MOVEMENT_TYPE_FACE_RIGHT') {
    if (npc.movementStep === 0) {
      // Step0 : ClearObjectEventMovement (event_object_movement.c:4486) :
      //   singleMovementActive=FALSE + heldMovementActive=FALSE +
      //   heldMovementFinished=FALSE + movementActionId=MOVEMENT_ACTION_NONE +
      //   sTypeFuncId=0. Step0 puis overwrite sTypeFuncId=1.
      npc.singleMovementActive = false;
      npc.heldMovementActive = false;
      npc.heldMovementFinished = false;
      npc.movementActionId = 0xFF;  // MOVEMENT_ACTION_NONE (= event_object_movement.h:265)
      // Step1 collapse : FaceDirection action instant → StartSpriteAnim FACE_X.
      _npcSetFaceAnim(rt, npc);
      // Step2 : singleMovementActive déjà FALSE via ClearObjectEventMovement.
      npc.movementStep = 2;
    }
    // Step2 idle : return FALSE dans décomp, return true dans notre TS pour
    // signaler "handled" au dispatcher (= sinon skip puis re-tick = boucle).
    return true;
  }
  // ROTATE_CLOCKWISE / COUNTERCLOCKWISE
  if (mt === 'MOVEMENT_TYPE_ROTATE_CLOCKWISE') {
    tickRotate(rt, npc, true);
    return true;
  }
  if (mt === 'MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE') {
    tickRotate(rt, npc, false);
    return true;
  }
  // WALK_*_AND_* : extract primary direction du nom (= DOWN_AND_UP, RIGHT_AND_LEFT, etc).
  if (mt.startsWith('MOVEMENT_TYPE_WALK_') && mt.includes('_AND_')) {
    let primaryDir = DIR_SOUTH;
    if (mt.includes('WALK_DOWN_AND_UP')) primaryDir = DIR_SOUTH;
    else if (mt.includes('WALK_UP_AND_DOWN')) primaryDir = DIR_NORTH;
    else if (mt.includes('WALK_LEFT_AND_RIGHT')) primaryDir = DIR_WEST;
    else if (mt.includes('WALK_RIGHT_AND_LEFT')) primaryDir = DIR_EAST;
    else return false;
    tickWalkBackAndForth(rt, npc, primaryDir);
    return true;
  }
  // WALK_IN_PLACE_* / WALK_SLOWLY_IN_PLACE_* / JOG_IN_PLACE_* / RUN_IN_PLACE_*
  // = facing static + walk anim "in place" cycle (= sprite pattes bougent sans
  //   bouger logical coords). 1:1 décomp `MovementType_WalkInPlace_Step0/1`
  //   (event_object_movement.c:4422 + MovementType_MoveInPlace_Step1:4413) :
  //     Step0: ClearObjectEventMovement + ObjectEventSetSingleMovement(
  //                GetWalkInPlaceNormalMovementAction(facing))
  //     Step1: ExecSingleMovementAction → quand fini, retour Step0 (= loop)
  //
  //   GetWalkInPlace*MovementAction(facing) retourne l'action ID qui declenche
  //   l'anim StartSpriteAnim(GetMoveDirectionAnimNum(facing)) avec une duration
  //   de 16/32/8/4 frames (normal/slow/fast/faster). updateNpcSpriteFrame
  //   alterne entre walk1/walk2 quand walkFramesLeft >= 8.
  //
  //   Bug user-flag : Vigoroth_FACING_AWAY (mt=WALK_IN_PLACE_UP) à MaysHouse_1F
  //   "ne bouge pas" = static facing init était broken (DIR_SOUTH au lieu de
  //   DIR_NORTH), résolu côté `_INITIAL_FACING_BY_MT`. Mais le sprite restait
  //   aussi STATIQUE (= jamais alternait walk1/walk2) faute de tick d'anim.
  if (mt.startsWith('MOVEMENT_TYPE_WALK_IN_PLACE_')
   || mt.startsWith('MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_')
   || mt.startsWith('MOVEMENT_TYPE_JOG_IN_PLACE_')
   || mt.startsWith('MOVEMENT_TYPE_RUN_IN_PLACE_')) {
    // 1:1 décomp duration : walk_in_place_normal=16, slow=32, fast=8, faster=4
    // (= event_object_movement.c:5732-5826 InitMoveInPlace, audit session 124).
    let duration = 16;
    if (mt.startsWith('MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_')) duration = 32;
    else if (mt.startsWith('MOVEMENT_TYPE_JOG_IN_PLACE_')) duration = 8;
    else if (mt.startsWith('MOVEMENT_TYPE_RUN_IN_PLACE_')) duration = 4;
    // 1:1 décomp `InitMoveInPlace` (event_object_movement.c:5704) au start :
    //   SetObjectEventDirection(direction);
    //   SetStepAnimHandleAlternation(animNum);   ← alterne walk1/walk2
    //   sprite->animPaused = FALSE;              ← enable anim cycle
    // Init le cycle au premier tick (= mimic Step0 ObjectEventSetSingleMovement).
    if (npc.walkFramesLeft === 0) {
      npc.walkFramesLeft = duration;
      npc.walkDirection = npc.facingDirection;
      _npcStartWalkAnim(rt, npc, npc.facingDirection);
    }
    npc.walkFramesLeft--;
    // 1:1 décomp `MovementAction_WalkInPlace_Step1` (5713) :
    //   if (--data[3] == 0) { sprite->animPaused = TRUE; return TRUE; }
    // Toggle walkAnimAlt + animPaused=TRUE quand duration expire. Next frame
    // re-init cycle via walkFramesLeft==0 check.
    if (npc.walkFramesLeft === 0) {
      npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
      _npcEndWalkAnim(rt, npc);
    }
    return true;
  }
  // INVISIBLE : sprite hidden. Set npc.invisible.
  if (mt === 'MOVEMENT_TYPE_INVISIBLE') {
    npc.invisible = true;
    return true;
  }
  // ─── MOVEMENT_TYPE_BURIED (H3) ──────────────────────────────────────────────
  // 1:1 strict décomp `MovementType_Buried` (event_object_movement.c:4390-4411) :
  //   if (!sprite->data[7]) {
  //     gObjectEvents[sprite->sObjEventId].fixedPriority = TRUE;
  //     sprite->subspriteMode = SUBSPRITES_IGNORE_PRIORITY;
  //     sprite->oam.priority = 3;
  //     sprite->data[7]++;
  //   }
  //   UpdateObjectEventCurrentMovement(...);  // Buried_Step0 = ClearObjectEventMovement, idle.
  //
  // DETTE H3 cascade : subspriteMode = SUBSPRITES_IGNORE_PRIORITY (= notre G14
  // subspriteMode est 'off' | 'on', pas étendu à IGNORE_PRIORITY).
  if (mt === 'MOVEMENT_TYPE_BURIED') {
    if (!npc.disguiseStarted) {
      npc.fixedPriority = true;
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite) {
          // 1:1 décomp `sprite->oam.priority = 3` (= behind tiles) via oamIndex.
          rt.gba.oam[sprite.oamIndex].priority = 3;
          // DETTE H3 : sprite->subspriteMode = SUBSPRITES_IGNORE_PRIORITY.
        }
      }
      npc.disguiseStarted = true;
    }
    // Buried_Step0 : ClearObjectEventMovement (4486) + return FALSE.
    npc.singleMovementActive = false;
    npc.heldMovementActive = false;
    npc.heldMovementFinished = false;
    npc.movementActionId = 0xFF;
    return true;
  }
  // ─── MOVEMENT_TYPE_BERRY_TREE_GROWTH (H2) ───────────────────────────────────
  // 1:1 strict décomp `MovementType_BerryTreeGrowth` (event_object_movement.c:3075)
  // + gMovementTypeFuncs_BerryTreeGrowth[5] (3060-3066) :
  //   BERRYTREEFUNC_NORMAL (0)        : check stage + decide grow/sparkle
  //   BERRYTREEFUNC_MOVE (1)          : exec sprite anim until done
  //   BERRYTREEFUNC_SPARKLE_START (2) : trigger FLDEFF_BERRY_TREE_GROWTH_SPARKLE
  //   BERRYTREEFUNC_SPARKLE (3)       : blink invisible 64 frames
  //   BERRYTREEFUNC_SPARKLE_END (4)   : blink invisible 64 frames + back to NORMAL
  //
  // sTypeFuncId = notre npc.movementStep. sBerryTreeFlags = npc.berryTreeFlags.
  // sTimer = npc.berryTreeTimer.
  //
  // BERRY_FLAG_SET_GFX = (1<<0)  : sprite graphics initialisé via SetBerryTreeGraphics.
  // BERRY_FLAG_SPARKLING = (1<<1) : sparkling anim en cours.
  // BERRY_FLAG_JUST_PICKED = (1<<2): berry vient d'être ramassée → skip sparkle.
  //
  // DETTES R3 1:1 strict cascade :
  //   - ObjectEventSetGraphicsId (1820) : palette swap + oam shape + images swap.
  //     Cascade vers PatchObjectPalette + LoadSpecialObjectReflectionPalette +
  //     SetSpritePosToMapCoords + CameraObjectReset.
  //   - FieldEffectStart(FLDEFF_BERRY_TREE_GROWTH_SPARKLE) : H3 FieldEffect system.
  //   - ObjectEventSetSingleMovement(MOVEMENT_ACTION_START_ANIM_IN_DIRECTION) +
  //     ObjectEventExecSingleMovementAction : H1 gMovementActionFuncs[].
  //   - gBerryTreePicTablePointers + gBerryTreePaletteSlotTablePointers (43 entries
  //     × 9 image structs) : data extraction lourde, lazy port (= dette R3).
  //
  // Port partial : state machine porté + visibility/animNum sync 1:1. Le sprite
  // swap (= graphics_id EARLY→LATE stages) + sparkle FieldEffect = stub explicit.
  if (mt === 'MOVEMENT_TYPE_BERRY_TREE_GROWTH') {
    tickBerryTreeGrowth(rt, npc);
    return true;
  }
  // ─── MOVEMENT_TYPE_TREE_DISGUISE / MOUNTAIN_DISGUISE (H3) ───────────────────
  // 1:1 strict décomp `MovementType_TreeDisguise` (4354) / `MountainDisguise` (4375) :
  //   if (directionSequenceIndex == 0 ||
  //       (directionSequenceIndex == 1 && !sprite->data[7])) {
  //     ObjectEventGetLocalIdAndMap(obj, &gFieldEffectArguments[0..2]);
  //     fieldEffectSpriteId = FieldEffectStart(FLDEFF_TREE_DISGUISE / MOUNTAIN_DISGUISE);
  //     directionSequenceIndex = 1;
  //     sprite->data[7]++;
  //   }
  //   UpdateObjectEventCurrentMovement(..., MovementType_Disguise_Callback);
  //
  // MovementType_Disguise_Callback (4369) : ClearObjectEventMovement + return FALSE.
  //
  // DETTE H3 cascade : FieldEffect system (FLDEFF_TREE_DISGUISE / MOUNTAIN_DISGUISE).
  // Sans ça, le sprite "déguisé" n'est pas spawned par-dessus le NPC.
  if (mt === 'MOVEMENT_TYPE_TREE_DISGUISE'
   || mt === 'MOVEMENT_TYPE_MOUNTAIN_DISGUISE') {
    if (npc.directionSeqIdx === 0 || (npc.directionSeqIdx === 1 && !npc.disguiseStarted)) {
      // 1:1 strict décomp event_object_movement.c:4361-4364 :
      //   ObjectEventGetLocalIdAndMap(obj, &gFieldEffectArguments[0..2]);
      //   objectEvent->fieldEffectSpriteId = FieldEffectStart(FLDEFF_X_DISGUISE);
      gFieldEffectArguments[0] = npc.localId;
      gFieldEffectArguments[1] = npc.mapNum;
      gFieldEffectArguments[2] = npc.mapGroup;
      const effectId = (mt === 'MOVEMENT_TYPE_TREE_DISGUISE')
        ? FLDEFF_TREE_DISGUISE : FLDEFF_MOUNTAIN_DISGUISE;
      npc.fieldEffectSpriteId = FieldEffectStart(effectId);
      npc.directionSeqIdx = 1;
      npc.disguiseStarted = true;
    }
    // MovementType_Disguise_Callback : ClearObjectEventMovement + return FALSE.
    npc.singleMovementActive = false;
    npc.heldMovementActive = false;
    npc.heldMovementFinished = false;
    npc.movementActionId = 0xFF;
    return true;
  }
  // ─── MOVEMENT_TYPE_COPY_PLAYER* (H4) ────────────────────────────────────────
  // 1:1 strict décomp `MovementType_CopyPlayer_Step0/1/2` (event_object_movement.c
  // :4159-4184) :
  //   Step0 : ClearObjectEventMovement;
  //           if (directionSequenceIndex == 0) directionSequenceIndex = GetPlayerFacingDirection();
  //           sTypeFuncId = 1; return TRUE;
  //   Step1 : if (player->movementActionId == MOVEMENT_ACTION_NONE ||
  //               gPlayerAvatar.tileTransitionState == T_TILE_CENTER) return FALSE;
  //           return gCopyPlayerMovementFuncs[PlayerGetCopyableMovement()](
  //                     obj, sprite, GetPlayerMovementDirection(), NULL);
  //   Step2 : if (ObjectEventExecSingleMovementAction(obj, sprite)) {
  //               singleMovementActive = FALSE;
  //               sTypeFuncId = 1;
  //           }
  //           return FALSE;
  //
  // DETTES H1 cascade explicits :
  //   - gCopyPlayerMovementFuncs[6] (None/FaceDirection/WalkNormal/WalkFast/
  //     WalkFaster/Slide/JumpInPlace/Jump/Jump2) chacune calls
  //     ObjectEventSetSingleMovement + GetWalkNormal/Fast/.../MovementAction.
  //   - PlayerGetCopyableMovement (= retourne COPY_MOVE_* selon player
  //     runningState + tileTransitionState).
  //   - GetCopyDirection(initialFacing, seqIdx, playerDir) = mapping selon
  //     gInitialMovementTypeFacingDirections + COPY_PLAYER_OPPOSITE/CCW/CW.
  //   - ObjectEventSetSingleMovement / ObjectEventExecSingleMovementAction.
  //   - ObjectEventIsFarawayIslandMew + GetMewMoveDirection (= subsystem
  //     Faraway Island Mystery Event).
  //   - GetCollisionAtCoords + MetatileBehavior_IsPokeGrass (= COPY_PLAYER_IN_GRASS).
  //
  // Port partial : Step0 init directionSequenceIndex 1:1 strict. Step1/2 idle
  // (= no-op sans gCopyPlayerMovementFuncs cascade). NPCs en COPY_PLAYER_X
  // garderont leur facingDirection initiale + ne copieront pas player.
  // Implémentation cascade complète attend H1 refactor.
  if (mt.startsWith('MOVEMENT_TYPE_COPY_PLAYER')) {
    if (npc.movementStep === 0) {
      // Step0 : ClearObjectEventMovement + init directionSequenceIndex.
      npc.singleMovementActive = false;
      npc.heldMovementActive = false;
      npc.heldMovementFinished = false;
      npc.movementActionId = 0xFF;
      if (npc.directionSeqIdx === 0) {
        npc.directionSeqIdx = GetPlayerFacingDirection();
      }
      npc.movementStep = 1;
    }
    // Step 1+ : idle sans gCopyPlayerMovementFuncs dispatch (= dette H1).
    return true;
  }
  // WALK_SLOWLY_IN_PLACE_* : facing static + slower in-place walk anim.
  // Dette : static face (= comme WALK_IN_PLACE) ; l'anim in-place ralentie reste à porter.
  if (mt.startsWith('MOVEMENT_TYPE_WALK_SLOWLY_IN_PLACE_')) {
    return true;
  }
  // JOG_IN_PLACE_* : faster in-place anim. Dette : static face (anim in-place non portée).
  if (mt.startsWith('MOVEMENT_TYPE_JOG_IN_PLACE_')) {
    return true;
  }
  // WALK_SEQUENCE_* : NPC walk un pattern prédéfini de 4 directions fixes
  // (= 24 variantes, ex. UP_RIGHT_LEFT_DOWN = DIR_NORTH→DIR_EAST→DIR_WEST→DIR_SOUTH).
  // 1:1 décomp `MovementType_WalkSequence_*` + `MoveNextDirectionInSequence`
  // (event_object_movement.c:3824-4020) + sequences tables (= 24 entries).
  if (mt.startsWith('MOVEMENT_TYPE_WALK_SEQUENCE_')) {
    const directions = WALK_SEQUENCE_DIRECTIONS[mt];
    if (directions) {
      tickWalkSequence(rt, npc, directions, WALK_SEQUENCE_GUARDS[mt]);
    }
    return true;
  }
  // RUN_IN_PLACE_* : run anim in place. Dette : traité comme WALK_IN_PLACE (anim run non portée).
  if (mt.startsWith('MOVEMENT_TYPE_RUN_IN_PLACE_')) {
    return true;
  }
  // PLAYER_AVATAR : meta-type pour player. Pas de NPC tick.
  if (mt === 'MOVEMENT_TYPE_PLAYER') {
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// SPINE GROUND EFFECTS — 1:1 STRICT décomp event_object_movement.c:7389-8140
//
// Système de dispatch des "ground effects" overworld (rustle d'herbe, kick de
// sable, splash/ripple d'eau, reflets, footprints, dust d'atterrissage, hot
// springs…). À chaque update d'object event (UpdateObjectEventCurrentMovement),
// DoGroundEffects_OnSpawn (top) + OnBeginStep/OnFinishStep (bottom) calculent un
// bitmask de flags depuis l'état tuile de l'objet (currentMetatileBehavior /
// previousMetatileBehavior + élévation) puis dispatchent vers les GroundEffect_*
// via sGroundEffectFuncs[].
//
// Gating : OnSpawn/OnBeginStep tirent sur triggerGroundEffectsOnMove, OnFinishStep
// sur triggerGroundEffectsOnStop — flags posés par les MovementActions, DÉJÀ
// câblés 1:1 (InitNpcForMovement:3068, UpdateMovementNormal:3120, InitJump:3657,
// UpdateJumpAnim:3718). BUGFIX est OFF en vanilla (include/config.h:53) → on porte
// la branche sans garde OBJ_EVENT_ID_CAMERA.
//
// Note archi : nos sprites NPC vivent dans rt.gSprites ; leur priority OAM est
// dans rt.gba.oam[sprite.oamIndex].priority (pas un sprite.oam local). Les coords
// currentCoordsX/Y sont INTERNAL (+MAP_OFFSET), 1:1 décomp → MapGridGet* direct.
// ═══════════════════════════════════════════════════════════════════════════

// 1:1 décomp GROUND_EFFECT_FLAG_* (include/event_object_movement.h:53-72).
const GROUND_EFFECT_FLAG_TALL_GRASS_ON_SPAWN   = 1 << 0;
const GROUND_EFFECT_FLAG_TALL_GRASS_ON_MOVE    = 1 << 1;
const GROUND_EFFECT_FLAG_LONG_GRASS_ON_SPAWN   = 1 << 2;
const GROUND_EFFECT_FLAG_LONG_GRASS_ON_MOVE    = 1 << 3;
const GROUND_EFFECT_FLAG_WATER_REFLECTION      = 1 << 4;
const GROUND_EFFECT_FLAG_ICE_REFLECTION        = 1 << 5;
const GROUND_EFFECT_FLAG_SHALLOW_FLOWING_WATER = 1 << 6;
const GROUND_EFFECT_FLAG_SAND                  = 1 << 7;
const GROUND_EFFECT_FLAG_DEEP_SAND             = 1 << 8;
const GROUND_EFFECT_FLAG_RIPPLES               = 1 << 9;
const GROUND_EFFECT_FLAG_PUDDLE                = 1 << 10;
const GROUND_EFFECT_FLAG_SAND_PILE             = 1 << 11;
const GROUND_EFFECT_FLAG_LAND_IN_TALL_GRASS    = 1 << 12;
const GROUND_EFFECT_FLAG_LAND_IN_LONG_GRASS    = 1 << 13;
const GROUND_EFFECT_FLAG_LAND_IN_SHALLOW_WATER = 1 << 14;
const GROUND_EFFECT_FLAG_LAND_IN_DEEP_WATER    = 1 << 15;
const GROUND_EFFECT_FLAG_LAND_ON_NORMAL_GROUND = 1 << 16;
const GROUND_EFFECT_FLAG_SHORT_GRASS           = 1 << 17;
const GROUND_EFFECT_FLAG_HOT_SPRINGS           = 1 << 18;
const GROUND_EFFECT_FLAG_SEAWEED               = 1 << 19;

// 1:1 décomp `enum` REFL_TYPE_* (include/event_object_movement.h:45-48).
const REFL_TYPE_NONE  = 0;
const REFL_TYPE_ICE   = 1;
const REFL_TYPE_WATER = 2;

// 1:1 décomp `TRACKS_*` (object_event_graphics_info → tracks field).
const TRACKS_NONE      = 0;
const TRACKS_FOOT      = 1;
const TRACKS_BIKE_TIRE = 2;

// 1:1 décomp `sElevationToPriority` / `sElevationToSubspriteTableNum`
// (event_object_movement.c:7729-7735).
const sElevationToPriority           = [2, 2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0, 2];
const sElevationToSubspriteTableNum  = [1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 0, 1];
// 1:1 décomp `sElevationToSubpriority` (event_object_movement.c:7725).
const sElevationToSubpriority        = [115, 115, 83, 115, 83, 115, 83, 115, 83, 115, 83, 115, 83, 0, 0, 115];

/** 1:1 décomp `SetObjectSubpriorityByElevation` (event_object_movement.c:7773). Calcule la
 *  subpriority d'un sprite depuis son Y ÉCRAN (= tri ASC, lower = devant). La décomp ajoute
 *  `gSpriteCoordOffsetY` car TOUS ses sprites overworld sont world-positionnés ; chez nous
 *  c'est opt-in (coordOffsetEnabled) → on n'ajoute l'offset QUE pour les sprites world (grass)
 *  ; les NPCs screen-positionnés ont déjà leur Y écran. */
export function SetObjectSubpriorityByElevation(rt: DecompRuntime, elevation: number, sprite: DecompSprite, subpriority: number): void {
  const offY = sprite.coordOffsetEnabled ? rt.gSpriteCoordOffsetY : 0;
  const tmp2 = (sprite.y - sprite.centerToCornerVecY) + offY;
  const tmp3 = (16 - (((tmp2 + 8) & 0xFF) >> 4)) * 2;
  sprite.subpriority = (tmp3 + (sElevationToSubpriority[elevation] ?? 115) + subpriority) & 0xFF;
}

/** 1:1 décomp `ObjectEventUpdateSubpriority` (event_object_movement.c:7783). Pose la
 *  subpriority Y-based du sprite NPC (appelé en fin de UpdateObjectEventCurrentMovement).
 *  Sans ça nos NPCs restaient à 255 fixe → tout le z-order grass/effets cassé. */
export function ObjectEventUpdateSubpriority(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  if (npc.fixedPriority) return;
  if (!sprite) return;
  SetObjectSubpriorityByElevation(rt, npc.previousElevation, sprite, 1);
}

// `UpdateGrassFieldEffectSubpriority` (field_effect_helpers.c:1662) relocalisé au miroir
// game/field_effect_helpers.ts (= son .c). Appelé par Update{Tall,Long,Short}GrassFieldEffect.

/** 1:1 décomp `u8 ElevationToPriority(u8 elevation)` (event_object_movement.c:7754). */
export function ElevationToPriority(elevation: number): number {
  return sElevationToPriority[elevation] ?? 2;
}

/** 1:1 décomp `void ObjectEventUpdateElevation(struct ObjectEvent *)`
 *  (event_object_movement.c:7759). Recalcule current/previousElevation depuis la
 *  grille. ELEVATION_TRANSITION (0) = ne MAJ pas previousElevation. */
export function ObjectEventUpdateElevation(npc: ObjectEvent): void {
  const curElevation = MapGridGetElevationAt(npc.currentCoordsX, npc.currentCoordsY);
  const prevElevation = MapGridGetElevationAt(npc.previousCoordsX, npc.previousCoordsY);
  if (curElevation === ELEVATION_MULTI_LEVEL || prevElevation === ELEVATION_MULTI_LEVEL) return;
  npc.currentElevation = curElevation;
  if (curElevation !== ELEVATION_TRANSITION && curElevation !== ELEVATION_MULTI_LEVEL)
    npc.previousElevation = curElevation;
}

/** 1:1 décomp `UpdateObjectEventElevationAndPriority` (event_object_movement.c:7737).
 *  Assigne sprite->oam.priority + subspriteTableNum selon previousElevation.
 *  Note : notre renderer indexe les subsprites par SetSubspriteTables (fixe) +
 *  subspriteMode, pas par subspriteTableNum → l'assignation subspriteTableNum est
 *  structurelle/inerte pour les NPCs non-split (élévation 0/3 → table 1). La
 *  priority OAM (rt.gba.oam[...]) est la valeur effective. */
function UpdateObjectEventElevationAndPriority(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  if (npc.fixedPriority) return;
  ObjectEventUpdateElevation(npc);
  if (sprite) {
    sprite.subspriteTableNum = sElevationToSubspriteTableNum[npc.previousElevation];
    if (sprite.oamIndex >= 0) rt.gba.oam[sprite.oamIndex].priority = sElevationToPriority[npc.previousElevation];
  }
}

/** 1:1 décomp `SetObjectEventSpriteOamTableForLongGrass` (event_object_movement.c:7690). */
function SetObjectEventSpriteOamTableForLongGrass(npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  if (npc.disableCoveringGroundEffects) return;
  if (!MetatileBehavior_IsLongGrass(npc.currentMetatileBehavior)) return;
  if (!MetatileBehavior_IsLongGrass(npc.previousMetatileBehavior)) return;
  if (!sprite) return;
  sprite.subspriteTableNum = 4;
  if (ElevationToPriority(npc.previousElevation) === 1) sprite.subspriteTableNum = 5;
}

/** 1:1 décomp `u8 GetReflectionTypeByMetatileBehavior(u32)` (event_object_movement.c:7654). */
function GetReflectionTypeByMetatileBehavior(behavior: number): number {
  if (MetatileBehavior_IsIce(behavior)) return REFL_TYPE_ICE;
  else if (MetatileBehavior_IsReflective(behavior)) return REFL_TYPE_WATER;
  else return REFL_TYPE_NONE;
}

// Métadonnées graphiques (width/height/tracks) SANS construire la pic-table.
// `GetObjectEventGraphicsInfo(graphicsId, ...pics)` (défini en bas de ce fichier ;
// factories dans data/object_events/object_event_graphics_info.ts)
// construit eagerly les images (= subarray sur les buffers PNG) ; l'appeler sans
// buffers crashe (`ptr.subarray` sur undefined). width/height/tracks sont des
// littéraux indépendants des pics → on passe des buffers VIDES (subarray no-op) et
// on mémoïse par graphicsId. Le spine ground-effect ne consomme QUE width/height
// (scan reflets) + tracks (footprints), jamais les images.
export interface GfxMeta {
  width: number; height: number; tracks: number;
  paletteSlot: number; paletteTag: number; reflectionPaletteTag: number;
  disableReflectionPaletteLoad: 0 | 1;
  shadowSize: number;  // 1:1 décomp `shadowSize:2` (0..3, SHADOW_SIZE_S/M/L/XL) — pour FldEff_Shadow.
}
const _gfxMetaCache = new Map<string, GfxMeta>();
const _gfxMetaEmptyPic = new Uint8Array(0);
// Le slot object-event du joueur stocke un graphicsId court ('Brendan'/'May', cf.
// InitPlayerAvatar) qui n'est PAS une clé du registre graphics-info. Pour le spine
// ground-effect (reflet : paletteSlot=PLAYER + height 32), on l'aliase vers la vraie
// fiche overworld du joueur (= OBJ_EVENT_GFX_BRENDAN/MAY_NORMAL, ce que le slot 0 décomp
// porte). Les autres états (vélo/surf) = chantier graphics-id séparé (pas aliasés ici).
const _playerGfxAlias: Readonly<Record<string, string>> = {
  Brendan: 'OBJ_EVENT_GFX_BRENDAN_NORMAL',
  May: 'OBJ_EVENT_GFX_MAY_NORMAL',
};
export function _getGfxMeta(graphicsIdRaw: string): GfxMeta {
  const graphicsId = _playerGfxAlias[graphicsIdRaw] ?? graphicsIdRaw;
  let m = _gfxMetaCache.get(graphicsId);
  if (m) return m;
  // défaut si la factory exige des pics réels (= métadonnées indispo).
  m = {
    width: 16, height: 16, tracks: TRACKS_NONE,
    paletteSlot: PALSLOT_NPC_1, paletteTag: OBJ_EVENT_PAL_TAG_NONE,
    reflectionPaletteTag: OBJ_EVENT_PAL_TAG_NONE, disableReflectionPaletteLoad: 0,
    shadowSize: 1,  // SHADOW_SIZE_M (défaut décomp).
  };
  try {
    const info = GetObjectEventGraphicsInfo(graphicsId, _gfxMetaEmptyPic, _gfxMetaEmptyPic, _gfxMetaEmptyPic, _gfxMetaEmptyPic);
    if (info) m = {
      width: info.width, height: info.height, tracks: info.tracks,
      paletteSlot: info.paletteSlot, paletteTag: info.paletteTag,
      reflectionPaletteTag: info.reflectionPaletteTag,
      disableReflectionPaletteLoad: info.disableReflectionPaletteLoad,
      shadowSize: info.shadowSize ?? 1,
    };
  } catch {
    // métadonnées indispo (factory non-purement-littérale) → défauts ci-dessus.
  }
  _gfxMetaCache.set(graphicsId, m);
  return m;
}

/** 1:1 décomp `u8 ObjectEventGetNearbyReflectionType(struct ObjectEvent *)`
 *  (event_object_movement.c:7625). Scanne les tuiles sous l'objet (sa largeur)
 *  pour trouver de l'eau/glace réfléchissante. */
function ObjectEventGetNearbyReflectionType(npc: ObjectEvent): number {
  const info = _getGfxMeta(npc.graphicsId);
  const w = info.width;
  const h = info.height;
  const width = (w + 8) >> 4;   // ceil div par tile width
  const height = (h + 8) >> 4;
  const one = 1;
  const at = (x: number, y: number) => GetReflectionTypeByMetatileBehavior(MapGridGetMetatileBehaviorAt(x, y));
  for (let i = 0; i < height; i++) {
    let r = at(npc.currentCoordsX, npc.currentCoordsY + one + i);
    if (r !== REFL_TYPE_NONE) return r;
    r = at(npc.previousCoordsX, npc.previousCoordsY + one + i);
    if (r !== REFL_TYPE_NONE) return r;
    for (let j = 1; j < width; j++) {
      r = at(npc.currentCoordsX + j, npc.currentCoordsY + one + i); if (r !== REFL_TYPE_NONE) return r;
      r = at(npc.currentCoordsX - j, npc.currentCoordsY + one + i); if (r !== REFL_TYPE_NONE) return r;
      r = at(npc.previousCoordsX + j, npc.previousCoordsY + one + i); if (r !== REFL_TYPE_NONE) return r;
      r = at(npc.previousCoordsX - j, npc.previousCoordsY + one + i); if (r !== REFL_TYPE_NONE) return r;
    }
  }
  return REFL_TYPE_NONE;
}

// ─── Calcul des flags (1:1 décomp GetGroundEffectFlags_*, :7434-7617) ──────────
// Variante return-based (≡ décomp `u32 *flags` : chaque fonction retourne les bits
// à OR, + mute l'état npc pour les "once" stateful (Reflection/SandHeap/…)).

function GetGroundEffectFlags_Reflection(npc: ObjectEvent): number {
  const reflectionFlags = [GROUND_EFFECT_FLAG_ICE_REFLECTION, GROUND_EFFECT_FLAG_WATER_REFLECTION]; // [ICE-1], [WATER-1]
  const reflType = ObjectEventGetNearbyReflectionType(npc);
  if (reflType) {
    if (!npc.hasReflection) {           // décomp : hasReflection == 0
      npc.hasReflection = true;         // hasReflection++
      return reflectionFlags[reflType - 1];
    }
    return 0;
  }
  npc.hasReflection = false;
  return 0;
}

function GetGroundEffectFlags_TallGrassOnSpawn(npc: ObjectEvent): number {
  return MetatileBehavior_IsTallGrass(npc.currentMetatileBehavior) ? GROUND_EFFECT_FLAG_TALL_GRASS_ON_SPAWN : 0;
}
function GetGroundEffectFlags_TallGrassOnBeginStep(npc: ObjectEvent): number {
  return MetatileBehavior_IsTallGrass(npc.currentMetatileBehavior) ? GROUND_EFFECT_FLAG_TALL_GRASS_ON_MOVE : 0;
}
function GetGroundEffectFlags_LongGrassOnSpawn(npc: ObjectEvent): number {
  return MetatileBehavior_IsLongGrass(npc.currentMetatileBehavior) ? GROUND_EFFECT_FLAG_LONG_GRASS_ON_SPAWN : 0;
}
function GetGroundEffectFlags_LongGrassOnBeginStep(npc: ObjectEvent): number {
  return MetatileBehavior_IsLongGrass(npc.currentMetatileBehavior) ? GROUND_EFFECT_FLAG_LONG_GRASS_ON_MOVE : 0;
}

function GetGroundEffectFlags_Tracks(npc: ObjectEvent): number {
  if (MetatileBehavior_IsDeepSand(npc.previousMetatileBehavior))
    return GROUND_EFFECT_FLAG_DEEP_SAND;
  else if (MetatileBehavior_IsSandOrDeepSand(npc.previousMetatileBehavior)
           || MetatileBehavior_IsFootprints(npc.previousMetatileBehavior))
    return GROUND_EFFECT_FLAG_SAND;
  return 0;
}

function GetGroundEffectFlags_SandHeap(npc: ObjectEvent): number {
  if (MetatileBehavior_IsDeepSand(npc.currentMetatileBehavior)
      && MetatileBehavior_IsDeepSand(npc.previousMetatileBehavior)) {
    if (!npc.inSandPile) {
      npc.inSandPile = true;
      return GROUND_EFFECT_FLAG_SAND_PILE;
    }
    return 0;
  }
  npc.inSandPile = false;
  return 0;
}

function GetGroundEffectFlags_ShallowFlowingWater(npc: ObjectEvent): number {
  if ((MetatileBehavior_IsShallowFlowingWater(npc.currentMetatileBehavior)
       && MetatileBehavior_IsShallowFlowingWater(npc.previousMetatileBehavior))
      || (MetatileBehavior_IsPacifidlogLog(npc.currentMetatileBehavior)
          && MetatileBehavior_IsPacifidlogLog(npc.previousMetatileBehavior))) {
    if (!npc.inShallowFlowingWater) {
      npc.inShallowFlowingWater = true;
      return GROUND_EFFECT_FLAG_SHALLOW_FLOWING_WATER;
    }
    return 0;
  }
  npc.inShallowFlowingWater = false;
  return 0;
}

function GetGroundEffectFlags_Puddle(npc: ObjectEvent): number {
  return (MetatileBehavior_IsPuddle(npc.currentMetatileBehavior)
          && MetatileBehavior_IsPuddle(npc.previousMetatileBehavior)) ? GROUND_EFFECT_FLAG_PUDDLE : 0;
}

function GetGroundEffectFlags_Ripple(npc: ObjectEvent): number {
  return MetatileBehavior_HasRipples(npc.currentMetatileBehavior) ? GROUND_EFFECT_FLAG_RIPPLES : 0;
}

function GetGroundEffectFlags_ShortGrass(npc: ObjectEvent): number {
  if (MetatileBehavior_IsShortGrass(npc.currentMetatileBehavior)
      && MetatileBehavior_IsShortGrass(npc.previousMetatileBehavior)) {
    if (!npc.inShortGrass) {
      npc.inShortGrass = true;
      return GROUND_EFFECT_FLAG_SHORT_GRASS;
    }
    return 0;
  }
  npc.inShortGrass = false;
  return 0;
}

function GetGroundEffectFlags_HotSprings(npc: ObjectEvent): number {
  if (MetatileBehavior_IsHotSprings(npc.currentMetatileBehavior)
      && MetatileBehavior_IsHotSprings(npc.previousMetatileBehavior)) {
    if (!npc.inHotSprings) {
      npc.inHotSprings = true;
      return GROUND_EFFECT_FLAG_HOT_SPRINGS;
    }
    return 0;
  }
  npc.inHotSprings = false;
  return 0;
}

function GetGroundEffectFlags_Seaweed(npc: ObjectEvent): number {
  return MetatileBehavior_IsSeaweed(npc.currentMetatileBehavior) ? GROUND_EFFECT_FLAG_SEAWEED : 0;
}

function GetGroundEffectFlags_JumpLanding(npc: ObjectEvent): number {
  if (npc.landingJump && !npc.disableJumpLandingGroundEffect) {
    const metatileFuncs = [
      MetatileBehavior_IsTallGrass,
      MetatileBehavior_IsLongGrass,
      MetatileBehavior_IsPuddle,
      MetatileBehavior_IsSurfableWaterOrUnderwater,
      MetatileBehavior_IsShallowFlowingWater,
      MetatileBehavior_IsATile,
    ];
    const jumpLandingFlags = [
      GROUND_EFFECT_FLAG_LAND_IN_TALL_GRASS,
      GROUND_EFFECT_FLAG_LAND_IN_LONG_GRASS,
      GROUND_EFFECT_FLAG_LAND_IN_SHALLOW_WATER,
      GROUND_EFFECT_FLAG_LAND_IN_DEEP_WATER,
      GROUND_EFFECT_FLAG_LAND_IN_SHALLOW_WATER,
      GROUND_EFFECT_FLAG_LAND_ON_NORMAL_GROUND,
    ];
    for (let i = 0; i < metatileFuncs.length; i++) {
      if (metatileFuncs[i](npc.currentMetatileBehavior)) return jumpLandingFlags[i];
    }
  }
  return 0;
}

function GetAllGroundEffectFlags_OnSpawn(npc: ObjectEvent): number {
  ObjectEventUpdateMetatileBehaviors(npc);
  let flags = 0;
  flags |= GetGroundEffectFlags_Reflection(npc);
  flags |= GetGroundEffectFlags_TallGrassOnSpawn(npc);
  flags |= GetGroundEffectFlags_LongGrassOnSpawn(npc);
  flags |= GetGroundEffectFlags_SandHeap(npc);
  flags |= GetGroundEffectFlags_ShallowFlowingWater(npc);
  flags |= GetGroundEffectFlags_ShortGrass(npc);
  flags |= GetGroundEffectFlags_HotSprings(npc);
  return flags;
}

function GetAllGroundEffectFlags_OnBeginStep(npc: ObjectEvent): number {
  ObjectEventUpdateMetatileBehaviors(npc);
  let flags = 0;
  flags |= GetGroundEffectFlags_Reflection(npc);
  flags |= GetGroundEffectFlags_TallGrassOnBeginStep(npc);
  flags |= GetGroundEffectFlags_LongGrassOnBeginStep(npc);
  flags |= GetGroundEffectFlags_Tracks(npc);
  flags |= GetGroundEffectFlags_SandHeap(npc);
  flags |= GetGroundEffectFlags_ShallowFlowingWater(npc);
  flags |= GetGroundEffectFlags_Puddle(npc);
  flags |= GetGroundEffectFlags_ShortGrass(npc);
  flags |= GetGroundEffectFlags_HotSprings(npc);
  return flags;
}

function GetAllGroundEffectFlags_OnFinishStep(npc: ObjectEvent): number {
  ObjectEventUpdateMetatileBehaviors(npc);
  let flags = 0;
  flags |= GetGroundEffectFlags_ShallowFlowingWater(npc);
  flags |= GetGroundEffectFlags_SandHeap(npc);
  flags |= GetGroundEffectFlags_Puddle(npc);
  flags |= GetGroundEffectFlags_Ripple(npc);
  flags |= GetGroundEffectFlags_ShortGrass(npc);
  flags |= GetGroundEffectFlags_HotSprings(npc);
  flags |= GetGroundEffectFlags_Seaweed(npc);
  flags |= GetGroundEffectFlags_JumpLanding(npc);
  return flags;
}

// ─── StartFieldEffectForObjectEvent (1:1 event_object_movement.c:8764) ─────────
/** 1:1 décomp : ObjectEventGetLocalIdAndMap → gFieldEffectArguments[0..2], puis
 *  FieldEffectStart(id). */
export function StartFieldEffectForObjectEvent(fieldEffectId: number, npc: ObjectEvent): number {
  gFieldEffectArguments[0] = npc.localId;
  gFieldEffectArguments[1] = npc.mapNum;
  gFieldEffectArguments[2] = npc.mapGroup;
  return FieldEffectStart(fieldEffectId);
}

/** 1:1 décomp `DoShadowFieldEffect(objectEvent)` (event_object_movement.c:8770). Appelé au
 *  DÉBUT d'un saut (InitJumpRegular/InitAcroWheelieJump) : spawn l'ombre de saut une fois
 *  (gardé par hasShadow), despawn à l'atterrissage (hasShadow=FALSE → UpdateShadowFieldEffect). */
export function DoShadowFieldEffect(npc: ObjectEvent): void {
  if (!npc.hasShadow) {
    npc.hasShadow = true;
    StartFieldEffectForObjectEvent(FLDEFF_SHADOW, npc);
  }
}

/** Sprite visuel d'un object event. 1:1 décomp = &gSprites[objectEvent->spriteId], MAIS
 *  chez nous le slot player (spriteId=-1) porte son sprite sur gPlayerAvatar.spriteId →
 *  résoudre via lui. Utilisé par les effets liés au parent (reflets, short grass). */
export function GetObjectEventMainSpriteId(npc: ObjectEvent): number {
  return npc && npc.isPlayer ? gPlayerAvatar.spriteId : (npc ? npc.spriteId : -1);
}

/** Hauteur (pixels) du graphics d'un object event, sans crasher (buffers vides mémoïsés). */
export function GetObjectEventGfxHeight(graphicsId: string): number {
  return _getGfxMeta(graphicsId).height;
}

// 1:1 décomp : args[6] = current map ((mapNum<<8)|mapGroup). Notre port web simplifie
// l'identité de map dans gSaveBlock1Ptr.location à mapNum/mapGroup=0 (load_save.ts).
function _currentMapLocationArg(): number {
  const loc = gSaveBlock1Ptr.location;
  return loc ? (((loc.mapNum & 0xFF) << 8) | (loc.mapGroup & 0xFF)) : 0;
}

function _oamPriority(rt: DecompRuntime, sprite: DecompSprite | undefined): number {
  return sprite && sprite.oamIndex >= 0 ? (rt.gba.oam[sprite.oamIndex].priority ?? 2) : 2;
}

// ─── Reflets (1:1 field_effect_helpers.c:47-163) ───────────────────────────────
// GÉOMÉTRIE portée 1:1 : sprite miroir (createCopySpriteAt) vflippé sous l'objet,
// mis à jour chaque frame par UpdateObjectReflectionSprite (= sprite.callback, tourne
// via runSpriteCallbacks dans l'overworld). Déclenché par le spine ground-effect
// (GroundEffect_Water/IceReflection ← hasReflection posé par GetGroundEffectFlags_Reflection).
//
// PALETTE TEINTÉE — adaptation 1:1 du mismatch d'archi :
//   Décomp : `InitObjectEventPalettes(reflType)` RÉSERVE 10 slots OBJ fixes (0-9) au map
//   init et y précharge brendan/npc_1..4 + leurs reflets (gObjectEventPal_*Reflection,
//   = .pal bleutés pré-construits). `SetUpReflection` pose alors
//   reflectionSprite->oam.paletteNum = gReflectionEffectPaletteMap[mainSlot] (= le slot
//   reflet réservé), et `LoadObjectReflectionPalette` ne RE-patche ce slot QUE pour le
//   joueur / NPC spéciaux / ponts hauts (reflectionPaletteTag != NONE) ; un NPC régulier
//   (reflectionPaletteTag == NONE) garde la palette npc_X_reflection DÉJÀ préchargée.
//   Nous : pas de slots réservés — alloc dynamique par tag. On modélise « le contenu du
//   slot reflet réservé » en chargeant explicitement la BONNE palette reflet (générique
//   npc_X_reflection / brendan_reflection / spéciale) via `LoadSpritePalette({data,tag})`
//   → bank dynamique, posée sur l'OAM du reflet. C'est exactement ce que la pré-réservation
//   décomp aurait mis dans le slot. Les .pal reflet sont préchargés (PreloadReflectionPalettes).
// sCurrentReflectionType (0-3) est VESTIGIAL en Émeraude (les 4 colonnes de chaque
//   PairedPalettes sont identiques + sObjectPaletteTags0..3 identiques) → on aplatit en
//   un map tag→reflTag (= colonne 0), 1:1 avec les données.
// DETTE ondulation eau (!stillReflection) : la décomp passe en affineMode NORMAL + matrice
//   ripple (oam.matrixNum 0/1) ; ici vflip simple (pas de wobble) tant que les matrices
//   affine ripple ne sont pas posées.

// `bridgeReflectionVerticalOffsets[]` (field_effect_helpers.c:78) relocalisé au miroir
// game/field_effect_helpers.ts (étape 2 — c'est une local de LoadObjectReflectionPalette).

/** 1:1 décomp `sPlayerReflectionPaletteSets[]` (event_object_movement.c:546) aplati
 *  (colonne sCurrentReflectionType, identique sur les 4). tag joueur → tag reflet. */
const sPlayerReflectionPaletteSets: ReadonlyArray<readonly [number, number]> = [
  [OBJ_EVENT_PAL_TAG_BRENDAN, OBJ_EVENT_PAL_TAG_BRENDAN_REFLECTION],
  [OBJ_EVENT_PAL_TAG_MAY, OBJ_EVENT_PAL_TAG_MAY_REFLECTION],
  [OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER, OBJ_EVENT_PAL_TAG_PLAYER_UNDERWATER],
];

/** 1:1 décomp `sSpecialObjectReflectionPaletteSets[]` (event_object_movement.c:630)
 *  aplati. tag spécial → tag reflet (certains reflètent leur PROPRE palette = pas de tint). */
const sSpecialObjectReflectionPaletteSets: ReadonlyArray<readonly [number, number]> = [
  [OBJ_EVENT_PAL_TAG_BRENDAN, OBJ_EVENT_PAL_TAG_BRENDAN_REFLECTION],
  [OBJ_EVENT_PAL_TAG_MAY, OBJ_EVENT_PAL_TAG_MAY_REFLECTION],
  [OBJ_EVENT_PAL_TAG_QUINTY_PLUMP, OBJ_EVENT_PAL_TAG_QUINTY_PLUMP_REFLECTION],
  [OBJ_EVENT_PAL_TAG_TRUCK, OBJ_EVENT_PAL_TAG_TRUCK],
  [OBJ_EVENT_PAL_TAG_VIGOROTH, OBJ_EVENT_PAL_TAG_VIGOROTH],
  [OBJ_EVENT_PAL_TAG_MOVING_BOX, OBJ_EVENT_PAL_TAG_MOVING_BOX],
  [OBJ_EVENT_PAL_TAG_CABLE_CAR, OBJ_EVENT_PAL_TAG_CABLE_CAR],
  [OBJ_EVENT_PAL_TAG_SSTIDAL, OBJ_EVENT_PAL_TAG_SSTIDAL],
  [OBJ_EVENT_PAL_TAG_KYOGRE, OBJ_EVENT_PAL_TAG_KYOGRE_REFLECTION],
  [OBJ_EVENT_PAL_TAG_GROUDON, OBJ_EVENT_PAL_TAG_GROUDON_REFLECTION],
  [OBJ_EVENT_PAL_TAG_NPC_3, OBJ_EVENT_PAL_TAG_NPC_3_REFLECTION], // pont Route 120 Kecleon
  [OBJ_EVENT_PAL_TAG_SUBMARINE_SHADOW, OBJ_EVENT_PAL_TAG_SUBMARINE_SHADOW],
  [OBJ_EVENT_PAL_TAG_RED_LEAF, OBJ_EVENT_PAL_TAG_RED_LEAF],
];

/** Tag reflet générique pour un slot NPC régulier (= contenu du slot PALSLOT_NPC_X_
 *  REFLECTION préchargé par InitObjectEventPalettes via sObjectPaletteTagSets). */
export const _genericNpcReflectionTag: ReadonlyArray<number> = [
  0,                                  // PALSLOT_PLAYER (jamais générique)
  OBJ_EVENT_PAL_TAG_NPC_1_REFLECTION, // PALSLOT_NPC_1
  OBJ_EVENT_PAL_TAG_NPC_2_REFLECTION, // PALSLOT_NPC_2
  OBJ_EVENT_PAL_TAG_NPC_3_REFLECTION, // PALSLOT_NPC_3
  OBJ_EVENT_PAL_TAG_NPC_4_REFLECTION, // PALSLOT_NPC_4
];

/** Données .pal reflet préchargées (tag numérique → BGR555). Modélise les slots reflet
 *  réservés par `InitObjectEventPalettes` au map init. Source : .pal décomp pré-bleutés. */
const _reflectionPalData = new Map<number, Uint16Array>();
const _reflectionPalUrls: ReadonlyArray<readonly [number, string]> = [
  [OBJ_EVENT_PAL_TAG_NPC_1_REFLECTION, '/decomp/em/object_events/palettes/npc_1_reflection.pal'],
  [OBJ_EVENT_PAL_TAG_NPC_2_REFLECTION, '/decomp/em/object_events/palettes/npc_2_reflection.pal'],
  [OBJ_EVENT_PAL_TAG_NPC_3_REFLECTION, '/decomp/em/object_events/palettes/npc_3_reflection.pal'],
  [OBJ_EVENT_PAL_TAG_NPC_4_REFLECTION, '/decomp/em/object_events/palettes/npc_4_reflection.pal'],
  [OBJ_EVENT_PAL_TAG_BRENDAN_REFLECTION, '/decomp/em/object_events/palettes/brendan_reflection.pal'],
  [OBJ_EVENT_PAL_TAG_MAY_REFLECTION, '/decomp/em/object_events/palettes/may_reflection.pal'],
  [OBJ_EVENT_PAL_TAG_BRIDGE_REFLECTION, '/decomp/em/object_events/palettes/bridge_reflection.pal'],
  // Reflets teintés des objets spéciaux (sSpecialObjectReflectionPaletteSets). Préchargés
  // pour la complétude 1:1 (objets surf/dive/cable-car). Les autres entrées de la table (TRUCK/VIGOROTH/
  // CABLE_CAR/SSTIDAL/SUBMARINE/RED_LEAF) reflètent leur PROPRE palette (déjà chargée par le
  // main) → pas de .pal reflet dédié à précharger ; NPC_3_REFLECTION est déjà au-dessus.
  [OBJ_EVENT_PAL_TAG_QUINTY_PLUMP_REFLECTION, '/decomp/em/object_events/palettes/quinty_plump_reflection.pal'],
  [OBJ_EVENT_PAL_TAG_KYOGRE_REFLECTION, '/decomp/em/object_events/palettes/kyogre_reflection.pal'],
  [OBJ_EVENT_PAL_TAG_GROUDON_REFLECTION, '/decomp/em/object_events/palettes/groudon_reflection.pal'],
];

/** Précharge les .pal reflet dans `_reflectionPalData` (idempotent). Équivalent de
 *  `InitObjectEventPalettes` (event_object_movement.c:2532) : remplit « les slots reflet ».
 *  Appelé (awaité) au map init par SpawnObjectEventsOnMap, avant le spawn des NPCs. */
export async function PreloadReflectionPalettes(): Promise<void> {
  await Promise.all(_reflectionPalUrls.map(async ([tag, url]) => {
    if (_reflectionPalData.has(tag)) return;
    try { _reflectionPalData.set(tag, await loadGbaPal(url)); }
    catch (e) { console.warn(`[reflets] échec préchargement ${url}`, e); }
  }));
  // 1:1 décomp `InitObjectEventPalettes` (event_object_movement.c:2532) → `PatchObjectPaletteRange(
  // ..., PALSLOT_PLAYER, PALSLOT_NPC_4_REFLECTION + 1)` : pose les palettes reflet GÉNÉRIQUES dans
  // leurs slots OBJ FIXES réservés (player→1, npc_1..4→6-9, via gReflectionEffectPaletteMap).
  // `UpdateObjectReflectionSprite` pointe alors `oam.paletteNum = gReflectionEffectPaletteMap[mainSlot]`
  // dessus. SANS ce patch, les slots reflet restaient VIDES → les reflets retombaient sur une
  // alloc dynamique [12,16) (slots field-effect/météo) → mauvaise couleur (bug « 3 reflets, 3
  // couleurs » sur maps à eau). Le slot 1 défaut brendan_reflection est re-patché au gender au
  // spawn joueur (LoadPlayerObjectReflectionPalette), 1:1 sObjectPaletteTags0.
  const _reflectionSlotPatches: ReadonlyArray<readonly [number, number]> = [
    [gReflectionEffectPaletteMap[PALSLOT_PLAYER], OBJ_EVENT_PAL_TAG_BRENDAN_REFLECTION], // slot 1
    [gReflectionEffectPaletteMap[PALSLOT_NPC_1],  OBJ_EVENT_PAL_TAG_NPC_1_REFLECTION],   // slot 6
    [gReflectionEffectPaletteMap[PALSLOT_NPC_2],  OBJ_EVENT_PAL_TAG_NPC_2_REFLECTION],   // slot 7
    [gReflectionEffectPaletteMap[PALSLOT_NPC_3],  OBJ_EVENT_PAL_TAG_NPC_3_REFLECTION],   // slot 8
    [gReflectionEffectPaletteMap[PALSLOT_NPC_4],  OBJ_EVENT_PAL_TAG_NPC_4_REFLECTION],   // slot 9
  ];
  for (const [slot, tag] of _reflectionSlotPatches) {
    const data = _reflectionPalData.get(tag);
    if (data) PatchObjectEventPalette(data, slot, tag);
  }
}

/** 1:1 décomp `PatchObjectPalette(paletteTag, paletteSlot)` (event_object_movement.c:2043) —
 *  charge une palette object-event dans son slot OBJ FIXE via LoadPalette (buffers unfaded+
 *  faded). Les objets occupent les slots [0, OBJ_PALSLOT_COUNT) ; combiné à
 *  `FreeAndReserveObjectSpritePalettes` (gReservedSpritePaletteCount=12), ça isole [12,16) pour
 *  la météo / field effects / UI — TIMING-PROOF (les objets n'utilisent JAMAIS AllocSpritePalette
 *  → la météo dans [12,16) n'est jamais clobbée, même si le spawn charge en async). Renvoie le slot. */
export function PatchObjectEventPalette(palData: Uint16Array, paletteSlot: number, markTag: number): number {
  LoadPalette(palData, OBJ_PLTT_ID(paletteSlot), 32); // PLTT_SIZE_4BPP = 16 couleurs × 2 octets
  // MARQUE le slot (sSpritePaletteTags) → AllocSpritePalette (météo / field effects) le SKIP.
  // C'est ce qui rend la météo timing-proof : les object events occupent des slots OBJ fixes
  // MARQUÉS [0,11], la météo alloue dynamiquement un slot LIBRE (haut) que les objets (fixed,
  // ne passant pas par AllocSpritePalette) ne reprendront jamais — même si le spawn est async.
  sSpritePaletteTags[paletteSlot] = markTag & 0xFFFF;
  return paletteSlot;
}

/** 1:1 décomp `FreeAndReserveObjectSpritePalettes()` (event_object_movement.c:2008) : libère
 *  tous les slots palette OBJ + réserve [0, OBJ_PALSLOT_COUNT) pour les object events (slots
 *  fixes). AllocSpritePalette (météo, field effects) n'alloue alors plus que dans [12,16).
 *  À appeler au map load AVANT le spawn des object events. */
export function FreeAndReserveObjectSpritePalettes(): void {
  FreeAllSpritePalettes();
  setReservedSpritePaletteCount(OBJ_PALSLOT_COUNT);
}

/** 1:1 décomp `PatchObjectPalette(reflTag, slot)` côté reflet : patche le .pal reflet préchargé
 *  dans son slot OBJ FIXE réservé (gReflectionEffectPaletteMap[mainSlot]) via PatchObjectEventPalette.
 *  Remplace l'ancienne alloc dynamique [12,16) (Change C — dette `_loadReflectionPaletteByTag` soldée). */
export function _patchReflectionPaletteToSlot(reflTag: number, slot: number): void {
  if (!reflTag || reflTag === OBJ_EVENT_PAL_TAG_NONE) return;
  const data = _reflectionPalData.get(reflTag);
  if (data) PatchObjectEventPalette(data, slot, reflTag);
}

/** 1:1 décomp `LoadPlayerObjectReflectionPalette(tag, slot)` (event_object_movement.c:2073).
 *  PUBLIQUE. Cherche le tag reflet teinté du joueur (gender-correct : brendan/may_reflection)
 *  dans `sPlayerReflectionPaletteSets` et le patche dans le slot reflet FIXE `slot`. */
export function LoadPlayerObjectReflectionPalette(tag: number, slot: number): void {
  let reflTag = 0;
  for (const [t, rt] of sPlayerReflectionPaletteSets) if (t === tag) { reflTag = rt; break; }
  _patchReflectionPaletteToSlot(reflTag, slot);
}

/** 1:1 décomp `LoadSpecialObjectReflectionPalette(tag, slot)` (event_object_movement.c:2088).
 *  PUBLIQUE. Idem pour les objets spéciaux (`sSpecialObjectReflectionPaletteSets` ; certains
 *  reflètent leur propre palette = pas de tint) → patche le slot reflet FIXE `slot`. */
export function LoadSpecialObjectReflectionPalette(tag: number, slot: number): void {
  let reflTag = 0;
  for (const [t, rt] of sSpecialObjectReflectionPaletteSets) if (t === tag) { reflTag = rt; break; }
  _patchReflectionPaletteToSlot(reflTag, slot);
}

// ─── Reflection distortion = petites vagues (1:1 CreateReflectionEffectSprites) ────
// event_object_movement.c:1207 `CreateReflectionEffectSprites` crée 2 sprites INVISIBLES
// (FLDEFFOBJ_REFLECTION_DISTORTION) dont les affine-anims pilotent en continu les matrices
// OAM 0 et 1. Les reflets EAU (!stillReflection) passent en affineMode NORMAL + matrixNum
// 0/1 (UpdateObjectReflectionSprite) → ils sont transformés par ces matrices animées =
// l'ondulation horizontale (« petites vagues »). On porte un moteur affine-anim FOCALISÉ
// pour ces 2 matrices (réplique 1:1 ContinueAffineAnim/AffineAnimDelay/AffineAnimCmd_frame/
// _jump + ApplyAffineAnimFrame{Absolute,RelativeAndUpdateMatrix}, sprite.c:1067-1342) qui
// écrit gba.affineParams[0]/[1] via ObjAffineSet. Données : sAffineAnims_ReflectionDistortion
// (field_effect_objects.h:849-881).

type _ReflDistortFrame = { xScale: number; yScale: number; rotation: number; duration: number };
type _ReflDistortCmd = _ReflDistortFrame | { jump: number };
// Valeurs signées (0xFF00=-256, 0xFFFF=-1, 0x100=256, 0x1=1). cmd0 = ABSOLUTE (base
// vflip / hflip+vflip via rotation 180°), puis oscillation xScale ±4 (= le wobble), JUMP(1).
const _sAffineAnims_ReflectionDistortion: _ReflDistortCmd[][] = [
  [ // matrix 0 (pas de hflip → vflip seul)
    { xScale: -256, yScale: 256, rotation: -128, duration: 0 },
    { xScale: 1, yScale: 0, rotation: 0, duration: 4 },
    { xScale: 0, yScale: 0, rotation: 0, duration: 8 },
    { xScale: -1, yScale: 0, rotation: 0, duration: 4 },
    { xScale: 0, yScale: 0, rotation: 0, duration: 8 },
    { xScale: -1, yScale: 0, rotation: 0, duration: 4 },
    { xScale: 0, yScale: 0, rotation: 0, duration: 8 },
    { xScale: 1, yScale: 0, rotation: 0, duration: 4 },
    { xScale: 0, yScale: 0, rotation: 0, duration: 8 },
    { jump: 1 },
  ],
  [ // matrix 1 (hflip + vflip)
    { xScale: 256, yScale: 256, rotation: -128, duration: 0 },
    { xScale: -1, yScale: 0, rotation: 0, duration: 4 },
    { xScale: 0, yScale: 0, rotation: 0, duration: 8 },
    { xScale: 1, yScale: 0, rotation: 0, duration: 4 },
    { xScale: 0, yScale: 0, rotation: 0, duration: 8 },
    { xScale: 1, yScale: 0, rotation: 0, duration: 4 },
    { xScale: 0, yScale: 0, rotation: 0, duration: 8 },
    { xScale: -1, yScale: 0, rotation: 0, duration: 4 },
    { xScale: 0, yScale: 0, rotation: 0, duration: 8 },
    { jump: 1 },
  ],
];
interface _ReflDistortState { animCmdIndex: number; delayCounter: number; xScale: number; yScale: number; rotation: number; }
const _reflDistortState: _ReflDistortState[] = [
  { animCmdIndex: 0, delayCounter: 0, xScale: 0x100, yScale: 0x100, rotation: 0 },
  { animCmdIndex: 0, delayCounter: 0, xScale: 0x100, yScale: 0x100, rotation: 0 },
];
let _reflDistortInited = false;

const _s16 = (v: number): number => (v << 16) >> 16;
/** 1:1 décomp `ConvertScaleParam` (sprite.c:1316) : SAFE_DIV(0x10000, scale). */
function _convertScaleParam(scale: number): number {
  return scale === 0 ? 0 : _s16((0x10000 / scale) | 0);
}
/** 1:1 décomp `ApplyAffineAnimFrameAbsolute` (sprite.c:1282). */
function _reflDistortApplyAbsolute(m: number, f: _ReflDistortFrame): void {
  const st = _reflDistortState[m];
  st.xScale = _s16(f.xScale);
  st.yScale = _s16(f.yScale);
  st.rotation = _s16(f.rotation) << 8;
}
/** 1:1 décomp `ApplyAffineAnimFrameRelativeAndUpdateMatrix` (sprite.c:1302) : accumule
 *  scale/rotation, calcule la matrice via ObjAffineSet, l'écrit dans gba.affineParams[m]. */
function _reflDistortApplyRelative(rt: DecompRuntime, m: number, f: _ReflDistortFrame): void {
  const st = _reflDistortState[m];
  st.xScale = _s16(st.xScale + f.xScale);
  st.yScale = _s16(st.yScale + f.yScale);
  st.rotation = (st.rotation + (f.rotation << 8)) & ~0xFF;
  const matrix = { pa: 0, pb: 0, pc: 0, pd: 0 };
  ObjAffineSet({ xScale: _convertScaleParam(st.xScale), yScale: _convertScaleParam(st.yScale), rotation: st.rotation }, [matrix], 1, 2);
  SetOamMatrix(rt.gba, m, matrix.pa, matrix.pb, matrix.pc, matrix.pd);
}
const _DUMMY_FRAME: _ReflDistortFrame = { xScale: 0, yScale: 0, rotation: 0, duration: 0 };
/** 1:1 décomp `ApplyAffineAnimFrame` (sprite.c:1330) — renvoie le nouveau delayCounter
 *  (= frameCmd.duration décrémenté si > 0, comme la mutation décomp consommée ensuite). */
function _reflDistortApplyFrame(rt: DecompRuntime, m: number, f: _ReflDistortFrame): number {
  if (f.duration > 0) {
    _reflDistortApplyRelative(rt, m, f);
    return f.duration - 1;
  }
  _reflDistortApplyAbsolute(m, f);
  _reflDistortApplyRelative(rt, m, _DUMMY_FRAME);
  return 0;
}
/** 1:1 décomp `ContinueAffineAnim` (sprite.c:1084) pour la matrice m (FRAME + JUMP only). */
function _reflDistortTick(rt: DecompRuntime, m: number): void {
  const st = _reflDistortState[m];
  const anim = _sAffineAnims_ReflectionDistortion[m];
  if (st.delayCounter) {
    // AffineAnimDelay : décrémente puis applique les deltas du FRAME courant.
    st.delayCounter--;
    const cur = anim[st.animCmdIndex];
    if (!('jump' in cur)) _reflDistortApplyRelative(rt, m, cur);
  } else {
    st.animCmdIndex++;
    let cmd = anim[st.animCmdIndex];
    if ('jump' in cmd) {            // AffineAnimCmd_jump
      st.animCmdIndex = cmd.jump;
      cmd = anim[st.animCmdIndex];
    }
    if (!('jump' in cmd)) st.delayCounter = _reflDistortApplyFrame(rt, m, cmd);
  }
}

/** 1:1 décomp `CreateReflectionEffectSprites` (event_object_movement.c:1207). Démarre les 2
 *  affine-anims (matrices 0/1) à leur frame de base. Appelé au map init (ResetObjectEvents). */
export function InitReflectionDistortion(rt: DecompRuntime): void {
  for (let m = 0; m < 2; m++) {
    _reflDistortState[m] = { animCmdIndex: 0, delayCounter: 0, xScale: 0x100, yScale: 0x100, rotation: 0 };
    const cmd0 = _sAffineAnims_ReflectionDistortion[m][0];
    // BeginAffineAnim : process cmd0 (ABSOLUTE, duration 0).
    if (!('jump' in cmd0)) _reflDistortState[m].delayCounter = _reflDistortApplyFrame(rt, m, cmd0);
  }
  _reserveReflectionMatrices();  // 1:1 net : les 2 sprites-reflets décomp tiennent les matrices 0/1.
  _reflDistortInited = true;
}

/** 🩸 RÉSERVATION matrices 0/1 dans gOamMatrixAllocBitmap (fix moteur 2026-06-29).
 *  Dans la décomp, `CreateReflectionEffectSprites` crée 2 VRAIS sprites qui appellent
 *  `InitSpriteAffineAnim` → `AllocOamMatrix()` → leurs slots (0 et 1, alloc à l'init map)
 *  sont MARQUÉS dans le bitmap d'alloc → tout `AllocOamMatrix` ultérieur les SAUTE. Notre
 *  moteur focalisé (`_reflDistortTick`) écrit les slots 0/1 EN DIRECT sans passer par
 *  AllocOamMatrix → l'allocateur les croyait LIBRES → un sprite affine (ex. le cercle du
 *  starter_choose) obtenait le slot 1 et était écrasé par l'ondulation des reflets (= jitter
 *  ±1px "le rond s'étend à gauche/droite"). On réserve donc les 2 slots ICI (idempotent, par
 *  frame → survit à un ResetAffineAnimData qui remettrait le bitmap à 0 pendant que les
 *  reflets tournent) = l'effet net des 2 sprites-reflets décomp qui tiennent ces matrices. */
function _reserveReflectionMatrices(): void {
  const g = globalThis as Record<string, unknown>;
  g.gOamMatrixAllocBitmap = (((g.gOamMatrixAllocBitmap as number) ?? 0) | 0b11) >>> 0;
}

/** Tick par frame des 2 matrices de distorsion. À call dans la boucle overworld AVANT le
 *  rendu (les reflets eau lisent gba.affineParams[0]/[1] via leur affineParamIndex). */
export function UpdateReflectionDistortionMatrices(rt: DecompRuntime): void {
  if (!_reflDistortInited) InitReflectionDistortion(rt);
  _reserveReflectionMatrices();  // 1:1 net : matrices 0/1 possédées par les reflets.
  _reflDistortTick(rt, 0);
  _reflDistortTick(rt, 1);
}

// ─── Reflets : SetUpReflection + GetReflectionVerticalOffset + UpdateObjectReflectionSprite
//   RELOCALISÉS dans le miroir game/field_effect_helpers.ts (field_effect_helpers.c:47-163).
//   SetUpReflection est importé (cf. haut du fichier) et appelé par le spine GroundEffect_
//   Water/IceReflection ci-dessous. Les fonctions PALETTE (LoadObjectReflectionPalette + sets)
//   + la distorsion affine restent ici pour l'instant (étape 2 de la relocation). ──

// ─── DoRippleFieldEffect (1:1 event_object_movement.c:8779) ────────────────────
function DoRippleFieldEffect(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  if (!sprite) return;
  const h = _getGfxMeta(npc.graphicsId).height;
  // 1:1 décomp : args[0/1] = sprite->x, sprite->y + h/2 - 2 (coords MONDE de l'objet,
  // sprites overworld world-positionnés). Nos NPCs sont ÉCRAN-positionnés (coordOffset
  // Enabled=false) → convertir écran→monde (retirer gSpriteCoordOffset) pour que le ripple
  // (coordOffsetEnabled=TRUE) se pose au bon endroit et suive ensuite la caméra.
  const offX = sprite.coordOffsetEnabled ? 0 : rt.gSpriteCoordOffsetX;
  const offY = sprite.coordOffsetEnabled ? 0 : rt.gSpriteCoordOffsetY;
  gFieldEffectArguments[0] = sprite.x - offX;
  gFieldEffectArguments[1] = (sprite.y - offY) + (h >> 1) - 2;
  gFieldEffectArguments[2] = 151;  // subpriority
  gFieldEffectArguments[3] = 3;    // priority
  FieldEffectStart(FLDEFF_RIPPLE);
}

// ─── GroundEffect_* (1:1 event_object_movement.c:7802-8020) ────────────────────
function GroundEffect_SpawnOnTallGrass(npc: ObjectEvent, _sprite: DecompSprite | undefined): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = 2; // priority
  gFieldEffectArguments[4] = (npc.localId << 8) | npc.mapNum;
  gFieldEffectArguments[5] = npc.mapGroup;
  gFieldEffectArguments[6] = _currentMapLocationArg();
  gFieldEffectArguments[7] = 1; // skip to end of anim (spawn = statique)
  FieldEffectStart(FLDEFF_TALL_GRASS);
}

function GroundEffect_StepOnTallGrass(npc: ObjectEvent, _sprite: DecompSprite | undefined): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = 2;
  gFieldEffectArguments[4] = (npc.localId << 8) | npc.mapNum;
  gFieldEffectArguments[5] = npc.mapGroup;
  gFieldEffectArguments[6] = _currentMapLocationArg();
  gFieldEffectArguments[7] = 0; // don't skip (step = rustle)
  FieldEffectStart(FLDEFF_TALL_GRASS);
}

function GroundEffect_SpawnOnLongGrass(npc: ObjectEvent, _sprite: DecompSprite | undefined): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = 2;
  gFieldEffectArguments[4] = (npc.localId << 8) | npc.mapNum;
  gFieldEffectArguments[5] = npc.mapGroup;
  gFieldEffectArguments[6] = _currentMapLocationArg();
  gFieldEffectArguments[7] = 1;
  FieldEffectStart(FLDEFF_LONG_GRASS);
}

function GroundEffect_StepOnLongGrass(npc: ObjectEvent, _sprite: DecompSprite | undefined): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = 2;
  gFieldEffectArguments[4] = (npc.localId << 8) | npc.mapNum;
  gFieldEffectArguments[5] = npc.mapGroup;
  gFieldEffectArguments[6] = _currentMapLocationArg();
  gFieldEffectArguments[7] = 0;
  FieldEffectStart(FLDEFF_LONG_GRASS);
}

function GroundEffect_WaterReflection(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  SetUpReflection(rt, npc, sprite, false);
}
function GroundEffect_IceReflection(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  SetUpReflection(rt, npc, sprite, true);
}

function GroundEffect_FlowingWater(npc: ObjectEvent): void {
  StartFieldEffectForObjectEvent(FLDEFF_FEET_IN_FLOWING_WATER, npc);
}

// 1:1 décomp `sGroundEffectTracksFuncs[]` (event_object_movement.c:7869).
const sGroundEffectTracksFuncs: ((npc: ObjectEvent, sprite: DecompSprite | undefined, isDeepSand: boolean) => void)[] = [];

function GroundEffect_SandTracks(npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  const tracks = _getGfxMeta(npc.graphicsId).tracks;
  sGroundEffectTracksFuncs[tracks]?.(npc, sprite, false);
}
function GroundEffect_DeepSandTracks(npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  const tracks = _getGfxMeta(npc.graphicsId).tracks;
  sGroundEffectTracksFuncs[tracks]?.(npc, sprite, true);
}

function DoTracksGroundEffect_None(_npc: ObjectEvent, _sprite: DecompSprite | undefined, _isDeepSand: boolean): void {
}
function DoTracksGroundEffect_Footprints(npc: ObjectEvent, _sprite: DecompSprite | undefined, isDeepSand: boolean): void {
  const sandFootprints = [FLDEFF_SAND_FOOTPRINTS, FLDEFF_DEEP_SAND_FOOTPRINTS];
  gFieldEffectArguments[0] = npc.previousCoordsX;
  gFieldEffectArguments[1] = npc.previousCoordsY;
  gFieldEffectArguments[2] = 149;
  gFieldEffectArguments[3] = 2;
  gFieldEffectArguments[4] = npc.facingDirection;
  FieldEffectStart(sandFootprints[isDeepSand ? 1 : 0]);
}
function DoTracksGroundEffect_BikeTireTracks(npc: ObjectEvent, _sprite: DecompSprite | undefined, _isDeepSand: boolean): void {
  // 1:1 décomp : forme de trace selon transition (prevMoveDir → faceDir).
  const bikeTireTracks_Transitions = [
    [1, 2, 7, 8],
    [1, 2, 6, 5],
    [5, 8, 3, 4],
    [6, 7, 3, 4],
  ];
  if (npc.currentCoordsX !== npc.previousCoordsX || npc.currentCoordsY !== npc.previousCoordsY) {
    const row = bikeTireTracks_Transitions[npc.previousMovementDirection];
    gFieldEffectArguments[0] = npc.previousCoordsX;
    gFieldEffectArguments[1] = npc.previousCoordsY;
    gFieldEffectArguments[2] = 149;
    gFieldEffectArguments[3] = 2;
    gFieldEffectArguments[4] = row ? (row[npc.facingDirection - 5] ?? 0) : 0;
    FieldEffectStart(FLDEFF_BIKE_TIRE_TRACKS);
  }
}
sGroundEffectTracksFuncs[TRACKS_NONE]      = DoTracksGroundEffect_None;
sGroundEffectTracksFuncs[TRACKS_FOOT]      = DoTracksGroundEffect_Footprints;
sGroundEffectTracksFuncs[TRACKS_BIKE_TIRE] = DoTracksGroundEffect_BikeTireTracks;

function GroundEffect_Ripple(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  DoRippleFieldEffect(rt, npc, sprite);
}
function GroundEffect_StepOnPuddle(npc: ObjectEvent): void {
  StartFieldEffectForObjectEvent(FLDEFF_SPLASH, npc);
}
function GroundEffect_SandHeap(npc: ObjectEvent): void {
  StartFieldEffectForObjectEvent(FLDEFF_SAND_PILE, npc);
}

function GroundEffect_JumpOnTallGrass(npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = 2;
  FieldEffectStart(FLDEFF_JUMP_TALL_GRASS);
  // 1:1 décomp : si pas déjà d'overlay tall-grass actif sur la tuile, on en spawn un.
  // FindTallGrassFieldEffectSpriteId non porté (notre SpawnTallGrassEffect dédoublonne
  // déjà par tuile) → on lance le spawn statique, qui no-op si doublon.
  GroundEffect_SpawnOnTallGrass(npc, sprite);
}
function GroundEffect_JumpOnLongGrass(npc: ObjectEvent): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = 2;
  FieldEffectStart(FLDEFF_JUMP_LONG_GRASS);
}
function GroundEffect_JumpOnShallowWater(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = _oamPriority(rt, sprite);
  FieldEffectStart(FLDEFF_JUMP_SMALL_SPLASH);
}
function GroundEffect_JumpOnWater(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = _oamPriority(rt, sprite);
  FieldEffectStart(FLDEFF_JUMP_BIG_SPLASH);
}
function GroundEffect_JumpLandingDust(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  gFieldEffectArguments[2] = npc.previousElevation;
  gFieldEffectArguments[3] = _oamPriority(rt, sprite);
  FieldEffectStart(FLDEFF_DUST);
}
function GroundEffect_ShortGrass(npc: ObjectEvent): void {
  StartFieldEffectForObjectEvent(FLDEFF_SHORT_GRASS, npc);
}
function GroundEffect_HotSprings(npc: ObjectEvent): void {
  StartFieldEffectForObjectEvent(FLDEFF_HOT_SPRINGS_WATER, npc);
}
function GroundEffect_Seaweed(npc: ObjectEvent): void {
  gFieldEffectArguments[0] = npc.currentCoordsX;
  gFieldEffectArguments[1] = npc.currentCoordsY;
  FieldEffectStart(FLDEFF_BUBBLES);
}

// 1:1 décomp `sGroundEffectFuncs[]` (event_object_movement.c:8023). Indexé par le
// bit de flag. Signature unifiée (rt, npc, sprite) ; les wrappers ignorent ce dont
// ils n'ont pas besoin.
const sGroundEffectFuncs: ((rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined) => void)[] = [
  (_rt, npc, sprite) => GroundEffect_SpawnOnTallGrass(npc, sprite),   // TALL_GRASS_ON_SPAWN
  (_rt, npc, sprite) => GroundEffect_StepOnTallGrass(npc, sprite),    // TALL_GRASS_ON_MOVE
  (_rt, npc, sprite) => GroundEffect_SpawnOnLongGrass(npc, sprite),   // LONG_GRASS_ON_SPAWN
  (_rt, npc, sprite) => GroundEffect_StepOnLongGrass(npc, sprite),    // LONG_GRASS_ON_MOVE
  (rt, npc, sprite) => GroundEffect_WaterReflection(rt, npc, sprite), // WATER_REFLECTION
  (rt, npc, sprite) => GroundEffect_IceReflection(rt, npc, sprite),   // ICE_REFLECTION
  (_rt, npc) => GroundEffect_FlowingWater(npc),                       // SHALLOW_FLOWING_WATER
  (_rt, npc, sprite) => GroundEffect_SandTracks(npc, sprite),         // SAND
  (_rt, npc, sprite) => GroundEffect_DeepSandTracks(npc, sprite),     // DEEP_SAND
  (rt, npc, sprite) => GroundEffect_Ripple(rt, npc, sprite),          // RIPPLES
  (_rt, npc) => GroundEffect_StepOnPuddle(npc),                       // PUDDLE
  (_rt, npc) => GroundEffect_SandHeap(npc),                           // SAND_PILE
  (_rt, npc, sprite) => GroundEffect_JumpOnTallGrass(npc, sprite),    // LAND_IN_TALL_GRASS
  (_rt, npc) => GroundEffect_JumpOnLongGrass(npc),                    // LAND_IN_LONG_GRASS
  (rt, npc, sprite) => GroundEffect_JumpOnShallowWater(rt, npc, sprite), // LAND_IN_SHALLOW_WATER
  (rt, npc, sprite) => GroundEffect_JumpOnWater(rt, npc, sprite),     // LAND_IN_DEEP_WATER
  (rt, npc, sprite) => GroundEffect_JumpLandingDust(rt, npc, sprite), // LAND_ON_NORMAL_GROUND
  (_rt, npc) => GroundEffect_ShortGrass(npc),                         // SHORT_GRASS
  (_rt, npc) => GroundEffect_HotSprings(npc),                         // HOT_SPRINGS
  (_rt, npc) => GroundEffect_Seaweed(npc),                            // SEAWEED
];

function DoFlaggedGroundEffects(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined, flags: number): void {
  // 1:1 décomp : garde ObjectEventIsFarawayIslandMew non portée (Faraway Island =
  // dépendance d'étape, toujours false ici) → pas de early-return.
  for (let i = 0; i < sGroundEffectFuncs.length; i++, flags >>= 1) {
    if (flags & 1) sGroundEffectFuncs[i](rt, npc, sprite);
  }
}

function filters_out_some_ground_effects(npc: ObjectEvent, flags: number): number {
  if (npc.disableCoveringGroundEffects) {
    npc.inShortGrass = false;
    npc.inSandPile = false;
    npc.inShallowFlowingWater = false;
    npc.inHotSprings = false;
    flags &= ~(GROUND_EFFECT_FLAG_HOT_SPRINGS
             | GROUND_EFFECT_FLAG_SHORT_GRASS
             | GROUND_EFFECT_FLAG_SAND_PILE
             | GROUND_EFFECT_FLAG_SHALLOW_FLOWING_WATER
             | GROUND_EFFECT_FLAG_TALL_GRASS_ON_MOVE);
  }
  return flags;
}

function FilterOutStepOnPuddleGroundEffectIfJumping(npc: ObjectEvent, flags: number): number {
  if (npc.landingJump) flags &= ~GROUND_EFFECT_FLAG_PUDDLE;
  return flags;
}

/** 1:1 décomp `DoGroundEffects_OnSpawn` (event_object_movement.c:8080). */
export function DoGroundEffects_OnSpawn(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  if (npc.triggerGroundEffectsOnMove) {
    UpdateObjectEventElevationAndPriority(rt, npc, sprite);
    const flags = GetAllGroundEffectFlags_OnSpawn(npc);
    SetObjectEventSpriteOamTableForLongGrass(npc, sprite);
    DoFlaggedGroundEffects(rt, npc, sprite, flags);
    npc.triggerGroundEffectsOnMove = false;
    npc.disableCoveringGroundEffects = false;
  }
}

/** 1:1 décomp `DoGroundEffects_OnBeginStep` (event_object_movement.c:8100). */
export function DoGroundEffects_OnBeginStep(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  if (npc.triggerGroundEffectsOnMove) {
    UpdateObjectEventElevationAndPriority(rt, npc, sprite);
    let flags = GetAllGroundEffectFlags_OnBeginStep(npc);
    SetObjectEventSpriteOamTableForLongGrass(npc, sprite);
    flags = filters_out_some_ground_effects(npc, flags);
    DoFlaggedGroundEffects(rt, npc, sprite, flags);
    npc.triggerGroundEffectsOnMove = false;
    npc.disableCoveringGroundEffects = false;
  }
}

/** 1:1 décomp `DoGroundEffects_OnFinishStep` (event_object_movement.c:8121). */
export function DoGroundEffects_OnFinishStep(rt: DecompRuntime, npc: ObjectEvent, sprite: DecompSprite | undefined): void {
  if (npc.triggerGroundEffectsOnStop) {
    UpdateObjectEventElevationAndPriority(rt, npc, sprite);
    let flags = GetAllGroundEffectFlags_OnFinishStep(npc);
    SetObjectEventSpriteOamTableForLongGrass(npc, sprite);
    flags = FilterOutStepOnPuddleGroundEffectIfJumping(npc, flags);
    DoFlaggedGroundEffects(rt, npc, sprite, flags);
    npc.triggerGroundEffectsOnStop = false;
    npc.landingJump = false;
  }
}

/** 1:1 STRICT décomp `TryEnableObjectEventAnim(objectEvent, sprite)`
 *  (event_object_movement.c:7335) : quand `enableAnim` est posé (ex.
 *  `Fishing_GetRodOut` → pêche, certains field moves), DÉPAUSE l'anim du sprite +
 *  consomme le flag. SANS cet appel, l'anim spéciale (pêche : take-out/put-away
 *  rod) reste `animPaused=TRUE` → `AnimateSprite` ne l'avance JAMAIS → `animEnded`
 *  jamais posé → `Task_Fishing` zombie bloqué à `Fishing_PutRodAway` + field
 *  controls verrouillés à vie (= régression canne à pêche). */
function TryEnableObjectEventAnim(objectEvent: ObjectEvent, sprite: DecompSprite | undefined): void {
  if (objectEvent.enableAnim && sprite) {
    sprite.animPaused = false;
    objectEvent.disableAnim = false;
    objectEvent.enableAnim = false;
  }
}

/** Tick chaque NPC selon son movementType. À call chaque frame. */
export function TickObjectEventMovements(rt: DecompRuntime): void {
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;

    // 1:1 STRICT décomp `UpdateObjectEventCurrentMovement`
    // (event_object_movement.c:4929-4944) :
    //   DoGroundEffects_OnSpawn(objectEvent, sprite);
    //   TryEnableObjectEventAnim(objectEvent, sprite);
    //   if (ObjectEventIsHeldMovementActive(objectEvent))
    //       ObjectEventExecHeldMovementAction(objectEvent, sprite);
    //   else if (!objectEvent->frozen)
    //       while (callback(objectEvent, sprite));
    //   DoGroundEffects_OnBeginStep(objectEvent, sprite);
    //   DoGroundEffects_OnFinishStep(objectEvent, sprite);
    //   ...
    //
    // Le check `heldMovementActive` est CRUCIAL : si scrcmd `faceplayer`,
    // `applymovement` etc. set heldMovementActive=TRUE via ObjectEventSetHeldMovement,
    // on exec ce held movement AU LIEU du MovementType callback. Sans ce
    // dispatch, faceplayer sur NPCs WANDER/LOOK ne tourne PAS visuellement
    // (= user G15 bug "NPCs dehors ne se tournent pas").
    //
    // GROUND EFFECTS : le slot player (isPlayer) passe MAINTENANT par le spine 1:1
    // comme la décomp (le player object event slot 0 traverse le même DoGroundEffects).
    // Ça lui donne reflet / tall grass / ondulations / eau peu profonde / etc. via le
    // chemin générique. Le player pose `triggerGroundEffectsOnMove` au step start
    // (player-avatar.ts PlayerStep) + maintient currentCoords/metatileBehavior → le spine
    // consomme correctement. Le tall-grass ad-hoc de player-avatar a été RETIRÉ (le spine
    // le fait). SEUL le jump landing dust reste ad-hoc dans player-avatar : son trigger
    // décomp (`landingJump`) n'est pas posé par notre saut bespoke → GetGroundEffectFlags_
    // JumpLanding ne fire pas pour le player (pas de double).
    // Le player a son sprite visuel sur gPlayerAvatar.spriteId (le slot a spriteId=-1) ;
    // les NPCs sur npc.spriteId. ObjectEventUpdateSubpriority (1:1) tourne pour TOUS.
    const sprite = npc.isPlayer
      ? (gPlayerAvatar.spriteId >= 0 ? rt.gSprites[gPlayerAvatar.spriteId] : undefined)
      : (npc.spriteId >= 0 ? rt.gSprites[npc.spriteId] : undefined);
    DoGroundEffects_OnSpawn(rt, npc, sprite);
    // 1:1 décomp UpdateObjectEventCurrentMovement (event_object_movement.c:4932) :
    // TryEnableObjectEventAnim juste après DoGroundEffects_OnSpawn. Dépause les anims
    // spéciales (pêche) posées via enableAnim. FIX régression canne à pêche.
    TryEnableObjectEventAnim(npc, sprite);

    if (ObjectEventIsHeldMovementActive(npc)) {
      _execHeldMovementAction(rt, npc);
    } else if (!npc.frozen) {
      // Frozen NPCs (= en interact, sans heldMovement actif) skip leur state machine,
      // mais 1:1 décomp les DoGroundEffects tournent quand même (no-op si les triggers
      // ne sont pas posés).
      const handler = MOVEMENT_HANDLERS[npc.movementType];
      if (handler) {
        if (handler.tick === 'look') {
          tickLookAround(rt, npc, handler.dirs);
        } else {
          tickWanderAround(rt, npc, handler.dirs);
        }
      } else {
        // Try special handlers (= ROTATE, WALK_*_AND_*, WALK_IN_PLACE_*, INVISIBLE).
        dispatchSpecialMovement(rt, npc);
        // Movement types non-supportés documentés : BERRY_TREE_GROWTH,
        // TREE/MOUNTAIN/SAND_DISGUISE, COPY_PLAYER_* (= subsystem-locked).
      }
    }

    DoGroundEffects_OnBeginStep(rt, npc, sprite);
    DoGroundEffects_OnFinishStep(rt, npc, sprite);
    // 1:1 décomp `UpdateObjectEventCurrentMovement` (event_object_movement.c:4943) :
    // ObjectEventUpdateSubpriority — pose la subpriority Y-based, pour TOUS les object events
    // y compris le player (sinon l'avatar reste à 255 → le bump grass wrap mal).
    ObjectEventUpdateSubpriority(rt, npc, sprite);
  }
}

// ─── G15 — 1:1 STRICT heldMovement system (= ObjectEventExecHeldMovementAction) ──
//
// Source décomp : event_object_movement.c + data/object_events/movement_action_func_tables.h
//
// Dispatch table 1:1 décomp `gMovementActionFuncs[]` (= 256 entries pour
// chaque MOVEMENT_ACTION_X). Chaque entry est un Step0/1/2 callback.
// Actions critiques portées (FACE_X, WALK_X, etc.) ; les autres = stub no-op
// qui retournent done immédiatement (dette à porter au fil des étapes).

import {
  MOVEMENT_ACTION_FACE_DOWN, MOVEMENT_ACTION_FACE_UP,
  MOVEMENT_ACTION_FACE_LEFT, MOVEMENT_ACTION_FACE_RIGHT,
  MOVEMENT_ACTION_DELAY_1, MOVEMENT_ACTION_DELAY_2,
  MOVEMENT_ACTION_DELAY_4, MOVEMENT_ACTION_DELAY_8,
  MOVEMENT_ACTION_DELAY_16,
  MOVEMENT_ACTION_WALK_NORMAL_DOWN, MOVEMENT_ACTION_WALK_NORMAL_UP,
  MOVEMENT_ACTION_WALK_NORMAL_LEFT, MOVEMENT_ACTION_WALK_NORMAL_RIGHT,
  MOVEMENT_ACTION_WALK_SLOW_DOWN, MOVEMENT_ACTION_WALK_SLOW_UP,
  MOVEMENT_ACTION_WALK_SLOW_LEFT, MOVEMENT_ACTION_WALK_SLOW_RIGHT,
  MOVEMENT_ACTION_WALK_FAST_DOWN, MOVEMENT_ACTION_WALK_FAST_UP,
  MOVEMENT_ACTION_WALK_FAST_LEFT, MOVEMENT_ACTION_WALK_FAST_RIGHT,
  MOVEMENT_ACTION_WALK_FASTER_DOWN, MOVEMENT_ACTION_WALK_FASTER_UP,
  MOVEMENT_ACTION_WALK_FASTER_LEFT, MOVEMENT_ACTION_WALK_FASTER_RIGHT,
  MOVEMENT_ACTION_LOCK_FACING_DIRECTION, MOVEMENT_ACTION_UNLOCK_FACING_DIRECTION,
  MOVEMENT_ACTION_SET_INVISIBLE, MOVEMENT_ACTION_SET_VISIBLE,
  MOVEMENT_ACTION_ENABLE_JUMP_LANDING_GROUND_EFFECT,
  MOVEMENT_ACTION_DISABLE_JUMP_LANDING_GROUND_EFFECT,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN, MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_UP,
  MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_LEFT, MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT,
  MOVEMENT_ACTION_SET_FIXED_PRIORITY, MOVEMENT_ACTION_CLEAR_FIXED_PRIORITY,
  MOVEMENT_ACTION_START_ANIM_IN_DIRECTION,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN, MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP,
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT, MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT,
  MOVEMENT_ACTION_SLIDE_DOWN, MOVEMENT_ACTION_SLIDE_UP,
  MOVEMENT_ACTION_SLIDE_LEFT, MOVEMENT_ACTION_SLIDE_RIGHT,
  MOVEMENT_ACTION_PLAYER_RUN_DOWN, MOVEMENT_ACTION_PLAYER_RUN_UP,
  MOVEMENT_ACTION_PLAYER_RUN_LEFT, MOVEMENT_ACTION_PLAYER_RUN_RIGHT,
  MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_UP_LEFT, MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_UP_RIGHT,
  MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_DOWN_LEFT, MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_DOWN_RIGHT,
  MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_UP_LEFT, MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_UP_RIGHT,
  MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_DOWN_LEFT, MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_DOWN_RIGHT,
  MOVEMENT_ACTION_DISABLE_ANIMATION, MOVEMENT_ACTION_RESTORE_ANIMATION,
  MOVEMENT_ACTION_HIDE_REFLECTION, MOVEMENT_ACTION_SHOW_REFLECTION,
  MOVEMENT_ACTION_FACE_ORIGINAL_DIRECTION,
  MOVEMENT_ACTION_FACE_PLAYER, MOVEMENT_ACTION_FACE_AWAY_PLAYER,
  MOVEMENT_ACTION_EMOTE_EXCLAMATION_MARK, MOVEMENT_ACTION_EMOTE_QUESTION_MARK,
  MOVEMENT_ACTION_EMOTE_HEART,
  MOVEMENT_ACTION_NURSE_JOY_BOW_DOWN,
  MOVEMENT_ACTION_ROCK_SMASH_BREAK, MOVEMENT_ACTION_CUT_TREE,
  MOVEMENT_ACTION_JUMP_DOWN, MOVEMENT_ACTION_JUMP_UP,
  MOVEMENT_ACTION_JUMP_LEFT, MOVEMENT_ACTION_JUMP_RIGHT,
  MOVEMENT_ACTION_JUMP_2_DOWN, MOVEMENT_ACTION_JUMP_2_UP,
  MOVEMENT_ACTION_JUMP_2_LEFT, MOVEMENT_ACTION_JUMP_2_RIGHT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN, MOVEMENT_ACTION_JUMP_IN_PLACE_UP,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT, MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT,
  MOVEMENT_ACTION_JUMP_SPECIAL_DOWN, MOVEMENT_ACTION_JUMP_SPECIAL_UP,
  MOVEMENT_ACTION_JUMP_SPECIAL_LEFT, MOVEMENT_ACTION_JUMP_SPECIAL_RIGHT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP, MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT, MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_UP,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_UP,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_LEFT, MOVEMENT_ACTION_ACRO_POP_WHEELIE_RIGHT,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_UP,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_LEFT, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_UP,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_UP,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_UP,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_UP,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_UP,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_LEFT, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_RIGHT,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_LEFT, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_RIGHT,
  MOVEMENT_ACTION_INIT_AFFINE_ANIM, MOVEMENT_ACTION_CLEAR_AFFINE_ANIM,
  MOVEMENT_ACTION_LEVITATE, MOVEMENT_ACTION_STOP_LEVITATE,
  MOVEMENT_ACTION_STOP_LEVITATE_AT_TOP, MOVEMENT_ACTION_FIGURE_8,
  MOVEMENT_ACTION_WALK_DOWN_START_AFFINE, MOVEMENT_ACTION_WALK_DOWN_AFFINE,
  MOVEMENT_ACTION_REVEAL_TRAINER,
  MOVEMENT_ACTION_WALK_LEFT_AFFINE, MOVEMENT_ACTION_WALK_RIGHT_AFFINE,
  MOVEMENT_ACTION_FLY_UP, MOVEMENT_ACTION_FLY_DOWN,
  MOVEMENT_ACTION_LOCK_ANIM, MOVEMENT_ACTION_UNLOCK_ANIM,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_UP,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_LEFT, MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_RIGHT,
} from '../include/constants/event_object_movement';

/** 1:1 décomp `FaceDirection` (event_object_movement.c:5048-5057) :
 *    SetObjectEventDirection(objectEvent, direction);
 *    if (!objectEvent->inanimate) {
 *        StartSpriteAnim(sprite, GetFaceDirectionAnimNum(direction));
 *    } */
function _FaceDirection(rt: DecompRuntime, npc: ObjectEvent, dir: number): void {
  SetObjectEventDirection(npc, dir);
  _npcSetFaceAnim(rt, npc);
}

/** 1:1 décomp `MovementAction_FaceDown_Step0` + variantes UP/LEFT/RIGHT.
 *  Chacune appelle FaceDirection(dir) + return TRUE (= done en 1 step). */
function _MovementAction_FaceDown_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  _FaceDirection(rt, npc, DIR_SOUTH);
  return true;
}
function _MovementAction_FaceUp_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  _FaceDirection(rt, npc, DIR_NORTH);
  return true;
}
function _MovementAction_FaceLeft_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  _FaceDirection(rt, npc, DIR_WEST);
  return true;
}
function _MovementAction_FaceRight_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  _FaceDirection(rt, npc, DIR_EAST);
  return true;
}

/** 1:1 décomp `MovementAction_Delay_Step0` (event_object_movement.c:5168+) :
 *    sprite->sActionFuncId = 1;
 *    sprite->data[3] = N;  // 1/2/4/8/16
 *    return FALSE;
 *  Variants Delay1/2/4/8/16 = juste different valeur initiale data[3]. */
function _MovementAction_Delay_Step0(_rt: DecompRuntime, npc: ObjectEvent, delay: number): boolean {
  npc.actionStep = 1;
  npc.actionTimer = delay;
  return false;
}

/** 1:1 décomp `MovementAction_Delay_Step1` (event_object_movement.c:5180) :
 *    if (--sprite->data[3] == 0) { sprite->sActionFuncId = 2; return TRUE; }
 *    return FALSE; */
function _MovementAction_Delay_Step1(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (--npc.actionTimer === 0) {
    npc.actionStep = 2;
    return true;
  }
  return false;
}

/** Factory pour Delay actions multi-step (Step0 set timer + return Step1). */
function _makeDelayAction(delay: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) return _MovementAction_Delay_Step0(rt, npc, delay);
    return _MovementAction_Delay_Step1(rt, npc);
  };
}

/** 1:1 décomp `MOVE_SPEED_*` (event_object_movement.c:5092-5097) — enum strict.
 *  0=NORMAL, 1=FAST_1 (run/surf/slide), 2=FAST_2 (current/acro bike),
 *  3=FASTER (mach bike), 4=FASTEST.
 *  H3.1 cleanup : SLOWER slot retiré (= n'existe pas dans décomp enum). WALK_SLOW
 *  utilise path SÉPARÉ via InitWalkSlow + UpdateWalkSlow (= 1:1 strict architectural). */
const MOVE_SPEED_NORMAL = 0;
const MOVE_SPEED_FAST_1 = 1;
const MOVE_SPEED_FAST_2 = 2;
const MOVE_SPEED_FASTER = 3;
const MOVE_SPEED_FASTEST = 4;
void MOVE_SPEED_FASTER; void MOVE_SPEED_FASTEST; void MOVE_SPEED_FAST_2;

/** 1:1 décomp `sStepTimes` (event_object_movement.c:8294) : frames-per-tile par speed.
 *  NORMAL=16, FAST_1=8, FAST_2=6, FASTER=4, FASTEST=2. */
const _sStepTimes = [16, 8, 6, 4, 2];

/** 1:1 décomp step patterns par speed (event_object_movement.c:8235-8284).
 *  Per-frame px increment : sStep1Funcs (= Step1 = 1px) × 16f for NORMAL,
 *  sStep2Funcs (= Step2 = 2px) × 8f for FAST_1, sStep3Funcs (= Step2/Step3 pattern
 *  totalisant 16px) × 6f for FAST_2, sStep4Funcs (= Step4 = 4px) × 4f for FASTER,
 *  sStep8Funcs (= Step8 = 8px) × 2f for FASTEST.
 *  Total = 16 px par tile, sub-pixel exact.
 *  H3.1 cleanup : slot SLOWER retiré (= n'existe pas dans décomp). WALK_SLOW
 *  utilise path séparé InitWalkSlow + UpdateWalkSlow (= 1:1 strict architectural). */
const _sStepFuncTables: readonly (readonly number[])[] = [
  // NORMAL (16f × 1px = 16px)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // FAST_1 (8f × 2px = 16px)
  [2, 2, 2, 2, 2, 2, 2, 2],
  // FAST_2 (6f pattern Step2/Step3 = 16px total : 2+3+3+2+3+3=16)
  [2, 3, 3, 2, 3, 3],
  // FASTER (4f × 4px = 16px)
  [4, 4, 4, 4],
  // FASTEST (2f × 8px = 16px)
  [8, 8],
];

/** 1:1 décomp `InitNpcForMovement` (event_object_movement.c:5081-5092) :
 *    SetObjectEventDirection + MoveCoords + ShiftObjectEventCoords +
 *    SetSpriteDataForNormalStep (= sActionFuncId=1, sSpeed=speed, sTimer=0) +
 *    sprite->animPaused = FALSE + triggerGroundEffectsOnMove = TRUE.
 *
 *  Notre TS : walkSpeed (= sSpeed) + actionTimer (= sTimer) + walkDirection.
 *  walkFramesLeft compatibilité ascendante avec ancien code MovementType callbacks. */
function _InitNpcForMovement(rt: DecompRuntime, npc: ObjectEvent, dir: number, speed: number): void {
  const dx = DIR_TO_DX[dir] ?? 0;
  const dy = DIR_TO_DY[dir] ?? 0;
  SetObjectEventDirection(npc, dir);
  ShiftObjectEventCoords(npc, npc.currentCoordsX + dx, npc.currentCoordsY + dy);
  npc.walkDirection = dir;
  npc.walkSpeed = speed;
  const duration = _sStepTimes[speed] ?? 16;
  npc.walkFramesLeft = duration;
  npc.actionTimer = 0;  // sTimer
  npc.actionStep = 1;
  // H4.3 fix : 1:1 strict décomp InitNpcForMovement set triggerGroundEffectsOnMove=TRUE.
  npc.triggerGroundEffectsOnMove = true;
  // 1:1 décomp `InitMovementNormal` (event_object_movement.c:5101-5107) : l'anim de pas dépend
  // de MOVE_SPEED via `sDirectionAnimFuncsBySpeed[speed]` (table exacte ci-dessus). Corrige le
  // pédalage gelé (l'anim normale ne cyclait pas dans un pas court) ET le « trop rapide » de l'acro
  // (FAST_2 → Fast, pas Faster). Fallback Normal pour les speeds hors table (sécurité).
  const animFn = _sDirectionAnimFuncsBySpeed[speed] ?? GetMoveDirectionAnimNum;
  _npcStartStepAnimWithNum(rt, npc, animFn(npc.facingDirection));
}

/** 1:1 décomp `MovementAction_WalkNormalX_Step0` (event_object_movement.c:5278+) :
 *    InitMovementNormal(obj, sprite, DIR_X, MOVE_SPEED_NORMAL);
 *    return MovementAction_WalkNormalX_Step1(obj, sprite). */
function _MovementAction_WalkNormal_Step0(rt: DecompRuntime, npc: ObjectEvent, dir: number, speed: number): boolean {
  _InitNpcForMovement(rt, npc, dir, speed);
  return _MovementAction_WalkNormal_Step1(rt, npc);
}

/** 1:1 décomp `NpcTakeStep` (event_object_movement.c:8460) :
 *    if (sTimer >= sStepTimes[sSpeed]) return FALSE;
 *    sNpcStepFuncTables[sSpeed][sTimer](sprite, sDirection);
 *    sTimer++;
 *    if (sTimer < sStepTimes[sSpeed]) return FALSE;
 *    return TRUE;
 *
 *  Notre TS : appel patterns via _sStepFuncTables[speed][timer] qui donne le
 *  px increment pour la frame. Total cumulatif = 16 px par tile. */
function _NpcTakeStep(npc: ObjectEvent): boolean {
  const speed = npc.walkSpeed;
  const stepTime = _sStepTimes[speed] ?? 16;
  if (npc.actionTimer >= stepTime) return false;  // safety
  const pattern = _sStepFuncTables[speed];
  const px = pattern?.[npc.actionTimer] ?? 0;
  const dx = DIR_TO_DX[npc.walkDirection] ?? 0;
  const dy = DIR_TO_DY[npc.walkDirection] ?? 0;
  npc.worldX += dx * px;
  npc.worldY += dy * px;
  npc.actionTimer++;
  if (npc.actionTimer < stepTime) return false;
  return true;
}

/** 1:1 décomp `MovementAction_WalkNormalX_Step1` (event_object_movement.c:5284) :
 *    if (UpdateMovementNormal(obj, sprite)) {
 *      sprite->sActionFuncId = 2; return TRUE;
 *    }
 *    return FALSE;
 *
 *  UpdateMovementNormal (5116) : NpcTakeStep + ShiftStillObjectEventCoords +
 *  animPaused=TRUE quand done. */
function _MovementAction_WalkNormal_Step1(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (_NpcTakeStep(npc)) {
    // 1:1 décomp `ShiftStillObjectEventCoords` (event_object_movement.c:2162) +
    // triggerGroundEffectsOnStop = TRUE + sprite->animPaused = TRUE.
    ShiftStillObjectEventCoords(npc);
    npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
    npc.walkFramesLeft = 0;
    // H4.3 fix : 1:1 strict décomp UpdateMovementNormal set triggerGroundEffectsOnStop=TRUE.
    npc.triggerGroundEffectsOnStop = true;
    npc.actionStep = 2;
    _npcEndWalkAnim(rt, npc);
    return true;
  }
  // Sync walkFramesLeft pour MovementType callbacks compatibility.
  npc.walkFramesLeft = (_sStepTimes[npc.walkSpeed] ?? 16) - npc.actionTimer;
  return false;
}

/** Factory pour Walk actions multi-step à speed donné. */
function _makeWalkAction(dir: number, speed: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) return _MovementAction_WalkNormal_Step0(rt, npc, dir, speed);
    return _MovementAction_WalkNormal_Step1(rt, npc);
  };
}

/** 1:1 décomp `MovementAction_PlayerRunDown_Step0` (event_object_movement.c:6020) :
 *    StartRunningAnim(objectEvent, sprite, DIR_SOUTH);
 *    return MovementAction_PlayerRunDown_Step1(objectEvent, sprite);
 *
 *  `StartRunningAnim` (5110) = InitNpcForMovement(MOVE_SPEED_FAST_1) +
 *  SetStepAnimHandleAlternation(GetRunningDirectionAnimNum(facingDirection)).
 *  Notre `_InitNpcForMovement` bundle déjà le walk anim (= décomp InitMovementNormal) ;
 *  on l'override ensuite avec l'anim RUN (= ANIM_RUN_X, frames running 9-17) via
 *  `_npcSetStepAnim`. Step1 = `_MovementAction_WalkNormal_Step1` (= NpcTakeStep, identique
 *  à MovementAction_PlayerRunDown_Step1). Remplace la dette R3 (_makeWalkAction → walk anim).
 *  La distance/vitesse sont identiques à WALK_FAST (speed 1) ; seul le pic course diffère. */
function _makePlayerRunAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitNpcForMovement(rt, npc, dir, MOVE_SPEED_FAST_1);
      _npcSetStepAnim(rt, npc, GetRunningDirectionAnimNum(npc.facingDirection));
      return _MovementAction_WalkNormal_Step1(rt, npc);
    }
    return _MovementAction_WalkNormal_Step1(rt, npc);
  };
}

// ─── WALK_SLOW path séparé 1:1 strict décomp ─────────────────────────────────
// Source : event_object_movement.c:5128-5160 (= path DISTINCT de
// InitMovementNormal + UpdateMovementNormal qui utilise NpcTakeStep + step
// pattern tables). WalkSlow path utilise UpdateWalkSlowAnim qui shift 1 px
// every 2 frames sur 32 frames totales = 16 px par tile, identique math mais
// path architectural séparé pour conformité 1:1 strict.

/** 1:1 décomp `SetWalkSlowSpriteData(sprite, direction)` (event_object_movement.c) :
 *    sprite->sDirection = direction;
 *    sprite->sTimer = 0;
 *    sprite->sNumSteps = 0; */
function _SetWalkSlowSpriteData(npc: ObjectEvent, direction: number): void {
  npc.walkDirection = direction;     // sDirection (data[3])
  npc.actionTimer = 0;                // sTimer (data[?])
  npc.walkSlowNumSteps = 0;           // sNumSteps
}

/** 1:1 décomp `InitNpcForWalkSlow(obj, sprite, direction)` (event_object_movement.c
 *  :5128) :
 *    x = currentCoords.x;
 *    y = currentCoords.y;
 *    SetObjectEventDirection(direction);
 *    MoveCoords(direction, &x, &y);
 *    ShiftObjectEventCoords(obj, x, y);
 *    SetWalkSlowSpriteData(sprite, direction);
 *    sprite->animPaused = FALSE;
 *    objectEvent->triggerGroundEffectsOnMove = TRUE;
 *    sprite->sActionFuncId = 1; */
function _InitNpcForWalkSlow(rt: DecompRuntime, npc: ObjectEvent, direction: number): void {
  const dx = DIR_TO_DX[direction] ?? 0;
  const dy = DIR_TO_DY[direction] ?? 0;
  SetObjectEventDirection(npc, direction);
  ShiftObjectEventCoords(npc, npc.currentCoordsX + dx, npc.currentCoordsY + dy);
  _SetWalkSlowSpriteData(npc, direction);
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.animPaused = false;
  }
  // H4.3 fix : 1:1 strict décomp InitNpcForWalkSlow set triggerGroundEffectsOnMove=TRUE.
  npc.triggerGroundEffectsOnMove = true;
  npc.actionStep = 1;
}

/** 1:1 décomp `InitWalkSlow(obj, sprite, direction)` (event_object_movement.c:5144) :
 *    InitNpcForWalkSlow(obj, sprite, direction);
 *    SetStepAnimHandleAlternation(obj, sprite, GetMoveDirectionAnimNum(facingDirection)); */
function _InitWalkSlow(rt: DecompRuntime, npc: ObjectEvent, direction: number): void {
  _InitNpcForWalkSlow(rt, npc, direction);
  // 1:1 décomp : SetStepAnimHandleAlternation = StartSpriteAnim avec walk anim
  // + animPaused=FALSE (= _npcStartWalkAnim gère ça via GetMoveDirectionAnimNum).
  _npcStartWalkAnim(rt, npc, npc.facingDirection);
}

/** 1:1 décomp `UpdateWalkSlowAnim(sprite)` (event_object_movement.c:5152) :
 *    if (!(sprite->sTimer & 1)) {
 *      Step1(sprite, sprite->sDirection);  // shift 1 px in direction
 *      sprite->sNumSteps++;
 *    }
 *    sprite->sTimer++;
 *    if (sprite->sNumSteps > 15) return TRUE;
 *    return FALSE;
 *
 *  Step1(sprite, dir) = sprite.x/y += sDirectionToVectors[dir].x/y * 1 (= 1 px). */
function _UpdateWalkSlowAnim(npc: ObjectEvent): boolean {
  if ((npc.actionTimer & 1) === 0) {
    // Step1 1:1 décomp : shift 1 px in direction.
    const dx = DIR_TO_DX[npc.walkDirection] ?? 0;
    const dy = DIR_TO_DY[npc.walkDirection] ?? 0;
    npc.worldX += dx;
    npc.worldY += dy;
    npc.walkSlowNumSteps++;
  }
  npc.actionTimer++;
  return npc.walkSlowNumSteps > 15;
}

/** 1:1 décomp `UpdateWalkSlow(obj, sprite)` (event_object_movement.c:5160) :
 *    if (UpdateWalkSlowAnim(sprite)) {
 *      ShiftStillObjectEventCoords(obj);
 *      objectEvent->triggerGroundEffectsOnStop = TRUE;
 *      sprite->animPaused = TRUE;
 *      return TRUE;
 *    }
 *    return FALSE; */
function _UpdateWalkSlow(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (_UpdateWalkSlowAnim(npc)) {
    ShiftStillObjectEventCoords(npc);
    npc.walkAnimAlt = (npc.walkAnimAlt ^ 1) as 0 | 1;
    // H4.3 fix : 1:1 strict décomp UpdateWalkSlow (5160) set triggerGroundEffectsOnStop=TRUE.
    npc.triggerGroundEffectsOnStop = true;
    _npcEndWalkAnim(rt, npc);
    return true;
  }
  return false;
}

/** Factory pour MovementAction_WalkSlow_X 1:1 strict décomp path séparé
 *  (= InitWalkSlow + UpdateWalkSlow). Différent de _makeWalkAction qui utilise
 *  InitMovementNormal + UpdateMovementNormal path. */
function _makeWalkSlowAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitWalkSlow(rt, npc, dir);
      // 1:1 décomp : Step0 chain to Step1.
      if (_UpdateWalkSlow(rt, npc)) {
        npc.actionStep = 2;
        return true;
      }
      return false;
    }
    // Step1 : UpdateWalkSlow check done.
    if (_UpdateWalkSlow(rt, npc)) {
      npc.actionStep = 2;
      return true;
    }
    return false;
  };
}

/** Factory pour MovementAction_WalkDown(Start)Affine 1:1 strict :
 *    InitWalkSlow(DIR_SOUTH);
 *    sprite->affineAnimPaused = FALSE;
 *    StartSpriteAffineAnimIfDifferent(sprite, affineAnimId);
 *    return Step1;
 *  Step1 : UpdateWalkSlow + affineAnimPaused=TRUE quand done. */
function _makeWalkDownAffineActionStrict(affineAnimId: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitWalkSlow(rt, npc, DIR_SOUTH);
      // H3.5 1:1 strict : sprite.affineAnimPaused = FALSE +
      // ChangeSpriteAffineAnimIfDifferent(sprite, affineAnimId).
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite) sprite.affineAnimPaused = false;
      }
      _ChangeSpriteAffineAnimIfDifferent(rt, npc, affineAnimId);
      if (_UpdateWalkSlow(rt, npc)) {
        // H3.5 1:1 strict : affineAnimPaused = TRUE quand done.
        if (npc.spriteId >= 0) {
          const sprite = rt.gSprites[npc.spriteId];
          if (sprite) sprite.affineAnimPaused = true;
        }
        npc.actionStep = 2;
        return true;
      }
      return false;
    }
    if (_UpdateWalkSlow(rt, npc)) {
      // H3.5 1:1 strict : affineAnimPaused = TRUE quand done.
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite) sprite.affineAnimPaused = true;
      }
      npc.actionStep = 2;
      return true;
    }
    return false;
  };
}

/** 1:1 décomp `MovementAction_LockFacingDirection_Step0` (event_object_movement.c) :
 *    objectEvent->facingDirectionLocked = TRUE;
 *    sprite->sActionFuncId = 1; return TRUE; */
function _MovementAction_LockFacingDirection_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.facingDirectionLocked = true;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_UnlockFacingDirection_Step0` (event_object_movement.c) :
 *    objectEvent->facingDirectionLocked = FALSE;
 *    sprite->sActionFuncId = 1; return TRUE; */
function _MovementAction_UnlockFacingDirection_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.facingDirectionLocked = false;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_SetInvisible_Step0` :
 *    objectEvent->invisible = TRUE; sActionFuncId = 1; return TRUE; */
function _MovementAction_SetInvisible_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.invisible = true;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_SetVisible_Step0` :
 *    objectEvent->invisible = FALSE; sActionFuncId = 1; return TRUE; */
function _MovementAction_SetVisible_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.invisible = false;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_EnableJumpLandingGroundEffect_Step0` :
 *    objectEvent->disableJumpLandingGroundEffect = FALSE; sActionFuncId = 1; return TRUE; */
function _MovementAction_EnableJumpLandingGroundEffect_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.disableJumpLandingGroundEffect = false;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_DisableJumpLandingGroundEffect_Step0` :
 *    objectEvent->disableJumpLandingGroundEffect = TRUE; sActionFuncId = 1; return TRUE; */
function _MovementAction_DisableJumpLandingGroundEffect_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.disableJumpLandingGroundEffect = true;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `InitMoveInPlace` (event_object_movement.c:5704) :
 *    SetObjectEventDirection + SetStepAnimHandleAlternation(animNum) +
 *    sprite->animPaused = FALSE + sprite->sActionFuncId = 1 + data[3] = duration. */
function _InitMoveInPlace(rt: DecompRuntime, npc: ObjectEvent, dir: number, animNum: number, duration: number): void {
  SetObjectEventDirection(npc, dir);
  // 1:1 STRICT décomp `InitMoveInPlace` (event_object_movement.c:5704) :
  //   SetStepAnimHandleAlternation(obj, sprite, animNum) + sprite->animPaused = FALSE.
  // ⚠️ `animNum` vient du CALLER selon la VITESSE (normal / fast / faster) — PAS forcé à
  // l'anim normale. C'est CE qui fait avancer l'anim exactement 2 cmds sur la durée :
  //   slow/normal = anim normale (8f/cmd) × 16-32f ; fast = anim fast (4f/cmd) × 8f ;
  //   faster = anim faster (2f/cmd) × 4f. → finit TOUJOURS sur la cmd neutre (= frame de face).
  // Bug réparé : avec l'anim normale (8f/cmd) sur 4-8 frames, l'anim n'avançait pas → le NPC
  // figeait sur la frame de MARCHE (cmd0). C'était le « PNJ figé en marche » du greeting mère
  // (LittlerootTown_Movement_MomApproachPlayerAtTruck → walk_in_place_faster_left).
  _npcStartStepAnimWithNum(rt, npc, animNum);
  npc.actionStep = 1;
  npc.actionTimer = duration;
}

/** 1:1 décomp `MovementAction_WalkInPlace_Step1` (event_object_movement.c:5713) :
 *    if (--sprite->data[3] == 0) {
 *      sActionFuncId = 2; sprite->animPaused = TRUE; return TRUE;
 *    }
 *    return FALSE; */
function _MovementAction_WalkInPlace_Step1(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (--npc.actionTimer === 0) {
    npc.actionStep = 2;
    _npcEndWalkAnim(rt, npc);
    return true;
  }
  return false;
}

/** 1:1 STRICT décomp `MovementAction_WalkInPlaceSlow_Step1` (event_object_movement.c:5724) :
 *    if (sprite->data[3] & 1) sprite->animDelayCounter++;
 *    return MovementAction_WalkInPlace_Step1(objectEvent, sprite);
 *  C'est CE qui distingue WALK_IN_PLACE_**SLOW** (collide bump mur) des autres in-place : sur
 *  les frames où le compteur de durée (`data[3]` = notre `actionTimer`) est IMPAIR, on incrémente
 *  `animDelayCounter` AVANT le tick d'anim (`animateSprites`, qui le décrémente) → net 0 cette
 *  frame → l'anim n'avance pas → les jambes bougent à MOITIÉ de la vitesse de la marche normale.
 *  Sans ça le bump jouait à vitesse de marche (bug user « même vitesse en marchant dans le mur »).
 *  ⚠️ check `& 1` AVANT le décrément (le décrément est dans _MovementAction_WalkInPlace_Step1). */
function _MovementAction_WalkInPlaceSlow_Step1(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.actionTimer & 1) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.animDelayCounter++;
  }
  return _MovementAction_WalkInPlace_Step1(rt, npc);
}

/** Factory pour WalkInPlace actions (= animNum + duration selon SLOW/NORMAL/FAST/FASTER).
 *  1:1 décomp : chaque MovementAction_WalkInPlace{Slow,Normal,Fast,Faster}X_Step0 passe
 *  l'anim de SA vitesse à InitMoveInPlace (GetMoveDirection{,Fast,Faster}AnimNum). `slow=true`
 *  route le tick vers `_MovementAction_WalkInPlaceSlow_Step1` (ralentissement 1:1 du bump mur). */
function _makeWalkInPlaceAction(dir: number, animNum: number, duration: number, slow = false): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitMoveInPlace(rt, npc, dir, animNum, duration);
    }
    return slow
      ? _MovementAction_WalkInPlaceSlow_Step1(rt, npc)
      : _MovementAction_WalkInPlace_Step1(rt, npc);
  };
}

/** 1:1 décomp `MovementAction_SetFixedPriority_Step0` :
 *    objectEvent->fixedPriority = TRUE; sActionFuncId = 1; return TRUE; */
function _MovementAction_SetFixedPriority_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.fixedPriority = true;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_ClearFixedPriority_Step0` :
 *    objectEvent->fixedPriority = FALSE; sActionFuncId = 1; return TRUE; */
function _MovementAction_ClearFixedPriority_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.fixedPriority = false;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_DisableAnimation_Step0` :
 *    objectEvent->inanimate = TRUE; sActionFuncId = 1; return TRUE; */
function _MovementAction_DisableAnimation_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.inanimate = true;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_RestoreAnimation_Step0` :
 *    objectEvent->inanimate = GetObjectEventGraphicsInfo(objectEvent->graphicsId)->inanimate;
 *    sActionFuncId = 1; return TRUE; */
function _MovementAction_RestoreAnimation_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  const graphicsInfo = GetObjectEventGraphicsInfo(npc.graphicsId);
  npc.inanimate = !!graphicsInfo?.inanimate;
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_HideReflection_Step0` :
 *    objectEvent->hideReflection = TRUE; return TRUE; */
function _MovementAction_HideReflection_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.hideReflection = true;
  return true;
}

/** 1:1 décomp `MovementAction_ShowReflection_Step0` :
 *    objectEvent->hideReflection = FALSE; return TRUE; */
function _MovementAction_ShowReflection_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  npc.hideReflection = false;
  return true;
}

/** 1:1 décomp `MovementAction_FaceOriginalDirection_Step0` :
 *    FaceDirection(obj, sprite, gInitialMovementTypeFacingDirections[movementType]);
 *    return TRUE;
 *  Notre TS : movementTypeToInitialFacing(movementType) équivaut au table. */
function _MovementAction_FaceOriginalDirection_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  _FaceDirection(rt, npc, movementTypeToInitialFacing(npc.movementType));
  return true;
}

/** 1:1 décomp `GetDirectionToFace` (event_object_movement.c) :
 *    if (x > targetX) return DIR_WEST;
 *    if (x < targetX) return DIR_EAST;
 *    if (y > targetY) return DIR_NORTH;
 *    return DIR_SOUTH; */
function _GetDirectionToFace(x: number, y: number, targetX: number, targetY: number): number {
  if (x > targetX) return DIR_WEST;
  if (x < targetX) return DIR_EAST;
  if (y > targetY) return DIR_NORTH;
  return DIR_SOUTH;
}

/** 1:1 décomp `MovementAction_FacePlayer_Step0` (event_object_movement.c) :
 *    if (!TryGetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0, &playerId))
 *      FaceDirection(obj, sprite, GetDirectionToFace(npc.x, npc.y, player.x, player.y));
 *    sActionFuncId = 1; return TRUE; */
function _MovementAction_FacePlayer_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  // Notre TS : gObjectEvents[0] = player (= convention slot 0 player avatar).
  const playerNpc = gObjectEvents[gPlayerAvatar.objectEventId];
  if (playerNpc && playerNpc.active) {
    const dir = _GetDirectionToFace(npc.currentCoordsX, npc.currentCoordsY, playerNpc.currentCoordsX, playerNpc.currentCoordsY);
    _FaceDirection(rt, npc, dir);
  }
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_FaceAwayPlayer_Step0` :
 *    FaceDirection(obj, sprite, GetOppositeDirection(GetDirectionToFace(...))); */
function _MovementAction_FaceAwayPlayer_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const playerNpc = gObjectEvents[gPlayerAvatar.objectEventId];
  if (playerNpc && playerNpc.active) {
    const dirToPlayer = _GetDirectionToFace(npc.currentCoordsX, npc.currentCoordsY, playerNpc.currentCoordsX, playerNpc.currentCoordsY);
    const dirAway = OPPOSITE_DIR[dirToPlayer] ?? DIR_SOUTH;
    _FaceDirection(rt, npc, dirAway);
  }
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_EmoteExclamationMark_Step0` (event_object_movement.c:6479) :
 *    ObjectEventGetLocalIdAndMap(obj, &gFieldEffectArguments[0..2]);
 *    FieldEffectStart(FLDEFF_EXCLAMATION_MARK_ICON);
 *    sActionFuncId = 1; return TRUE;
 *
 *  Wire FieldEffectStart → dispatcher field-effect.ts → FldEff_ExclamationMarkIcon
 *  (game/trainer_see.ts, vrai callback SpriteCB_TrainerIcons). */
function _MovementAction_EmoteExclamationMark_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  gFieldEffectArguments[0] = npc.localId;
  gFieldEffectArguments[1] = npc.mapNum;
  gFieldEffectArguments[2] = npc.mapGroup;
  FieldEffectStart(FLDEFF_EXCLAMATION_MARK_ICON);
  npc.actionStep = 1;
  return true;
}

function _MovementAction_EmoteQuestionMark_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  gFieldEffectArguments[0] = npc.localId;
  gFieldEffectArguments[1] = npc.mapNum;
  gFieldEffectArguments[2] = npc.mapGroup;
  FieldEffectStart(FLDEFF_QUESTION_MARK_ICON);
  npc.actionStep = 1;
  return true;
}

function _MovementAction_EmoteHeart_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  gFieldEffectArguments[0] = npc.localId;
  gFieldEffectArguments[1] = npc.mapNum;
  gFieldEffectArguments[2] = npc.mapGroup;
  FieldEffectStart(FLDEFF_HEART_ICON);
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `ANIM_REMOVE_OBSTACLE = 1` (event_object_movement.h).
 *  Used par RockSmashBreak + CutTree pour anim destruction obstacle. */
const ANIM_REMOVE_OBSTACLE = 1;

/** 1:1 décomp `ANIM_STD_COUNT = 20` (event_object_movement.h:175). */
const ANIM_STD_COUNT = 20;

/** 1:1 décomp `ANIM_NURSE_BOW = ANIM_STD_COUNT + 0 = 20` (event_object_movement.h). */
const ANIM_NURSE_BOW = ANIM_STD_COUNT + 0;

/** 1:1 décomp ANIM_BUNNY_HOP_BACK_WHEEL_X (= ANIM_STD_COUNT + 0..3 = 20..23). */
const ANIM_BUNNY_HOP_BACK_WHEEL = [
  ANIM_STD_COUNT + 0,  // SOUTH
  ANIM_STD_COUNT + 1,  // NORTH
  ANIM_STD_COUNT + 2,  // WEST
  ANIM_STD_COUNT + 3,  // EAST
];
// (sAcroWheelieDirectionAnimNums : défini en tête de fichier avec les autres
//  tables direction 1:1 — l'ex-doublon local 5 entrées, sans diagonales, a été
//  dissous à l'unification miroir.)

/** 1:1 décomp ANIM_STANDING_WHEELIE_BACK_WHEEL_X (= ANIM_STD_COUNT + 8..11). */
const sAcroEndWheelieDirectionAnimNums: readonly number[] = [
  ANIM_STD_COUNT + 8,
  ANIM_STD_COUNT + 8,
  ANIM_STD_COUNT + 9,
  ANIM_STD_COUNT + 10,
  ANIM_STD_COUNT + 11,
];

/** 1:1 décomp ANIM_MOVING_WHEELIE_X (= ANIM_STD_COUNT + 16..19). */
const sAcroWheeliePedalDirectionAnimNums: readonly number[] = [
  ANIM_STD_COUNT + 16,
  ANIM_STD_COUNT + 16,
  ANIM_STD_COUNT + 17,
  ANIM_STD_COUNT + 18,
  ANIM_STD_COUNT + 19,
];
void ANIM_BUNNY_HOP_BACK_WHEEL;

// 1:1 STRICT décomp `gMovementActionFuncs_NurseJoyBowDown[]` (movement_action_func_tables.h:1117) :
//   { MovementAction_NurseJoyBowDown_Step0, MovementAction_WaitSpriteAnim, MovementAction_PauseSpriteAnim }.
// ⚠️ AVANT : un SEUL func (Step0) re-démarrait l'anim CHAQUE frame sans dispatcher par actionStep →
// `StartSpriteAnimInDirection` du décomp avance `sActionFuncId=1` (→ WaitSpriteAnim), notre mono-step ne
// l'a JAMAIS fait → held jamais fini → `waitmovement 0` (EventScript_PkmnCenterNurse_ReturnPkmn, le SALUT
// de l'infirmière après le soin) bloqué → GEL du jeu en sortie de Centre Pokémon. MÊME bug + MÊME fix que
// CUT_TREE / ROCK_SMASH_BREAK. De plus le sprite nurse a son anim PAUSÉE par défaut (NPC stationnaire) →
// poser `animPaused = false` au Step0 (sinon l'anim ne tick pas → animEnded jamais → WaitSpriteAnim boucle).
//   Step0 : StartSpriteAnimInDirection(DIR_SOUTH, ANIM_NURSE_BOW) + animPaused=false ; actionStep=1.
//   Step1 : MovementAction_WaitSpriteAnim (à animEnded → actionStep=2).
//   Step2 : MovementAction_PauseSpriteAnim (animPaused=TRUE) → DONE.
function _MovementAction_NurseJoyBowDown(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const sprite = npc.spriteId >= 0 ? rt.gSprites[npc.spriteId] : null;
  if (npc.actionStep === 0) {
    // 1:1 décomp StartSpriteAnimInDirection(obj, sprite, DIR_SOUTH, ANIM_NURSE_BOW) (+ sActionFuncId=1).
    SetObjectEventDirection(npc, DIR_SOUTH);
    if (sprite && sprite.anims) { StartSpriteAnim(sprite as never, ANIM_NURSE_BOW); sprite.animPaused = false; }
    npc.actionStep = 1;
    return false;
  }
  if (npc.actionStep === 1) {
    // 1:1 décomp MovementAction_WaitSpriteAnim : attend animEnded.
    if (!sprite || !sprite.anims || sprite.animEnded) npc.actionStep = 2;
    return false;
  }
  // 1:1 décomp MovementAction_PauseSpriteAnim : pause l'anim sur la dernière frame → held fini.
  if (sprite) sprite.animPaused = true;
  return true;
}

// 1:1 STRICT décomp `gMovementActionFuncs_RockSmashBreak[]` (Step0/1/2) — le rocher se brise/disparaît.
// MÊME pattern + MÊME bug que CUT_TREE : avant, un seul func (Step0) re-démarrait l'anim chaque frame
// → boucle infinie, held jamais fini → `waitmovement 0` (EventScript_SmashRock) bloqué. Maintenant
// dispatcher multi-step (Step0 start anim → Step1 WaitSpriteAnim + SetMovementDelay(32) → Step2 flicker
// invisible + WaitForMovementDelay → invisible + DONE).
function _MovementAction_RockSmashBreak(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const sprite = npc.spriteId >= 0 ? rt.gSprites[npc.spriteId] : null;
  if (npc.actionStep === 0) {
    if (sprite && sprite.anims) { StartSpriteAnim(sprite as never, ANIM_REMOVE_OBSTACLE); sprite.animPaused = false; }
    npc.actionStep = 1;
    return false;
  }
  if (npc.actionStep === 1) {
    if (!sprite || !sprite.anims || sprite.animEnded) {
      if (sprite) sprite.data[3] = 32;  // SetMovementDelay(32)
      npc.actionStep = 2;
    }
    return false;
  }
  npc.invisible = !npc.invisible;
  if (!sprite || --sprite.data[3] === 0) {
    npc.invisible = true;
    return true;
  }
  return false;
}

// 1:1 STRICT décomp `gMovementActionFuncs_CutTree[]` (Step0/1/2) — l'arbre coupable chute/disparaît.
// ⚠️ AVANT : un SEUL func (Step0) re-démarrait l'anim CHAQUE frame (posait actionStep=1 sans dispatcher
// par actionStep) → boucle infinie, held jamais fini → `waitmovement 0` (EventScript_CutTreeDown)
// bloqué → l'arbre n'était jamais retiré après Cut. Maintenant dispatcher multi-step :
//   Step0 : SetAndStartSpriteAnim(ANIM_REMOVE_OBSTACLE) ; actionStep=1.
//   Step1 : WaitSpriteAnim (arbre inanimate → anim tickée par le système global) ;
//           à animEnded : SetMovementDelay(32) (= sprite.data[3]) ; actionStep=2.
//   Step2 : invisible ^= TRUE (clignote) ; WaitForMovementDelay (--data[3]==0) → invisible=TRUE + DONE.
function _MovementAction_CutTree(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const sprite = npc.spriteId >= 0 ? rt.gSprites[npc.spriteId] : null;
  if (npc.actionStep === 0) {
    if (sprite && sprite.anims) { StartSpriteAnim(sprite as never, ANIM_REMOVE_OBSTACLE); sprite.animPaused = false; }
    npc.actionStep = 1;
    return false;
  }
  if (npc.actionStep === 1) {
    if (!sprite || !sprite.anims || sprite.animEnded) {
      if (sprite) sprite.data[3] = 32;  // SetMovementDelay(32)
      npc.actionStep = 2;
    }
    return false;
  }
  // Step2 : flicker + wait delay → invisible + complete.
  npc.invisible = !npc.invisible;
  if (!sprite || --sprite.data[3] === 0) {
    npc.invisible = true;
    return true;  // held movement complete → step_end → waitmovement done → removeobject
  }
  return false;
}

// ─── Jump physics 1:1 strict décomp ──────────────────────────────────────────
// Source : event_object_movement.c:8464 DoJumpSpriteMovement + 5427 InitJump
// + sJumpY_High/Low/Normal tables.

/** 1:1 décomp `JUMP_DISTANCE_*` (event_object_movement.c). */
const JUMP_DISTANCE_IN_PLACE = 0;
const JUMP_DISTANCE_NORMAL = 1;
const JUMP_DISTANCE_FAR = 2;

/** 1:1 décomp `JUMP_TYPE_*` (event_object_movement.c). */
const JUMP_TYPE_HIGH = 0;
const JUMP_TYPE_LOW = 1;
const JUMP_TYPE_NORMAL = 2;

/** 1:1 décomp `JUMP_HALFWAY` / `JUMP_FINISHED`. */
const JUMP_HALFWAY = 1;
const JUMP_FINISHED = 2;

/** 1:1 décomp `sJumpInitDisplacements` (movement_action_func_tables.h:709). */
const _sJumpInitDisplacements = [0, 1, 1];  // [IN_PLACE, NORMAL, FAR]
/** 1:1 décomp `sJumpDisplacements` (movement_action_func_tables.h:714). */
const _sJumpDisplacements = [0, 0, 1];  // [IN_PLACE, NORMAL, FAR]

/** 1:1 décomp `sJumpY_High` (event_object_movement.c). */
const _sJumpY_High: readonly number[] = [-4, -6, -8, -10, -11, -12, -12, -12, -11, -10, -9, -8, -6, -4, 0, 0];
/** 1:1 décomp `sJumpY_Low`. */
const _sJumpY_Low: readonly number[] = [0, -2, -3, -4, -5, -6, -6, -6, -5, -5, -4, -3, -2, 0, 0, 0];
/** 1:1 décomp `sJumpY_Normal`. */
const _sJumpY_Normal: readonly number[] = [-2, -4, -6, -8, -9, -10, -10, -10, -9, -8, -6, -5, -3, -2, 0, 0];

const _sJumpYTable: readonly (readonly number[])[] = [_sJumpY_High, _sJumpY_Low, _sJumpY_Normal];

/** Jump state per npc : direction, distance, type, timer. Stocké sur npc
 *  via actionStep (sActionFuncId) + actionTimer (= sprite.data[6] sTimer) +
 *  walkDirection (= sDirection) + un nouveau field jumpType/jumpDistance. */

/** 1:1 décomp `InitJump` (event_object_movement.c:5427) :
 *    SetObjectEventDirection + MoveCoords(distance) + ShiftCoords + SetJumpSpriteData
 *    + sActionFuncId=1 + animPaused=FALSE + triggerGroundEffectsOnMove=TRUE +
 *    disableCoveringGroundEffects=TRUE.
 *
 *  InitJumpRegular (5446) = InitJump + SetStepAnimHandleAlternation(GetMoveDirectionAnimNum)
 *  + DoShadowFieldEffect (= cascade FieldEffect ; skip H3 dette). */
function _InitJump(rt: DecompRuntime, npc: ObjectEvent, dir: number, distance: number, type: number): void {
  const initDist = _sJumpInitDisplacements[distance] ?? 0;
  const dx = (DIR_TO_DX[dir] ?? 0) * initDist;
  const dy = (DIR_TO_DY[dir] ?? 0) * initDist;
  SetObjectEventDirection(npc, dir);
  ShiftObjectEventCoords(npc, npc.currentCoordsX + dx, npc.currentCoordsY + dy);
  npc.walkDirection = dir;  // sDirection
  npc.jumpDistance = distance;
  npc.jumpType = type;
  npc.actionTimer = 0;  // sTimer
  npc.actionStep = 1;  // sActionFuncId
  // H4.3 fix : 1:1 strict décomp InitJump set triggerGroundEffectsOnMove +
  // disableCoveringGroundEffects = TRUE (event_object_movement.c:5442-5443).
  npc.triggerGroundEffectsOnMove = true;
  npc.disableCoveringGroundEffects = true;
  // 1:1 décomp `InitJumpRegular` (event_object_movement.c:5449) : l'anim suit `facingDirection`,
  // PAS la direction du saut. Crucial pour le SIDE JUMP acro (facingDirectionLocked garde la face
  // perpendiculaire pendant qu'on saute sur le côté) — sinon le sprite se tournait vers le côté.
  // (Pour un saut de ledge facingDirection == dir → identique.)
  _npcStartWalkAnim(rt, npc, npc.facingDirection);
  // Visual : worldX/Y reflect previousCoords (= source position), npc walks vers dest.
  // Sans shift visuel direct (= y2 anim parabolic handle ça).
}

/** 1:1 décomp `DoJumpSpriteMovement` (event_object_movement.c:8464). */
function _DoJumpSpriteMovement(rt: DecompRuntime, npc: ObjectEvent): number {
  const distanceToTime = [16, 16, 32];
  const distanceToShift = [0, 0, 1];
  const dist = npc.jumpDistance;
  const type = npc.jumpType;
  // Visual shift via worldX/Y for non-in-place jumps (= NPC bouge progressivement vers dest).
  // 1:1 décomp Step1(sprite, sDirection) translates sprite.x/y by 1px each step
  // for non-IN_PLACE jumps.
  if (dist !== JUMP_DISTANCE_IN_PLACE) {
    const dx = DIR_TO_DX[npc.walkDirection] ?? 0;
    const dy = DIR_TO_DY[npc.walkDirection] ?? 0;
    npc.worldX += dx;
    npc.worldY += dy;
  }
  // 1:1 décomp sprite->y2 = sJumpY[type][sTimer >> shift].
  const shift = distanceToShift[dist] ?? 0;
  const yIdx = Math.min(15, npc.actionTimer >> shift);
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.y2 = _sJumpYTable[type][yIdx] ?? 0;
  }
  npc.actionTimer++;
  const halfTime = (distanceToTime[dist] ?? 16) >> 1;
  if (npc.actionTimer === halfTime) return JUMP_HALFWAY;
  if (npc.actionTimer >= (distanceToTime[dist] ?? 16)) {
    if (npc.spriteId >= 0) {
      const sprite = rt.gSprites[npc.spriteId];
      if (sprite) sprite.y2 = 0;
    }
    return JUMP_FINISHED;
  }
  return 0;  // continuing
}

/** 1:1 décomp `UpdateJumpAnim` (event_object_movement.c:5455). */
function _UpdateJumpAnim(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const result = _DoJumpSpriteMovement(rt, npc);
  if (result === JUMP_HALFWAY) {
    const halfDist = _sJumpDisplacements[npc.jumpDistance] ?? 0;
    if (halfDist !== 0) {
      // Second shift coords pour JUMP_2 / FAR.
      const dx = (DIR_TO_DX[npc.walkDirection] ?? 0) * halfDist;
      const dy = (DIR_TO_DY[npc.walkDirection] ?? 0) * halfDist;
      ShiftObjectEventCoords(npc, npc.currentCoordsX + dx, npc.currentCoordsY + dy);
      // H4.3 fix : 1:1 strict UpdateJumpAnim (5470-5471) set triggerGroundEffectsOnMove +
      // disableCoveringGroundEffects = TRUE au halfway.
      npc.triggerGroundEffectsOnMove = true;
      npc.disableCoveringGroundEffects = true;
    }
  } else if (result === JUMP_FINISHED) {
    ShiftStillObjectEventCoords(npc);
    // H4.3 fix : 1:1 strict UpdateJumpAnim (5476-5478) set triggerGroundEffectsOnStop +
    // landingJump = TRUE au finish.
    npc.triggerGroundEffectsOnStop = true;
    npc.landingJump = true;
    return true;
  }
  return false;
}

/** Factory pour MovementAction_Jump* avec direction + distance + type. */
function _makeJumpAction(dir: number, distance: number, type: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitJump(rt, npc, dir, distance, type);
      // 1:1 décomp InitJumpRegular : DoShadowFieldEffect (ombre de saut).
      DoShadowFieldEffect(npc);
      // Step0 retourne Step1 chain (1:1 décomp).
    }
    // Step1 : UpdateJumpAnim → JUMP_FINISHED set sActionFuncId = 2 + hasShadow = FALSE.
    if (_UpdateJumpAnim(rt, npc)) {
      npc.hasShadow = false;
      npc.actionStep = 2;
      _npcEndWalkAnim(rt, npc);
      return true;
    }
    return false;
  };
}

/** 1:1 décomp `DoJumpSpecialSpriteMovement` (event_object_movement.c:8497).
 *  distanceToTime doublé (32/32/64) + distanceToShift doublé (1/1/2).
 *  Visual shift seulement on even sTimer (= half speed). */
function _DoJumpSpecialSpriteMovement(rt: DecompRuntime, npc: ObjectEvent): number {
  const distanceToTime = [32, 32, 64];
  const distanceToShift = [1, 1, 2];
  const dist = npc.jumpDistance;
  const type = npc.jumpType;
  // Visual shift sur even sTimer seulement (= ralenti par 2 vs DoJumpSpriteMovement).
  if (dist !== JUMP_DISTANCE_IN_PLACE && (npc.actionTimer & 1) === 0) {
    const dx = DIR_TO_DX[npc.walkDirection] ?? 0;
    const dy = DIR_TO_DY[npc.walkDirection] ?? 0;
    npc.worldX += dx;
    npc.worldY += dy;
  }
  // 1:1 décomp sprite->y2 = sJumpY[type][sTimer >> shift].
  const shift = distanceToShift[dist] ?? 1;
  const yIdx = Math.min(15, npc.actionTimer >> shift);
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.y2 = _sJumpYTable[type][yIdx] ?? 0;
  }
  npc.actionTimer++;
  const halfTime = (distanceToTime[dist] ?? 32) >> 1;
  if (npc.actionTimer === halfTime) return JUMP_HALFWAY;
  if (npc.actionTimer >= (distanceToTime[dist] ?? 32)) {
    if (npc.spriteId >= 0) {
      const sprite = rt.gSprites[npc.spriteId];
      if (sprite) sprite.y2 = 0;
    }
    return JUMP_FINISHED;
  }
  return 0;
}

/** 1:1 décomp `UpdateJumpAnim` (= via DoJumpSpecialSpriteMovement callback). */
function _UpdateJumpSpecialAnim(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const result = _DoJumpSpecialSpriteMovement(rt, npc);
  if (result === JUMP_HALFWAY) {
    const halfDist = _sJumpDisplacements[npc.jumpDistance] ?? 0;
    if (halfDist !== 0) {
      const dx = (DIR_TO_DX[npc.walkDirection] ?? 0) * halfDist;
      const dy = (DIR_TO_DY[npc.walkDirection] ?? 0) * halfDist;
      ShiftObjectEventCoords(npc, npc.currentCoordsX + dx, npc.currentCoordsY + dy);
    }
  } else if (result === JUMP_FINISHED) {
    ShiftStillObjectEventCoords(npc);
    return true;
  }
  return false;
}

/** 1:1 décomp `InitJumpSpecial` (event_object_movement.c) :
 *    InitJump(obj, sprite, direction, JUMP_DISTANCE_NORMAL, JUMP_TYPE_HIGH);
 *    StartSpriteAnim(sprite, GetJumpSpecialDirectionAnimNum(direction));
 *
 *  Dette R3 : GetJumpSpecialDirectionAnimNum (= ANIM_JUMP_SPECIAL_X). Notre
 *  _InitJump utilise _npcStartWalkAnim (= GetMoveDirectionAnimNum). Pour 1:1
 *  strict full il faudrait ANIM_JUMP_SPECIAL. */
function _makeJumpSpecialAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitJump(rt, npc, dir, JUMP_DISTANCE_NORMAL, JUMP_TYPE_HIGH);
    }
    if (_UpdateJumpSpecialAnim(rt, npc)) {
      npc.actionStep = 2;
      _npcEndWalkAnim(rt, npc);
      return true;
    }
    return false;
  };
}

/** 1:1 décomp `DoJumpInPlaceAnim` (event_object_movement.c) :
 *    switch (DoJumpAnimStep) {
 *      case JUMP_FINISHED: return TRUE;
 *      case JUMP_HALFWAY:
 *        SetObjectEventDirection(GetOppositeDirection(movementDirection));
 *        SetStepAnim(GetMoveDirectionAnimNum(facingDirection));
 *      default: return FALSE;
 *    } */
function _UpdateJumpInPlaceAnim(rt: DecompRuntime, npc: ObjectEvent): boolean {
  const result = _DoJumpSpriteMovement(rt, npc);
  if (result === JUMP_FINISHED) return true;
  if (result === JUMP_HALFWAY) {
    // Swap to opposite direction au halfway.
    SetObjectEventDirection(npc, OPPOSITE_DIR[npc.movementDirection] ?? DIR_SOUTH);
    _npcStartWalkAnim(rt, npc, npc.facingDirection);
  }
  return false;
}

/** Factory pour JumpInPlaceX_Y (alternating direction au halfway). */
function _makeJumpInPlaceAlternatingAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitJump(rt, npc, dir, JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_NORMAL);
      // 1:1 décomp InitJumpRegular (in-place utilise aussi InitJumpRegular) : DoShadowFieldEffect.
      DoShadowFieldEffect(npc);
    }
    if (_UpdateJumpInPlaceAnim(rt, npc)) {
      npc.hasShadow = false;
      npc.actionStep = 2;
      _npcEndWalkAnim(rt, npc);
      return true;
    }
    return false;
  };
}

/** 1:1 décomp `AcroWheelieFaceDirection` (event_object_movement.c) :
 *    SetObjectEventDirection(direction);
 *    ShiftStillObjectEventCoords;
 *    SetStepAnim(GetAcroWheeliePedalDirectionAnimNum(direction));
 *    sprite->animPaused = TRUE;
 *    sActionFuncId = 1; */
function _makeAcroWheelieFaceAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    SetObjectEventDirection(npc, dir);
    ShiftStillObjectEventCoords(npc);
    if (npc.spriteId >= 0) {
      const sprite = rt.gSprites[npc.spriteId];
      if (sprite && sprite.anims) {
        StartSpriteAnim(sprite as never, sAcroWheeliePedalDirectionAnimNums[dir] ?? 0);
        sprite.animPaused = true;
      }
    }
    npc.actionStep = 1;
    return true;
  };
}

/** 1:1 décomp table `gMovementActionFuncs_AcroPopWheelieX` = [Step0, WaitSpriteAnim, PauseSpriteAnim] :
 *    Step0: StartSpriteAnimInDirection(obj, sprite, dir, GetAcroWheelieDirectionAnimNum(dir)); return FALSE.
 *    Step1 (WaitSpriteAnim): attend sprite->animEnded → avance. Step2 (PauseSpriteAnim): animPaused=TRUE; return TRUE.
 *  ⚠️ Le décomp avance l'anim via AnimateSprites() (tick global par frame) ; notre port ne tick PAS
 *  le sprite joueur ailleurs (seulement les `inanimate`) → la WaitSpriteAnim avance l'anim ICI
 *  (AnimateSprite) pour que l'anim one-shot pop wheelie [frame,frame,end] se joue et set animEnded.
 *  Sans ça : action jamais finie → held bloqué → TryInterrupt gèle l'input wheelie (bfc reste 0). */
function _makeAcroPopWheelieAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    const sprite = npc.spriteId >= 0 ? rt.gSprites[npc.spriteId] : null;
    if (npc.actionStep === 0) {
      SetObjectEventDirection(npc, dir);
      // 1:1 décomp StartSpriteAnimInDirection→SetAndStartSpriteAnim : clear animPaused (sinon l'anim
      // héritée paused — ex. depuis l'idle wheelie PauseSpriteAnim — n'avance pas → WaitSpriteAnim gèle).
      if (sprite && sprite.anims) { StartSpriteAnim(sprite as never, sAcroWheelieDirectionAnimNums[dir] ?? 0); sprite.animPaused = false; }
      npc.actionStep = 1;
      return false;
    }
    if (npc.actionStep === 1) {  // WaitSpriteAnim
      if (sprite && sprite.anims) {
        AnimateSprite(rt, sprite as never);
        if (sprite.animEnded) npc.actionStep = 2;
      } else {
        npc.actionStep = 2;
      }
      return false;
    }
    if (sprite) sprite.animPaused = true;  // PauseSpriteAnim
    return true;
  };
}

/** 1:1 décomp table `gMovementActionFuncs_AcroEndWheelieFaceX` = [Step0, WaitSpriteAnim, PauseSpriteAnim].
 *  Idem pop wheelie : anim one-shot end-wheelie avancée ici (notre port ne tick pas le joueur ailleurs). */
function _makeAcroEndWheelieFaceAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    const sprite = npc.spriteId >= 0 ? rt.gSprites[npc.spriteId] : null;
    if (npc.actionStep === 0) {
      SetObjectEventDirection(npc, dir);
      // 1:1 SetAndStartSpriteAnim : clear animPaused (l'idle wheelie a posé animPaused=TRUE).
      if (sprite && sprite.anims) { StartSpriteAnim(sprite as never, sAcroEndWheelieDirectionAnimNums[dir] ?? 0); sprite.animPaused = false; }
      npc.actionStep = 1;
      return false;
    }
    if (npc.actionStep === 1) {  // WaitSpriteAnim
      if (sprite && sprite.anims) {
        AnimateSprite(rt, sprite as never);
        if (sprite.animEnded) npc.actionStep = 2;
      } else {
        npc.actionStep = 2;
      }
      return false;
    }
    if (sprite) sprite.animPaused = true;  // PauseSpriteAnim
    return true;
  };
}

/** 1:1 décomp `InitAcroWheelieJump` (event_object_movement.c) :
 *    InitJump(obj, sprite, dir, distance, type);
 *    StartSpriteAnimIfDifferent(sprite, GetAcroWheelieDirectionAnimNum(dir));
 *    DoShadowFieldEffect(obj);
 *
 *  Pour 1:1 strict, utilise _InitJump (= déjà porté) + StartSpriteAnim avec
 *  ANIM_BUNNY_HOP_BACK_WHEEL_X. */
function _makeAcroWheelieJumpAction(dir: number, distance: number, type: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitJump(rt, npc, dir, distance, type);
      // 1:1 décomp : StartSpriteAnim wheelie au lieu de walk anim.
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite && sprite.anims) {
          StartSpriteAnim(sprite as never, sAcroWheelieDirectionAnimNums[dir] ?? 0);
        }
      }
      // 1:1 décomp InitAcroWheelieJump : DoShadowFieldEffect (ombre de saut).
      DoShadowFieldEffect(npc);
    }
    if (_UpdateJumpAnim(rt, npc)) {
      npc.hasShadow = false;
      npc.actionStep = 2;
      _npcEndWalkAnim(rt, npc);
      return true;
    }
    return false;
  };
}

/** 1:1 décomp `MovementAction_AcroWheelieInPlaceX_Step0` :
 *    InitMoveInPlace(obj, sprite, dir, GetAcroWheeliePedalDirectionAnimNum(dir), 8);
 *    return MovementAction_WalkInPlace_Step1; */
function _makeAcroWheelieInPlaceAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      // InitMoveInPlace avec wheelie pedal anim au lieu de walk anim.
      SetObjectEventDirection(npc, dir);
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite && sprite.anims) {
          StartSpriteAnim(sprite as never, sAcroWheeliePedalDirectionAnimNums[dir] ?? 0);
        }
      }
      npc.actionStep = 1;
      npc.actionTimer = 8;  // 1:1 décomp duration 8.
    }
    return _MovementAction_WalkInPlace_Step1(rt, npc);
  };
}

/** 1:1 décomp `InitAcroPopWheelie` (event_object_movement.c) :
 *    InitNpcForMovement(obj, sprite, dir, speed);
 *    StartSpriteAnim(GetAcroWheelieDirectionAnimNum(facingDirection));
 *    SeekSpriteAnim(sprite, 0); */
function _makeAcroPopWheelieMoveAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitNpcForMovement(rt, npc, dir, MOVE_SPEED_FAST_1);
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite && sprite.anims) {
          // 1:1 décomp : StartSpriteAnim(wheelie back wheel) + SeekSpriteAnim(0).
          StartSpriteAnim(sprite as never, sAcroWheelieDirectionAnimNums[dir] ?? 0);
        }
      }
    }
    return _MovementAction_WalkNormal_Step1(rt, npc);
  };
}

/** 1:1 décomp `InitAcroWheelieMove` (event_object_movement.c) :
 *    InitNpcForMovement(obj, sprite, dir, speed);
 *    SetStepAnimHandleAlternation(GetAcroWheeliePedalDirectionAnimNum(facingDirection)); */
function _makeAcroWheelieMoveAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitNpcForMovement(rt, npc, dir, MOVE_SPEED_FAST_1);
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite && sprite.anims) {
          // 1:1 décomp : SetStepAnim(moving wheelie pedal).
          StartSpriteAnim(sprite as never, sAcroWheeliePedalDirectionAnimNums[dir] ?? 0);
        }
      }
    }
    return _MovementAction_WalkNormal_Step1(rt, npc);
  };
}

/** 1:1 décomp `ST_OAM_AFFINE_*` (gba/oam.h) : affineMode values. */
const ST_OAM_AFFINE_OFF    = 0;
const ST_OAM_AFFINE_NORMAL = 1;
const ST_OAM_AFFINE_DOUBLE = 3;
void ST_OAM_AFFINE_NORMAL;

/** 1:1 décomp `ChangeSpriteAffineAnimIfDifferent(sprite, affineAnimNum)` (sprite.c) :
 *    if (sprite->affineAnims[sprite->affineAnimNum] != sprite->affineAnims[affineAnimNum])
 *        ChangeSpriteAffineAnim(sprite, affineAnimNum);
 *
 *  Notre TS : set affineAnimNum + reset cmd index. */
function _ChangeSpriteAffineAnimIfDifferent(rt: DecompRuntime, npc: ObjectEvent, affineAnimNum: number): void {
  if (npc.spriteId < 0) return;
  const sprite = rt.gSprites[npc.spriteId];
  if (!sprite) return;
  if (sprite.affineAnimNum !== affineAnimNum) {
    sprite.affineAnimNum = affineAnimNum;
    sprite.affineAnimCmdIndex = 0;
    sprite.affineAnimBeginning = true;
    sprite.affineAnimDelayCounter = 0;
  }
}

/** 1:1 décomp `MovementAction_InitAffineAnim_Step0` (event_object_movement.c) :
 *    sprite->oam.affineMode = ST_OAM_AFFINE_DOUBLE;
 *    InitSpriteAffineAnim(sprite);
 *    sprite->affineAnimPaused = TRUE;
 *    sprite->subspriteMode = SUBSPRITES_OFF;
 *    return TRUE;
 *
 *  H3.5 fix : wire fields sprite.affineMode + affineAnimPaused + subspriteMode
 *  1:1 strict. DETTE R3 mineure : InitSpriteAffineAnim cascade (= matrix alloc
 *  GBA OAM), pas critique pour le state machine. */
function _MovementAction_InitAffineAnim_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.affineMode = ST_OAM_AFFINE_DOUBLE;
      sprite.affineAnimPaused = true;
      sprite.subspriteMode = 'off';
      // DETTE R3 mineure : InitSpriteAffineAnim matrix alloc (= AllocOamMatrix).
    }
  }
  return true;
}

/** 1:1 décomp `MovementAction_ClearAffineAnim_Step0` :
 *    FreeOamMatrix(sprite->oam.matrixNum);
 *    sprite->oam.affineMode = ST_OAM_AFFINE_OFF;
 *    CalcCenterToCornerVec(sprite, sprite->oam.shape, sprite->oam.size, sprite->oam.affineMode);
 *    return TRUE;
 *
 *  H3.5 fix : wire affineMode = OFF 1:1 strict. DETTE R3 mineure : FreeOamMatrix
 *  + CalcCenterToCornerVec cascade. */
function _MovementAction_ClearAffineAnim_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.affineMode = ST_OAM_AFFINE_OFF;
      // DETTE R3 : FreeOamMatrix(matrixNum) + CalcCenterToCornerVec.
    }
  }
  return true;
}

// ─── LevitateMovementTask 1:1 strict port (H3.2) ────────────────────────────
// Source : event_object_movement.c:8897-8932 + ApplyLevitateMovement (8907).
// Task data structure :
//   data[0..1] = objEventId pointer (= notre TS : just objEventId number)
//   data[2] = timer (counter)
//   data[3] = direction (initialement 0xFFFF = -1 signé, toggle ±1)

interface _LevitateTaskState {
  objEventId: number;
  timer: number;       // task.data[2]
  direction: number;   // task.data[3] : -1 ou +1
}

/** 1:1 décomp tasks levitate registry. Keyed par objEventId (= notre TS proxy
 *  pour task ID, stored dans npc.warpArrowSpriteId). */
const _sLevitateTasksByObjEventId: Map<number, _LevitateTaskState> = new Map();

/** 1:1 décomp `CreateLevitateMovementTask(objectEvent)` (event_object_movement.c:8897) :
 *    taskId = CreateTask(ApplyLevitateMovement, 0xFF);
 *    StoreWordInTwoHalfwords(&task->data[0], (u32)objectEvent);
 *    objectEvent->warpArrowSpriteId = taskId;
 *    task->data[3] = 0xFFFF;  // = -1 signed */
function _CreateLevitateMovementTask(npc: ObjectEvent): void {
  // Trouver objEventId via lookup dans gObjectEvents.
  let objEventId = -1;
  for (let i = 0; i < gObjectEvents.length; i++) {
    if (gObjectEvents[i] === npc) { objEventId = i; break; }
  }
  if (objEventId < 0) return;
  _sLevitateTasksByObjEventId.set(objEventId, {
    objEventId,
    timer: 0,
    direction: -1,  // 0xFFFF = -1 signed
  });
  npc.warpArrowSpriteId = objEventId;  // = task ID proxy
}

/** 1:1 décomp `DestroyLevitateMovementTask(taskId)` (event_object_movement.c:8925) :
 *    DestroyTask(taskId). */
function _DestroyLevitateMovementTask(taskId: number): void {
  _sLevitateTasksByObjEventId.delete(taskId);
}

/** 1:1 décomp `ApplyLevitateMovement(taskId)` (event_object_movement.c:8907) :
 *    sprite = &gSprites[objectEvent->spriteId];
 *    if (!(task->data[2] & 3)) sprite->y2 += task->data[3];
 *    if (!(task->data[2] & 15)) task->data[3] = -task->data[3];
 *    task->data[2]++;
 *
 *  Called per-frame depuis `ApplyLevitateMovement_TickAll`. */
function _ApplyLevitateMovement(rt: DecompRuntime, state: _LevitateTaskState): void {
  const npc = gObjectEvents[state.objEventId];
  if (!npc || !npc.active) return;
  if (npc.spriteId < 0) return;
  const sprite = rt.gSprites[npc.spriteId];
  if (!sprite) return;

  if ((state.timer & 3) === 0) sprite.y2 += state.direction;
  if ((state.timer & 15) === 0) state.direction = -state.direction;
  state.timer++;
}

/** Tick all active levitate tasks per-frame. À appeler depuis le scene tick
 *  loop (= TestOverworldScene). */
export function ApplyLevitateMovement_TickAll(rt: DecompRuntime): void {
  for (const state of _sLevitateTasksByObjEventId.values()) {
    _ApplyLevitateMovement(rt, state);
  }
}

/** Reset complet du levitate task registry — call au map switch / scene reset. */
export function ResetLevitateMovementTasks(): void {
  _sLevitateTasksByObjEventId.clear();
}

/** 1:1 décomp `MovementAction_Levitate_Step0` (event_object_movement.c:7292) :
 *    CreateLevitateMovementTask(objectEvent);
 *    sprite->sActionFuncId = 1;
 *    return TRUE; */
function _MovementAction_Levitate_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  _CreateLevitateMovementTask(npc);
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_StopLevitate_Step0` (event_object_movement.c:7299) :
 *    DestroyLevitateMovementTask(objectEvent->warpArrowSpriteId);
 *    sprite->y2 = 0;
 *    sActionFuncId = 1; return TRUE; */
function _MovementAction_StopLevitate_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  _DestroyLevitateMovementTask(npc.warpArrowSpriteId);
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.y2 = 0;
  }
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_StopLevitateAtTop_Step0` (event_object_movement.c:7307) :
 *    if (sprite->y2 == 0) {
 *        DestroyLevitateMovementTask(objectEvent->warpArrowSpriteId);
 *        sActionFuncId = 1; return TRUE;
 *    }
 *    return FALSE; */
function _MovementAction_StopLevitateAtTop_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite && sprite.y2 === 0) {
      _DestroyLevitateMovementTask(npc.warpArrowSpriteId);
      npc.actionStep = 1;
      return true;
    }
  }
  return false;
}

// ─── Figure8Anim 1:1 strict port (H3.3) ──────────────────────────────────────
// Source : event_object_movement.c:6810 InitFigure8Anim + 6816 DoFigure8Anim +
// 8349 sFigure8XOffsets[72] + 8361 sFigure8YOffsets[72] + 8383
// InitSpriteForFigure8Anim + 8389 AnimateSpriteInFigure8.

/** 1:1 décomp `FIGURE_8_LENGTH` = 72 (event_object_movement.c). */
const FIGURE_8_LENGTH = 72;

/** 1:1 décomp `sFigure8XOffsets[72]` (event_object_movement.c:8349). */
const _sFigure8XOffsets: readonly number[] = [
   1, 2, 2, 2, 2, 2, 2, 2,
   2, 2, 2, 1, 2, 2, 1, 2,
   2, 1, 2, 2, 1, 2, 1, 1,
   2, 1, 1, 2, 1, 1, 2, 1,
   1, 2, 1, 1, 1, 1, 1, 1,
   1, 1, 1, 1, 1, 1, 1, 1,
   0, 1, 1, 1, 0, 1, 1, 0,
   1, 0, 1, 0, 1, 0, 0, 0,
   0, 1, 0, 0, 0, 0, 0, 0,
];

/** 1:1 décomp `sFigure8YOffsets[72]` (event_object_movement.c:8361). */
const _sFigure8YOffsets: readonly number[] = [
   0,  0,  1,  0,  0,  1,  0,  0,
   1,  0,  1,  1,  0,  1,  1,  0,
   1,  1,  0,  1,  1,  0,  1,  1,
   0,  0,  1,  0,  0,  1,  0,  0,
   1,  0,  0,  0,  0,  0,  0,  0,
   0,  0,  0,  0,  0,  0,  0,  0,
   0,  0, -1,  0,  0, -1,  0,  0,
  -1,  0, -1, -1,  0, -1, -1,  0,
  -1, -1, -1, -1, -1, -1, -1, -2,
];

/** 1:1 décomp `InitSpriteForFigure8Anim` (event_object_movement.c:8383) :
 *    sprite->data[6] = 0;
 *    sprite->data[7] = 0; */
function _InitSpriteForFigure8Anim(npc: ObjectEvent): void {
  npc.figure8Idx = 0;
  npc.figure8Phase = 0;
}

/** 1:1 décomp `InitFigure8Anim` (event_object_movement.c:6810) :
 *    InitSpriteForFigure8Anim(sprite);
 *    sprite->animPaused = FALSE; */
function _InitFigure8Anim(rt: DecompRuntime, npc: ObjectEvent): void {
  _InitSpriteForFigure8Anim(npc);
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.animPaused = false;
  }
}

/** 1:1 décomp `AnimateSpriteInFigure8(sprite)` (event_object_movement.c:8389) :
 *    switch (sprite->data[7]) {  // = npc.figure8Phase
 *      case 0: sprite->x2 += GetFigure8XOffset(data[6]); y2 += GetFigure8YOffset(data[6]); break;
 *      case 1: sprite->x2 -= GetFigure8XOffset((FIGURE_8_LENGTH-1) - data[6]); y2 += GetFigure8YOffset(...); break;
 *      case 2: sprite->x2 -= GetFigure8XOffset(data[6]); y2 += GetFigure8YOffset(data[6]); break;
 *      case 3: sprite->x2 += GetFigure8XOffset((FIGURE_8_LENGTH-1) - data[6]); y2 += GetFigure8YOffset(...); break;
 *    }
 *    if (++data[6] == FIGURE_8_LENGTH) { data[6]=0; data[7]++; }
 *    if (data[7] == 4) { y2=0; x2=0; finished=TRUE; } */
function _AnimateSpriteInFigure8(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.spriteId < 0) return true;
  const sprite = rt.gSprites[npc.spriteId];
  if (!sprite) return true;

  // x2 field — notre DecompSprite a x2 (cf. decomp-runtime.ts).
  const idx = npc.figure8Idx;
  const idxReverse = (FIGURE_8_LENGTH - 1) - idx;
  switch (npc.figure8Phase) {
    case 0:
      sprite.x2 += _sFigure8XOffsets[idx] ?? 0;
      sprite.y2 += _sFigure8YOffsets[idx] ?? 0;
      break;
    case 1:
      sprite.x2 -= _sFigure8XOffsets[idxReverse] ?? 0;
      sprite.y2 += _sFigure8YOffsets[idxReverse] ?? 0;
      break;
    case 2:
      sprite.x2 -= _sFigure8XOffsets[idx] ?? 0;
      sprite.y2 += _sFigure8YOffsets[idx] ?? 0;
      break;
    case 3:
      sprite.x2 += _sFigure8XOffsets[idxReverse] ?? 0;
      sprite.y2 += _sFigure8YOffsets[idxReverse] ?? 0;
      break;
  }
  npc.figure8Idx++;
  if (npc.figure8Idx === FIGURE_8_LENGTH) {
    npc.figure8Idx = 0;
    npc.figure8Phase++;
  }
  if (npc.figure8Phase === 4) {
    sprite.x2 = 0;
    sprite.y2 = 0;
    return true;
  }
  return false;
}

/** 1:1 décomp `DoFigure8Anim` (event_object_movement.c:6816) :
 *    if (AnimateSpriteInFigure8) {
 *      ShiftStillObjectEventCoords + triggerGroundEffectsOnStop +
 *      sprite->animPaused = TRUE; return TRUE;
 *    }
 *    return FALSE; */
function _DoFigure8Anim(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (_AnimateSpriteInFigure8(rt, npc)) {
    ShiftStillObjectEventCoords(npc);
    if (npc.spriteId >= 0) {
      const sprite = rt.gSprites[npc.spriteId];
      if (sprite) sprite.animPaused = true;
    }
    return true;
  }
  return false;
}

/** 1:1 décomp `MovementAction_Figure8_Step0` (event_object_movement.c:6828) +
 *  Step1 (6835). Step0 init + chain to Step1. Step1 tick DoFigure8Anim. */
function _MovementAction_Figure8(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.actionStep === 0) {
    _InitFigure8Anim(rt, npc);
    npc.actionStep = 1;
  }
  if (_DoFigure8Anim(rt, npc)) {
    npc.actionStep = 2;
    return true;
  }
  return false;
}

// H3.1 : `_makeWalkDownAffineAction` retiré (= utilisait MOVE_SPEED_SLOWER hack).
// Remplacé par `_makeWalkDownAffineActionStrict` qui utilise InitWalkSlow path
// 1:1 strict architectural. Cf. defs supra.

/** 1:1 décomp `MovementAction_RevealTrainer_Step0` (event_object_movement.c) :
 *    if (objectEvent->movementType == MOVEMENT_TYPE_BURIED) {
 *      SetBuriedTrainerMovement(objectEvent); return FALSE;
 *    }
 *    sActionFuncId = 1; return MovementAction_RevealTrainer_Step1.
 *
 *  Step1 : if (UpdateRevealDisguise) { sActionFuncId=2; return TRUE; }
 *  return FALSE.
 *
 *  Dette H3 cascade : SetBuriedTrainerMovement + UpdateRevealDisguise +
 *  Disguise/Buried sub-systems. State machine porté partial. */
function _MovementAction_RevealTrainer_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  // 1:1 décomp `MovementAction_RevealTrainer_Step0` (event_object_movement.c:6503) :
  //   if (movementType == MOVEMENT_TYPE_BURIED) { SetBuriedTrainerMovement(obj); return FALSE; }
  //   if (movementType != TREE_DISGUISE && != MOUNTAIN_DISGUISE) { sActionFuncId=2; return TRUE; }
  //   StartRevealDisguise(obj); sActionFuncId=1; return MovementAction_RevealTrainer_Step1(...);
  if (npc.movementType === 'MOVEMENT_TYPE_BURIED') {
    // SetBuriedTrainerMovement vit dans trainer_see.ts (module propriétaire de la
    // machine TRSEE) → pont globalThis pour éviter le cycle ESM eom↔trainer_see.
    const g = globalThis as { __trainerSee?: { SetBuriedTrainerMovement?: (o: ObjectEvent) => void } };
    g.__trainerSee?.SetBuriedTrainerMovement?.(npc);
    return false;
  }
  if (npc.movementType !== 'MOVEMENT_TYPE_TREE_DISGUISE' && npc.movementType !== 'MOVEMENT_TYPE_MOUNTAIN_DISGUISE') {
    // Chemin dresseur NORMAL (route 102/103…) : reveal instantané, action finie.
    npc.actionStep = 2;
    return true;
  }
  // DÉTTE : StartRevealDisguise/UpdateRevealDisguise (animation tree/mountain
  // disguise) non portée — l'action se termine ici (le dresseur déguisé n'a pas
  // encore son animation de révélation). Concerne uniquement les rares NPCs
  // déguisés (arbre/montagne), pas l'aggro dresseur normal.
  npc.actionStep = 2;
  return true;
}

/** 1:1 décomp `MovementAction_WalkLeftAffine_Step0` / `_WalkRightAffine_Step0` :
 *    InitMovementNormal(obj, sprite, DIR_WEST/EAST, MOVE_SPEED_FAST_1);
 *    sprite->affineAnimPaused = FALSE;
 *    ChangeSpriteAffineAnimIfDifferent(sprite, 2 or 3);
 *    return Step1; */
function _makeWalkAffineAction(dir: number, affineAnimId: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitNpcForMovement(rt, npc, dir, MOVE_SPEED_FAST_1);
      // H3.5 1:1 strict : sprite.affineAnimPaused = FALSE +
      // ChangeSpriteAffineAnimIfDifferent(sprite, affineAnimId).
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite) sprite.affineAnimPaused = false;
      }
      _ChangeSpriteAffineAnimIfDifferent(rt, npc, affineAnimId);
    }
    return _MovementAction_WalkNormal_Step1(rt, npc);
  };
}

/** 1:1 décomp `DISPLAY_HEIGHT = 160` (gba/io_reg.h). */
const DISPLAY_HEIGHT = 160;

/** 1:1 décomp `MovementAction_FlyUp_Step0` :
 *    sprite->y2 = 0; sprite->sActionFuncId++; return FALSE; */
function _MovementAction_FlyUp_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.y2 = 0;
  }
  npc.actionStep = 1;
  return false;
}

/** 1:1 décomp `MovementAction_FlyUp_Step1` :
 *    sprite->y2 -= 8;
 *    if (sprite->y2 == -DISPLAY_HEIGHT) sActionFuncId++;
 *    return FALSE; */
function _MovementAction_FlyUp_Step1(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.y2 -= 8;
      if (sprite.y2 === -DISPLAY_HEIGHT) {
        npc.actionStep = 2;
      }
    }
  }
  return false;
}

/** 1:1 décomp `MovementAction_FlyDown_Step0` :
 *    sprite->y2 = -DISPLAY_HEIGHT; sActionFuncId++; return FALSE; */
function _MovementAction_FlyDown_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.y2 = -DISPLAY_HEIGHT;
  }
  npc.actionStep = 1;
  return false;
}

/** 1:1 décomp `MovementAction_FlyDown_Step1` :
 *    sprite->y2 += 8; if (!sprite->y2) sActionFuncId++; return FALSE; */
function _MovementAction_FlyDown_Step1(rt: DecompRuntime, npc: ObjectEvent): boolean {
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.y2 += 8;
      if (sprite.y2 === 0) {
        npc.actionStep = 2;
      }
    }
  }
  return false;
}

/** 1:1 décomp `MovementAction_Fly_Finish` :
 *    return TRUE (= action done sentinel). */
function _MovementAction_Fly_Finish(_rt: DecompRuntime, _npc: ObjectEvent): boolean {
  return true;
}

/** Factory FlyUp combinant Step0+Step1+Finish (= sActionFuncId dispatcher). */
function _makeFlyUpAction(): MovementActionFunc {
  return (rt, npc) => {
    switch (npc.actionStep) {
      case 0: return _MovementAction_FlyUp_Step0(rt, npc);
      case 1: return _MovementAction_FlyUp_Step1(rt, npc);
      default: return _MovementAction_Fly_Finish(rt, npc);
    }
  };
}

/** Factory FlyDown combinant Step0+Step1+Finish. */
function _makeFlyDownAction(): MovementActionFunc {
  return (rt, npc) => {
    switch (npc.actionStep) {
      case 0: return _MovementAction_FlyDown_Step0(rt, npc);
      case 1: return _MovementAction_FlyDown_Step1(rt, npc);
      default: return _MovementAction_Fly_Finish(rt, npc);
    }
  };
}

/** 1:1 décomp struct `sLockedAnimObjectEvents` (event_object_movement.c).
 *  Tracks localIds of NPCs ayant anim locked. AllocZeroed dans LockAnim_Step0,
 *  freed quand count=0 dans UnlockAnim_Step0. */
const _sLockedAnimLocalIds: Set<number> = new Set();

/** 1:1 décomp `MovementAction_LockAnim_Step0` (event_object_movement.c) :
 *    Track localId dans sLockedAnimObjectEvents + sActionFuncId = 1.
 *    Return TRUE. */
function _MovementAction_LockAnim_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  _sLockedAnimLocalIds.add(npc.localId);
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `MovementAction_UnlockAnim_Step0` (event_object_movement.c) :
 *    Remove localId de sLockedAnimObjectEvents + sActionFuncId = 1.
 *    Free sLockedAnimObjectEvents si count == 0. */
function _MovementAction_UnlockAnim_Step0(_rt: DecompRuntime, npc: ObjectEvent): boolean {
  _sLockedAnimLocalIds.delete(npc.localId);
  npc.actionStep = 1;
  return true;
}

/** 1:1 décomp `InitAcroEndWheelie` (event_object_movement.c) :
 *    InitNpcForMovement(obj, sprite, dir, speed);
 *    StartSpriteAnim(GetAcroEndWheelieDirectionAnimNum(facingDirection));
 *    SeekSpriteAnim(sprite, 0);
 *
 *  MovementAction_AcroEndWheelieMoveX_Step0 = InitAcroEndWheelie + Step1. */
function _makeAcroEndWheelieMoveAction(dir: number): MovementActionFunc {
  return (rt, npc) => {
    if (npc.actionStep === 0) {
      _InitNpcForMovement(rt, npc, dir, MOVE_SPEED_FAST_1);
      if (npc.spriteId >= 0) {
        const sprite = rt.gSprites[npc.spriteId];
        if (sprite && sprite.anims) {
          // 1:1 décomp : StartSpriteAnim(standing wheelie back wheel anim) + SeekSpriteAnim(0).
          StartSpriteAnim(sprite as never, sAcroEndWheelieDirectionAnimNums[dir] ?? 0);
        }
      }
    }
    return _MovementAction_WalkNormal_Step1(rt, npc);
  };
}

/** 1:1 décomp `MovementAction_StartAnimInDirection_Step0` (event_object_movement.c) :
 *    StartSpriteAnimInDirection(obj, sprite, movementDirection, sprite->animNum);
 *    return FALSE;
 *
 *  StartSpriteAnimInDirection (3958) : SetObjectEventDirection + StartSpriteAnim. */
function _MovementAction_StartAnimInDirection_Step0(rt: DecompRuntime, npc: ObjectEvent): boolean {
  // 1:1 STRICT décomp `gMovementActionFuncs_StartAnimInDirection[]` (movement_action_func_tables.h:990) :
  //   [0] MovementAction_StartAnimInDirection_Step0 (lance l'anim courante, sActionFuncId=1)
  //   [1] MovementAction_WaitSpriteAnim (attend SpriteAnimEnded → sActionFuncId=2, return TRUE = FINISH)
  //   [2] MovementAction_PauseSpriteAnim
  // Notre table aplatit les sActionFuncId dans `npc.actionStep`. AVANT (DETTE H1) : seul Step0 →
  // le held ne finissait JAMAIS (heldMovementFinished restait FALSE) → bloquait p.ex. la pose
  // field-move de la montée de surf (SurfFieldEffect_ShowMon attend ObjectEventCheckHeldMovementStatus).
  // ⚠️ Le slot object-event du JOUEUR a spriteId=-1 (son sprite visuel est sur gPlayerAvatar.spriteId,
  // cf. le special-case du tick TickObjectEventMovements). Sans ce même special-case ici, `sprite`=null
  // pour le joueur → l'anim de pose ne démarre jamais → `animEnded` jamais TRUE → held 57 jamais fini
  // (= la pose field-move de VOL/Surf restait bloquée sur le joueur).
  const sprite = npc.isPlayer
    ? (gPlayerAvatar.spriteId >= 0 ? rt.gSprites[gPlayerAvatar.spriteId] : null)
    : (npc.spriteId >= 0 ? rt.gSprites[npc.spriteId] : null);
  if (npc.actionStep === 0) {
    // 1:1 `StartSpriteAnimInDirection` (event_object_movement.c:6084) : SetAndStartSpriteAnim(animNum, 0)
    // (re-démarre l'anim courante depuis frame 0) + SetObjectEventDirection + sActionFuncId = 1.
    // `SetAndStartSpriteAnim` (event_object_movement.c:8549) fait : animNum=animNum ; animPaused=FALSE ;
    // SeekSpriteAnim(0). Le `animPaused = FALSE` est CRITIQUE : `UpdateMovementNormal` (fin de pas) laisse
    // le sprite avec `animPaused=TRUE` → sans ce clear, l'anim de pose ne rejoue jamais → `SpriteAnimEnded`
    // jamais TRUE → held jamais fini (ex. pose field-move de la montée de surf bloquée après une marche).
    SetObjectEventDirection(npc, npc.movementDirection);
    if (sprite) {
      sprite.animPaused = false;
      sprite.animBeginning = true;
      sprite.animEnded = false;
      sprite.animCmdIndex = 0;
      sprite.animDelayCounter = 0;
    }
    npc.actionStep = 1;
    return false;
  }
  if (npc.actionStep === 1) {
    // 1:1 `MovementAction_WaitSpriteAnim` (event_object_movement.c:6097) : SpriteAnimEnded → finish.
    if (sprite && sprite.animEnded) {
      npc.actionStep = 2;
      return true;  // heldMovementFinished = TRUE
    }
    return false;
  }
  // 1:1 `MovementAction_PauseSpriteAnim` (sActionFuncId 2) — gèle l'anim (pose tenue).
  if (sprite) sprite.animPaused = true;
  return false;
}

// ─── gMovementActionFuncs[256] dispatch table (H1) ──────────────────────────
// 1:1 strict décomp `gMovementActionFuncs_X` arrays (event_object_movement.c
// :5101+) + `MovementAction_X_StepN` callbacks. Le décomp a une table de 256
// entries indexed par MOVEMENT_ACTION_*, chaque entry étant un tableau de
// pointers Step0/Step1/Step2 callbacks. Notre TS simplifie en une seule
// fonction par action qui gère son state via npc.movementStep (= sActionFuncId).
//
// Source du dispatch : `ObjectEventExecHeldMovementAction` (event_object_movement.c) :
//   bool8 ObjectEventExecHeldMovementAction(struct ObjectEvent *objectEvent, struct Sprite *sprite)
//   {
//       u8 actionId = ObjectEventGetHeldMovementActionId(objectEvent);
//       if (actionId != MOVEMENT_ACTION_NONE) {
//           if (gMovementActionFuncs_X[actionId][sprite->data[2]](objectEvent, sprite))
//               return TRUE;
//       }
//       return FALSE;
//   }
//
// Notre infra : `gMovementActionFuncs[movementActionId]` returns le callback
// qui peut être multi-step (= track via npc.movementStep). Quand action done,
// callback returns TRUE → set heldMovementFinished = TRUE.
//
// État du port (= 4/160 actions full strict portées) :
//   ✅ FACE_DOWN/UP/LEFT/RIGHT (G15)
//   ⏳ WALK_NORMAL/SLOW/FAST/FASTER_X (= _tickWalk path string-based reste actif)
//   ⏳ JUMP/JUMP_2/JUMP_SPECIAL/JUMP_IN_PLACE_X
//   ⏳ DELAY_1/2/4/8/16
//   ⏳ ~150 autres actions (LOCK_FACING, EXCLAIM_EMOTE, ROCK_SMASH_BREAK, etc.)
//
// Migration incremental : les actions non encore portées via numeric dispatch
// retournent done=TRUE immédiatement (= safe no-op) ; le system applymovement
// string-based _tickWalk continue de gérer la majorité des cas en parallèle.

/** 1:1 décomp `MovementActionFunc` = bool8 (*)(struct ObjectEvent*, struct Sprite*).
 *  Returns TRUE quand l'action est done (= multi-step terminé). */
type MovementActionFunc = (rt: DecompRuntime, npc: ObjectEvent) => boolean;

/** Sentinel no-op : marque l'action done imm pour éviter freeze + signaler
 *  que l'action n'est pas (encore) portée 1:1 strict. */
const _movementActionNoOp: MovementActionFunc = (_rt, _npc) => true;

/** 1:1 décomp `gMovementActionFuncs[256]` array. Indexed par MOVEMENT_ACTION_*.
 *  Actions non portées = `_movementActionNoOp` (= safe done immédiat).
 *  Dette H1.X : migration progressive vers numeric dispatch full 1:1 strict
 *  (= ~160 actions à porter, multi-batch). */
const gMovementActionFuncs: MovementActionFunc[] = new Array(256).fill(_movementActionNoOp);
// H1.1 : FACE_X actions (= déjà portées via G15).
gMovementActionFuncs[MOVEMENT_ACTION_FACE_DOWN]  = _MovementAction_FaceDown_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_FACE_UP]    = _MovementAction_FaceUp_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_FACE_LEFT]  = _MovementAction_FaceLeft_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_FACE_RIGHT] = _MovementAction_FaceRight_Step0;
// H1.2 : DELAY actions 1:1 strict décomp event_object_movement.c:5168-5185.
gMovementActionFuncs[MOVEMENT_ACTION_DELAY_1]  = _makeDelayAction(1);
gMovementActionFuncs[MOVEMENT_ACTION_DELAY_2]  = _makeDelayAction(2);
gMovementActionFuncs[MOVEMENT_ACTION_DELAY_4]  = _makeDelayAction(4);
gMovementActionFuncs[MOVEMENT_ACTION_DELAY_8]  = _makeDelayAction(8);
gMovementActionFuncs[MOVEMENT_ACTION_DELAY_16] = _makeDelayAction(16);
// H1.3 + H3.1 fix : WALK_NORMAL/FAST/FASTER actions 1:1 strict via
// InitMovementNormal path (= MOVE_SPEED_NORMAL=0, FAST_1=1, FAST_2=2,
// FASTER=3, FASTEST=4). WALK_SLOW_X path SÉPARÉ via InitWalkSlow + UpdateWalkSlow
// (= H3.1 fix architectural, plus de hack speed=SLOWER=5 dans MOVE_SPEED).
gMovementActionFuncs[MOVEMENT_ACTION_WALK_SLOW_DOWN]    = _makeWalkSlowAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_SLOW_UP]      = _makeWalkSlowAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_SLOW_LEFT]    = _makeWalkSlowAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_SLOW_RIGHT]   = _makeWalkSlowAction(DIR_EAST);
// WALK_NORMAL = MOVE_SPEED_NORMAL (= 16 frames/tile = 1 px/frame).
gMovementActionFuncs[MOVEMENT_ACTION_WALK_NORMAL_DOWN]  = _makeWalkAction(DIR_SOUTH, 0);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_NORMAL_UP]    = _makeWalkAction(DIR_NORTH, 0);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_NORMAL_LEFT]  = _makeWalkAction(DIR_WEST,  0);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_NORMAL_RIGHT] = _makeWalkAction(DIR_EAST,  0);
// WALK_FAST = MOVE_SPEED_FAST_1 (= 12 frames/tile).
gMovementActionFuncs[MOVEMENT_ACTION_WALK_FAST_DOWN]    = _makeWalkAction(DIR_SOUTH, 1);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_FAST_UP]      = _makeWalkAction(DIR_NORTH, 1);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_FAST_LEFT]    = _makeWalkAction(DIR_WEST,  1);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_FAST_RIGHT]   = _makeWalkAction(DIR_EAST,  1);
// WALK_FASTER = MOVE_SPEED_FAST_2 (= 8 frames/tile).
gMovementActionFuncs[MOVEMENT_ACTION_WALK_FASTER_DOWN]  = _makeWalkAction(DIR_SOUTH, 2);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_FASTER_UP]    = _makeWalkAction(DIR_NORTH, 2);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_FASTER_LEFT]  = _makeWalkAction(DIR_WEST,  2);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_FASTER_RIGHT] = _makeWalkAction(DIR_EAST,  2);
// H1.4 : LOCK_FACING_DIRECTION / UNLOCK_FACING_DIRECTION (= scripted face lock).
gMovementActionFuncs[MOVEMENT_ACTION_LOCK_FACING_DIRECTION]   = _MovementAction_LockFacingDirection_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_UNLOCK_FACING_DIRECTION] = _MovementAction_UnlockFacingDirection_Step0;
// H1.5 : SET_INVISIBLE / SET_VISIBLE / ENABLE/DISABLE_JUMP_LANDING_GROUND_EFFECT.
gMovementActionFuncs[MOVEMENT_ACTION_SET_INVISIBLE] = _MovementAction_SetInvisible_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_SET_VISIBLE]   = _MovementAction_SetVisible_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_ENABLE_JUMP_LANDING_GROUND_EFFECT]  = _MovementAction_EnableJumpLandingGroundEffect_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_DISABLE_JUMP_LANDING_GROUND_EFFECT] = _MovementAction_DisableJumpLandingGroundEffect_Step0;
// H1.6 : WALK_IN_PLACE_SLOW/NORMAL/FAST/FASTER_X (16 actions, durations 32/16/8/4).
// 1:1 décomp `InitMoveInPlace` (event_object_movement.c:5704) + WalkInPlace_Step1 (5713).
// SLOW + NORMAL : anim NORMALE (GetMoveDirectionAnimNum, 8f/cmd). FAST : anim FAST (4f/cmd).
// FASTER : anim FASTER (2f/cmd). 1:1 décomp MovementAction_WalkInPlace{Slow,Normal,Fast,Faster}X_Step0.
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN]    = _makeWalkInPlaceAction(DIR_SOUTH, GetMoveDirectionAnimNum(DIR_SOUTH),       32, true);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_UP]      = _makeWalkInPlaceAction(DIR_NORTH, GetMoveDirectionAnimNum(DIR_NORTH),       32, true);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT]    = _makeWalkInPlaceAction(DIR_WEST,  GetMoveDirectionAnimNum(DIR_WEST),        32, true);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_RIGHT]   = _makeWalkInPlaceAction(DIR_EAST,  GetMoveDirectionAnimNum(DIR_EAST),        32, true);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN]  = _makeWalkInPlaceAction(DIR_SOUTH, GetMoveDirectionAnimNum(DIR_SOUTH),       16);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP]    = _makeWalkInPlaceAction(DIR_NORTH, GetMoveDirectionAnimNum(DIR_NORTH),       16);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT]  = _makeWalkInPlaceAction(DIR_WEST,  GetMoveDirectionAnimNum(DIR_WEST),        16);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT] = _makeWalkInPlaceAction(DIR_EAST,  GetMoveDirectionAnimNum(DIR_EAST),        16);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN]    = _makeWalkInPlaceAction(DIR_SOUTH, GetMoveDirectionFastAnimNum(DIR_SOUTH),    8);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP]      = _makeWalkInPlaceAction(DIR_NORTH, GetMoveDirectionFastAnimNum(DIR_NORTH),    8);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT]    = _makeWalkInPlaceAction(DIR_WEST,  GetMoveDirectionFastAnimNum(DIR_WEST),     8);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT]   = _makeWalkInPlaceAction(DIR_EAST,  GetMoveDirectionFastAnimNum(DIR_EAST),     8);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_DOWN]  = _makeWalkInPlaceAction(DIR_SOUTH, GetMoveDirectionFasterAnimNum(DIR_SOUTH),  4);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_UP]    = _makeWalkInPlaceAction(DIR_NORTH, GetMoveDirectionFasterAnimNum(DIR_NORTH),  4);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_LEFT]  = _makeWalkInPlaceAction(DIR_WEST,  GetMoveDirectionFasterAnimNum(DIR_WEST),   4);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_IN_PLACE_FASTER_RIGHT] = _makeWalkInPlaceAction(DIR_EAST,  GetMoveDirectionFasterAnimNum(DIR_EAST),   4);
// H1.7 : SET_FIXED_PRIORITY / CLEAR_FIXED_PRIORITY / START_ANIM_IN_DIRECTION.
gMovementActionFuncs[MOVEMENT_ACTION_SET_FIXED_PRIORITY]      = _MovementAction_SetFixedPriority_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_CLEAR_FIXED_PRIORITY]    = _MovementAction_ClearFixedPriority_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_START_ANIM_IN_DIRECTION] = _MovementAction_StartAnimInDirection_Step0;
// H1.8 : RIDE_WATER_CURRENT_X (= speed FAST_2, 8 frames/tile).
// Source : MovementAction_RideWaterCurrentDown_Step0 (InitMovementNormal + MOVE_SPEED_FAST_2).
gMovementActionFuncs[MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN]  = _makeWalkAction(DIR_SOUTH, 2);
gMovementActionFuncs[MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP]    = _makeWalkAction(DIR_NORTH, 2);
gMovementActionFuncs[MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT]  = _makeWalkAction(DIR_WEST,  2);
gMovementActionFuncs[MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT] = _makeWalkAction(DIR_EAST,  2);
// H1.8 : SLIDE_X (= speed FASTEST, 4 frames/tile, ice tiles).
// Source : MovementAction_SlideDown_Step0 (InitMovementNormal + MOVE_SPEED_FASTEST).
gMovementActionFuncs[MOVEMENT_ACTION_SLIDE_DOWN]  = _makeWalkAction(DIR_SOUTH, 4);
gMovementActionFuncs[MOVEMENT_ACTION_SLIDE_UP]    = _makeWalkAction(DIR_NORTH, 4);
gMovementActionFuncs[MOVEMENT_ACTION_SLIDE_LEFT]  = _makeWalkAction(DIR_WEST,  4);
gMovementActionFuncs[MOVEMENT_ACTION_SLIDE_RIGHT] = _makeWalkAction(DIR_EAST,  4);
// H1.9 : PLAYER_RUN_X (= speed FAST_1, 8 frames/tile, running) — 1:1 StartRunningAnim
// (GetRunningDirectionAnimNum = ANIM_RUN_X, frames running 9-17). Cf. _makePlayerRunAction.
gMovementActionFuncs[MOVEMENT_ACTION_PLAYER_RUN_DOWN]  = _makePlayerRunAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_PLAYER_RUN_UP]    = _makePlayerRunAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_PLAYER_RUN_LEFT]  = _makePlayerRunAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_PLAYER_RUN_RIGHT] = _makePlayerRunAction(DIR_EAST);
// H1.10 : WALK_NORMAL_DIAGONAL_X / WALK_SLOW_DIAGONAL_X (8 actions).
// Source : MovementAction_WalkNormalDiagonalUpLeft_Step0 (InitMovementNormal + DIR_NORTHWEST).
gMovementActionFuncs[MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_UP_LEFT]    = _makeWalkAction(DIR_NORTHWEST, 0);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_UP_RIGHT]   = _makeWalkAction(DIR_NORTHEAST, 0);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_DOWN_LEFT]  = _makeWalkAction(DIR_SOUTHWEST, 0);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_NORMAL_DIAGONAL_DOWN_RIGHT] = _makeWalkAction(DIR_SOUTHEAST, 0);
// H3.1 fix : WALK_SLOW_DIAGONAL_X utilisent aussi InitWalkSlow path (= 1:1 décomp
// MovementAction_WalkSlowDiagonalX_Step0 → InitWalkSlow + UpdateWalkSlow).
gMovementActionFuncs[MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_UP_LEFT]      = _makeWalkSlowAction(DIR_NORTHWEST);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_UP_RIGHT]     = _makeWalkSlowAction(DIR_NORTHEAST);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_DOWN_LEFT]    = _makeWalkSlowAction(DIR_SOUTHWEST);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_SLOW_DIAGONAL_DOWN_RIGHT]   = _makeWalkSlowAction(DIR_SOUTHEAST);
// H1.11 : DISABLE/RESTORE_ANIMATION + HIDE/SHOW_REFLECTION + FACE_ORIGINAL_DIRECTION.
gMovementActionFuncs[MOVEMENT_ACTION_DISABLE_ANIMATION]        = _MovementAction_DisableAnimation_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_RESTORE_ANIMATION]        = _MovementAction_RestoreAnimation_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_HIDE_REFLECTION]          = _MovementAction_HideReflection_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_SHOW_REFLECTION]          = _MovementAction_ShowReflection_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_FACE_ORIGINAL_DIRECTION]  = _MovementAction_FaceOriginalDirection_Step0;
// H1.12 : FACE_PLAYER / FACE_AWAY_PLAYER (= scripts utilisent ces actions au lieu
// de faceplayer opcode dans certains cas).
gMovementActionFuncs[MOVEMENT_ACTION_FACE_PLAYER]      = _MovementAction_FacePlayer_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_FACE_AWAY_PLAYER] = _MovementAction_FaceAwayPlayer_Step0;
// H1.13 : EMOTE_X (= dette H3 cascade FieldEffect spawn emote sprite).
// State machine porté 1:1 (= retourne TRUE imm, NPC pas bloqué) mais visuel
// emote sprite manque tant que FieldEffectStart(FLDEFF_X_ICON) non porté.
gMovementActionFuncs[MOVEMENT_ACTION_EMOTE_EXCLAMATION_MARK] = _MovementAction_EmoteExclamationMark_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_EMOTE_QUESTION_MARK]   = _MovementAction_EmoteQuestionMark_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_EMOTE_HEART]           = _MovementAction_EmoteHeart_Step0;
// H1.14 : NURSE_JOY_BOW_DOWN + ROCK_SMASH_BREAK + CUT_TREE.
// Tous utilisent StartSpriteAnim avec animNum dédié (= ANIM_NURSE_BOW/REMOVE_OBSTACLE).
// Dette R3 : SetAndStartSpriteAnim sub-anim frame param skipped (= ramène anim
// à frame 0, ce qu'on fait via StartSpriteAnim normal).
gMovementActionFuncs[MOVEMENT_ACTION_NURSE_JOY_BOW_DOWN] = _MovementAction_NurseJoyBowDown;
gMovementActionFuncs[MOVEMENT_ACTION_ROCK_SMASH_BREAK]   = _MovementAction_RockSmashBreak;
gMovementActionFuncs[MOVEMENT_ACTION_CUT_TREE]           = _MovementAction_CutTree;
// H1.15 : JUMP_X (66-69) + JUMP_2_X (12-15) + JUMP_IN_PLACE_X (70-73) 1:1 strict.
// Source : InitJump (5427) + DoJumpSpriteMovement (8464) + UpdateJumpAnim (5455)
// + sJumpY_High/Low/Normal tables.
// Jump normal (1 tile) = type NORMAL, distance NORMAL, 16 frames.
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_DOWN]  = _makeJumpAction(DIR_SOUTH, JUMP_DISTANCE_NORMAL, JUMP_TYPE_NORMAL);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_UP]    = _makeJumpAction(DIR_NORTH, JUMP_DISTANCE_NORMAL, JUMP_TYPE_NORMAL);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_LEFT]  = _makeJumpAction(DIR_WEST,  JUMP_DISTANCE_NORMAL, JUMP_TYPE_NORMAL);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_RIGHT] = _makeJumpAction(DIR_EAST,  JUMP_DISTANCE_NORMAL, JUMP_TYPE_NORMAL);
// Jump 2 (2 tiles ledge) = type HIGH, distance FAR, 32 frames.
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_2_DOWN]  = _makeJumpAction(DIR_SOUTH, JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_2_UP]    = _makeJumpAction(DIR_NORTH, JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_2_LEFT]  = _makeJumpAction(DIR_WEST,  JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_2_RIGHT] = _makeJumpAction(DIR_EAST,  JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH);
// Jump in place = type NORMAL, distance IN_PLACE (= 0 tiles), 16 frames.
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN]  = _makeJumpAction(DIR_SOUTH, JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_NORMAL);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_IN_PLACE_UP]    = _makeJumpAction(DIR_NORTH, JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_NORMAL);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT]  = _makeJumpAction(DIR_WEST,  JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_NORMAL);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT] = _makeJumpAction(DIR_EAST,  JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_NORMAL);
// H1.16 : JUMP_SPECIAL_X (58-61) = NORMAL distance, HIGH type, doubled time (32f).
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_SPECIAL_DOWN]  = _makeJumpSpecialAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_SPECIAL_UP]    = _makeJumpSpecialAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_SPECIAL_LEFT]  = _makeJumpSpecialAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_SPECIAL_RIGHT] = _makeJumpSpecialAction(DIR_EAST);
// H1.17 : JUMP_IN_PLACE_X_Y (74-77) = jump in place + switch direction au halfway.
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP]    = _makeJumpInPlaceAlternatingAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN]    = _makeJumpInPlaceAlternatingAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT] = _makeJumpInPlaceAlternatingAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT] = _makeJumpInPlaceAlternatingAction(DIR_EAST);
// H1.19 : ACRO_WHEELIE_FACE_X (100-103) / ACRO_POP_WHEELIE_X (104-107) /
// ACRO_END_WHEELIE_FACE_X (108-111). Bike wheelie state actions.
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN]      = _makeAcroWheelieFaceAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN + 1]  = _makeAcroWheelieFaceAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN + 2]  = _makeAcroWheelieFaceAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN + 3]  = _makeAcroWheelieFaceAction(DIR_EAST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN]       = _makeAcroPopWheelieAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN + 1]   = _makeAcroPopWheelieAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN + 2]   = _makeAcroPopWheelieAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN + 3]   = _makeAcroPopWheelieAction(DIR_EAST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN]     = _makeAcroEndWheelieFaceAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN + 1] = _makeAcroEndWheelieFaceAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN + 2] = _makeAcroEndWheelieFaceAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN + 3] = _makeAcroEndWheelieFaceAction(DIR_EAST);
// H1.20 : ACRO_WHEELIE_HOP_FACE_X (112-115) = wheelie jump IN_PLACE type LOW.
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN]     = _makeAcroWheelieJumpAction(DIR_SOUTH, JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_LOW);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN + 1] = _makeAcroWheelieJumpAction(DIR_NORTH, JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_LOW);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN + 2] = _makeAcroWheelieJumpAction(DIR_WEST,  JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_LOW);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN + 3] = _makeAcroWheelieJumpAction(DIR_EAST,  JUMP_DISTANCE_IN_PLACE, JUMP_TYPE_LOW);
// ACRO_WHEELIE_HOP_X (116-119) = wheelie jump NORMAL type LOW (1 tile hop).
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN]     = _makeAcroWheelieJumpAction(DIR_SOUTH, JUMP_DISTANCE_NORMAL, JUMP_TYPE_LOW);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN + 1] = _makeAcroWheelieJumpAction(DIR_NORTH, JUMP_DISTANCE_NORMAL, JUMP_TYPE_LOW);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN + 2] = _makeAcroWheelieJumpAction(DIR_WEST,  JUMP_DISTANCE_NORMAL, JUMP_TYPE_LOW);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN + 3] = _makeAcroWheelieJumpAction(DIR_EAST,  JUMP_DISTANCE_NORMAL, JUMP_TYPE_LOW);
// ACRO_WHEELIE_JUMP_X (120-123) = wheelie jump FAR type HIGH (2 tiles big jump).
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN]     = _makeAcroWheelieJumpAction(DIR_SOUTH, JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN + 1] = _makeAcroWheelieJumpAction(DIR_NORTH, JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN + 2] = _makeAcroWheelieJumpAction(DIR_WEST,  JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN + 3] = _makeAcroWheelieJumpAction(DIR_EAST,  JUMP_DISTANCE_FAR, JUMP_TYPE_HIGH);
// ACRO_WHEELIE_IN_PLACE_X (124-127) = wheelie in place anim (duration 8 frames).
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN]     = _makeAcroWheelieInPlaceAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN + 1] = _makeAcroWheelieInPlaceAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN + 2] = _makeAcroWheelieInPlaceAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN + 3] = _makeAcroWheelieInPlaceAction(DIR_EAST);
// H1.21 : ACRO_POP_WHEELIE_MOVE_X (128-131) = walk speed FAST_1 + wheelie back wheel anim.
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN]     = _makeAcroPopWheelieMoveAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN + 1] = _makeAcroPopWheelieMoveAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN + 2] = _makeAcroPopWheelieMoveAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN + 3] = _makeAcroPopWheelieMoveAction(DIR_EAST);
// ACRO_WHEELIE_MOVE_X (132-135) = walk speed FAST_1 + wheelie pedal anim.
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN]     = _makeAcroWheelieMoveAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN + 1] = _makeAcroWheelieMoveAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN + 2] = _makeAcroWheelieMoveAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN + 3] = _makeAcroWheelieMoveAction(DIR_EAST);
// H1.22 : INIT_AFFINE_ANIM (94) + CLEAR_AFFINE_ANIM (95). Dette H3 sprite affine cascade.
gMovementActionFuncs[MOVEMENT_ACTION_INIT_AFFINE_ANIM]  = _MovementAction_InitAffineAnim_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_CLEAR_AFFINE_ANIM] = _MovementAction_ClearAffineAnim_Step0;
// H1.23 : LEVITATE (152) + STOP_LEVITATE (153) + STOP_LEVITATE_AT_TOP (154) + FIGURE_8 (155).
// State machine porté ; dette H3 cascade tasks (LevitateMovementTask, Figure8Anim).
gMovementActionFuncs[MOVEMENT_ACTION_LEVITATE]            = _MovementAction_Levitate_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_STOP_LEVITATE]       = _MovementAction_StopLevitate_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_STOP_LEVITATE_AT_TOP] = _MovementAction_StopLevitateAtTop_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_FIGURE_8]            = _MovementAction_Figure8;
// H1.24 + H3.1 fix : WALK_DOWN_START_AFFINE (98) + WALK_DOWN_AFFINE (99) +
// REVEAL_TRAINER (89). WALK_DOWN_AFFINE utilise InitWalkSlow path (= 1:1 strict).
gMovementActionFuncs[MOVEMENT_ACTION_WALK_DOWN_START_AFFINE] = _makeWalkDownAffineActionStrict(0);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_DOWN_AFFINE]      = _makeWalkDownAffineActionStrict(1);
gMovementActionFuncs[MOVEMENT_ACTION_REVEAL_TRAINER]        = _MovementAction_RevealTrainer_Step0;
// H1.25 : WALK_LEFT_AFFINE (150) + WALK_RIGHT_AFFINE (151) + FLY_UP (156) + FLY_DOWN (157).
gMovementActionFuncs[MOVEMENT_ACTION_WALK_LEFT_AFFINE]  = _makeWalkAffineAction(DIR_WEST, 2);
gMovementActionFuncs[MOVEMENT_ACTION_WALK_RIGHT_AFFINE] = _makeWalkAffineAction(DIR_EAST, 3);
gMovementActionFuncs[MOVEMENT_ACTION_FLY_UP]   = _makeFlyUpAction();
gMovementActionFuncs[MOVEMENT_ACTION_FLY_DOWN] = _makeFlyDownAction();
// H1.26 : LOCK_ANIM (148) + UNLOCK_ANIM (149).
gMovementActionFuncs[MOVEMENT_ACTION_LOCK_ANIM]   = _MovementAction_LockAnim_Step0;
gMovementActionFuncs[MOVEMENT_ACTION_UNLOCK_ANIM] = _MovementAction_UnlockAnim_Step0;
// H1.27 : ACRO_END_WHEELIE_MOVE_X (136-139) = walk speed FAST_1 + standing wheelie back wheel anim.
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN]     = _makeAcroEndWheelieMoveAction(DIR_SOUTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN + 1] = _makeAcroEndWheelieMoveAction(DIR_NORTH);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN + 2] = _makeAcroEndWheelieMoveAction(DIR_WEST);
gMovementActionFuncs[MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN + 3] = _makeAcroEndWheelieMoveAction(DIR_EAST);

// ─── dir → movement-action helpers (1:1 décomp `dirn_to_anim`) ───────────────
// Source : event_object_movement.c:933-975 (tables) + 4945-4964 (macro).
// Tables indexées par direction : [DIR_NONE, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST].
// La macro `dirn_to_anim` clamp `if (direction > DIR_EAST) direction = 0`.

/** 1:1 décomp `gFaceDirectionMovementActions[]` (event_object_movement.c:919). */
const gFaceDirectionMovementActions: readonly number[] = [
  MOVEMENT_ACTION_FACE_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_FACE_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_FACE_UP,     // DIR_NORTH
  MOVEMENT_ACTION_FACE_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_FACE_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetFaceDirectionMovementAction` (event_object_movement.c:4957, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_FACE_*. */
export function GetFaceDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gFaceDirectionMovementActions[dir];
}

/** 1:1 décomp `gWalkNormalMovementActions[]` (event_object_movement.c:933). */
const gWalkNormalMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_NORMAL_DOWN,  // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_WALK_NORMAL_DOWN,  // DIR_SOUTH
  MOVEMENT_ACTION_WALK_NORMAL_UP,    // DIR_NORTH
  MOVEMENT_ACTION_WALK_NORMAL_LEFT,  // DIR_WEST
  MOVEMENT_ACTION_WALK_NORMAL_RIGHT, // DIR_EAST
];

/** 1:1 décomp `gPlayerRunMovementActions[]` (event_object_movement.c:968). */
const gPlayerRunMovementActions: readonly number[] = [
  MOVEMENT_ACTION_PLAYER_RUN_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_PLAYER_RUN_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_PLAYER_RUN_UP,     // DIR_NORTH
  MOVEMENT_ACTION_PLAYER_RUN_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_PLAYER_RUN_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetWalkNormalMovementAction` (event_object_movement.c:4959, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_WALK_NORMAL_*. */
export function GetWalkNormalMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gWalkNormalMovementActions[dir];
}

/** 1:1 décomp `gWalkSlowMovementActions[]` (event_object_movement.c). */
const gWalkSlowMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_SLOW_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_WALK_SLOW_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_WALK_SLOW_UP,     // DIR_NORTH
  MOVEMENT_ACTION_WALK_SLOW_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_WALK_SLOW_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetWalkSlowMovementAction` (event_object_movement.c:4958, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_WALK_SLOW_*. Utilisé par la
 *  montée de cascade (`WaterfallFieldEffect_RideUp` : grimpe lente vers le nord). */
export function GetWalkSlowMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gWalkSlowMovementActions[dir];
}

/** 1:1 décomp `gWalkFastMovementActions[]` (event_object_movement.c). */
const gWalkFastMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_FAST_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_WALK_FAST_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_WALK_FAST_UP,     // DIR_NORTH
  MOVEMENT_ACTION_WALK_FAST_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_WALK_FAST_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetWalkFastMovementAction` (event_object_movement.c:4954, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_WALK_FAST_* (= surf speed,
 *  même vitesse que run). Utilisé par `PlayerWalkFast` (branche SURFING de
 *  PlayerNotOnBikeMoving — surf = dépendance d'étape, porté 1:1). */
export function GetWalkFastMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gWalkFastMovementActions[dir];
}

/** 1:1 décomp `gRideWaterCurrentMovementActions[]` (event_object_movement.c:947). */
const gRideWaterCurrentMovementActions: readonly number[] = [
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_UP,     // DIR_NORTH
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_RIDE_WATER_CURRENT_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetRideWaterCurrentMovementAction` (event_object_movement.c:4961, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_RIDE_WATER_CURRENT_* (= poussé par
 *  un courant d'eau en surf, vitesse FASTER). Utilisé par `PlayerRideWaterCurrent`
 *  (forced movement `ForcedMovement_Pushed*ByCurrent` — courants = surf, dépendance
 *  d'étape, porté 1:1). */
export function GetRideWaterCurrentMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gRideWaterCurrentMovementActions[dir];
}

/** 1:1 décomp `GetPlayerRunMovementAction` (event_object_movement.c:4964, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_PLAYER_RUN_*. */
export function GetPlayerRunMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gPlayerRunMovementActions[dir];
}

/** 1:1 décomp `gJump2MovementActions[]` (event_object_movement.c). */
const gJump2MovementActions: readonly number[] = [
  MOVEMENT_ACTION_JUMP_2_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_JUMP_2_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_JUMP_2_UP,     // DIR_NORTH
  MOVEMENT_ACTION_JUMP_2_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_JUMP_2_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetJump2MovementAction` (event_object_movement.c:4969, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_JUMP_2_* (= ledge hop,
 *  JUMP_DISTANCE_FAR/JUMP_TYPE_HIGH). Utilisé par PlayerJumpLedge. */
export function GetJump2MovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gJump2MovementActions[dir];
}

/** 1:1 décomp `gJumpSpecialMovementActions[]` (event_object_movement.c:1003). */
const gJumpSpecialMovementActions: readonly number[] = [
  MOVEMENT_ACTION_JUMP_SPECIAL_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_JUMP_SPECIAL_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_JUMP_SPECIAL_UP,     // DIR_NORTH
  MOVEMENT_ACTION_JUMP_SPECIAL_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_JUMP_SPECIAL_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetJumpSpecialMovementAction` (event_object_movement.c:4969, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_JUMP_SPECIAL_* (= saut sur le blob de surf,
 *  JUMP_DISTANCE_NORMAL/JUMP_TYPE_HIGH). Utilisé par `SurfFieldEffect_JumpOnSurfBlob`.
 *  ⚠️ NE PAS confondre avec la version `decomp-bridge` (numérotation décomp-réelle 0x60 ≠ notre
 *  table gMovementActionFuncs où JUMP_SPECIAL_DOWN=58 ; cf. gotcha-movement-action-getter-dual-source). */
export function GetJumpSpecialMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gJumpSpecialMovementActions[dir];
}

/** 1:1 décomp `gWalkInPlaceFastMovementActions[]` (event_object_movement.c). */
const gWalkInPlaceFastMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_UP,     // DIR_NORTH
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_WALK_IN_PLACE_FAST_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetWalkInPlaceFastMovementAction` (event_object_movement.c, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_WALK_IN_PLACE_FAST_* (= turn
 *  in place, 8 frames). Utilisé par PlayerTurnInPlace. */
export function GetWalkInPlaceFastMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gWalkInPlaceFastMovementActions[dir];
}

/** 1:1 décomp `gWalkInPlaceSlowMovementActions[]` (event_object_movement.c). */
const gWalkInPlaceSlowMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_UP,     // DIR_NORTH
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetWalkInPlaceSlowMovementAction` (event_object_movement.c, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_WALK_IN_PLACE_SLOW_* (= collide
 *  bump, 32 frames). Utilisé par PlayerNotOnBikeCollide. */
export function GetWalkInPlaceSlowMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gWalkInPlaceSlowMovementActions[dir];
}

/** 1:1 décomp `gWalkInPlaceNormalMovementActions[]` (event_object_movement.c). */
const gWalkInPlaceNormalMovementActions: readonly number[] = [
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_UP,     // DIR_NORTH
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_RIGHT,  // DIR_EAST
];

/** 1:1 décomp `GetWalkInPlaceNormalMovementAction` (event_object_movement.c, via
 *  `dirn_to_anim`). Map direction → MOVEMENT_ACTION_WALK_IN_PLACE_NORMAL_* (= marche
 *  sur place, 16 frames). Utilisé par PlayerOnBikeCollide + PushBoulder_Move (Strength).
 *  ⚠️ NE PAS confondre avec la version de `decomp-bridge` (numérotation décomp-réelle
 *  ≠ notre table gMovementActionFuncs → renverrait JUMP_LEFT=68). */
export function GetWalkInPlaceNormalMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gWalkInPlaceNormalMovementActions[dir];
}

// ─── 1:1 décomp getters movement action vélo (event_object_movement.c, via `dirn_to_anim`) ───
// Tables 5 éléments indexées par direction (DIR_NONE=0/SOUTH=1/NORTH=2/WEST=3/EAST=4).
// Utilisées par bike.c (game/bike.ts) + les Player*Wheelie* (player-avatar.ts).
// ⚠️ NE PAS confondre avec les versions de `decomp-bridge` (numérotation décomp-réelle).

/** 1:1 décomp `gWalkFasterMovementActions` (event_object_movement.c:954). */
const gWalkFasterMovementActions = [
  MOVEMENT_ACTION_WALK_FASTER_DOWN, MOVEMENT_ACTION_WALK_FASTER_DOWN,
  MOVEMENT_ACTION_WALK_FASTER_UP, MOVEMENT_ACTION_WALK_FASTER_LEFT, MOVEMENT_ACTION_WALK_FASTER_RIGHT,
];
/** 1:1 décomp `GetWalkFasterMovementAction` (mach bike speed 3). */
export function GetWalkFasterMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gWalkFasterMovementActions[dir];
}

/** 1:1 décomp `gJumpMovementActions` (event_object_movement.c:996). */
const gJumpMovementActions = [
  MOVEMENT_ACTION_JUMP_DOWN, MOVEMENT_ACTION_JUMP_DOWN,
  MOVEMENT_ACTION_JUMP_UP, MOVEMENT_ACTION_JUMP_LEFT, MOVEMENT_ACTION_JUMP_RIGHT,
];
/** 1:1 décomp `GetJumpMovementAction` (acro side jump). */
export function GetJumpMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gJumpMovementActions[dir];
}

// ─── Trainer movement type + template overrides (1:1 event_object_movement.c) ──

/** 1:1 décomp `gTrainerFacingDirectionMovementTypes[]` (event_object_movement.c:881).
 *  Indexé par direction → nom du MOVEMENT_TYPE_FACE_* (notre `movementType` est un
 *  string ; le décomp stocke le numéro MOVEMENT_TYPE_FACE_DOWN/UP/LEFT/RIGHT). */
const gTrainerFacingDirectionMovementTypes: readonly string[] = [
  'MOVEMENT_TYPE_FACE_DOWN',   // DIR_NONE
  'MOVEMENT_TYPE_FACE_DOWN',   // DIR_SOUTH
  'MOVEMENT_TYPE_FACE_UP',     // DIR_NORTH
  'MOVEMENT_TYPE_FACE_LEFT',   // DIR_WEST
  'MOVEMENT_TYPE_FACE_RIGHT',  // DIR_EAST
  'MOVEMENT_TYPE_FACE_DOWN',   // DIR_SOUTHWEST
  'MOVEMENT_TYPE_FACE_DOWN',   // DIR_SOUTHEAST
  'MOVEMENT_TYPE_FACE_UP',     // DIR_NORTHWEST
  'MOVEMENT_TYPE_FACE_UP',     // DIR_NORTHEAST
];

/** 1:1 décomp `GetTrainerFacingDirectionMovementType(direction)`
 *  (event_object_movement.c:4645). */
export function GetTrainerFacingDirectionMovementType(direction: number): string {
  return gTrainerFacingDirectionMovementTypes[direction] ?? 'MOVEMENT_TYPE_FACE_DOWN';
}

/** 1:1 décomp `SetTrainerMovementType(objectEvent, movementType)`
 *  (event_object_movement.c:4636).
 *  ```c
 *  objectEvent->movementType = movementType;
 *  objectEvent->directionSequenceIndex = 0;
 *  objectEvent->playerCopyableMovement = 0;
 *  gSprites[objectEvent->spriteId].callback = sMovementTypeCallbacks[movementType];
 *  gSprites[objectEvent->spriteId].sTypeFuncId = 0;
 *  ```
 *  Adaptation modèle : le port web ne dispatche pas les movement-types par pointeur
 *  de callback sprite (sMovementTypeCallbacks[]) mais par string-match de
 *  `npc.movementType` dans `dispatchSpecialMovement` — donc « reprogrammer la
 *  callback » = poser `npc.movementType` + reset du state machine (movementStep =
 *  sTypeFuncId). Comportement identique. */
export function SetTrainerMovementType(objectEvent: ObjectEvent, movementType: string): void {
  objectEvent.movementType = movementType;
  objectEvent.directionSeqIdx = 0;      // directionSequenceIndex
  objectEvent.playerCopyableMovement = 0;
  objectEvent.movementStep = 0;         // sTypeFuncId = 0
}

/** 1:1 décomp `GetBaseTemplateForObjectEvent(objectEvent)`
 *  (event_object_movement.c:2462). Renvoie le template save-block correspondant au
 *  localId sur la map courante, ou null hors map courante / introuvable. */
type SaveBlockObjectEventTemplate = (typeof gSaveBlock1Ptr.objectEventTemplates)[number];
function GetBaseTemplateForObjectEvent(objectEvent: ObjectEvent): SaveBlockObjectEventTemplate | null {
  const loc = gSaveBlock1Ptr.location;
  if (!loc || objectEvent.mapNum !== loc.mapNum || objectEvent.mapGroup !== loc.mapGroup) {
    return null;
  }
  const templates = gSaveBlock1Ptr.objectEventTemplates;
  for (let i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i++) {
    const t = templates[i];
    if (t && objectEvent.localId === t.localId) return t;
  }
  return null;
}

/** 1:1 décomp `OverrideTemplateCoordsForObjectEvent(objectEvent)`
 *  (event_object_movement.c:2478). Persiste la position courante du NPC dans son
 *  template (x/y en coords LOGIQUES = current - MAP_OFFSET) → un dresseur qui a
 *  marché vers le joueur reste à sa nouvelle place au re-load de map. */
export function OverrideTemplateCoordsForObjectEvent(objectEvent: ObjectEvent): void {
  const t = GetBaseTemplateForObjectEvent(objectEvent);
  if (t !== null) {
    t.x = objectEvent.currentCoordsX - MAP_OFFSET;
    t.y = objectEvent.currentCoordsY - MAP_OFFSET;
  }
}

/** 1:1 décomp `TryOverrideTemplateCoordsForObjectEvent(objectEvent, movementType)`
 *  (event_object_movement.c:2499). Persiste le movement-type dans le template. */
export function TryOverrideTemplateCoordsForObjectEvent(objectEvent: ObjectEvent, movementType: string): void {
  const t = GetBaseTemplateForObjectEvent(objectEvent);
  if (t !== null) t.movementType = movementType;
}

/** 1:1 décomp `gJumpInPlaceMovementActions[]` (event_object_movement.c:982). */
const gJumpInPlaceMovementActions: readonly number[] = [
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,   // DIR_NONE  → DOWN (default)
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN,   // DIR_SOUTH
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP,     // DIR_NORTH
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT,   // DIR_WEST
  MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT,  // DIR_EAST
];
/** 1:1 décomp `GetJumpInPlaceMovementAction` (event_object_movement.c:4966, via
 *  `dirn_to_anim`). Utilisé par trainer_see.c JumpInPlaceBuriedTrainer. */
export function GetJumpInPlaceMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gJumpInPlaceMovementActions[dir];
}

/** 1:1 décomp `gJumpInPlaceTurnAroundMovementActions` (event_object_movement.c:989). */
const gJumpInPlaceTurnAroundMovementActions = [
  MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN, MOVEMENT_ACTION_JUMP_IN_PLACE_UP_DOWN,
  MOVEMENT_ACTION_JUMP_IN_PLACE_DOWN_UP, MOVEMENT_ACTION_JUMP_IN_PLACE_RIGHT_LEFT,
  MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT_RIGHT,
];
/** 1:1 décomp `GetJumpInPlaceTurnAroundMovementAction` (acro turn jump). */
export function GetJumpInPlaceTurnAroundMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gJumpInPlaceTurnAroundMovementActions[dir];
}

/** 1:1 décomp `gAcroWheelieFaceDirectionMovementActions` (event_object_movement.c:1038). */
const gAcroWheelieFaceDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_DOWN,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_FACE_LEFT,
  MOVEMENT_ACTION_ACRO_WHEELIE_FACE_RIGHT,
];
export function GetAcroWheelieFaceDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroWheelieFaceDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroPopWheelieFaceDirectionMovementActions` (event_object_movement.c:1045). */
const gAcroPopWheelieFaceDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_DOWN,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_UP, MOVEMENT_ACTION_ACRO_POP_WHEELIE_LEFT,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_RIGHT,
];
export function GetAcroPopWheelieFaceDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroPopWheelieFaceDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroEndWheelieFaceDirectionMovementActions` (event_object_movement.c:1052). */
const gAcroEndWheelieFaceDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_DOWN,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_UP, MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_LEFT,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_FACE_RIGHT,
];
export function GetAcroEndWheelieFaceDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroEndWheelieFaceDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroWheelieHopFaceDirectionMovementActions` (event_object_movement.c:1059). */
const gAcroWheelieHopFaceDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_DOWN,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_LEFT,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_FACE_RIGHT,
];
export function GetAcroWheelieHopFaceDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroWheelieHopFaceDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroWheelieHopDirectionMovementActions` (event_object_movement.c:1066). */
const gAcroWheelieHopDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_DOWN,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_UP, MOVEMENT_ACTION_ACRO_WHEELIE_HOP_LEFT,
  MOVEMENT_ACTION_ACRO_WHEELIE_HOP_RIGHT,
];
export function GetAcroWheelieHopDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroWheelieHopDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroWheelieJumpDirectionMovementActions` (event_object_movement.c:1073). */
const gAcroWheelieJumpDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_DOWN,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_UP, MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_LEFT,
  MOVEMENT_ACTION_ACRO_WHEELIE_JUMP_RIGHT,
];
export function GetAcroWheelieJumpDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroWheelieJumpDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroWheelieInPlaceDirectionMovementActions` (event_object_movement.c:1080). */
const gAcroWheelieInPlaceDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_DOWN,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_LEFT,
  MOVEMENT_ACTION_ACRO_WHEELIE_IN_PLACE_RIGHT,
];
export function GetAcroWheelieInPlaceDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroWheelieInPlaceDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroPopWheelieMoveDirectionMovementActions` (event_object_movement.c:1087). */
const gAcroPopWheelieMoveDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_DOWN,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_UP, MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_LEFT,
  MOVEMENT_ACTION_ACRO_POP_WHEELIE_MOVE_RIGHT,
];
export function GetAcroPopWheelieMoveDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroPopWheelieMoveDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroWheelieMoveDirectionMovementActions` (event_object_movement.c:1094). */
const gAcroWheelieMoveDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_DOWN,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_UP, MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_LEFT,
  MOVEMENT_ACTION_ACRO_WHEELIE_MOVE_RIGHT,
];
export function GetAcroWheelieMoveDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroWheelieMoveDirectionMovementActions[dir];
}

/** 1:1 décomp `gAcroEndWheelieMoveDirectionMovementActions` (event_object_movement.c:1101). */
const gAcroEndWheelieMoveDirectionMovementActions = [
  MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN, MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_DOWN,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_UP, MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_LEFT,
  MOVEMENT_ACTION_ACRO_END_WHEELIE_MOVE_RIGHT,
];
export function GetAcroEndWheelieMoveDirectionMovementAction(dir: number): number {
  if (dir > DIR_EAST) dir = 0;
  return gAcroEndWheelieMoveDirectionMovementActions[dir];
}

/** 1:1 décomp `ObjectEventExecHeldMovementAction` (event_object_movement.c) :
 *  dispatch sur movementActionId → gMovementActionFuncs[actionId](obj, sprite).
 *  Quand action done (= return TRUE), set heldMovementFinished = TRUE.
 *
 *  Notre dispatch via array index est 1:1 strict architecture vs switch ad-hoc. */
function _execHeldMovementAction(rt: DecompRuntime, npc: ObjectEvent): void {
  if (npc.heldMovementFinished) return;  // already done, wait pour clear
  const actionId = npc.movementActionId;
  if (actionId === 0xFF) {  // MOVEMENT_ACTION_NONE
    npc.heldMovementFinished = true;
    return;
  }
  if (actionId < 0 || actionId >= gMovementActionFuncs.length) {
    npc.heldMovementFinished = true;
    return;
  }
  const fn = gMovementActionFuncs[actionId];
  if (fn(rt, npc)) {
    npc.heldMovementFinished = true;
  }
}

// ─── Spawn ──────────────────────────────────────────────────────────────────

/** Index de la 1re frame image affichée par stade (= 1er `ANIMCMD_FRAME` de
 *  `sAnim_BerryTreeStage{0..4}`, object_event_anims.h:564-600) :
 *    animNum 0 (PLANTED)   → frame 0  (DirtPile 16×16)
 *    animNum 1 (SPROUTED)  → frame 1  (Sprout   16×16)
 *    animNum 2 (TALLER)    → frame 3  (baie     16×32)
 *    animNum 3 (FLOWERING) → frame 5  (baie     16×32)
 *    animNum 4 (BERRIES)   → frame 7  (baie     16×32, mûre) */
const BERRY_TREE_FIRST_FRAME_BY_ANIM = [0, 1, 3, 5, 7] as const;

/** 1:1 décomp `gBerryTreePaletteSlotTablePointers[berryId]` (berry_tree_graphics_
 *  tables.h:471) — slot palette des frames BAIE (TALLER/FLOWERING/BERRIES) par
 *  berryId. Valeurs = PALSLOT_NPC_1..4 (= banks OBJ 2,3,4,5). Le DirtPile (PLANTED)
 *  est TOUJOURS slot 3 et le Sprout (SPROUTED) TOUJOURS slot 4 (constants pour les
 *  43 baies → non tabulés). Toutes les baies d'un même slot partagent la MÊME palette
 *  (design décomp, vérifié) → on borne à 4 banks. Ordre = gBerryTreePicTablePointers
 *  (berryId 0-based : Cheri, Chesto, Pecha, Rawst, Aspear, Leppa, Oran, …). */
const gBerryTreeBerryPaletteSlot: readonly number[] = [
  /* 0 Cheri  */ 4, /* 1 Chesto */ 2, /* 2 Pecha  */ 4, /* 3 Rawst  */ 4,
  /* 4 Aspear */ 3, /* 5 Leppa  */ 3, /* 6 Oran   */ 2, /* 7 Persim */ 2,
  /* 8 Lum    */ 4, /* 9 Sitrus */ 4, /* 10 Figy  */ 3, /* 11 Wiki  */ 3,
  /* 12 Mago  */ 3, /* 13 Aguav */ 4, /* 14 Iapapa*/ 3, /* 15 Razz  */ 4,
  /* 16 Bluk  */ 4, /* 17 Nanab */ 3, /* 18 Wepear*/ 2, /* 19 Pinap */ 3,
  /* 20 Pomeg */ 3, /* 21 Kelpsy*/ 2, /* 22 Qualot*/ 2, /* 23 Hondew*/ 5,
  /* 24 Grepa */ 3, /* 25 Tamato*/ 2, /* 26 Cornn */ 2, /* 27 Magost*/ 3,
  /* 28 Rabuta*/ 4, /* 29 Nomel */ 3, /* 30 Spelon*/ 3, /* 31 Pamtre*/ 2,
  /* 32 Watmel*/ 4, /* 33 Durin */ 4, /* 34 Belue */ 5, /* 35 Liechi*/ 4,
  /* 36 Ganlon*/ 5, /* 37 Salac */ 4, /* 38 Petaya*/ 3, /* 39 Apicot*/ 3,
  /* 40 Lansat*/ 2, /* 41 Starf */ 2, /* 42 Enigma*/ 4,
];

interface BerryStageGfx {
  visible: boolean;
  animNum: number;
  width: number;
  height: number;
  picTable: ReturnType<(typeof gBerryTreePicTableBuilders)[number]['build']>;
  palData: Uint16Array;
  palTag: string;
  palSlot: number;
  firstFrame: number;
}

/** Résout les graphics du stade COURANT d'un berry tree (= partie "resolution" de
 *  SetBerryTreeGraphics, event_object_movement.c:1897-1910) : stade → animNum, taille
 *  OAM (EARLY 16×16 stades 1-2 / LATE 16×32 stades 3-5, cf gBerryTreeObjectEvent
 *  GraphicsIdTable = {EARLY,EARLY,LATE,LATE,LATE}), pic table (9 frames assemblées de
 *  3 PNGs), palette PAR STADE (dirt_pile/sprout/baie), frame initiale. Retourne null
 *  si les PNGs ne sont pas en cache. Partagé par le spawn (_setupBerryTreeSpriteGraphics)
 *  et le swap live (_applyBerryTreeStageGraphicsLive). */
function _resolveBerryTreeStageGfx(npc: ObjectEvent): BerryStageGfx | null {
  const berryTreeId = npc.trainerRange_berryTreeId;
  const berryStage = GetStageByBerryTreeId(berryTreeId);
  const visible = berryStage !== BERRY_STAGE_NO_BERRY;
  const berryType = GetBerryTypeByBerryTreeId(berryTreeId);
  let berryId = berryType - 1;
  if (berryId < 0 || berryId >= gBerryTreePicTableBuilders.length) berryId = 0;
  const gfx = gBerryTreePicTableBuilders[berryId];
  // 1:1 : berryStage-- avant le lookup table/anim. Plot vide → animNum 0 (dirt).
  const animNum = visible ? berryStage - 1 : 0;
  const isLate = animNum >= 2;
  const [dirtPath, sproutPath, berryPath] = _berryTreePngPaths(berryTreeId);
  const dirtPng = _npcPngCache.get(dirtPath);
  const sproutPng = _npcPngCache.get(sproutPath);
  const berryPng = _npcPngCache.get(berryPath);
  if (!dirtPng || !sproutPng || !berryPng) return null;
  const dirt1d = pngTo1dObjLayoutAllFrames(dirtPng.charData, dirtPng.widthTiles, 16, 16);
  const sprout1d = pngTo1dObjLayoutAllFrames(sproutPng.charData, sproutPng.widthTiles, 16, 16);
  const berry1d = pngTo1dObjLayoutAllFrames(berryPng.charData, berryPng.widthTiles, 16, 32);
  const picTable = gfx.build(dirt1d, sprout1d, berry1d);
  // Palette PAR SLOT — 1:1 décomp `sprite->oam.paletteNum = gBerryTreePaletteSlotTable
  // Pointers[berryId][stage]` (event_object_movement.c:1909). La décomp pointe l'OAM vers
  // 1 des 4 banks NPC partagés (PALSLOT_NPC_1..4 = slots 2,3,4,5). DirtPile → slot 3,
  // Sprout → slot 4 (constants), frames baie → slot par baie. sprout.png met ses feuilles
  // aux indices 8-10 (verts) ≠ baie slot-2 (bleu) → palettes distinctes par slot, mais
  // toutes les baies d'un même slot PARTAGENT la palette (vérifié) → tag par SLOT = MAX
  // 4 banks OBJ (évite la saturation "1 bank/baie"). N° de bank effectif = first-free
  // (dette : divergent du slot fixe décomp, couleurs 1:1).
  const palSrc = animNum === 0 ? dirtPng : animNum === 1 ? sproutPng : berryPng;
  const palSlot = animNum === 0 ? 3 : animNum === 1 ? 4 : (gBerryTreeBerryPaletteSlot[berryId] ?? 2);
  return {
    visible, animNum, width: 16, height: isLate ? 32 : 16,
    picTable, palData: palSrc.palette as Uint16Array, palTag: `NPC_PAL_BERRY_SLOT_${palSlot}`, palSlot,
    firstFrame: BERRY_TREE_FIRST_FRAME_BY_ANIM[animNum] ?? 0,
  };
}

/** 1:1 décomp `SetBerryTreeGraphics` (event_object_movement.c:1890) — SWAP LIVE sur le
 *  sprite EXISTANT (réutilise npc.objTileBase, PAS de réalloc VRAM, comme la décomp qui
 *  ne fait que re-pointer images/oam.paletteNum/StartSpriteAnim). Appelé au changement
 *  de stade en partie (croissance, via la state machine BerryTreeGrowth) ET en boucle
 *  même-stade (sway restart). Mute : npc.invisible/paletteBank ; oam.shape/size (16×16↔
 *  16×32 au passage EARLY↔LATE) + paletteBank + tileId ; sprite.images/paletteBank/ctcv/
 *  y2/animNum ; recopie la frame initiale du nouveau stade en VRAM (objTileBase inchangé). */
function _applyBerryTreeStageGraphicsLive(rt: DecompRuntime, npc: ObjectEvent): void {
  // 1:1 décomp : objectEvent->invisible = sprite->invisible = TRUE ; remis FALSE si stade.
  npc.invisible = true;
  if (npc.spriteId < 0) return;
  const sprite = rt.gSprites[npc.spriteId];
  if (!sprite) return;
  sprite.invisible = true;
  const g = _resolveBerryTreeStageGfx(npc);
  if (!g || !g.visible) return;
  // FIX PALSLOT : slot OBJ FIXE de la baie (palSlot ∈ [0,11], partagé comme la décomp), pas
  // l'allocateur dynamique → le berry ne prend plus un slot [12,16) réservé à la météo.
  const paletteBank = PatchObjectEventPalette(g.palData, g.palSlot, 0x1300 + g.palSlot);
  npc.invisible = false;
  sprite.invisible = false;
  // Recopie la frame initiale du nouveau stade en VRAM (objTileBase réutilisé, pas de réalloc).
  rt.gba.objVram.set(g.picTable[g.firstFrame].data, npc.objTileBase * 32);
  npc.paletteBank = paletteBank;
  const oamTemplate = GetBaseOamForDimensions(g.width, g.height);
  const oamIndex = sprite.oamIndex;
  rt.gba.oam[oamIndex].shape = oamTemplate.shape;
  rt.gba.oam[oamIndex].size = oamTemplate.size;
  rt.gba.oam[oamIndex].paletteBank = paletteBank;
  rt.gba.oam[oamIndex].tileId = npc.objTileBase;
  rt.gba.oam[oamIndex].priority = oamTemplate.priority;
  // (la palette du sprite est portée par l'OAM — oam.paletteBank ci-dessus — comme au spawn.)
  sprite.tileBase = npc.objTileBase;
  sprite.images = g.picTable;
  // 1:1 event_object_movement.c:1461-1464 (ctcv + offsets) — recomputés car la taille
  // change au passage EARLY↔LATE (l'arbre pousse vers le haut, base ancrée).
  sprite.centerToCornerVecX = -(g.width >> 1);
  sprite.centerToCornerVecY = -(g.height >> 1);
  sprite.y2 = 16 + sprite.centerToCornerVecY;
  // 1:1 SetBerryTreeGraphics : StartSpriteAnim(sprite, berryStage) (animNum).
  sprite.animNum = g.animNum;
  sprite.animBeginning = true;
  sprite.animEnded = false;
  sprite.animCmdIndex = 0;
  sprite.animDelayCounter = 0;
  sprite.animPaused = false;
}

/** Spawn 1:1 d'un berry tree object-event. Miroir de `TrySpawnObjectEventTemplate`
 *  (event_object_movement.c:1478) + résolution immédiate de `SetBerryTreeGraphics`
 *  (1890) à l'état du stade courant.
 *
 *  Cas spécial vs le flow NPC standard :
 *   - la pic table (9 frames) est assemblée au runtime depuis 3 PNGs distincts
 *     (dirt_pile + sprout + baie) via le builder `gBerryTreePicTableBuilders[berryId]` ;
 *   - la taille OAM dépend du stade (EARLY 16×16 stades 1-2 / LATE 16×32 stades 3-5,
 *     cf `gBerryTreeObjectEventGraphicsIdTable = {EARLY,EARLY,LATE,LATE,LATE}`) ;
 *   - l'alloc VRAM = `graphicsInfo->size` (256 = 8 tiles, sprite.c:1488-1489 +
 *     CreateSpriteAt:566), PAS `images[0].size` (DirtPile = 4 tiles seulement).
 *
 *  Le swap de graphics AU CHANGEMENT de stade en cours de partie (croissance →
 *  ObjectEventSetGraphicsId réalloc) reste différé (dette R3) : les baies
 *  initiales sont figées (stopGrowth=TRUE), l'état du stade est donc résolu une
 *  fois au spawn. `tickBerryTreeGrowth`/`setBerryTreeGraphics` continuent de
 *  resynchroniser `animNum` chaque frame (no-op pour un arbre statique). */
/** Crée (ou recrée) le SPRITE graphique d'un berry tree pour un object event déjà
 *  initialisé (npc.trainerRange_berryTreeId posé). Partagé par le spawn initial
 *  (_spawnBerryTreeFromTemplate) ET le respawn au retour de menu
 *  (SpawnObjectEventOnReturnToField, event_object_movement.c:1728).
 *
 *  1:1 décomp : SpawnObjectEventOnReturnToField recrée le sprite de CHAQUE object
 *  event actif via son graphicsId, puis le movement type re-run SetBerryTreeGraphics
 *  (sprite.data[7]=0 sur le nouveau sprite) pour ré-appliquer les pics de la baie.
 *  Notre helper fait les deux d'un coup (pics baie du berryType + frame du stade).
 *  Sans ça, ouvrir un menu (sac) puis revenir à l'OW laissait le berry tree
 *  invisible (`_respawnNpcSpriteForReturnToField` → `catalog['OBJ_EVENT_GFX_BERRY_TREE']`
 *  = undefined → sprite jamais recréé).
 *
 *  Pose : npc.invisible/spriteId/objTileBase/objTileCount/paletteBank/inanimate/
 *  is16x16/is32x32/useSubsprites + sprite.images/anims/animNum. NE touche PAS les
 *  champs identité/position (= préservés au respawn). Retourne false si les PNGs
 *  ne sont pas en cache ou si l'alloc tiles/palette échoue. */
function _setupBerryTreeSpriteGraphics(npc: ObjectEvent, rt: DecompRuntime): boolean {
  // ─── Résolution graphics 1:1 SetBerryTreeGraphics — résolveur partagé ────────
  // (stade → animNum, taille OAM EARLY/LATE, pic table 9 frames, palette par stade,
  //  frame initiale). Partagé avec le swap live `_applyBerryTreeStageGraphicsLive`.
  const g = _resolveBerryTreeStageGfx(npc);
  if (!g) return false;  // PNGs (dirt/sprout/baie) pas encore en cache → caller retry.
  const { visible, animNum, width, height, picTable, palData, palSlot, firstFrame } = g;

  // 1:1 décomp : AllocSpriteTiles(graphicsInfo->size / TILE_SIZE_4BPP) = 256/32 = 8.
  // (gObjectEventGraphicsInfo_BerryTree{,EarlyStages,LateStages}.size = 256 = la
  // plus grande frame 16×32 ; suffisant pour toutes les frames du sprite.)
  const objTileCount = 8;
  const objTileBase = AllocSpriteTiles(objTileCount);
  if (objTileBase < 0) return false;

  // FIX PALSLOT : slot OBJ FIXE de la baie (cf. _applyBerryTreeStageGraphicsLive) → hors [12,16).
  const paletteBank = PatchObjectEventPalette(palData, palSlot, 0x1300 + palSlot);

  // Copie la frame initiale du stade en VRAM (= état avant que l'anim ne tourne).
  rt.gba.objVram.set(picTable[firstFrame].data, objTileBase * 32);

  // ─── Champs graphics de l'object event (PAS identité/position) ───────────────
  // 1:1 SetBerryTreeGraphics : invisible si BERRY_STAGE_NO_BERRY.
  npc.invisible = !visible;
  npc.objTileBase = objTileBase;
  npc.objTileCount = objTileCount;
  npc.paletteBank = paletteBank;
  // 1:1 décomp : inanimate=TRUE (gObjectEventGraphicsInfo_BerryTree). is16x16/
  // is32x32/useSubsprites = false → frame piloté par le sprite anim system
  // (dynamic copy), pas par le cycle tileId de updateNpcSpriteFrame.
  npc.inanimate = true;
  npc.is16x16 = false;
  npc.is32x32 = false;
  npc.useSubsprites = false;

  // ─── Création du sprite (flow images/dynamic-copy 1:1, cf _hasNewFlow) ───────
  const oamTemplate = GetBaseOamForDimensions(width, height);
  const result = rt.CreateSpriteAtOam({
    tileId: objTileBase,
    paletteBank,
    x: 0, y: 0,
    shape: oamTemplate.shape, size: oamTemplate.size,
    priority: oamTemplate.priority,
    paletteMode: 0,
    affineMode: 0,
  });
  npc.spriteId = result.spriteId;
  const sprite = rt.gSprites[npc.spriteId];
  if (sprite) {
    sprite.tileBase = objTileBase;
    sprite.images = picTable;
    sprite.anims = sAnimTable_BerryTree as unknown as ReadonlyArray<ReadonlyArray<unknown>>;
    sprite.usingSheet = false;
    sprite.sheetTileStart = 0;
    // 1:1 event_object_movement.c:1461-1464 (ctcv + offsets).
    sprite.centerToCornerVecX = -(width >> 1);
    sprite.centerToCornerVecY = -(height >> 1);
    sprite.y2 = 16 + sprite.centerToCornerVecY;
    // 1:1 SetBerryTreeGraphics : StartSpriteAnim(sprite, berryStage) (animNum).
    if (visible) {
      sprite.animNum = animNum;
      sprite.animBeginning = true;
      sprite.animEnded = false;
      sprite.animCmdIndex = 0;
      sprite.animDelayCounter = 0;
    }
  }
  rt.gba.oam[result.oamIndex].flipH = false;
  rt.gba.oam[result.oamIndex].priority = oamTemplate.priority;
  return true;
}

function _spawnBerryTreeFromTemplate(
  template: ObjectEventTemplate,
  currentMapId: string,
  rt: DecompRuntime,
): boolean {
  // Flag de masquage (1:1 décomp TrySpawnObjectEvents : NPC caché si flagId set).
  if (template.flagId && template.flagId !== '0' && FlagGet(template.flagId)) return false;

  // Dedup (1:1 GetAvailableObjectEventId) — identique au flow standard.
  const existing = gObjectEvents.findIndex(o => {
    if (!o.active || o.mapId !== currentMapId) return false;
    if (template.localIdRaw && o.localIdRaw === template.localIdRaw) return true;
    if (!template.localIdRaw
        && o.initialCoordsX === template.x + MAP_OFFSET
        && o.initialCoordsY === template.y + MAP_OFFSET) return true;
    return false;
  });
  if (existing >= 0) return false;

  const slot = gObjectEvents.findIndex(o => !o.active);
  if (slot < 0) return false;

  // ─── Init ObjectEvent identité + position (1:1 InitObjectEventStateFromTemplate) ─
  const cam = GetCameraTopLeftCoords();
  const npc = gObjectEvents[slot];
  npc.active = true;
  npc.graphicsId = 'OBJ_EVENT_GFX_BERRY_TREE';
  npc.movementType = template.movementTypeRaw ?? '';
  npc.localId = template.localId;
  npc.localIdRaw = template.localIdRaw;
  npc.mapId = currentMapId;
  npc.scriptLabel = template.script ?? '';
  // CRITIQUE : champ jamais copié par le flow standard ; sans ça
  // GetStageByBerryTreeId lit toujours berryTrees[0]. Posé AVANT le helper graphics.
  npc.trainerRange_berryTreeId = template.trainerRange_berryTreeId;
  npc.currentCoordsX = template.x + MAP_OFFSET;
  npc.currentCoordsY = template.y + MAP_OFFSET;
  npc.previousCoordsX = template.x + MAP_OFFSET;
  npc.previousCoordsY = template.y + MAP_OFFSET;
  npc.facingDirection = movementTypeToInitialFacing(npc.movementType);
  npc.movementDirection = npc.facingDirection;
  npc.previousMovementDirection = npc.facingDirection;
  ObjectEventUpdateMetatileBehaviors(npc);
  // Position sprite 1:1 SetSpritePosToMapCoords (event_object_movement.c:4801).
  let dx = -gTotalCamera.pixelOffsetX - gFieldCamera.x;
  let dy = -gTotalCamera.pixelOffsetY - gFieldCamera.y;
  if (gFieldCamera.x > 0) dx += 16;
  if (gFieldCamera.x < 0) dx -= 16;
  if (gFieldCamera.y > 0) dy += 16;
  if (gFieldCamera.y < 0) dy -= 16;
  npc.worldX = (npc.currentCoordsX - cam.x) * 16 + 8 + dx;
  npc.worldY = (npc.currentCoordsY - cam.y) * 16 + dy;
  npc.movementStep = 0;
  npc.movementDelay = 0;
  npc.walkFramesLeft = 0;
  npc.walkDirection = DIR_NONE;
  npc.walkAnimAlt = 0;
  npc.frozen = false;
  npc.initialCoordsX = template.x + MAP_OFFSET;
  npc.initialCoordsY = template.y + MAP_OFFSET;
  npc.movementRangeX = template.movementRangeX;
  npc.movementRangeY = template.movementRangeY;
  if (movementTypeHasRange(npc.movementType)) {
    if (npc.movementRangeX === 0) npc.movementRangeX = 1;
    if (npc.movementRangeY === 0) npc.movementRangeY = 1;
  }
  npc.directionSeqIdx = 0;

  // ─── Graphics + sprite (helper partagé avec le respawn retour-menu) ──────────
  if (!_setupBerryTreeSpriteGraphics(npc, rt)) {
    npc.active = false;  // alloc/PNG échoué → libère le slot
    return false;
  }
  console.log(`[object-events] spawn berry tree slot=${slot} treeId=${npc.trainerRange_berryTreeId} stage=${GetStageByBerryTreeId(npc.trainerRange_berryTreeId)} at (${template.x}, ${template.y}) visible=${!npc.invisible}`);
  return true;
}

/** Spawn 1 NPC depuis un template. SYNC : lit la PNG depuis _npcPngCache.
 *  Returns true si spawn réussi, false si skipped (= dedup hit, pool full,
 *  PNG pas cached, graphics non-standard, etc).
 *
 *  Phase 4.8 Tâche 2 : extracted depuis SpawnObjectEventsOnMap pour pouvoir
 *  être appelé par TrySpawnObjectEvents per-frame sync. */
function _spawnSingleNpcFromTemplate(
  template: ObjectEventTemplate,
  currentMapId: string,
  rt: DecompRuntime,
  catalog: Record<string, GraphicsInfo>,
): boolean {
  if (!template.graphicsIdRaw) return false;
  let graphicsKey = template.graphicsIdRaw;
  // 1:1 décomp `event_object_movement.c:820` :
  //   if (graphicsId >= OBJ_EVENT_GFX_VARS)
  //     graphicsId = VarGetObjectEventGraphicsId(graphicsId - OBJ_EVENT_GFX_VARS);
  // OBJ_EVENT_GFX_VAR_N (N=0..7) = placeholder graphics_id qui se résout à
  // runtime via VAR_OBJ_GFX_ID_N. Used par les NPCs rival (= sprite genre
  // opposé) + Wally + autres NPCs dynamiques.
  const varMatch = graphicsKey.match(/^OBJ_EVENT_GFX_VAR_(\d+)$/);
  if (varMatch) {
    const n = Number(varMatch[1]);
    const varName = `VAR_OBJ_GFX_ID_${n}`;
    const gfxIdValue = VarGet(varName);
    if (gfxIdValue !== 0) {
      const resolved = _reverseDecompConstant(gfxIdValue, 'OBJ_EVENT_GFX_');
      if (resolved) {
        graphicsKey = resolved;
      } else {
        console.warn(`[object-events] OBJ_EVENT_GFX_VAR_${n} resolved to ${gfxIdValue} but no matching OBJ_EVENT_GFX_ const found, skip`);
        return false;
      }
    } else {
      // VAR_OBJ_GFX_ID_N = 0 (= pas encore set par script). Ne pas spawn —
      // décomp ferait pareil (= sprite blank/invisible).
      return false;
    }
  }
  // Berry tree : cas spécial (absent du catalogue, 3 PNGs distincts assemblés au
  // runtime selon le berryType + swap de taille OAM selon le stade). Dispatch
  // vers le spawner dédié 1:1 décomp (TrySpawnObjectEventTemplate +
  // SetBerryTreeGraphics, event_object_movement.c:1478 + 1890).
  if (graphicsKey === 'OBJ_EVENT_GFX_BERRY_TREE') {
    return _spawnBerryTreeFromTemplate(template, currentMapId, rt);
  }
  const graphics = catalog[graphicsKey];
  if (!graphics) return false;
  // 1:1 décomp `TrySpawnObjectEvents` (event_object_movement.c:1670) :
  //   if (... && !FlagGet(template->flagId)) TrySpawnObjectEventTemplate(...)
  // → un NPC avec un flag set est CACHÉ. Ex : FLAG_HIDE_LITTLEROOT_TOWN_BIRCH
  // empêche Birch d'apparaitre tant qu'il est hidden par scénario.
  // template.flagId == "0" ou "" → no flag (= always show).
  if (template.flagId && template.flagId !== '0' && FlagGet(template.flagId)) {
    return false;
  }
  // Phase 4.10 : support multi-tailles NPC :
  //   - 16×32 standard people sprites (= overworld_frame anim 9 frames).
  //   - 16×16 inanimate (= moving box, berry tree, egg, etc.).
  //   - 32×32 large Pokemon (= Vigoroth_Carrying_Box déménageurs, Latios, etc.).
  //   - 48×48 truck (= subsprites 12 OAMs).
  // Session 123 : 32×32 ajouté car Vigoroth déménageurs étaient skip silencieusement
  // → "il manque les déménageurs (gros sprite Pokémon NPC)" dans BrendansHouse_1F.
  const is48x48 = graphics.frameWidth === 48 && graphics.frameHeight === 48;
  const is32x32 = graphics.frameWidth === 32 && graphics.frameHeight === 32;
  const is16x32 = graphics.frameWidth === 16 && graphics.frameHeight === 32;
  const is16x16 = graphics.frameWidth === 16 && graphics.frameHeight === 16;
  if (!is48x48 && !is32x32 && !is16x32 && !is16x16) return false;
  if (graphics.displayWidth !== graphics.frameWidth || graphics.displayHeight !== graphics.frameHeight) return false;

  // 1:1 STRICT décomp `GetAvailableObjectEventId` (event_object_movement.c:1263) :
  // dedup par (localId, mapId). Si template a un localId > 0 (= localId résolu
  // depuis localIdRaw défini), on dedup PAR LOCALID. Sinon fallback aux coords.
  //
  // Bug 2026-05-24 : dedup uniquement par coords créait des duplicates quand
  // l'overlay (saveblock setobjectxyperm) modifie x/y → 2 MOMs spawnés (= 1 à
  // mapHeader pristine x=2 + 1 à overlay x=4). Fix : dedup par localId d'abord
  // (= 1:1 décomp), fallback coords pour templates avec localId=0 (= généric NPCs).
  const existing = gObjectEvents.findIndex(o => {
    if (!o.active || o.mapId !== currentMapId) return false;
    // Dedup par localIdRaw si défini (= 1:1 décomp localId).
    if (template.localIdRaw && o.localIdRaw === template.localIdRaw) return true;
    // Fallback coords pour anonymous templates (localId=0, no localIdRaw).
    if (!template.localIdRaw
        && o.initialCoordsX === template.x + MAP_OFFSET
        && o.initialCoordsY === template.y + MAP_OFFSET) return true;
    return false;
  });
  if (existing >= 0) return false;

  const slot = gObjectEvents.findIndex(o => !o.active);
  if (slot < 0) return false;

  // SYNC : PNG depuis cache. Si pas cached, skip — caller doit avoir préload.
  const pngPath = `${BASE}/${graphics.png}`;
  const png = _npcPngCache.get(pngPath);
  if (!png) return false;

  // ─── C1.3 — 1:1 STRICT décomp flow unified (TrySpawnObjectEventTemplate) ───
  //
  // Pré-convert PNG row-major → 1D OBJ frames consécutifs (= format ROM décomp
  // gObjectEventPic_*). Sans ça les `subarray(N*sz, (N+1)*sz)` des pic_table
  // factories mélangent les frames (= bug "2 têtes empilées").
  // 1:1 décomp : graphicsInfo (= source des `images`) est résolu AVANT
  // AllocSpriteTiles, car la taille d'alloc dépend de `images->size` (sprite.c:566).
  const _pic1dObj = pngTo1dObjLayoutAllFrames(
    png.charData, png.widthTiles, graphics.frameWidth, graphics.frameHeight,
  );
  // 1:1 STRICT décomp : certains factories (= BrendanNormal/MayNormal/Rival
  // BrendanNormal/RivalMayNormal) attendent 2 buffers PNG distincts (= mixed
  // walking + running frames dans sPicTable_X[18]). Le secondaire est défini
  // dans MULTI_PNG_SECONDARY_PATHS et préchargé par preloadNpcGraphicsForMap.
  // Convert le 2nd PNG row-major → 1D OBJ et passe au factory.
  const _factory = gObjectEventGraphicsInfoPointers[graphicsKey];
  const _numPicsExpected = _factory ? _factory.length : 1;
  const _picsArgs: Uint8Array[] = [_pic1dObj];
  if (_numPicsExpected > 1) {
    const secondaryRelPath = MULTI_PNG_SECONDARY_PATHS[graphicsKey];
    const secondaryPng = secondaryRelPath ? _npcPngCache.get(`${BASE}/${secondaryRelPath}`) : undefined;
    if (secondaryPng) {
      const sec1dObj = pngTo1dObjLayoutAllFrames(
        secondaryPng.charData, secondaryPng.widthTiles, graphics.frameWidth, graphics.frameHeight,
      );
      _picsArgs.push(sec1dObj);
    } else {
      // Fallback (= dette : 2nd PNG pas chargé, duplique le primary pour éviter
      // crash subarray undefined). Frames running afficheront frames normales.
      console.warn(`[object-events] secondary PNG manquant pour ${graphicsKey} (path=${secondaryRelPath ?? 'undefined'})`);
      _picsArgs.push(_pic1dObj);
    }
  }
  const _graphicsInfo_1to1 = GetObjectEventGraphicsInfo(graphicsKey, ..._picsArgs);
  const _hasNewFlow = _graphicsInfo_1to1 && _graphicsInfo_1to1.images.length > 0;

  // 1:1 STRICT décomp sprite.c:562-575 `CreateSpriteAt` branch `if (tileTag == TAG_NONE)` :
  //   sprite->images = template->images;
  //   tileNum = AllocSpriteTiles(images->size / TILE_SIZE_4BPP);   // = UNE frame
  //   if (tileNum == -1) { ResetSprite(); return MAX_SPRITES; }
  //   sprite->usingSheet = FALSE;
  // NPCs ont tileTag == TAG_NONE → AllocSpriteTiles depuis bitmap général.
  // Flow images/dynamic-copy (= _hasNewFlow) : on alloue EXACTEMENT les tiles
  // d'UNE frame (= images[0].size / TILE_SIZE_4BPP). La frame courante est
  // recopiée dans ces mêmes tiles (oam.tileId = objTileBase) par AnimateSprite →
  // RequestSpriteFrameImageCopy → ProcessSpriteCopyRequests (sprite-animation.ts).
  // Sans ça (= ancien raccourci TILES_PER_NPC=72/NPC) la VRAM OBJ saturait dans
  // les maps bondées (= flèche warp tombait sur tuile 0 = joueur). Les sprites
  // legacy multi-frame préchargé (branches is48x48/is32x32/is16x16/else) gardent
  // TILES_PER_NPC (= dette migration : pas encore portés au flow images).
  const _objTileCount = (_hasNewFlow && _graphicsInfo_1to1 && _graphicsInfo_1to1.images[0])
    ? Math.ceil(_graphicsInfo_1to1.images[0].size / 32)   // TILE_SIZE_4BPP = 32 bytes
    : TILES_PER_NPC;
  const objTileBase = AllocSpriteTiles(_objTileCount);
  if (objTileBase < 0) return false;

  // 1:1 STRICT décomp event_object_movement.c:1577-1578 + 2014-2025 :
  //   if (spriteTemplate->paletteTag != TAG_NONE)
  //       LoadObjectEventPalette(spriteTemplate->paletteTag);
  // LoadObjectEventPalette → LoadSpritePaletteIfTagExists → LoadSpritePalette
  // (sprite.c:1589-1608) : dédup par le `paletteTag` PARTAGÉ (OBJ_EVENT_PAL_TAG_NPC_X).
  // FIX over-alloc palette OBJ : on utilisait `NPC_PAL_<graphicsKey>` (= 1 slot PAR
  // graphics distinct → 14-16 slots pleins → ZÉRO place météo). La décomp partage 4
  // palettes NPC (npc_1..4) : N graphics NPC_1 → 1 seul slot. On dédoublonne donc par le
  // VRAI tag partagé `_graphicsInfo_1to1.paletteTag` → ≤ ~12 slots objet, [12,16) libre
  // pour la météo (cf. PALSLOT scheme décomp, OBJ_PALSLOT_COUNT=12).
  // FIX over-alloc PALSLOT (cause-racine météo rose) : charge la palette dans le SLOT OBJ
  // FIXE de la graphics (`paletteSlot` ∈ [0,11]) via PatchObjectEventPalette (LoadPalette direct),
  // au lieu de l'allocateur dynamique. Les object events n'utilisent JAMAIS AllocSpritePalette →
  // ils ne touchent jamais [12,16) (réservé à la météo par FreeAndReserveObjectSpritePalettes).
  // Les graphics d'un même slot PARTAGENT la palette (npc_1..4 ; asset-compatible, vérifié A/B).
  const _palSlot = _graphicsInfo_1to1?.paletteSlot ?? PALSLOT_NPC_1;
  const _palTag1to1 = _graphicsInfo_1to1?.paletteTag;
  const _markTag = typeof _palTag1to1 === 'number' && _palTag1to1 !== OBJ_EVENT_PAL_TAG_NONE
    ? _palTag1to1 : (0x1300 + _palSlot);
  const paletteBank = PatchObjectEventPalette(png.palette as Uint16Array, _palSlot, _markTag);

  if (_hasNewFlow && _graphicsInfo_1to1) {
    // Flow 1:1 strict : copie SEULEMENT frame 0 en VRAM (= état initial).
    // AnimateSprite + RequestSpriteFrameImageCopy → ProcessSpriteCopyRequests
    // recopie images[N].data dans le slot VRAM à chaque anim cmd.
    rt.gba.objVram.set(_graphicsInfo_1to1.images[0].data, objTileBase * 32);
  } else if (is48x48) {
    // 48×48 truck : 36 tiles row-major sequential (= matches sOamTable_48x48
    // tileOffsets 0, 4, 6, 10, ... 34). PNG layout : 6×6 tiles row-major.
    // Just copy the 36 tiles directly into OBJ VRAM at objTileBase.
    rt.gba.objVram.set(png.charData.subarray(0, 36 * 32), objTileBase * 32);
  } else if (is32x32) {
    // 32×32 large Pokemon (= Vigoroth déménageurs, Latios, etc.).
    //
    // **Session 124 fix Bug 1** : PNG row-major NE MATCHE PAS le format OBJ
    // 1D MAP. Pour un PNG multi-frames (= Vigoroth 5 frames horizontaux de
    // 32x32, 160x32 PNG = 20 tiles wide), copier `subarray(0, 16*32)` prend
    // les 16 PREMIERS tiles row-major du PNG = 16 tiles de la row 0 (= 4
    // frames partiels horizontalement) → garbage rendering.
    //
    // Fix : utiliser pngTo1dObjLayoutSingleFrame (= reorganise 16 tiles d'un
    // frame N en row-major frame-local).
    //
    // Anim multi-frame 1:1 décomp (session 2026-05-20 user-flag Vigoroth) :
    // 1:1 décomp `sPicTable_Vigoroth*` (object_event_pic_tables.h:928-950) +
    // `sAnim_GoSouth/North/West/East` (object_event_anims.h:202-236) :
    //   - VIGOROTH_CARRYING_BOX : face=PNG[0], walk1=PNG[1], walk2=PNG[2]
    //     (= face down avec box + 2 frames marche down ; le hFlip vers east
    //      utilise les mêmes frames car le sprite reste face DOWN).
    //   - VIGOROTH_FACING_AWAY : face=PNG[3], walk1=PNG[4], walk2=PNG[4]
    //     (= face up ; pas de walk2 distinct du PNG, walk1 répété sur les
    //      sub-frames walk1/walk2 de sAnim_GoNorth → oscillation 2-frame).
    //   - autres 32x32 (futur) : face=0, walk1=1, walk2=2 (defaults).
    //
    // Charge les 3 frames consecutivement en VRAM à objTileBase pour que
    // updateNpcSpriteFrame branch is32x32 puisse cycler oam.tileId entre
    // objTileBase, objTileBase+16, objTileBase+32 (16 tiles par frame 32×32).
    let faceFrame = 0;
    let walk1Frame = 1;
    let walk2Frame = 2;
    if (graphicsKey === 'OBJ_EVENT_GFX_VIGOROTH_FACING_AWAY') {
      faceFrame = 3;
      walk1Frame = 4;
      walk2Frame = 4;  // pas de walk2 distinct du PNG
    }
    const faceTiles = pngTo1dObjLayoutSingleFrame(png.charData, faceFrame, png.widthTiles, 32, 32);
    const walk1Tiles = pngTo1dObjLayoutSingleFrame(png.charData, walk1Frame, png.widthTiles, 32, 32);
    const walk2Tiles = pngTo1dObjLayoutSingleFrame(png.charData, walk2Frame, png.widthTiles, 32, 32);
    rt.gba.objVram.set(faceTiles, objTileBase * 32);
    rt.gba.objVram.set(walk1Tiles, (objTileBase + 16) * 32);
    rt.gba.objVram.set(walk2Tiles, (objTileBase + 32) * 32);
  } else if (is16x16) {
    // 16×16 — peut être inanimate (= moving box, berry, egg) OU animate (=
    // NINJA_BOY, kids 9-frame standard anim). Bug B3 2026-05-24 : le copy
    // row-major naïf prenait les 4 premiers tiles du PNG → frame 0 top-left,
    // frame 0 top-right, frame 1 top-left, frame 1 top-right (= "2 têtes
    // empilées").
    //
    // Fix : charger jusqu'à 9 frames consécutifs en VRAM via
    // pngTo1dObjLayoutSingleFrame (= layout 1D OBJ frame-local). Si le PNG
    // contient < 9 frames (= inanimate), on charge ce qui est dispo (le
    // sprite reste static via cfg.face=0).
    const numAvailFrames = Math.min(9, Math.floor(png.widthTiles / 2));
    for (let f = 0; f < numAvailFrames; f++) {
      const frameTiles = pngTo1dObjLayoutSingleFrame(png.charData, f, png.widthTiles, 16, 16);
      rt.gba.objVram.set(frameTiles, (objTileBase + f * 4) * 32);
    }
  } else {
    const numFrames = (png.widthTiles * png.heightTiles) / TILES_PER_FRAME_16x32;
    const reordered = pngTo1dObjLayout(png.charData, numFrames, png.widthTiles, 16, 32);
    rt.gba.objVram.set(reordered, objTileBase * 32);
  }
  // 1:1 STRICT décomp : AllocSpriteTiles (au-dessus) marque déjà les tiles
  // comme allouées dans `sSpriteTileAllocBitmap`. LoadSpritePalette (au-dessus)
  // marque déjà `sSpritePaletteTags[paletteBank]` + écrit la palette via
  // DoLoadSpritePalette (sprite.c:1618-1621 = LoadPalette buffers unfaded+faded
  // à OBJ_PLTT_ID(slot)). Pas de double-write ici.
  //
  // Note dette web : on a chargé `png.palette` directement via LoadSpritePalette,
  // mais le décomp aurait passé un `OBJ_EVENT_PAL_TAG_<X>` issu de
  // `sObjectEventSpritePalettes[]` (= constante data du décomp). On utilise un
  // tag string `NPC_PAL_${graphicsKey}` qui est unique par graphicsKey →
  // équivalent fonctionnel pour le tag system.

  const cam = GetCameraTopLeftCoords();
  const npc = gObjectEvents[slot];
  npc.active = true;
  // 1:1 décomp `InitObjectEventStateFromTemplate` (event_object_movement.c:1300-1301) :
  // active = TRUE; triggerGroundEffectsOnMove = TRUE. Sans ça, DoGroundEffects_OnSpawn
  // ne tire jamais pour un NPC statique → pas de reflet/grass-on-spawn près de l'eau/herbe
  // (le flag est consommé au 1er tick de TickObjectEventMovements, grille déjà chargée).
  npc.triggerGroundEffectsOnMove = true;
  // Reset 1:1 des "once" flags ground-effect (= ClearObjectEvent zéroie tout avant le set) :
  // un slot réutilisé peut garder hasReflection/inX stale → forcerait GetGroundEffectFlags_*
  // à sauter le re-trigger. On les remet à false (la valeur post-ClearObjectEvent).
  npc.hasReflection = false;
  npc.inShortGrass = false;
  npc.inShallowFlowingWater = false;
  npc.inSandPile = false;
  npc.inHotSprings = false;
  npc.disableCoveringGroundEffects = false;
  npc.invisible = false;
  npc.graphicsId = graphicsKey;
  npc.movementType = template.movementTypeRaw ?? '';
  npc.localId = template.localId;
  npc.localIdRaw = template.localIdRaw;  // Phase 4.10 : pour movement-system applymovement.
  npc.mapId = currentMapId;  // Phase 4.8 : track map of origin pour dedup cross-border.
  npc.scriptLabel = template.script ?? '';
  // 1:1 décomp `InitObjectEventStateFromTemplate` (event_object_movement.c:1330/1332) :
  //   objectEvent->trainerType = template->trainerType;
  //   objectEvent->trainerRange_berryTreeId = template->trainerRange_berryTreeId;
  // Requis par l'aggro dresseurs (CheckForTrainersWantingBattle lit npc.trainerType) et par
  // les berry trees (le spawn berry-tree spécialisé le posait déjà ; ici = flow standard).
  npc.trainerType = template.trainerType;
  npc.trainerRange_berryTreeId = template.trainerRange_berryTreeId;
  // 1:1 décomp `InitObjectEventStateFromTemplate` (event_object_movement.c:1298-1312) :
  //   x = template->x + MAP_OFFSET;
  //   y = template->y + MAP_OFFSET;
  //   objectEvent->currentCoords.x = x;
  //   objectEvent->currentCoords.y = y;
  //   objectEvent->previousCoords.x = x;
  //   objectEvent->previousCoords.y = y;
  // Post R3 refactor : storage INTERNAL 1:1 strict path identique au décomp.
  npc.currentCoordsX = template.x + MAP_OFFSET;
  npc.currentCoordsY = template.y + MAP_OFFSET;
  npc.previousCoordsX = template.x + MAP_OFFSET;
  npc.previousCoordsY = template.y + MAP_OFFSET;
  npc.facingDirection = movementTypeToInitialFacing(npc.movementType);
  npc.movementDirection = npc.facingDirection;
  npc.previousMovementDirection = npc.facingDirection;
  // 1:1 décomp `GetAllGroundEffectFlags_OnSpawn` (event_object_movement.c:7389)
  // appelle `ObjectEventUpdateMetatileBehaviors(objEvent)` au spawn pour init
  // `currentMetatileBehavior` + `previousMetatileBehavior` cached fields.
  ObjectEventUpdateMetatileBehaviors(npc);
  npc.objTileBase = objTileBase;
  npc.objTileCount = _objTileCount;
  npc.paletteBank = paletteBank;
  // Post R3 refactor : npc.currentCoords déjà INTERNAL (= template + MAP_OFFSET).
  const npcGBackupCol = npc.currentCoordsX;
  const npcGBackupRow = npc.currentCoordsY;
  // Phase 4.9 audit : 1:1 décomp `SetSpritePosToMapCoords` (event_object_movement.c:4801).
  //
  // ```c
  // s16 dx = -gTotalCameraPixelOffsetX - gFieldCamera.x;
  // s16 dy = -gTotalCameraPixelOffsetY - gFieldCamera.y;
  // if (gFieldCamera.x > 0) dx += 16;
  // if (gFieldCamera.x < 0) dx -= 16;
  // if (gFieldCamera.y > 0) dy += 16;
  // if (gFieldCamera.y < 0) dy -= 16;
  // *destX = ((mapX - pos.x) << 4) + dx;
  // *destY = ((mapY - pos.y) << 4) + dy;
  // ```
  //
  // Le `+/- 16` quand gFieldCamera.{x,y} non-zero (= mid-step) snap le spawn
  // sprite à la post-step position. Sans ça, NPCs spawnés mid-step (= via
  // orchestrator au tile boundary frame 0 où gFieldCamera.y = ±1 post-update)
  // dérivent de 16 px sur le reste du step (= drift "1 case trop bas/haut").
  //
  // Notre conv (post-refactor) : cam.x/y = playerLogical (= 1:1 décomp pos).
  let dx = -gTotalCamera.pixelOffsetX - gFieldCamera.x;
  let dy = -gTotalCamera.pixelOffsetY - gFieldCamera.y;
  if (gFieldCamera.x > 0) dx += 16;
  if (gFieldCamera.x < 0) dx -= 16;
  if (gFieldCamera.y > 0) dy += 16;
  if (gFieldCamera.y < 0) dy -= 16;
  // 1:1 décomp `(mapX - pos.x) << 4 + dx` (event_object_movement.c:4801).
  // mapX = NPC's gBackup-frame coord. pos.x = LOGICAL.x player (= cam.x).
  // (npcGBackupCol - cam.x) = (template.x + 7 - LOGICAL.x_player) = "cols from view top-left".
  // Player drawn at view (7, 7) avec BG_VOFS = 40 → screen y centered.
  npc.worldX = (npcGBackupCol - cam.x) * 16 + 8 + dx;
  npc.worldY = (npcGBackupRow - cam.y) * 16 + dy;
  npc.movementStep = 0;
  npc.movementDelay = 0;
  npc.walkFramesLeft = 0;
  npc.walkDirection = DIR_NONE;
  npc.walkAnimAlt = 0;
  npc.frozen = false;
  // Post R3 refactor : initialCoords INTERNAL (= +MAP_OFFSET) 1:1 décomp
  // event_object_movement.c:1307.
  npc.initialCoordsX = template.x + MAP_OFFSET;
  npc.initialCoordsY = template.y + MAP_OFFSET;
  npc.movementRangeX = template.movementRangeX;
  npc.movementRangeY = template.movementRangeY;
  // 1:1 décomp event_object_movement.c:1323-1328 — force range = 1 si 0 et
  // movementType ∈ sMovementTypeHasRange.
  if (movementTypeHasRange(npc.movementType)) {
    if (npc.movementRangeX === 0) npc.movementRangeX = 1;
    if (npc.movementRangeY === 0) npc.movementRangeY = 1;
  }
  npc.directionSeqIdx = 0;

  // 1:1 STRICT décomp event_object_movement.c:1487 :
  //   graphicsInfo = GetObjectEventGraphicsInfo(template->graphicsId);
  //   MakeSpriteTemplateFromObjectEventTemplate(template, &spriteTemplate, ...);
  //   spriteTemplate.oam = graphicsInfo->oam;  ← shape/size/priority source
  // Au CreateSpriteAt : sprite->oam = *template->oam (= struct copy).
  //
  // Lookup graphicsInfo dans le pointer table porté 1:1 (= 245 factories dans
  // data/object_events/object_event_graphics_info.ts). Si trouvé, utilise graphicsInfo.oam
  // (= source authoritative décomp). Sinon fallback à GetBaseOamForDimensions
  // qui dérive depuis dimensions PNG (= cas OBJ_EVENT_GFX_VAR_* dynamiques).
  const graphicsInfo = _graphicsInfo_1to1;
  const oamTemplate = graphicsInfo?.oam ?? GetBaseOamForDimensions(graphics.frameWidth, graphics.frameHeight);

  // ─── C1.3 — 1:1 STRICT décomp CreateSprite unified ────────────────────────
  //
  // Si graphicsInfo + images sont disponibles (= 245 entries patchées), on
  // utilise le flow 1:1 strict décomp (event_object_movement.c:1418-1499) :
  //   CreateSprite(spriteTemplate) → sprite.images = graphicsInfo.images
  //   sprite.centerToCornerVecX = -(width >> 1);
  //   sprite.centerToCornerVecY = -(height >> 1);
  //   sprite.x += 8;
  //   sprite.y += 16 + ctcvY;
  //   StartSpriteAnim(sprite, GetFaceDirectionAnimNum(facing));
  if (_hasNewFlow && graphicsInfo) {
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase,
      paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: oamTemplate.priority,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.tileBase = objTileBase;
      // 1:1 STRICT décomp sprite.c:CreateSpriteAt — branch tileTag==TAG_NONE :
      //   sprite->images = template->images;
      //   sprite->usingSheet = FALSE;
      sprite.images = graphicsInfo.images;
      // 1:1 décomp `sprite->anims = template->anims` (sprite.c:544).
      sprite.anims = graphicsInfo.anims as ReadonlyArray<ReadonlyArray<unknown>> | null;
      sprite.usingSheet = false;
      sprite.sheetTileStart = 0;
      // 1:1 décomp event_object_movement.c:1461-1464 :
      //   sprite->centerToCornerVecX = -(graphicsInfo->width >> 1);
      //   sprite->centerToCornerVecY = -(graphicsInfo->height >> 1);
      //   sprite->x += 8;
      //   sprite->y += 16 + sprite->centerToCornerVecY;
      sprite.centerToCornerVecX = -(graphicsInfo.width >> 1);
      sprite.centerToCornerVecY = -(graphicsInfo.height >> 1);
      // sprite.x += 8 → on l'a déjà via worldX = (col - cam.x) * 16 + 8 + dx.
      // sprite.y += 16 + ctcvY → on l'applique via sprite.y2.
      sprite.y2 = 16 + sprite.centerToCornerVecY;
      // 1:1 décomp event_object_movement.c:1470-1471 :
      //   if (!objectEvent->inanimate)
      //       StartSpriteAnim(sprite, GetFaceDirectionAnimNum(facingDirection));
      if (!graphicsInfo.inanimate && sprite.anims && sprite.anims.length > 0) {
        sprite.animNum = GetFaceDirectionAnimNum(npc.facingDirection);
        sprite.animBeginning = true;
        sprite.animEnded = false;
        sprite.animCmdIndex = 0;
        sprite.animDelayCounter = 0;
      }
    }
    rt.gba.oam[result.oamIndex].flipH = false;
    rt.gba.oam[result.oamIndex].priority = oamTemplate.priority;
    // 1:1 STRICT décomp event_object_movement.c:1494-1496 :
    //   gSprites[..spriteId].images = graphicsInfo->images;
    //   if (subspriteTables)
    //       SetSubspriteTables(&gSprites[..].spriteId], subspriteTables);
    //
    // Mais : le décomp `SetSubspriteTables` (sprite.c:1659-1664) ne hide PAS le
    // primary OAM. C'est le rendering qui décide selon `subspriteTableNum`
    // (= sElevationToSubspriteTableNum[elevation]) ET `subspriteCount > 0`.
    //
    // Notre TS `SetSubspriteTables(spriteId, subsprites)` hide le primary
    // unconditionnellement. Donc si on passe subspriteTables[0].subsprites
    // pour un 16x32 (= placeholder vide `[]`), le primary est hidden + 0
    // child OAM → NPC INVISIBLE (bug G3 sur Maman).
    //
    // Le décomp 1:1 strict = TOUS NPCs setupent subspriteTables, et le
    // rendering choisit subspriteTableNum via elevation. Notre rendering
    // (= updateNpcSpriteFrame) gère DÉJÀ les NPCs standard 16x16/16x32/32x32
    // via le sprite system normal (= tile copy par frame anim). Le subsprite
    // mode TS n'est utile QUE pour le truck 48x48 (= 12 child OAMs qui
    // composent l'image visuellement).
    //
    // Décision : limiter le wire SetSubspriteTables au CAS 48x48 strict, où
    // le décomp utilise sOamTables_48x48 qui a 6 entries TOUTES identiques
    // pointant vers les 12 subsprites de sOamTable_48x48 (= subspriteTableNum
    // n'importe lequel donne le même résultat 48x48).
    //
    // AUDIT FIX G3 : G2 avait passé subspriteTables[0] pour TOUS les NPCs →
    // 16x32 Mom hit `sOamTables_16x32[0] = { subspriteCount: 0, subsprites: [] }`
    // → primary hidden + 0 child → invisible. Le truck 48x48 marche car
    // sOamTables_48x48[0] = real 12 subsprites.
    if (is48x48) {
      const subspriteTablesData = graphicsInfo.subspriteTables as
        ReadonlyArray<{ subspriteCount: number; subsprites: ReadonlyArray<NamingSubsprite> }> | null;
      if (subspriteTablesData && subspriteTablesData.length > 0 && subspriteTablesData[0].subspriteCount > 0) {
        SetSubspriteTables(npc.spriteId, subspriteTablesData[0].subsprites);
        npc.useSubsprites = true;
      } else {
        npc.useSubsprites = false;
      }
    } else {
      npc.useSubsprites = false;
    }
    npc.is32x32 = false;
    npc.is16x16 = false;
    // 1:1 STRICT décomp event_object_movement.c:1469 :
    //   objectEvent->inanimate = graphicsInfo->inanimate;
    // Stocker le flag pour updateNpcSpriteFrame qui skip le sync animNum quand
    // inanimate (= sAnimTable_Inanimate n'a qu'1 entry index 0).
    npc.inanimate = graphicsInfo.inanimate === 1;
    console.log(`[object-events] spawn slot=${slot} ${graphicsKey} (1:1 flow) at (${npc.currentCoordsX - MAP_OFFSET}, ${npc.currentCoordsY - MAP_OFFSET}) animNum=${GetFaceDirectionAnimNum(npc.facingDirection)} inanimate=${npc.inanimate} useSubsprites=${npc.useSubsprites}`);
    return true;
  }

  if (is48x48) {
    // Primary sprite = placeholder logique pour le subsprite system. Décomp
    // gObjectEventGraphicsInfo_Truck utilise gObjectEventBaseOam_16x32 +
    // sOamTables_48x48 (= 12 child OAMs rendent le 48×48). shape/size depuis
    // base oam 16x32 (= MAPPED par GetBaseOamForDimensions pour 48x48 → 16x32).
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase,
      paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: oamTemplate.priority,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.tileBase = objTileBase;
    rt.gba.oam[result.oamIndex].flipH = false;
    // 1:1 décomp `SetSubspriteTables(sprite, sOamTables_48x48)` : alloue 12
    // child OAMs avec offsets (-24, -24), ..., (8, 16) et tileOffsets 0, 4,
    // ..., 34. Le primary OAM est hidden — les child OAMs rendent le 48×48.
    SetSubspriteTables(npc.spriteId, sOamTable_48x48);
    npc.useSubsprites = true;
  } else if (is16x16) {
    // 16×16 — sprite kid (= NINJA_BOY) ou inanimate (= box, berry, egg). Pour
    // les kids 9-frame standard anim, updateNpcSpriteFrame branche is16x16
    // cycle oam.tileId entre face/walk1/walk2 par direction. Pour inanimate
    // (= PNG < 2 frames), le cycle reste sur frame 0 face.
    npc.is16x16 = true;
    // Session 124 fix Bug 3 : 1:1 décomp `UpdateObjectEventElevationAndPriority`
    // assigne priority + subspriteTableNum selon elevation :
    //   sprite->subspriteTableNum = sElevationToSubspriteTableNum[elevation];
    //   sprite->oam.priority = sElevationToPriority[elevation];
    // Pour caisses elevation=8 → priority 1 + subsprite table 2 (= split en
    // 2 OAMs 16x8 avec priorities 2/3 → top half rendered above, bottom half
    // behind). Sans le split, on rend single OAM 16x16 priority 1 → 1-pixel
    // artifact visible lors du trajet camion (= user feedback).
    const ELEV_PRIORITY      = [2,2,2,2,1,2,1,2,1,2,1,2,1,0,0,2];
    const ELEV_SUBSPRITE_NUM = [1,1,1,1,2,1,2,1,2,1,2,1,2,0,0,1];
    const inRange = template.elevation >= 0 && template.elevation < 16;
    const elevPriority = inRange ? ELEV_PRIORITY[template.elevation] : 2;
    const subspriteNum = inRange ? ELEV_SUBSPRITE_NUM[template.elevation] : 1;
    // 1:1 STRICT décomp : shape/size depuis base oam 16x16 template (= équivalent
    // `graphicsInfo->oam = &gObjectEventBaseOam_16x16`). Priority overridé par
    // elevation (= 1:1 décomp UpdateObjectEventElevationAndPriority).
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase,
      paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: elevPriority,  // 1:1 décomp ELEV_PRIORITY override
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.tileBase = objTileBase;
      // Fix B3 : pour les NPCs 16x16 (= kids NINJA_BOY etc.), shift Y de +8
      // pour que les pieds soient au bot du tile (= same convention que sprites
      // 16x32). Sans ce shift, sprite 16x16 ctcvY=-8 → pieds au middle du tile
      // → "trop haut" user-flag.
      sprite.y2 = 8;
    }
    rt.gba.oam[result.oamIndex].flipH = false;
    // Apply subsprite split si elevation→table 2 (= elevation 4,6,8,10,12).
    if (subspriteNum === 2) {
      SetSubspriteTables(npc.spriteId, sOamTable_16x16_2);
    }
  } else if (is32x32) {
    // 32×32 large Pokemon (= Vigoroth déménageurs). Single OAM shape=0 size=2
    // (= 32×32). is32x32=true active la branche dédiée dans updateNpcSpriteFrame
    // (= cycle oam.tileId entre 3 frames consecutivement chargées en VRAM :
    // face=base, walk1=base+16, walk2=base+32). 1:1 décomp sAnim_Go* alterne
    // walk1/face/walk2/face sur 32 frames (= 4 sub-frames × 8 ticks) — notre
    // approximation actuelle (M3-NPC M2 : à porter sur AnimateSprite) : walkFramesLeft cycle 16 → 0, walkAnimAlt toggle pour
    // alterner walk1/walk2. updateNpcSpriteFrame branche is32x32 mappe :
    //   - walkFramesLeft >= 8 → walk1 (alt=0) ou walk2 (alt=1)
    //   - walkFramesLeft < 8  → face
    // useSubsprites stays FALSE (= we want updateNpcSpriteFrame to run for
    // Vigoroth ; useSubsprites=true previously was a hack pour skip le
    // 16×32 frame layout invalide qui produisait du garbage).
    npc.useSubsprites = false;
    npc.is32x32 = true;
    // 1:1 STRICT décomp : shape/size depuis base oam 32x32 template (= équivalent
    // `graphicsInfo->oam = &gObjectEventBaseOam_32x32`).
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase,
      paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: oamTemplate.priority,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.tileBase = objTileBase;
    rt.gba.oam[result.oamIndex].flipH = false;
  } else {
    npc.useSubsprites = false;
    const cfg = NPC_SPRITE_FRAMES[npc.facingDirection] ?? NPC_SPRITE_FRAMES[DIR_SOUTH];
    // 1:1 STRICT décomp default branch (NPC 16x32) : shape/size depuis base
    // oam 16x32 template (= équivalent `graphicsInfo->oam = &gObjectEventBase
    // Oam_16x32` pour MOM + plupart NPCs people). Aucune valeur hardcoded
    // — tout provient du base template 1:1.
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase + cfg.face * TILES_PER_FRAME_16x32,
      paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: oamTemplate.priority,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.hFlip = cfg.hFlip;
    rt.gba.oam[result.oamIndex].flipH = cfg.hFlip;
  }

  console.log(`[object-events] spawn slot=${slot} ${graphicsKey} mt=${npc.movementType} at (${npc.currentCoordsX - MAP_OFFSET}, ${npc.currentCoordsY - MAP_OFFSET})`);
  return true;
}

/** Phase 4.8 Tâche 2 : Spawn TOUS les NPC templates de la map courante.
 *  Async car preload des PNGs (parallel). Iteration spawn elle-même est sync.
 *  1:1 STRICT décomp `TrySpawnObjectEvents(0, 0)` au map init/warp (overworld.c
 *  :2159) → event_object_movement.c:1666 itère `gSaveBlock1Ptr->object
 *  EventTemplates[i]` (= saveblock = ROM copy + setobjectxyperm overlay).
 *  Pas de bounds check ici — décomp init spawn TOUS templates sans filter
 *  (= le bounds check c'est pour TrySpawnObjectEvents per-frame).
 *
 *  A10 (2026-05-24) — migration vers saveblock direct : le saveblock est
 *  populé par LoadObjEventTemplatesFromHeader au map switch (= CpuCopy32 ROM
 *  → saveblock), puis muté par setobjectxyperm. Iterer le saveblock direct
 *  élimine le besoin de overlay merge (= 1 source unique 1:1 strict). */
export async function SpawnObjectEventsOnMap(rt: DecompRuntime): Promise<void> {
  if (!gMapHeader) throw new Error('SpawnObjectEventsOnMap: gMapHeader is null');
  const currentMapId = gMapHeader.id;
  // 1:1 STRICT décomp event_object_movement.c:1666 : iterer le saveblock direct.
  const block1 = GetSaveBlock1();
  const templates = block1.objectEventTemplates.filter(
    (t: { mapId?: string }) => t.mapId === currentMapId,
  );
  if (templates.length === 0) {
    console.log('[object-events] no NPCs in this map (saveblock empty for ' + currentMapId + ')');
    return;
  }
  const catalog = await loadGraphicsCatalog();

  // 1:1 décomp `InitObjectEventPalettes` (event_object_movement.c:2532) : précharge les
  // palettes reflet « dans les slots réservés ». Awaité AVANT le spawn pour que les NPCs
  // statiques près de l'eau reflètent teinté dès le premier tick (spawn-trigger). Idempotent.
  await PreloadReflectionPalettes();

  // PARALLEL preload (= élimine sequential await + matches décomp instant
  // spawn). Templates qui referencent une PNG manquante après preload sont
  // loggées (= via _spawnSingleNpcFromTemplate which checks cache).
  // Preload reste basé sur mapHeader (= structure logique map.json) car le
  // saveblock contient les mêmes graphicsId (= LoadObjEventTemplatesFromHeader
  // copy à l'identique sauf x/y muté par setobjectxyperm).
  await preloadNpcGraphicsForMap(gMapHeader);

  // SYNC iteration spawn — saveblock IS la source 1:1 (= overlay déjà appliqué).
  for (const template of templates) {
    _spawnSingleNpcFromTemplate(template as never, currentMapId, rt, catalog);
  }
}

// ─── 1:1 STRICT décomp event_object_movement.c:1715-1796 ──────────────────
// SpawnObjectEventsOnReturnToField + SpawnObjectEventOnReturnToField :
// re-crée les sprites OAM des NPCs DÉJÀ actifs (= preserve gObjectEvents[i]
// .currentCoords, graphicsId, etc.). Utilisé par ReturnToFieldLocal au bag/
// menu close (= 1:1 décomp overworld.c:1961 ReturnToFieldLocal → ResumeMap
// → InitObjectEventsReturnToField).
//
// Différence avec SpawnObjectEventsOnMap (= TrySpawnObjectEvents) :
// - SpawnObjectEventsOnMap itère gMapHeader.events.objectEvents (= templates)
//   et spawn NEW NPCs à template.x/y (= position initiale map).
// - SpawnObjectEventsOnReturnToField itère gObjectEvents[i].active (= NPCs
//   déjà en mémoire) et re-crée juste les sprites visuels à leur position
//   courante (= preserve mouvements faits durant le jeu : applymovement,
//   etc.).
//
// Au bag close (= ResetSpriteData a clear gSprites + OAMs), on doit re-créer
// les sprites visuels MAIS sans toucher gObjectEvents memory (= currentCoords,
// facing, etc. preservés).

/** 1:1 décomp `SpawnObjectEventOnReturnToField` (event_object_movement.c:1728-1797).
 *
 *  Re-crée le sprite OAM d'un NPC déjà actif (= gObjectEvents[id].active=true).
 *  Lit graphicsInfo via graphicsId, alloue tiles + palette, crée OAM à la
 *  position courante (= currentCoords, NON template). Préserve npc fields.
 *
 *  Décomp utilise SpriteTemplate + CreateSprite. Notre port simplifié réutilise
 *  le branch logic de _spawnSingleNpcFromTemplate pour le sprite creation, mais
 *  source les coords depuis npc.currentCoords. */
async function _respawnNpcSpriteForReturnToField(
  npc: ObjectEvent,
  rt: DecompRuntime,
  catalog: Record<string, GraphicsInfo>,
): Promise<boolean> {
  // Berry tree : cas spécial (absent du catalogue, pics assemblés par baie au
  // runtime). Recrée le sprite via le helper partagé avec le spawn initial. Sans
  // ça, retour de menu (sac) → catalog['OBJ_EVENT_GFX_BERRY_TREE'] = undefined →
  // sprite jamais recréé → berry tree invisible (1:1 décomp : SpawnObjectEvent
  // OnReturnToField recrée le sprite de TOUS les object events actifs).
  if (npc.graphicsId === 'OBJ_EVENT_GFX_BERRY_TREE') {
    return _setupBerryTreeSpriteGraphics(npc, rt);
  }
  const graphics = catalog[npc.graphicsId];
  if (!graphics) return false;

  // Detect type 1:1 décomp via dimensions (= equivalent graphicsInfo->oam lookup).
  const is48x48 = graphics.frameWidth === 48 && graphics.frameHeight === 48;
  const is32x32 = graphics.frameWidth === 32 && graphics.frameHeight === 32;
  const is16x32 = graphics.frameWidth === 16 && graphics.frameHeight === 32;
  const is16x16 = graphics.frameWidth === 16 && graphics.frameHeight === 16;
  if (!is48x48 && !is32x32 && !is16x32 && !is16x16) return false;

  // Load PNG depuis cache (= preload au boot field).
  const pngPath = `${BASE}/${graphics.png}`;
  const png = _npcPngCache.get(pngPath);
  if (!png) return false;

  // ─── C8 — 1:1 STRICT flow unified (= match _spawnSingleNpcFromTemplate) ────
  //
  // Pré-convert PNG row-major → 1D OBJ frames consec + lookup graphicsInfo via
  // factory + wire sprite.images/anims. Sans ça, _respawnNpcSpriteForReturnToField
  // utilisait le LEGACY branch by-size → sprite.anims=null → updateNpcSpriteFrame
  // legacy path → tileId cycle bug (= "PokeBall tourne sur elle-même" user-flag
  // post WallClock close).
  // 1:1 décomp : graphicsInfo résolu AVANT AllocSpriteTiles (taille d'alloc =
  // images->size / TILE_SIZE_4BPP, sprite.c:566).
  const _pic1dObj = pngTo1dObjLayoutAllFrames(
    png.charData, png.widthTiles, graphics.frameWidth, graphics.frameHeight,
  );
  const _factory = gObjectEventGraphicsInfoPointers[npc.graphicsId];
  const _numPicsExpected = _factory ? _factory.length : 1;
  const _picsArgs: Uint8Array[] = [_pic1dObj];
  if (_numPicsExpected > 1) {
    const secondaryRelPath = MULTI_PNG_SECONDARY_PATHS[npc.graphicsId];
    const secondaryPng = secondaryRelPath ? _npcPngCache.get(`${BASE}/${secondaryRelPath}`) : undefined;
    if (secondaryPng) {
      const sec1dObj = pngTo1dObjLayoutAllFrames(
        secondaryPng.charData, secondaryPng.widthTiles, graphics.frameWidth, graphics.frameHeight,
      );
      _picsArgs.push(sec1dObj);
    } else {
      _picsArgs.push(_pic1dObj);
    }
  }
  const _graphicsInfo_1to1 = GetObjectEventGraphicsInfo(npc.graphicsId, ..._picsArgs);
  const _hasNewFlow = _graphicsInfo_1to1 && _graphicsInfo_1to1.images.length > 0;

  // 1:1 STRICT décomp sprite.c:562-575 + 566 : AllocSpriteTiles(images->size /
  // TILE_SIZE_4BPP) = tiles d'UNE frame pour le flow images/dynamic-copy ;
  // TILES_PER_NPC pour le legacy multi-frame préchargé (dette migration).
  const _objTileCount = (_hasNewFlow && _graphicsInfo_1to1 && _graphicsInfo_1to1.images[0])
    ? Math.ceil(_graphicsInfo_1to1.images[0].size / 32)   // TILE_SIZE_4BPP = 32 bytes
    : TILES_PER_NPC;
  const objTileBase = AllocSpriteTiles(_objTileCount);
  if (objTileBase < 0) return false;

  // FIX over-alloc PALSLOT : slot OBJ FIXE (paletteSlot) via PatchObjectEventPalette (cf. spawn
  // principal) — les objets ne touchent jamais [12,16) (réservé météo). Return-to-field path.
  const _palSlot = _graphicsInfo_1to1?.paletteSlot ?? PALSLOT_NPC_1;
  const _palTag1to1 = _graphicsInfo_1to1?.paletteTag;
  const _markTag = typeof _palTag1to1 === 'number' && _palTag1to1 !== OBJ_EVENT_PAL_TAG_NONE
    ? _palTag1to1 : (0x1300 + _palSlot);
  const paletteBank = PatchObjectEventPalette(png.palette as Uint16Array, _palSlot, _markTag);

  if (_hasNewFlow && _graphicsInfo_1to1) {
    // Copy frame 0 in VRAM (= état initial).
    rt.gba.objVram.set(_graphicsInfo_1to1.images[0].data, objTileBase * 32);

    const oamTpl = _graphicsInfo_1to1.oam;
    const result = rt.CreateSpriteAtOam({
      tileId: objTileBase,
      paletteBank,
      x: 0, y: 0,
      shape: oamTpl.shape, size: oamTpl.size,
      priority: oamTpl.priority,
      paletteMode: 0,
      affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.tileBase = objTileBase;
      // Wire 1:1 strict décomp sprite.c:CreateSpriteAt + event_object_movement.c:1461-1471.
      sprite.images = _graphicsInfo_1to1.images;
      sprite.anims = _graphicsInfo_1to1.anims as ReadonlyArray<ReadonlyArray<unknown>> | null;
      sprite.usingSheet = false;
      sprite.sheetTileStart = 0;
      sprite.centerToCornerVecX = -(_graphicsInfo_1to1.width >> 1);
      sprite.centerToCornerVecY = -(_graphicsInfo_1to1.height >> 1);
      sprite.y2 = 16 + sprite.centerToCornerVecY;
      if (!_graphicsInfo_1to1.inanimate && sprite.anims && sprite.anims.length > 0) {
        sprite.animNum = GetFaceDirectionAnimNum(npc.facingDirection);
        sprite.animBeginning = true;
        sprite.animEnded = false;
        sprite.animCmdIndex = 0;
        sprite.animDelayCounter = 0;
      }
    }
    rt.gba.oam[result.oamIndex].flipH = false;
    rt.gba.oam[result.oamIndex].priority = oamTpl.priority;
    npc.useSubsprites = false;
    npc.is32x32 = false;
    npc.is16x16 = false;
    npc.inanimate = _graphicsInfo_1to1.inanimate === 1;
    npc.objTileBase = objTileBase;
    npc.objTileCount = _objTileCount;
    npc.paletteBank = paletteBank;
    return true;
  }

  // Copie tile data en VRAM (= équivalent décomp RequestSpriteFrameImageCopy au
  // 1er frame, simplifié pour pré-charger tous les frames consécutifs).
  if (is48x48) {
    rt.gba.objVram.set(png.charData.subarray(0, 36 * 32), objTileBase * 32);
  } else if (is32x32) {
    let faceFrame = 0;
    let walk1Frame = 1;
    let walk2Frame = 2;
    if (npc.graphicsId === 'OBJ_EVENT_GFX_VIGOROTH_FACING_AWAY') {
      faceFrame = 3; walk1Frame = 4; walk2Frame = 4;
    }
    const faceTiles = pngTo1dObjLayoutSingleFrame(png.charData, faceFrame, png.widthTiles, 32, 32);
    const walk1Tiles = pngTo1dObjLayoutSingleFrame(png.charData, walk1Frame, png.widthTiles, 32, 32);
    const walk2Tiles = pngTo1dObjLayoutSingleFrame(png.charData, walk2Frame, png.widthTiles, 32, 32);
    rt.gba.objVram.set(faceTiles, objTileBase * 32);
    rt.gba.objVram.set(walk1Tiles, (objTileBase + 16) * 32);
    rt.gba.objVram.set(walk2Tiles, (objTileBase + 32) * 32);
  } else if (is16x16) {
    const numTiles = png.widthTiles * png.heightTiles;
    rt.gba.objVram.set(png.charData.subarray(0, numTiles * 32), objTileBase * 32);
  } else {
    const numFrames = (png.widthTiles * png.heightTiles) / TILES_PER_FRAME_16x32;
    const reordered = pngTo1dObjLayout(png.charData, numFrames, png.widthTiles, 16, 32);
    rt.gba.objVram.set(reordered, objTileBase * 32);
  }
  const paletteSlot = 256 + paletteBank * 16;
  for (let i = 0; i < Math.min(16, png.palette.length); i++) {
    rt.gPlttBufferFaded.set(paletteSlot + i, png.palette[i]);
    rt.gPlttBufferUnfaded.set(paletteSlot + i, png.palette[i]);
  }

  // Lookup oam template via graphicsInfo (= 1:1 décomp record).
  const graphicsInfo = GetObjectEventGraphicsInfo(npc.graphicsId, png.charData);
  const oamTemplate = graphicsInfo?.oam ?? GetBaseOamForDimensions(graphics.frameWidth, graphics.frameHeight);

  // Create OAM sprite. 1:1 STRICT décomp branch selon type.
  let result: { spriteId: number; oamIndex: number };
  if (is48x48) {
    result = rt.CreateSpriteAtOam({
      tileId: objTileBase, paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: oamTemplate.priority, paletteMode: 0, affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.tileBase = objTileBase;
    SetSubspriteTables(npc.spriteId, sOamTable_48x48);
    npc.useSubsprites = true;
  } else if (is16x16) {
    const ELEV_PRIORITY      = [2,2,2,2,1,2,1,2,1,2,1,2,1,0,0,2];
    const ELEV_SUBSPRITE_NUM = [1,1,1,1,2,1,2,1,2,1,2,1,2,0,0,1];
    const inRange = (npc as { elevation?: number }).elevation !== undefined &&
                    ((npc as { elevation?: number }).elevation ?? 0) >= 0 &&
                    ((npc as { elevation?: number }).elevation ?? 0) < 16;
    const elev = inRange ? ((npc as { elevation?: number }).elevation ?? 0) : 0;
    const elevPriority = inRange ? ELEV_PRIORITY[elev] : 2;
    const subspriteNum = inRange ? ELEV_SUBSPRITE_NUM[elev] : 1;
    result = rt.CreateSpriteAtOam({
      tileId: objTileBase, paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: elevPriority, paletteMode: 0, affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.tileBase = objTileBase;
    if (subspriteNum === 2) SetSubspriteTables(npc.spriteId, sOamTable_16x16_2);
  } else if (is32x32) {
    result = rt.CreateSpriteAtOam({
      tileId: objTileBase, paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: oamTemplate.priority, paletteMode: 0, affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.tileBase = objTileBase;
  } else {
    const cfg = NPC_SPRITE_FRAMES[npc.facingDirection] ?? NPC_SPRITE_FRAMES[DIR_SOUTH];
    result = rt.CreateSpriteAtOam({
      tileId: objTileBase + cfg.face * TILES_PER_FRAME_16x32,
      paletteBank,
      x: 0, y: 0,
      shape: oamTemplate.shape, size: oamTemplate.size,
      priority: oamTemplate.priority, paletteMode: 0, affineMode: 0,
    });
    npc.spriteId = result.spriteId;
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) sprite.hFlip = cfg.hFlip;
    rt.gba.oam[result.oamIndex].flipH = cfg.hFlip;
  }

  // 1:1 STRICT : update tile/palette fields for anim cycling later.
  npc.objTileBase = objTileBase;
  npc.objTileCount = _objTileCount;
  npc.paletteBank = paletteBank;
  return true;
}

/** Précharge les PNG d'un graphicsId catalogue dans `_npcPngCache` (pour que
 *  `ObjectEventSetGraphicsId` puisse swapper en SYNC, comme la décomp suppose le gfx déjà chargé).
 *  Utilisé pour les sprites d'ÉTAT joueur (surfing/field_move/bike…) qui ne sont pas auto-préchargés
 *  comme les NPC de la map. */
export async function PreloadObjectEventGraphics(graphicsId: string): Promise<void> {
  const catalog = await loadGraphicsCatalog();
  const g = catalog[graphicsId];
  if (!g || !g.png) return;
  await loadNpcPng(`${BASE}/${g.png}`);
  const sec = MULTI_PNG_SECONDARY_PATHS[graphicsId];
  if (sec) await loadNpcPng(`${BASE}/${sec}`);
}

/** ADAPTATION port (unification lot 17b) : prépare les pics FRAME-MAJOR + la
 *  palette d'un graphicsId PRÉCHARGÉ (PreloadObjectEventGraphics) pour
 *  `CreateObjectGraphicsSprite`. Rôle décomp équivalent : les INCBIN
 *  `gObjectEventPic_*` (déjà frame-major en ROM, ici PNG row-major →
 *  pngTo1dObjLayout) + `sObjectEventSpritePalettes` (la palette du PNG,
 *  enregistrée sous le paletteTag du graphicsInfo via LoadSpritePalette —
 *  dette documentée sur LoadObjectEventPalette). Retourne null si le gfx
 *  n'est pas préchargé (le caller HURLE, règle 3). */
export function PrepareObjectEventGraphics(graphicsId: string): Uint8Array[] | null {
  const g = _graphicsCatalog?.[graphicsId];
  if (!g || !g.png) return null;
  const repack = (path: string): Uint8Array | null => {
    const png = _npcPngCache.get(path);
    if (!png) return null;
    const frameW = g.frameWidth || 16, frameH = g.frameHeight || 32;
    const frames = Math.max(1, Math.floor((png.widthTiles * 8) / frameW) * Math.floor((png.heightTiles * 8) / frameH));
    return pngTo1dObjLayout(png.charData, frames, png.widthTiles, frameW, frameH);
  };
  const main = repack(`${BASE}/${g.png}`);
  if (!main) return null;
  const pics: Uint8Array[] = [main];
  const sec = MULTI_PNG_SECONDARY_PATHS[graphicsId];
  if (sec) {
    const secPic = repack(`${BASE}/${sec}`);
    if (secPic) pics.push(secPic);
  }
  // Palette du PNG sous le paletteTag du graphicsInfo (= sObjectEventSpritePalettes).
  const info = GetObjectEventGraphicsInfo(graphicsId, ...pics);
  if (info && info.paletteTag !== TAG_NONE_EOM && _IndexOfSpritePaletteTag_EOM(info.paletteTag) === 0xFF) {
    const png = _npcPngCache.get(`${BASE}/${g.png}`);
    if (png) LoadSpritePalette_EOM({ tag: info.paletteTag, data: png.palette });
  }
  return pics;
}

// ─── GetBaseTemplateForObjectEvent — adaptation byte-VM (ex script-opcodes-helpers, lot 18) ──
import { GetCurrentMap as _GetCurrentMap_EOM } from './load_save';

/** ADAPTATION du 1:1 décomp `GetBaseTemplateForObjectEvent` (event_object_movement.c:2462,
 *  itère `gSaveBlock1Ptr->objectEventTemplates` par localId) : nos scripts byte-VM
 *  transportent le localIdRaw STRING ('LOCALID_X') → match par localIdRaw d'abord,
 *  fallback numérique (= le match décomp `template->localId == localId`). Le saveblock
 *  est populé au map switch par `LoadObjEventTemplatesFromHeader`, puis muté par
 *  setobjectxyperm/setobjectmovementtype/copyobjectxytoperm. */
export function findTemplateByLocalId(arg: string): ObjectEventTemplate | null {
  if (!arg) return null;
  const currentMapId = gMapHeader?.id ?? _GetCurrentMap_EOM()?.name ?? '';
  const block1 = GetSaveBlock1();
  for (const t of block1.objectEventTemplates) {
    if ((t as { mapId?: string }).mapId !== currentMapId) continue;
    if ((t as { localIdRaw?: string }).localIdRaw === arg) return t as unknown as ObjectEventTemplate;
  }
  // Fallback numérique (= 1:1 décomp `TryOverrideObjectEventTemplateCoords` matche
  // par `template->localId == localId`) : requis quand le byte-VM passe `String(localId)`.
  const n = parseInt(arg, 10);
  if (!Number.isNaN(n)) {
    for (const t of block1.objectEventTemplates) {
      if ((t as { mapId?: string }).mapId !== currentMapId) continue;
      if ((t as { localId?: number }).localId === n) return t as unknown as ObjectEventTemplate;
    }
  }
  return null;
}

// ─── [Déviation M3] Snapshot de rendu du gfx NORMAL joueur (feuille combinée réservée) ──────
//
// Le décomp `ObjectEventSetGraphicsId` repointe simplement `sprite->images` vers la table ROM du
// nouveau gfx (slot VRAM fixe par sprite + DMA par frame, PAS de réalloc). Notre archi M3 charge le
// gfx NORMAL joueur comme une FEUILLE COMBINÉE walking+running RÉSERVÉE (tiles 0..143, jamais
// libérées) — pas un sprite dynamic-copy. Pour que `ObjectEventSetGraphicsId(player, NORMAL)` (= retour
// à pied : démontage surf/vélo/...) restaure ce rendu, `InitPlayerAvatar` mémorise ici l'état NORMAL
// (images/anims/palette/oam) → `_restorePlayerNormalGfx` le ré-applique sans AllocSpriteTiles.
interface PlayerNormalGfxSnapshot {
  graphicsId: string;
  images: ReadonlyArray<{ data: Uint8Array; size: number }> | null;
  anims: ReadonlyArray<ReadonlyArray<unknown>> | null;
  palette: Uint16Array;
  tileBase: number;
  shape: 0 | 1 | 2;
  size: 0 | 1 | 2 | 3;
  priority: number;
  centerToCornerVecX: number;
  centerToCornerVecY: number;
  y2: number;
}
let _playerNormalGfxSnapshot: PlayerNormalGfxSnapshot | null = null;
/** Appelé par `InitPlayerAvatar` (player-avatar.ts) une fois le sprite joueur NORMAL monté. */
export function _setPlayerNormalGfxSnapshot(snap: PlayerNormalGfxSnapshot): void {
  _playerNormalGfxSnapshot = snap;
}

/** Restaure le rendu NORMAL joueur (feuille combinée réservée) depuis le snapshot. Libère d'abord
 *  l'alloc VRAM dynamique courante (surfing/field-move), re-patche la palette NORMAL dans PALSLOT_PLAYER
 *  (1:1 décomp `PatchObjectPalette` sur le gfx NORMAL), puis repointe images/anims/oam vers les tiles
 *  réservées 0..143. La feuille réservée (objTileBase < reservedCount) n'est JAMAIS libérée. */
function _restorePlayerNormalGfx(objectEvent: ObjectEvent, sprite: DecompSprite, oam: OamEntry): void {
  const snap = _playerNormalGfxSnapshot;
  if (!snap) return;
  // 1) Libère l'alloc dynamique précédente (la feuille réservée a objTileBase < reservedCount).
  const reserved = getReservedSpriteTileCount();
  if (objectEvent.objTileBase >= reserved && objectEvent.objTileBase > 0 && objectEvent.objTileCount > 0)
    MarkObjTilesFree(objectEvent.objTileBase * 32, objectEvent.objTileCount * 32);
  // 2) Re-charge la palette NORMAL dans PALSLOT_PLAYER (le surf a réécrit ce slot — mêmes couleurs
  //    partagées, mais 1:1 décomp on re-patche). Tag = OBJ_EVENT_PAL_TAG_BRENDAN/MAY selon le gfx.
  const palTag = snap.graphicsId === 'OBJ_EVENT_GFX_MAY_NORMAL' ? OBJ_EVENT_PAL_TAG_MAY : OBJ_EVENT_PAL_TAG_BRENDAN;
  const paletteBank = PatchObjectEventPalette(snap.palette, PALSLOT_PLAYER, palTag);
  // 3) Repointe le rendu vers la feuille combinée réservée (usingSheet=false + images/anims NORMAL).
  sprite.images = snap.images;
  sprite.anims = snap.anims;
  sprite.usingSheet = false;
  sprite.sheetTileStart = 0;
  sprite.tileBase = snap.tileBase;
  sprite.centerToCornerVecX = snap.centerToCornerVecX;
  sprite.centerToCornerVecY = snap.centerToCornerVecY;
  sprite.y2 = snap.y2;
  oam.shape = snap.shape;
  oam.size = snap.size;
  oam.tileId = snap.tileBase;
  oam.paletteBank = paletteBank;
  oam.priority = snap.priority;
  objectEvent.inanimate = false;
  objectEvent.graphicsId = snap.graphicsId;
  objectEvent.objTileBase = snap.tileBase;
  objectEvent.objTileCount = 0;
  objectEvent.paletteBank = paletteBank;
  // Re-init anim (face direction courante — 1:1 spawn StartSpriteAnim(GetFaceDirectionAnimNum)).
  if (sprite.anims && sprite.anims.length > 0) {
    sprite.animNum = GetFaceDirectionAnimNum(objectEvent.facingDirection);
    sprite.animBeginning = true;
    sprite.animEnded = false;
    sprite.animCmdIndex = 0;
    sprite.animDelayCounter = 0;
    sprite.animPaused = false;
  }
  if (objectEvent.trackedByCamera) CameraObjectReset();
}

/** 1:1 STRICT décomp `ObjectEventSetGraphicsId(struct ObjectEvent *, u8 graphicsId)`
 *  (event_object_movement.c:1820) — SWAP LIVE du gfx d'un object event existant.
 *
 *  ```c
 *  graphicsInfo = GetObjectEventGraphicsInfo(graphicsId);
 *  sprite = &gSprites[objectEvent->spriteId];
 *  ... PatchObjectPalette(...) selon paletteSlot ...
 *  sprite->oam.shape/size = graphicsInfo->oam->shape/size;
 *  sprite->images = graphicsInfo->images; sprite->anims = graphicsInfo->anims;
 *  sprite->oam.paletteNum = paletteSlot; objectEvent->inanimate = graphicsInfo->inanimate;
 *  objectEvent->graphicsId = graphicsId;
 *  SetSpritePosToMapCoords(...); ... centerToCornerVec ...
 *  if (objectEvent->trackedByCamera) CameraObjectReset();
 *  ```
 *
 *  Notre port : réutilise le chemin gfx partagé (catalogue → GetObjectEventGraphicsInfo →
 *  AllocSpriteTiles → copie VRAM → repoint sprite.images/anims/oam), comme le spawn NPC +
 *  `_applyBerryTreeStageGraphicsLive`. Le PNG doit être préchargé (`PreloadObjectEventGraphics`).
 *  graphicsId = NOM du constant décomp (convention de notre port).
 *
 *  VRAM (déviation M3) : on free l'alloc dynamique précédente avant la nouvelle (anti-fuite), et le
 *  retour au gfx NORMAL joueur RESTAURE la feuille combinée réservée (`_restorePlayerNormalGfx`) au lieu
 *  d'allouer — le sheet NORMAL (tiles 0..143) est RÉSERVÉ, jamais libéré. (Dette free/restore soldée.) */
export function ObjectEventSetGraphicsId(objectEvent: ObjectEvent, graphicsId: string): void {
  const rt = getRuntime();
  if (objectEvent.spriteId < 0) return;
  const sprite = rt.gSprites[objectEvent.spriteId];
  if (!sprite) return;
  const oam = rt.gba.oam[sprite.oamIndex];

  // [Déviation M3] Retour au gfx NORMAL du joueur = RESTAURE la feuille combinée réservée
  // (walking+running, tiles 0..143) au lieu du flux dynamic-copy. Libère aussi l'alloc surf/field-move
  // courante → solde la dette free/restore VRAM du keystone. (Snapshot posé par InitPlayerAvatar.)
  if (_playerNormalGfxSnapshot && objectEvent.isPlayer && graphicsId === _playerNormalGfxSnapshot.graphicsId) {
    _restorePlayerNormalGfx(objectEvent, sprite, oam);
    return;
  }

  const catalog = _graphicsCatalog;
  if (!catalog) { console.warn('[ObjectEventSetGraphicsId] catalogue non chargé'); return; }
  const graphics = catalog[graphicsId];
  if (!graphics || !graphics.png) { console.warn('[ObjectEventSetGraphicsId] gfx absent du catalogue: ' + graphicsId); return; }
  const png = _npcPngCache.get(`${BASE}/${graphics.png}`);
  if (!png) { console.warn('[ObjectEventSetGraphicsId] PNG non préchargé (appeler PreloadObjectEventGraphics): ' + graphicsId); return; }

  // Build 1D-OBJ layout + résolution graphicsInfo (1:1 spawn flow).
  const pic1dObj = pngTo1dObjLayoutAllFrames(png.charData, png.widthTiles, graphics.frameWidth, graphics.frameHeight);
  const factory = gObjectEventGraphicsInfoPointers[graphicsId];
  const numPics = factory ? factory.length : 1;
  const picsArgs: Uint8Array[] = [pic1dObj];
  if (numPics > 1) {
    const secPath = MULTI_PNG_SECONDARY_PATHS[graphicsId];
    const secPng = secPath ? _npcPngCache.get(`${BASE}/${secPath}`) : undefined;
    picsArgs.push(secPng
      ? pngTo1dObjLayoutAllFrames(secPng.charData, secPng.widthTiles, graphics.frameWidth, graphics.frameHeight)
      : pic1dObj);
  }
  const graphicsInfo = GetObjectEventGraphicsInfo(graphicsId, ...picsArgs);
  if (!graphicsInfo || graphicsInfo.images.length === 0) { console.warn('[ObjectEventSetGraphicsId] graphicsInfo vide: ' + graphicsId); return; }

  // Libère l'alloc VRAM dynamique précédente AVANT la nouvelle (évite la fuite à chaque swap, ex.
  // NORMAL→FIELD_MOVE→SURFING). La feuille combinée réservée du joueur (objTileBase < reservedCount)
  // n'est JAMAIS libérée. Le décomp n'a pas ce free (slot VRAM fixe par sprite + DMA par frame) — ici
  // on gère NOS allocations dynamiques (déviation M3 assumée du keystone).
  {
    const reserved = getReservedSpriteTileCount();
    if (objectEvent.objTileBase >= reserved && objectEvent.objTileBase > 0 && objectEvent.objTileCount > 0)
      MarkObjTilesFree(objectEvent.objTileBase * 32, objectEvent.objTileCount * 32);
  }

  // 1:1 décomp `AllocSpriteTiles(images->size / TILE_SIZE_4BPP)` (= UNE frame, dynamic-copy flow).
  const objTileCount = Math.ceil(graphicsInfo.images[0].size / 32);
  const objTileBase = AllocSpriteTiles(objTileCount);
  if (objTileBase < 0) { console.warn('[ObjectEventSetGraphicsId] AllocSpriteTiles échec'); return; }

  // Palette (1:1 décomp PatchObjectPalette par paletteSlot ; FIX PALSLOT : slot fixe).
  const palSlot = graphicsInfo.paletteSlot ?? PALSLOT_NPC_1;
  const palTag = typeof graphicsInfo.paletteTag === 'number' && graphicsInfo.paletteTag !== OBJ_EVENT_PAL_TAG_NONE
    ? graphicsInfo.paletteTag : (0x1300 + palSlot);
  const paletteBank = PatchObjectEventPalette(png.palette as Uint16Array, palSlot, palTag);

  // Copie la frame 0 du nouveau gfx en VRAM.
  rt.gba.objVram.set(graphicsInfo.images[0].data, objTileBase * 32);

  // Repoint sprite + OAM (1:1 décomp : oam shape/size/paletteNum, images, anims, inanimate, graphicsId).
  oam.shape = graphicsInfo.oam.shape;
  oam.size = graphicsInfo.oam.size;
  oam.tileId = objTileBase;
  oam.paletteBank = paletteBank;
  oam.priority = graphicsInfo.oam.priority;
  sprite.tileBase = objTileBase;
  sprite.images = graphicsInfo.images;
  sprite.anims = graphicsInfo.anims as ReadonlyArray<ReadonlyArray<unknown>> | null;
  sprite.usingSheet = false;
  sprite.sheetTileStart = 0;
  objectEvent.inanimate = graphicsInfo.inanimate === 1;
  objectEvent.graphicsId = graphicsId;
  objectEvent.objTileBase = objTileBase;
  objectEvent.objTileCount = objTileCount;
  objectEvent.paletteBank = paletteBank;
  // centerToCornerVec + ancre Y (1:1 décomp lignes 1851-1854 ; reposition gérée par le spine M3).
  sprite.centerToCornerVecX = -(graphicsInfo.width >> 1);
  sprite.centerToCornerVecY = -(graphicsInfo.height >> 1);
  sprite.y2 = 16 + sprite.centerToCornerVecY;
  // Init anim (1:1 spawn : animNum = FaceDirection du nouveau gfx).
  if (!objectEvent.inanimate && sprite.anims && sprite.anims.length > 0) {
    sprite.animNum = GetFaceDirectionAnimNum(objectEvent.facingDirection);
    sprite.animBeginning = true;
    sprite.animEnded = false;
    sprite.animCmdIndex = 0;
    sprite.animDelayCounter = 0;
  }
  if (objectEvent.trackedByCamera) CameraObjectReset();
}

// Dev hooks (A/B keystone graphics-id swap). Cf. __updateNpcSpriteFrame.
(globalThis as Record<string, unknown>).__ObjectEventSetGraphicsId = ObjectEventSetGraphicsId;
(globalThis as Record<string, unknown>).__PreloadObjectEventGraphics = PreloadObjectEventGraphics;

/** 1:1 décomp `SpawnObjectEventsOnReturnToField(s16 x, s16 y)`
 *  (event_object_movement.c:1715-1726) :
 *
 *    ClearPlayerAvatarInfo();
 *    for (i = 0; i < OBJECT_EVENTS_COUNT; i++)
 *      if (gObjectEvents[i].active)
 *        SpawnObjectEventOnReturnToField(i, x, y);
 *    CreateReflectionEffectSprites();
 *
 *  Re-crée tous les sprites OAM des NPCs déjà actifs depuis leur currentCoords.
 *  PRÉSERVE gObjectEvents memory (= positions/facing post-script intacts). */
export async function SpawnObjectEventsOnReturnToField(rt: DecompRuntime, persistedPlayerGraphicsId?: string): Promise<void> {
  if (!_graphicsCatalog) return;
  const catalog = _graphicsCatalog;
  // 1:1 STRICT décomp event_object_movement.c:1719 ClearPlayerAvatarInfo().
  // Reset gPlayerAvatar fields (preserve objectEventId/spriteId pour notre archi).
  const { ClearPlayerAvatarInfo, SetPlayerAvatarExtraStateTransition, gPlayerAvatar } = await import('./field_player_avatar');
  ClearPlayerAvatarInfo();
  // 1:1 STRICT décomp `SetPlayerAvatarObjectEventIdAndObjectId` (event_object_movement.c:1812)
  // appelé au re-spawn du player object event : ré-établit gPlayerAvatar.flags via
  // `SetPlayerAvatarExtraStateTransition(playerGfx, CONTROLLABLE)` (= ÉTAT_du_gfx | CONTROLLABLE
  // = à pied ON_FOOT | CONTROLLABLE). Sans ça, ClearPlayerAvatarInfo laissait flags=0 (CONTROLLABLE
  // clear → forced movement armé dès le 1er pas au lieu d'être suppressé 1 cycle). Notre archi
  // préserve objectEventId/spriteId/gender → on n'appelle QUE la part transition (1:1 flags).
  //
  // FIX (Bug 2a) — `persistedPlayerGraphicsId` : le graphicsId de l'état PERSISTÉ (surf/underwater)
  // survivant au combat. Notre InitPlayerAvatar (spécifique port : recrée la feuille NORMAL réservée
  // + snapshot pour notre sprite joueur, chemin que le décomp générique n'a pas) est appelé AVANT
  // ce spawn et CLOBBERE gObjectEvents[slot].graphicsId en 'Brendan'/'May'. Le harness snapshot donc
  // le graphicsId AVANT InitPlayerAvatar et le passe ICI → SetPlayerAvatarExtraStateTransition
  // re-dérive SURFING/UNDERWATER (PlayerAvatarTransition_Surfing → ObjectEventSetGraphicsId(surf) swap
  // le sprite + FieldEffectStart(FLDEFF_SURF_BLOB) recrée le blob). Fallback playerSlot.graphicsId
  // (= chemin où le harness ne passe rien, ex. à pied → ON_FOOT, comportement inchangé).
  {
    const playerSlot = gObjectEvents[gPlayerAvatar.objectEventId];
    const gfxForTransition = persistedPlayerGraphicsId ?? playerSlot?.graphicsId;
    if (playerSlot && gfxForTransition !== undefined)
      SetPlayerAvatarExtraStateTransition(gfxForTransition, 1 << 5 /* PLAYER_AVATAR_FLAG_CONTROLLABLE */);
  }
  // DETTE 1:1 décomp restante (event_object_movement.c:1715-1726) :
  //   - Player slot re-spawn graphique délégué à notre archi (InitPlayerAvatar) ; ici on porte
  //     seulement la part flags de SetPlayerAvatarObjectEventIdAndObjectId (ci-dessus).
  //   - CreateReflectionEffectSprites() (= reflexion sur eau pour NPCs) pas
  //     porté (notre port n'a pas le reflection sprite system).
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    if (npc.isPlayer) continue;  // Voir DETTE ci-dessus.
    const ok = await _respawnNpcSpriteForReturnToField(npc, rt, catalog);
    if (!ok) continue;
    // 1:1 STRICT décomp event_object_movement.c:1773 :
    //   GetMapCoordsFromSpritePos(x + objectEvent->currentCoords.x,
    //                              y + objectEvent->currentCoords.y,
    //                              &sprite->x, &sprite->y);
    // Re-calcule npc.worldX/Y depuis currentCoords (= LOGICAL = INTERNAL - MAP_
    // OFFSET) et le camera state COURANT. Sans ça, le sprite reste à worldX/Y
    // stale (= valeurs d'avant le bag open) qui peuvent être hors viewport
    // (bug user 2026-05-24 "MOM décalée en bas-gauche post-cycle bag").
    const logicalX = npc.currentCoordsX - MAP_OFFSET;
    const logicalY = npc.currentCoordsY - MAP_OFFSET;
    SetObjectEventSpritePosToMapCoords(npc, logicalX, logicalY);
  }
}

/** 1:1 décomp `TrySpawnObjectEvent(u8 localId, u8 mapNum, u8 mapGroup)`
 *  (event_object_movement.c). Spawn UN seul NPC par localId — appelé par
 *  ScrCmd_addobject après ClearFlag. Ne fait pas de bounds check (= le script
 *  est responsable de spawn dans des positions logiques). */
export function TrySpawnObjectEvent(localIdRaw: string, rt: DecompRuntime): boolean {
  const mh = gMapHeader;
  if (!mh) return false;
  if (!_graphicsCatalog) return false;
  // 1:1 STRICT décomp `GetObjectEventTemplateByLocalIdAndMap` (event_object_movement.c:1647) :
  // pour la MAP COURANTE, le template vient de `gSaveBlock1Ptr->objectEventTemplates`
  // (copie SAVEBLOCK mutée par setobjectxyperm), PAS de la ROM (gMapHeader.events). Sans
  // ça, `addobject` (ScrCmd_addobject) ignore les repositions de genre — ex.
  // `LittlerootTown_EventScript_MoveMomToMaysDoor` (OnTransition, state 2/♀) →
  // `setobjectxyperm LOCALID_LITTLEROOT_MOM, 14, 8` — et spawne la mère aux coords ROM
  // (5,8 = côté Brendan/♂), d'où la mère hors-écran à la sortie du camion côté May.
  //   Le port scinde ObjectEventTemplate en 2 types (fieldmap=ROM avec localIdRaw ;
  // save-blocks avec mapId, sans localIdRaw). Plutôt qu'un cast, on lit le template ROM
  // (type correct + localIdRaw) puis on OVERLAYE les coords persistées du saveblock
  // (x, y = ce qu'écrit setobjectxy[perm]) → équivalent net au template saveblock du décomp.
  const romTpl = (mh.events?.objectEvents ?? []).find(t => t.localIdRaw === localIdRaw);
  if (!romTpl) return false;
  const sav = GetSaveBlock1().objectEventTemplates.find(
    t => t.mapId === mh.id && t.localId === romTpl.localId,
  );
  const tpl = sav ? { ...romTpl, x: sav.x, y: sav.y } : romTpl;
  return _spawnSingleNpcFromTemplate(tpl, mh.id, rt, _graphicsCatalog);
}

/** 1:1 décomp `u8 SpawnSpecialObjectEvent(struct ObjectEventTemplate *objectEventTemplate)`
 *  (event_object_movement.c:1501-1508) :
 *  ```c
 *  u8 SpawnSpecialObjectEvent(struct ObjectEventTemplate *objectEventTemplate) {
 *      s16 cameraX, cameraY;
 *      GetObjectEventMovingCameraOffset(&cameraX, &cameraY);
 *      return TrySpawnObjectEventTemplate(objectEventTemplate,
 *                                         gSaveBlock1Ptr->location.mapNum,
 *                                         gSaveBlock1Ptr->location.mapGroup,
 *                                         cameraX, cameraY);
 *  }
 *  ```
 *  Notre port : le flow 1:1 de `TrySpawnObjectEventTemplate` (alloc sprite/tiles/palette +
 *  `InitObjectEventStateFromTemplate`) est inliné dans `_spawnSingleNpcFromTemplate`. On y
 *  délègue (mapId string ≡ mapNum/mapGroup), puis on retrouve le slot par localId (le dedup
 *  garantit l'unicité par localId sur la map courante) pour renvoyer l'objectEventId comme
 *  la décomp. Retourne `OBJECT_EVENTS_COUNT` si échec (= sentinel décomp).
 *
 *  Câblage 1:1 manquant côté `_spawnSingleNpcFromTemplate` : `objectEvent->mapNum/mapGroup`
 *  (décomp `InitObjectEventStateFromTemplate` event_object_movement.c:1305-1306, alimentés
 *  par les args de TrySpawnObjectEventTemplate = `gSaveBlock1Ptr->location.mapNum/mapGroup`).
 *  On les pose ici → `RemoveObjectEventByLocalIdAndMap(localId, location.mapNum, location.
 *  mapGroup)` (RemoveCameraObject) retrouve bien l'object event (match localId+mapNum+mapGroup,
 *  cf. GetObjectEventIdByLocalIdAndMap pour localId 127 < LOCALID_PLAYER). */
export function SpawnSpecialObjectEvent(template: ObjectEventTemplate): number {
  if (!_graphicsCatalog || !gMapHeader) return OBJECT_EVENTS_COUNT;
  const currentMapId = gMapHeader.id;
  const rt = getRuntime();
  const ok = _spawnSingleNpcFromTemplate(template, currentMapId, rt, _graphicsCatalog);
  if (!ok) return OBJECT_EVENTS_COUNT;
  const idx = gObjectEvents.findIndex(
    o => o.active && o.mapId === currentMapId && o.localId === template.localId,
  );
  if (idx < 0) return OBJECT_EVENTS_COUNT;
  const npc = gObjectEvents[idx];
  // 1:1 décomp InitObjectEventStateFromTemplate:1305-1306 (via TrySpawnObjectEventTemplate args).
  npc.mapNum = gSaveBlock1Ptr.location.mapNum;
  npc.mapGroup = gSaveBlock1Ptr.location.mapGroup;
  // Positionne le sprite à sa coord MONDE DÈS le spawn (= 1:1 décomp : TrySetupObjectEventSprite
  // pose sprite->x/y via SetObjectEventSpritePosToMapCoords, event_object_movement.c:1456-1464 ;
  // cf. aussi le spawn joueur field_player_avatar.ts qui fait `sprite.x = worldX`). Sans ça,
  // `_spawnSingleNpcFromTemplate` laisse sprite.x/y = 0 jusqu'au prochain UpdateObjectEvents
  // (invisible pour un NPC ordinaire) → mais l'object event CAMERA est immédiatement suivi par
  // le CameraObject tracker (CameraObjectSetFollowedSpriteId) : le tracker se snap sur x=0 puis
  // voit un delta d'une frame = worldX (~120 px) → SAUT caméra au début de chaque travelling.
  if (npc.spriteId >= 0) {
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.coordOffsetEnabled = true;
      sprite.x = npc.worldX + npc.visualOffsetX;
      sprite.y = npc.worldY + npc.visualOffsetY;
    }
  }
  return idx;
}

/** 1:1 décomp `u8 SpawnSpecialObjectEventParameterized(u8 graphicsId, u8 movementBehavior,
 *  u8 localId, s16 x, s16 y, u8 elevation)` (event_object_movement.c:1510-1528) :
 *  ```c
 *      struct ObjectEventTemplate objectEventTemplate;
 *      x -= MAP_OFFSET;
 *      y -= MAP_OFFSET;
 *      objectEventTemplate.localId = localId;
 *      objectEventTemplate.graphicsId = graphicsId;
 *      objectEventTemplate.kind = OBJ_KIND_NORMAL;
 *      objectEventTemplate.x = x; objectEventTemplate.y = y;
 *      objectEventTemplate.elevation = elevation;
 *      objectEventTemplate.movementType = movementBehavior;
 *      objectEventTemplate.movementRangeX = 0; objectEventTemplate.movementRangeY = 0;
 *      objectEventTemplate.trainerType = TRAINER_TYPE_NONE;
 *      objectEventTemplate.trainerRange_berryTreeId = 0;
 *      return SpawnSpecialObjectEvent(&objectEventTemplate);
 *  ```
 *  Adaptation port : `graphicsId`/`movementBehavior` sont des strings (OBJ_EVENT_GFX_* /
 *  MOVEMENT_TYPE_*) ; `localIdRaw` optionnel pour la résolution `applymovement` par nom
 *  (movement-system `_resolveTarget` matche localIdRaw OU localId numérique). */
export function SpawnSpecialObjectEventParameterized(
  graphicsId: string, movementBehavior: string, localId: number,
  x: number, y: number, elevation: number, localIdRaw = '',
): number {
  const template: ObjectEventTemplate = {
    localId,
    localIdRaw,
    graphicsId: 0,
    graphicsIdRaw: graphicsId,
    kind: 0,                     // OBJ_KIND_NORMAL
    x: x - MAP_OFFSET,           // 1:1 décomp : x -= MAP_OFFSET
    y: y - MAP_OFFSET,
    elevation,
    movementType: 0,
    movementTypeRaw: movementBehavior,
    movementRangeX: 0,
    movementRangeY: 0,
    trainerType: 0,              // TRAINER_TYPE_NONE
    trainerRange_berryTreeId: 0,
    script: '',
    flagId: '0',
  };
  return SpawnSpecialObjectEvent(template);
}

/** 1:1 décomp `void RemoveObjectEventByLocalIdAndMap(u8 localId, u8 mapNum, u8 mapGroup)`
 *  (event_object_movement.c:1389-1397) :
 *    if (!TryGetObjectEventIdByLocalIdAndMap(...)) {
 *        FlagSet(GetObjectEventFlagIdByObjectEventId(objectEventId));
 *        RemoveObjectEvent(&gObjectEvents[objectEventId]);
 *    }
 *  Utilisé par tv.c (reporter du lobby Tour de Combat). Le despawn réutilise la
 *  mécanique 1:1 de RemoveObjectEventsOutsideView (sprite + tiles + active). */
export function RemoveObjectEventByLocalIdAndMap(localId: number, mapNum: number, mapGroup: number): void {
  const r = TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup);
  if (!r.notFound) {
    const npc = gObjectEvents[r.objectEventId];
    // GetObjectEventFlagIdByObjectEventId → template.flagId (event_object_movement.c:1408).
    const tpl = (gMapHeader?.events?.objectEvents ?? []).find(t => t.localId === npc.localId);
    if (tpl?.flagId && tpl.flagId !== '0') FlagSet(tpl.flagId);
    // RemoveObjectEvent : active=FALSE + destroy sprite (event_object_movement.c:1374).
    const rt = getRuntime();
    if (npc.spriteId >= 0) {
      const sprite = rt.gSprites[npc.spriteId];
      if (sprite) {
        sprite.inUse = false;
        rt.gba.oam[sprite.oamIndex].visible = false;
      }
      if (npc.objTileBase > 0) {
        MarkObjTilesFree(npc.objTileBase * 32, (npc.objTileCount > 0 ? npc.objTileCount : TILES_PER_NPC) * 32);
      }
    }
    npc.active = false;
    npc.spriteId = -1;
  }
}

/** 1:1 STRICT décomp `TrySpawnObjectEvents(s16 cameraX, s16 cameraY)`
 *  (event_object_movement.c:1645-1675). Per-frame ou per-boundary-cross :
 *  iterate tous les NPC templates DU SAVEBLOCK (= ROM copy + setobjectxyperm
 *  overlay), spawn ceux dans bounds qui ne sont pas déjà active (= dedup via
 *  localId).
 *
 *  Bounds 1:1 décomp :
 *    left   = pos.x - 2
 *    right  = pos.x + MAP_OFFSET_W + 2 = pos.x + 17
 *    top    = pos.y
 *    bottom = pos.y + MAP_OFFSET_H + 2 = pos.y + 16
 *  Compare avec npcX = template.x + MAP_OFFSET, npcY = template.y + MAP_OFFSET.
 *  Réécrit en LOGICAL frame : template.x dans [pos.x - 9, pos.x + 10],
 *  template.y dans [pos.y - 7, pos.y + 9].
 *
 *  A10 (2026-05-24) — migration vers saveblock direct : 1:1 strict décomp
 *  ligne 1666 utilise `gSaveBlock1Ptr->objectEventTemplates[i]`, PAS gMapHeader.
 *
 *  SYNC : assume PNGs préchargées via preloadNpcGraphicsForMap. Si pas cached,
 *  _spawnSingleNpcFromTemplate retourne false et le NPC sera retried frame
 *  suivante (= no-op rapide). */
export function TrySpawnObjectEvents(rt: DecompRuntime): void {
  if (!gMapHeader) return;
  if (!_graphicsCatalog) return;  // Catalog pas encore loaded — caller missed init.
  const currentMapId = gMapHeader.id;
  // 1:1 STRICT décomp event_object_movement.c:1666.
  const block1 = GetSaveBlock1();
  const templates = block1.objectEventTemplates.filter(
    (t: { mapId?: string }) => t.mapId === currentMapId,
  );
  if (templates.length === 0) return;
  const catalog = _graphicsCatalog;

  // 1:1 décomp pos.x/y. Notre conv : pos.x = playerLogical.x = gPlayerAvatar.x,
  // pos.y = playerLogical.y = gPlayerAvatar.y.
  const posX = gSaveBlock1Ptr.pos.x;
  const posY = gSaveBlock1Ptr.pos.y;
  const left = posX - 9;
  const right = posX + 10;
  const top = posY - 7;
  const bottom = posY + 9;

  for (const template of templates) {
    if (template.x < left || template.x > right) continue;
    if (template.y < top || template.y > bottom) continue;
    _spawnSingleNpcFromTemplate(template as never, currentMapId, rt, catalog);
  }
}

// ─── Re-anchor sprite pixel pos depuis coords logiques (resume save) ────────

/** 1:1 décomp `SetSpritePosToMapCoords` (event_object_movement.c:4801) ligne-par-ligne :
 *  ```c
 *  void SetSpritePosToMapCoords(s32 mapX, s32 mapY, s16 *destX, s16 *destY) {
 *      s16 dx = -gTotalCameraPixelOffsetX - gFieldCamera.x;
 *      s16 dy = -gTotalCameraPixelOffsetY - gFieldCamera.y;
 *      if (gFieldCamera.x > 0) dx += 0x10;
 *      if (gFieldCamera.x < 0) dx -= 0x10;
 *      if (gFieldCamera.y > 0) dy += 0x10;
 *      if (gFieldCamera.y < 0) dy -= 0x10;
 *      *destX = ((mapX - gSaveBlock1Ptr->pos.x) << 4) + dx;
 *      *destY = ((mapY - gSaveBlock1Ptr->pos.y) << 4) + dy;
 *  }
 *  ```
 *  mapX/Y = INTERNAL frame (= +MAP_OFFSET). Returns sprite pixel pos relative
 *  to screen top-left. */
function _SetSpritePosToMapCoords(mapX: number, mapY: number): { destX: number; destY: number } {
  let dx = -gTotalCamera.pixelOffsetX - gFieldCamera.x;
  let dy = -gTotalCamera.pixelOffsetY - gFieldCamera.y;
  if (gFieldCamera.x > 0) dx += 0x10;
  if (gFieldCamera.x < 0) dx -= 0x10;
  if (gFieldCamera.y > 0) dy += 0x10;
  if (gFieldCamera.y < 0) dy -= 0x10;
  const destX = ((mapX - gSaveBlock1Ptr.pos.x) << 4) + dx;
  const destY = ((mapY - gSaveBlock1Ptr.pos.y) << 4) + dy;
  return { destX, destY };
}

/** 1:1 décomp `SetObjectEventCoords` (event_object_movement.c) :
 *  ```c
 *  void SetObjectEventCoords(struct ObjectEvent *objectEvent, s16 x, s16 y) {
 *      objectEvent->previousCoords.x = objectEvent->currentCoords.x;
 *      objectEvent->previousCoords.y = objectEvent->currentCoords.y;
 *      objectEvent->currentCoords.x = x;
 *      objectEvent->currentCoords.y = y;
 *  }
 *  ```
 *  x, y = INTERNAL frame. */
function _SetObjectEventCoords(npc: ObjectEvent, x: number, y: number): void {
  npc.previousCoordsX = npc.currentCoordsX;
  npc.previousCoordsY = npc.currentCoordsY;
  npc.currentCoordsX = x;
  npc.currentCoordsY = y;
}

/** 1:1 décomp `MoveObjectEventToMapCoords` (event_object_movement.c:2133) ligne-par-ligne :
 *  ```c
 *  void MoveObjectEventToMapCoords(struct ObjectEvent *objectEvent, s16 x, s16 y) {
 *      struct Sprite *sprite = &gSprites[objectEvent->spriteId];
 *      const struct ObjectEventGraphicsInfo *graphicsInfo = GetObjectEventGraphicsInfo(objectEvent->graphicsId);
 *      SetObjectEventCoords(objectEvent, x, y);
 *      SetSpritePosToMapCoords(currentCoords.x, currentCoords.y, &sprite->x, &sprite->y);
 *      sprite->centerToCornerVecX = -(graphicsInfo->width >> 1);
 *      sprite->centerToCornerVecY = -(graphicsInfo->height >> 1);
 *      sprite->x += 8;
 *      sprite->y += 16 + sprite->centerToCornerVecY;
 *      ResetObjectEventFldEffData(objectEvent);
 *      if (objectEvent->trackedByCamera) CameraObjectReset();
 *  }
 *  ```
 *  Notre TS : sprite.x/y = npc.worldX/worldY. centerToCornerVec stocké sur npc.
 *  x, y = INTERNAL frame (= +MAP_OFFSET, caller fait l'add).
 *  trackedByCamera + CameraObjectReset : dette R3 (rarement utilisé). */
export function MoveObjectEventToMapCoords(npc: ObjectEvent, x: number, y: number): void {
  _SetObjectEventCoords(npc, x, y);
  const { destX, destY } = _SetSpritePosToMapCoords(npc.currentCoordsX, npc.currentCoordsY);
  // 1:1 décomp ligne 2142 : sprite->x += 8; sprite->y += 16 + ctcvY;
  //
  // Notre TS architecture : sprite.y2 absorbe déjà le `16 + ctcvY` au SPAWN
  // (= ligne 5125 `sprite.y2 = 16 + sprite.centerToCornerVecY`). Donc :
  //   sprite render position = worldY + sprite.y2
  //                          = worldY + (16 + ctcvY)
  // Pour matcher décomp `sprite.y = destY + 16 + ctcvY`, on a 2 options :
  //   A) worldY = destY + 16 + ctcvY ET sprite.y2 = 0  ← 1:1 décomp exact
  //   B) worldY = destY ET sprite.y2 = 16 + ctcvY      ← architecture spawn legacy
  //
  // Choix B (= preserve compat avec spawn template + load_save) : worldY = destY
  // direct, le offset `+ 16 + ctcvY` reste dans sprite.y2 (= settled at spawn).
  // Cela évite régression sur tous les NPCs déjà spawned.
  npc.worldX = destX + 8;
  npc.worldY = destY;
  // 1:1 décomp `ResetObjectEventFldEffData` (event_object_movement.c).
  npc.singleMovementActive = false;
  npc.triggerGroundEffectsOnMove = true;
  npc.triggerGroundEffectsOnStop = true;
  npc.disableCoveringGroundEffects = false;
  npc.landingJump = false;
  npc.facingDirectionLocked = false;
  // 1:1 décomp `ObjectEventClearHeldMovementIfActive` (event_object_movement.c).
  if (npc.heldMovementActive) {
    npc.heldMovementActive = false;
    npc.heldMovementFinished = false;
    npc.movementActionId = MOVEMENT_ACTION_NONE;
  }
  // Dette R3 : CameraObjectReset si trackedByCamera (= rarement utilisé).
  // Notre TS : reset walk progression résiduelle pour que UpdateObjectEvents
  // le dessine statique à worldX/Y. Pas dans le décomp (= geree autrement)
  // mais nécessaire pour notre tick model qui caches walk state.
  npc.walkFramesLeft = 0;
  npc.walkDirection = DIR_NONE;
  npc.movementStep = 0;
  npc.visualOffsetX = 0;
  npc.visualOffsetY = 0;
}

/** 1:1 décomp `TryMoveObjectEventToMapCoords` (event_object_movement.c:2151) :
 *  ```c
 *  void TryMoveObjectEventToMapCoords(u8 localId, u8 mapNum, u8 mapGroup, s16 x, s16 y) {
 *      u8 objectEventId;
 *      if (!TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup, &objectEventId)) {
 *          x += MAP_OFFSET;
 *          y += MAP_OFFSET;
 *          MoveObjectEventToMapCoords(&gObjectEvents[objectEventId], x, y);
 *      }
 *  }
 *  ```
 *  Note : `TryGetObjectEventIdByLocalIdAndMap` returns FALSE (= 0) si trouvé
 *  donc `if (!...)` = if found. localId 0xFF (= LOCALID_PLAYER) → player slot.
 *  x, y arrivent en LOGICAL (= script args) → +MAP_OFFSET inside. */
export function TryMoveObjectEventToMapCoords(localId: number, mapNum: number, mapGroup: number, x: number, y: number): void {
  // Find NPC par localId numeric + mapNum + mapGroup. LOCALID_PLAYER = 0xFF.
  let found: ObjectEvent | null = null;
  if (localId === 0xFF) {
    found = gObjectEvents[PLAYER_OBJECT_EVENT_SLOT] ?? null;
  } else {
    for (const npc of gObjectEvents) {
      if (!npc.active) continue;
      if (npc.localId === localId && npc.mapNum === mapNum && npc.mapGroup === mapGroup) {
        found = npc;
        break;
      }
    }
    // Fallback : si pas trouvé via mapNum+mapGroup (= notre TS use mapId string),
    // match par localId+mapId match.
    if (!found) {
      for (const npc of gObjectEvents) {
        if (!npc.active) continue;
        if (npc.localId === localId) {
          found = npc;
          break;
        }
      }
    }
  }
  if (!found) return;
  MoveObjectEventToMapCoords(found, x + MAP_OFFSET, y + MAP_OFFSET);
}

/** Legacy wrapper : `SetObjectEventSpritePosToMapCoords` (TS shim).
 *  Wraps `MoveObjectEventToMapCoords` mais accepte x, y en LOGICAL (= script API).
 *  Used par load_save (resume) + script-opcodes-movement (setobjectxy) + spawn. */
export function SetObjectEventSpritePosToMapCoords(npc: ObjectEvent, x: number, y: number): void {
  MoveObjectEventToMapCoords(npc, x + MAP_OFFSET, y + MAP_OFFSET);
}

// ─── Update sprite positions + frame each frame ────────────────────────────

/** Update sprite.x/y des NPCs (object events) + leur frame selon facingDirection.
 *  Appelé chaque frame depuis MainCB2_Overworld APRÈS TickObjectEventMovements.
 *
 *  [M3-C1] 1:1 décomp : chaque object event sprite est posé en coords MONDE
 *  (sprite.x/y = worldX/Y = le `sprite->x/y` posé par SetSpritePosToMapCoords)
 *  avec `coordOffsetEnabled = TRUE`. Le runtime (UpdateOamCoords, sprite.c:347-356)
 *  ajoute gSpriteCoordOffsetX/Y = gTotalCameraPixelOffsetX - pan (field_camera.c:461)
 *  → tous les sprites monde scrollent ensemble avec la caméra. Avant (hybride
 *  non-1:1) on bakait `+ offX - pan` à la main ici, hors du chemin décomp.
 *
 *  NOTE archi (M3 en cours) : le PLAYER reste pour l'instant écran-ancré
 *  (sprite.x=120, coordOffsetEnabled=FALSE, player-avatar.ts) avec le snap
 *  pixelOffsetX/Y au step-end (band-aid). Ces deux-là tombent en C2/C3/C4 quand
 *  le joueur passera lui aussi en coords-monde + CameraObject (chantier-camera-M3). */
/** 1:1 décomp `ResetSpriteData()` equivalent : quand un scene comme ChooseStarter
 *  swap le CB2 via SetMainCallback2(CB2_StarterChoose), l'OW tick s'arrête et les
 *  sprites OW ne sont plus rendus. Notre TS inline garde l'OW scene actif, donc
 *  les OAM des NPCs sont re-shown chaque frame par UpdateObjectEvents. Ce flag
 *  émule le décomp comportement : quand TRUE, UpdateObjectEvents skip tout (= sprites
 *  invisibles restent invisibles, NPCs effectivement hidden). 1:1 strict cf.
 *  starter_choose.c:CB2_ChooseStarter qui replace le main callback. */
let _objectEventsSuspended = false;

export function setObjectEventsSuspended(suspended: boolean): void {
  _objectEventsSuspended = suspended;
}

export function UpdateObjectEvents(rt: DecompRuntime): void {
  if (_objectEventsSuspended) return;
  const cam = GetCameraTopLeftCoords();

  for (const npc of gObjectEvents) {
    if (!npc.active || npc.spriteId < 0) continue;
    const sprite = rt.gSprites[npc.spriteId];
    if (!sprite) continue;

    // Post R3 refactor : npc.currentCoords stockés INTERNAL → use direct.
    const npcGBackupCol = npc.currentCoordsX;
    const npcGBackupRow = npc.currentCoordsY;
    const viewCol = npcGBackupCol - cam.x;
    const viewRow = npcGBackupRow - cam.y;
    if (viewCol < -2 || viewCol > 17 || viewRow < -2 || viewRow > 13) {
      sprite.invisible = true;
      continue;
    }
    // 1:1 décomp : on respecte le `npc.invisible` flag set par script
    // (= `set_invisible` movement action, `hideobject` opcode, etc.).
    // Avant : `sprite.invisible = false` forcé chaque frame → écrasait
    // set_invisible → user feedback session 123 "le sprite de la mère
    // ne disparait pas sur la porte" pendant LittlerootTown_Movement_MomEnterHouse.
    sprite.invisible = npc.invisible;

    // [M3-C1] 1:1 décomp : coords MONDE + coordOffsetEnabled. Le runtime
    // (UpdateOamCoords, sprite.c:347-356) ajoute gSpriteCoordOffsetX/Y
    // (= gTotalCameraPixelOffsetX - pan, field_camera.c:461) → plus de bake
    // manuel `+ offX - pan` ici (c'était l'hybride non-1:1). worldX/Y = le
    // `sprite->x/y` décomp posé par SetSpritePosToMapCoords.
    // visualOffsetX/Y = `sprite->x2/y2` décomp (truck box bounce) — gardés
    // foldés dans sprite.x/y (le sprite.x2/y2 runtime des NPCs reste 0).
    sprite.coordOffsetEnabled = true;
    sprite.x = npc.worldX + npc.visualOffsetX;
    sprite.y = npc.worldY + npc.visualOffsetY;

    // Update sprite frame chaque frame (= keeps tile + flipH en sync avec
    // facingDirection, important pour interact qui change facing instantané).
    updateNpcSpriteFrame(rt, npc);

    // 1:1 décomp `OverworldBasic` → `AnimateSprites()` (overworld.c:1467) : tick
    // l'anim de TOUS les sprites chaque frame. Nos NPCs animés sont pilotés par
    // le système de mouvement (SeekSpriteAnim par step, qui skip `inanimate`),
    // mais les sprites INANIMÉS à anim multi-frame free-running (= berry tree mûr
    // qui oscille frame 7↔8 via sAnim_BerryTreeStage4) ne sont tickés nulle part
    // → figés. On les fait avancer ici (ContinueAnim → RequestSpriteFrameImageCopy).
    // Scopé `inanimate` pour ne PAS double-advancer les NPCs animés (= conflit
    // avec le mouvement). Drain ProcessSpriteCopyRequests en fin de boucle.
    if (npc.inanimate && sprite.anims) {
      AnimateSprite(rt, sprite as never);
    }
  }
  // 1:1 décomp : ProcessSpriteCopyRequests draine la queue des copies de frame
  // (RequestSpriteFrameImageCopy → objVram) une fois après tous les AnimateSprite.
  ProcessSpriteCopyRequests(rt);
}

/** 1:1 décomp `SetObjectEventSpritePosByLocalIdAndMap`
 *  (event_object_movement.c:1995-2006) :
 *  ```c
 *  void SetObjectEventSpritePosByLocalIdAndMap(u8 localId, u8 mapNum, u8 mapGroup, s16 x, s16 y) {
 *      u8 objectEventId;
 *      if (!TryGetObjectEventIdByLocalIdAndMap(localId, mapNum, mapGroup, &objectEventId)) {
 *          sprite = &gSprites[gObjectEvents[objectEventId].spriteId];
 *          sprite->x2 = x;
 *          sprite->y2 = y;
 *      }
 *  }
 *  ```
 *  Used par Task_Truck1/2 pour box bouncing. Trouve le NPC par localIdRaw
 *  + set ses visualOffsetX/Y (= notre équivalent de sprite.x2/y2).
 *
 *  DETTE 1:1 : signature TS prend (localIdRaw, x, y) au lieu de
 *  (localId, mapNum, mapGroup, x, y). Notre itération direct sur gObjectEvents
 *  remplace TryGetObjectEventIdByLocalIdAndMap (pas portée en TS). Fonctionne
 *  pour les call-sites mono-map (= Task_Truck1/2 sur ELM_LAB_FRONT). */
export function SetObjectEventSpritePosByLocalIdAndMap(
  localIdRaw: string,
  x: number,
  y: number,
): void {
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localIdRaw === localIdRaw) {
      npc.visualOffsetX = x;
      npc.visualOffsetY = y;
      return;
    }
  }
}

export function DestroyAllObjectEvents(rt: DecompRuntime): void {
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    if (npc.spriteId >= 0) {
      const sprite = rt.gSprites[npc.spriteId];
      if (sprite) {
        sprite.inUse = false;
        rt.gba.oam[sprite.oamIndex].visible = false;
      }
    }
    npc.active = false;
    npc.spriteId = -1;
  }
  resetObjectEventAllocations();
}

// ─── Phase 4.8 : seamless cross-border NPC handling (1:1 décomp) ─────────────

/** 1:1 décomp `UpdateObjectEventCoordsForCameraUpdate` (event_object_movement.c:2167-2190).
 *
 *  ```c
 *  void UpdateObjectEventCoordsForCameraUpdate(void) {
 *      if (gCamera.active) {
 *          dx = gCamera.x;
 *          dy = gCamera.y;
 *          for (each active NPC) {
 *              initialCoords -= (dx, dy);
 *              currentCoords -= (dx, dy);
 *              previousCoords -= (dx, dy);
 *          }
 *      }
 *  }
 *  ```
 *
 *  Phase 4.8 audit : changement de signature pour être 1:1 décomp. Avant on
 *  passait dx/dy en paramètres. Maintenant on lit gCamera.active/x/y (= set
 *  par CameraMove au cross-border, FALSE sinon). Per-frame call est safe car
 *  no-op si gCamera.active=FALSE. */
export function UpdateObjectEventCoordsForCameraUpdate(): void {
  if (!gCamera.active) return;
  const dx = gCamera.x;
  const dy = gCamera.y;
  for (const npc of gObjectEvents) {
    if (!npc.active) continue;
    npc.currentCoordsX -= dx;
    npc.currentCoordsY -= dy;
    npc.previousCoordsX -= dx;
    npc.previousCoordsY -= dy;
    npc.initialCoordsX -= dx;
    npc.initialCoordsY -= dy;
  }
}

/** 1:1 décomp `UpdateObjectEventsForCameraUpdate(s16 x, s16 y)` (event_object_movement.c:2217).
 *
 *  ```c
 *  void UpdateObjectEventsForCameraUpdate(s16 x, s16 y) {
 *      UpdateObjectEventCoordsForCameraUpdate();   // si gCamera.active
 *      TrySpawnObjectEvents(x, y);                  // bounds check + spawn
 *      RemoveObjectEventsOutsideView();              // cleanup hors bounds
 *  }
 *  ```
 *
 *  Appelé depuis CameraUpdate (field_camera.c:416) UNIQUEMENT au tile
 *  boundary (= deltaX/Y non-zero). Cette restriction au tile boundary élimine
 *  le mid-step capture drift qu'on avait avec per-frame TrySpawn.
 *
 *  À call dans CameraUpdate après CameraMove (= ordre 1:1 décomp). */
export function UpdateObjectEventsForCameraUpdate(rt: DecompRuntime, x: number, y: number): void {
  void x;  // décomp passe deltaX/deltaY (= used as cameraX/Y dans TrySpawn signature)
  void y;
  UpdateObjectEventCoordsForCameraUpdate();
  TrySpawnObjectEvents(rt);
  RemoveObjectEventsOutsideView(rt);
}

// Register pour CameraUpdate orchestrator call via field-globals.
_registerUpdateObjectEventsForCameraUpdate((rt, dx, dy) => {
  UpdateObjectEventsForCameraUpdate(rt as DecompRuntime, dx, dy);
});

// ════════════════════════════════════════════════════════════════════════════
//  CameraObject (event_object_movement.c:2224-2330) — port 1:1 STRICT
//  « The CameraObject functions below are responsible for an invisible sprite
//    that follows the movements of a different sprite (normally the player's
//    sprite) and tracks x/y movement distances for the camera so it knows where
//    to move. »
//  data macros (include/event_object_movement.h:75-78) :
//    sCamera_FollowSpriteId = data[0]
//    sCamera_State          = data[1]
//    sCamera_MoveX          = data[2]   (s16 — Int16Array gère le wrap signé)
//    sCamera_MoveY          = data[3]
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp enum (event_object_movement.c:207-211). */
const CAMERA_STATE_INIT = 0;
const CAMERA_STATE_MOVE = 1;
const CAMERA_STATE_FROZEN = 2;

/** 1:1 décomp `SpriteCB_CameraObject(struct Sprite *sprite)` (event_object_movement.c:2236).
 *  Dispatch `callbacks[sprite->sCamera_State](sprite)`. */
function SpriteCB_CameraObject(sprite: DecompSprite): void {
  sCameraObjectFuncs[sprite.data[1]]?.(sprite);
}

/** 1:1 décomp `CameraObject_Init(struct Sprite *sprite)` (event_object_movement.c:2244). */
function CameraObject_Init(sprite: DecompSprite): void {
  const rt = getRuntime();
  const follow = rt.gSprites[sprite.data[0]];
  if (!follow) return; // garde plateforme : sprite suivi pas encore créé.
  sprite.x = follow.x;
  sprite.y = follow.y;
  sprite.invisible = true;
  sprite.data[1] = CAMERA_STATE_MOVE;
  CameraObject_UpdateMove(sprite);
}

/** 1:1 décomp `CameraObject_UpdateMove(struct Sprite *sprite)` (event_object_movement.c:2253). */
function CameraObject_UpdateMove(sprite: DecompSprite): void {
  const rt = getRuntime();
  const follow = rt.gSprites[sprite.data[0]];
  if (!follow) return;
  const x = follow.x;
  const y = follow.y;
  sprite.data[2] = x - sprite.x; // sCamera_MoveX (Int16Array → s16)
  sprite.data[3] = y - sprite.y; // sCamera_MoveY
  sprite.x = x;
  sprite.y = y;
}

/** 1:1 décomp `CameraObject_UpdateFrozen(struct Sprite *sprite)` (event_object_movement.c:2266).
 *  Continue à suivre le parent mais ne produit AUCUN mouvement caméra. */
function CameraObject_UpdateFrozen(sprite: DecompSprite): void {
  const rt = getRuntime();
  const follow = rt.gSprites[sprite.data[0]];
  if (!follow) return;
  sprite.x = follow.x;
  sprite.y = follow.y;
  sprite.data[2] = 0;
  sprite.data[3] = 0;
}

/** 1:1 décomp `sCameraObjectFuncs[]` (event_object_movement.c:213-217). */
const sCameraObjectFuncs: ReadonlyArray<(sprite: DecompSprite) => void> = [
  CameraObject_Init,         // [CAMERA_STATE_INIT]
  CameraObject_UpdateMove,   // [CAMERA_STATE_MOVE]
  CameraObject_UpdateFrozen, // [CAMERA_STATE_FROZEN]
];

/** 1:1 décomp `AddCameraObject(u8 followSpriteId)` (event_object_movement.c:2227).
 *  CreateSprite(&sCameraSpriteTemplate, 0, 0, 4) — OAM dummy, invisible. */
export function AddCameraObject(followSpriteId: number): number {
  const rt = getRuntime();
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: 0, paletteBank: 0, x: 0, y: 0,
    shape: 0, size: 0, priority: 0,
    subpriority: 4,
  });
  if (spriteId === MAX_SPRITES) return MAX_SPRITES;
  const sprite = rt.gSprites[spriteId]!;
  sprite.invisible = true;
  sprite.callback = SpriteCB_CameraObject;
  sprite.data[0] = followSpriteId; // sCamera_FollowSpriteId
  return spriteId;
}

/** 1:1 décomp `FindCameraSprite(void)` (event_object_movement.c:2274). */
function FindCameraSprite(): DecompSprite | null {
  const rt = getRuntime();
  // 1:1 décomp : boucle indexée sur les MAX_SPRITES slots fixes (gSprites[i]).
  for (let i = 0; i < MAX_SPRITES; i++) {
    const s = rt.gSprites[i];
    if (s !== undefined && s.inUse && s.callback === SpriteCB_CameraObject) return s;
  }
  return null;
}

/** 1:1 décomp `CameraObjectReset(void)` (event_object_movement.c:2286). */
export function CameraObjectReset(): void {
  const camera = FindCameraSprite();
  if (camera !== null) {
    camera.data[1] = CAMERA_STATE_INIT;
    // 1:1 décomp `camera->callback(camera)` — notre runtime passe (sprite, rt).
    camera.callback!(camera, getRuntime());
  }
}

/** 1:1 décomp `CameraObjectSetFollowedSpriteId(u8 spriteId)` (event_object_movement.c:2296). */
export function CameraObjectSetFollowedSpriteId(spriteId: number): void {
  const camera = FindCameraSprite();
  if (camera !== null) {
    camera.data[0] = spriteId;
    CameraObjectReset();
  }
}

/** 1:1 décomp `UNUSED CameraObjectGetFollowedSpriteId(void)` (event_object_movement.c:2306). */
function CameraObjectGetFollowedSpriteId(): number {
  const camera = FindCameraSprite();
  if (camera === null) return MAX_SPRITES;
  return camera.data[0];
}
void CameraObjectGetFollowedSpriteId;

/** 1:1 décomp `CameraObjectFreeze(void)` (event_object_movement.c:2315). */
export function CameraObjectFreeze(): void {
  const camera = FindCameraSprite();
  if (camera !== null) camera.data[1] = CAMERA_STATE_FROZEN;
}

// Register les helpers CameraObject pour field-camera.ts (anti-cycle via field-globals).
_registerCameraObjectHelpers(AddCameraObject, CameraObjectReset);

/** 1:1 décomp `RemoveObjectEventsOutsideView` (event_object_movement.c:1677).
 *  Removes NPCs dont currentCoords ET initialCoords sont tous deux hors view+
 *  buffer. Les NPCs traversant la border (= currentCoords in view via FillX)
 *  restent visibles. À call per-frame depuis MainCB2 après UpdateObjectEvents.
 *
 *  Décomp bounds (pos LOGICAL frame) : [pos.x - 2, pos.x + 17], [pos.y, pos.y + 16].
 *  NPC.coords en gBackup (= template + MAP_OFFSET). La comparaison mixed-frame
 *  donne en LOGICAL : NPC.template ∈ [pos.x - 9, pos.x + 10] × [pos.y - 7, pos.y + 9].
 *
 *  Notre impl post-refactor : NPC.coords = template (LOGICAL pur). _camPos.x/y =
 *  pos.x/y (= 1:1 décomp gSaveBlock1Ptr->pos en LOGICAL).
 *  Équivalent bounds en LOGICAL :
 *    left = cam.x - 9, right = cam.x + 10.
 *    top = cam.y - 7, bottom = cam.y + 9. */
export function RemoveObjectEventsOutsideView(rt: DecompRuntime): void {
  if (!gMapHeader) return;
  // 1:1 STRICT décomp event_object_movement.c:1699-1713 RemoveObjectEventIfOutsideView :
  //   s16 left   = gSaveBlock1Ptr->pos.x - 2;
  //   s16 right  = gSaveBlock1Ptr->pos.x + 17;
  //   s16 top    = gSaveBlock1Ptr->pos.y;
  //   s16 bottom = gSaveBlock1Ptr->pos.y + 16;
  //   if (objectEvent->currentCoords.x >= left && objectEvent->currentCoords.x <= right ...)
  //
  // CRITICAL : le décomp mélange volontairement les frames. `gSaveBlock1Ptr->pos.x`
  // est en LOGICAL frame (= cf. SetCameraFocusCoords fieldmap.c:794 `pos.x = x - MAP_OFFSET`).
  // Mais `objectEvent->currentCoords.x` est en INTERNAL frame (= template.x + MAP_OFFSET).
  // → bounds effectif en NPC INTERNAL frame est [pos.x - 2 + 7, pos.x + 17 + 7]
  //   en LOGICAL équivalent NPC.x ∈ [pos.x - 9, pos.x + 10] (= large 19 tiles).
  //
  // AUDIT BUG FIX G4 (régression non commitée) : l'ancien code ajoutait
  // `+ MAP_OFFSET` aux bounds (= bug), ce qui SHRINK la zone effective :
  // [pos.x + 5, pos.x + 24] en LOGICAL → NPC à 4 tiles left de player removed.
  // → MOM à world (4, 5), player à (8, 3) : NPC.x INTERNAL 11 < left 15 = removed
  // alors que le décomp garde MOM visible (= 11 >= 6 = TRUE).
  // Fix : utiliser les bounds DIRECTEMENT comme dans le décomp.
  const posX = gSaveBlock1Ptr.pos.x;
  const posY = gSaveBlock1Ptr.pos.y;
  const left = posX - 2;
  const right = posX + 17;
  const top = posY;
  const bottom = posY + 16;

  for (const npc of gObjectEvents) {
    if (!npc.active || npc.spriteId < 0) continue;
    // 1:1 STRICT décomp 1693 : skip player (= jamais removed par cette fonction).
    if (npc.isPlayer) continue;
    const inViewCurrent = npc.currentCoordsX >= left && npc.currentCoordsX <= right
      && npc.currentCoordsY >= top && npc.currentCoordsY <= bottom;
    const inViewInitial = npc.initialCoordsX >= left && npc.initialCoordsX <= right
      && npc.initialCoordsY >= top && npc.initialCoordsY <= bottom;
    if (inViewCurrent || inViewInitial) continue;
    // NPC outside view+buffer → remove.
    const sprite = rt.gSprites[npc.spriteId];
    if (sprite) {
      sprite.inUse = false;
      rt.gba.oam[sprite.oamIndex].visible = false;
    }
    // 1:1 STRICT décomp sprite.c:622-628 `DestroySprite` branch `if (!usingSheet)` :
    //   u16 tileEnd = (sprite->images->size / TILE_SIZE_4BPP) + sprite->oam.tileNum;
    //   for (i = sprite->oam.tileNum; i < tileEnd; i++) FREE_SPRITE_TILE(i);
    // Libère EXACTEMENT le nombre de tiles alloués (= npc.objTileCount). Palette
    // PAS libérée individuellement (= 1:1 décomp, libérée uniquement via
    // FreeAllSpritePalettes au map switch / boot field).
    if (npc.objTileBase > 0) {
      MarkObjTilesFree(npc.objTileBase * 32, (npc.objTileCount > 0 ? npc.objTileCount : TILES_PER_NPC) * 32);
    }
    npc.active = false;
    npc.spriteId = -1;
  }
}

// ─── GetObjectEventGraphicsInfo 1:1 décomp event_object_movement.c:1538-1541 ─
/**
 *  1:1 décomp `GetObjectEventGraphicsInfo` (event_object_movement.c:1538-1541) :
 *    const struct ObjectEventGraphicsInfo *GetObjectEventGraphicsInfo(u16 graphicsId)
 *    {
 *        if (graphicsId >= OBJ_EVENT_GFX_VARS)
 *            graphicsId = VarGetObjectEventGraphicsId(graphicsId - OBJ_EVENT_GFX_VARS);
 *        if (graphicsId >= NUM_OBJ_EVENT_GFX)
 *            graphicsId = OBJ_EVENT_GFX_NINJA_BOY;
 *        return gObjectEventGraphicsInfoPointers[graphicsId];
 *    }
 *
 *  Notre port prend des string enum (= graphicsId TS), pas de u16 numeric.
 *  Les caller passe les pics via un dispatch externe (les pics sont chargés
 *  async PNG → loadTileBin → Uint8Array).
 */
export function GetObjectEventGraphicsInfo(
  graphicsId: string,
  ...pics: Uint8Array[]
): ObjectEventGraphicsInfo | null {
  const factory = gObjectEventGraphicsInfoPointers[graphicsId];
  if (!factory) return null;
  return factory(...pics);
}

// ─── CreateObjectGraphicsSprite (1:1 EOM.c:1543-1591) — INERTE, lot 17b ──────
// Transcrit ce tour, câblage des consommateurs (naming_screen/easy_chat/virtual
// objects, aujourd'hui sur le mini-moteur DIVERGENT engine/field/
// object-event-graphics.ts) = suite du lot. Règle CLAUDE.md : partie complète
// inerte > testable improvisé.
import * as _EventObjectsNS from '../include/constants/event_objects';
import {
  IndexOfSpritePaletteTag as _IndexOfSpritePaletteTag_EOM,
  CreateSprite as CreateSprite_EOM,
  LoadSpritePalette as LoadSpritePalette_EOM,
  StartSpriteAnim as StartSpriteAnim_EOM,
} from './sprite';
import { TAG_NONE as TAG_NONE_EOM } from '../include/sprite';

/** ADAPTATION port : reverse-index valeur OBJ_EVENT_GFX_* → clé string (les
 *  data/object_events sont indexées par clé 'OBJ_EVENT_GFX_*', les scripts et
 *  field_player_avatar véhiculent le u16 décomp). Lazy-construit depuis le
 *  header-miroir include/constants/event_objects. */
let _objEventGfxIdToKey: Map<number, string> | null = null;
export function ObjectEventGfxIdToKey(gfxId: number): string | undefined {
  if (!_objEventGfxIdToKey) {
    _objEventGfxIdToKey = new Map();
    for (const [k, v] of Object.entries(_EventObjectsNS)) {
      if (k.startsWith('OBJ_EVENT_GFX_') && typeof v === 'number' && !_objEventGfxIdToKey.has(v)) {
        _objEventGfxIdToKey.set(v, k);
      }
    }
  }
  return _objEventGfxIdToKey.get(gfxId);
}

/** 1:1 décomp `CopyObjectGraphicsInfoToSpriteTemplate` (EOM.c:1543-1556).
 *  Adaptations port : graphicsId = clé string + `pics` (PNG décompressés,
 *  consommés par la factory data pour construire `images` — le décomp lit la
 *  ROM en place) ; le out-param `*subspriteTables` devient une valeur de retour. */
function CopyObjectGraphicsInfoToSpriteTemplate(
  graphicsId: string,
  callback: ((sprite: unknown) => void) | null,
  spriteTemplate: Record<string, unknown>,
  pics: Uint8Array[],
): { subspriteTables: unknown[] | null } {
  const graphicsInfo = GetObjectEventGraphicsInfo(graphicsId, ...pics);
  if (!graphicsInfo) {
    console.error(`[EOM] CopyObjectGraphicsInfoToSpriteTemplate : graphicsId inconnu '${graphicsId}'`);
    return { subspriteTables: null };
  }
  spriteTemplate.tileTag = graphicsInfo.tileTag;
  spriteTemplate.paletteTag = graphicsInfo.paletteTag;
  spriteTemplate.oam = graphicsInfo.oam;
  spriteTemplate.anims = graphicsInfo.anims;
  spriteTemplate.images = graphicsInfo.images;
  spriteTemplate.affineAnims = graphicsInfo.affineAnims;
  spriteTemplate.callback = callback;
  return { subspriteTables: graphicsInfo.subspriteTables };
}

/** 1:1 décomp `LoadObjectEventPalette` (EOM.c:2014-2025, branche BUGFIX).
 *  ⚠️ DETTE annotée : `sObjectEventSpritePalettes[]` (table tag → .pal INCBIN)
 *  n'est pas portée — nos palettes NPC arrivent par les PNG (chargées via
 *  LoadSpritePalette sous le même tag par le préchargeur). Ici : si le tag est
 *  déjà enregistré → no-op (= LoadSpritePaletteIfTagExists) ; sinon on HURLE
 *  (règle 3 : un gate asset qui échoue ne se tait pas). */
function LoadObjectEventPalette(paletteTag: number): void {
  if (_IndexOfSpritePaletteTag_EOM(paletteTag) !== 0xFF) return;  // déjà chargé
  console.error(`[EOM] LoadObjectEventPalette : tag 0x${paletteTag.toString(16)} absent — précharger la palette (LoadSpritePalette) avant CreateObjectGraphicsSprite`);
}

/** 1:1 décomp `CreateObjectGraphicsSprite` (EOM.c:1568-1591) :
 *    spriteTemplate = Alloc(...); CopyObjectGraphicsInfoToSpriteTemplate(...);
 *    if (paletteTag != TAG_NONE) LoadObjectEventPalette(paletteTag);
 *    spriteId = CreateSprite(spriteTemplate, x, y, subpriority); Free(...);
 *    if (spriteId != MAX_SPRITES && subspriteTables != NULL) {
 *        SetSubspriteTables(sprite, subspriteTables);
 *        sprite->subspriteMode = SUBSPRITES_IGNORE_PRIORITY;
 *    }
 *  Adaptation port : `pics` = PNG décompressés du graphics (asset async chargé
 *  par le caller, cf. GetObjectEventGraphicsInfo). graphicsId accepte le u16
 *  décomp (résolu via ObjectEventGfxIdToKey) ou la clé string directe. */
export function CreateObjectGraphicsSprite(
  graphicsId: number | string,
  callback: ((sprite: unknown) => void) | null,
  x: number,
  y: number,
  subpriority: number,
  pics: Uint8Array[] = [],
): number {
  const key = typeof graphicsId === 'number' ? ObjectEventGfxIdToKey(graphicsId) : graphicsId;
  if (!key) {
    console.error(`[EOM] CreateObjectGraphicsSprite : gfxId 0x${(graphicsId as number).toString(16)} sans clé OBJ_EVENT_GFX_*`);
    return -1;
  }
  const spriteTemplate: Record<string, unknown> = {};
  const { subspriteTables } = CopyObjectGraphicsInfoToSpriteTemplate(key, callback, spriteTemplate, pics);
  if (spriteTemplate.tileTag === undefined) return -1;  // graphicsId inconnu (erreur déjà hurlée)
  if (spriteTemplate.paletteTag !== TAG_NONE_EOM) {
    LoadObjectEventPalette(spriteTemplate.paletteTag as number);
  }
  const spriteId = CreateSprite_EOM(spriteTemplate, x, y, subpriority);
  if (spriteId >= 0 && spriteId < 64 && subspriteTables) {
    // Les data (sOamTables_16x32…) = tableau de `SubspriteTable {subspriteCount,
    // subsprites}` indexé par subspriteTableNum (décomp) ; notre SetSubspriteTables
    // (adaptation) prend le tableau PLAT de subsprites déjà résolu. 1:1 sémantique
    // décomp : subspriteTableNum = 0 après CreateSprite, et sprite.c
    // AddSubspritesToOamBuffer rend NORMALEMENT quand subspriteCount == 0
    // (la table 0 des sOamTables_* est le placeholder vide `{}`) → on ne pose
    // les subsprites que si la table 0 en a.
    const table0 = (subspriteTables as ReadonlyArray<{ subspriteCount: number; subsprites: unknown[] }>)[0];
    if (table0 && table0.subspriteCount > 0) {
      SetSubspriteTables(spriteId, table0.subsprites as Parameters<typeof SetSubspriteTables>[1]);
    }
    // sprite->subspriteMode = SUBSPRITES_IGNORE_PRIORITY : porté par SetSubspriteTables
    // côté port (cf. son impl plus haut dans ce fichier).
  }
  return spriteId;
}
// ─── GetBaseOamForDimensions (helper PORT non-1:1) ──────────────────────────
/** Mappe (frameWidth, frameHeight) → base OAM template 1:1 décomp.
 *  Le décomp ne fait PAS ce mapping (= chaque graphicsInfo référence son
 *  oam explicit). Notre port dérive depuis le catalog JSON qui ne contient
 *  pas le `oam` field — on infère via dimensions. C'est une déviation
 *  documentée mais fonctionnellement équivalente (= mêmes shape/size que
 *  les graphicsInfo décomp pour les NPCs standard). Templates = base_oam.ts. */
export function GetBaseOamForDimensions(frameWidth: number, frameHeight: number): Readonly<OamData> {
  if (frameWidth === 8 && frameHeight === 8) return gObjectEventBaseOam_8x8;
  if (frameWidth === 16 && frameHeight === 8) return gObjectEventBaseOam_16x8;
  if (frameWidth === 16 && frameHeight === 16) return gObjectEventBaseOam_16x16;
  if (frameWidth === 32 && frameHeight === 8) return gObjectEventBaseOam_32x8;
  if (frameWidth === 64 && frameHeight === 32) return gObjectEventBaseOam_64x32;
  if (frameWidth === 16 && frameHeight === 32) return gObjectEventBaseOam_16x32;
  if (frameWidth === 32 && frameHeight === 32) return gObjectEventBaseOam_32x32;
  if (frameWidth === 64 && frameHeight === 64) return gObjectEventBaseOam_64x64;
  // Cas 48x48 (Truck) : utilise subspriteTables + primary sprite 16x32 hidden.
  // Le décomp utilise gObjectEventBaseOam_16x32 pour le primary (cf.
  // gObjectEventGraphicsInfo_Truck). Notre port fait pareil.
  if (frameWidth === 48 && frameHeight === 48) return gObjectEventBaseOam_16x32;
  return gObjectEventBaseOam_16x32;  // fallback
}


// ─── Virtual objects 1:1 (event_object_movement.c CreateVirtualObject & co) ──
// Ex-engine/field/virtual-objects.ts (lot 14). Adaptation conservée : sprites
// posés via CreateObjectGraphicsSprite (le 1:1 de CE fichier depuis le lot 17b —
// le mini-moteur engine/field/object-event-graphics est DISSOUS), pas
// auto-camera-tracked (cutscenes stationnaires). _directionToAnimIdx_VO = la
// table sFaceDirectionAnimNums (définie plus haut dans CE fichier) en switch.
import { getRuntime as _getRuntime_VO } from '../harness/runtime/decomp-globals';
import { DestroySprite as _DestroySprite_VO } from './sprite';
import { gFieldCamera as _gFieldCamera_VO } from './field_camera';
import { DIR_SOUTH as _DIR_SOUTH_VO, DIR_NORTH as _DIR_NORTH_VO, DIR_WEST as _DIR_WEST_VO, DIR_EAST as _DIR_EAST_VO } from '../include/constants/global';

/** 1:1 décomp `sFaceDirectionAnimNums` (event_object_movement.c). */
function _directionToAnimIdx_VO(direction: number): number {
  // ANIM_STD_FACE_SOUTH = 0, NORTH = 1, WEST = 2, EAST = 3.
  switch (direction) {
    case _DIR_SOUTH_VO: return 0;
    case _DIR_NORTH_VO: return 1;
    case _DIR_WEST_VO: return 2;
    case _DIR_EAST_VO: return 3;
    default: return 0;
  }
}

// ─── Virtual object state ────────────────────────────────────────────────────

interface VirtualObject_VO {
  spriteId: number;
  graphicsId: number;
  mapX: number;
  mapY: number;
  elevation: number;
  direction: number;
}

const _gVirtualObjects_VO: Map<number, VirtualObject_VO> = new Map();

const TILE_SIZE_VO = 16;

/** Convert map tile coords → screen pixel coords using current camera offset.
 *  1:1 décomp `gSpriteCoordOffsetX/Y` = camera tile offset in pixels. */
function _mapToScreenX_VO(mapX: number): number {
  return (mapX - _gFieldCamera_VO.x) * TILE_SIZE_VO + TILE_SIZE_VO / 2;
}

function _mapToScreenY_VO(mapY: number): number {
  return (mapY - _gFieldCamera_VO.y) * TILE_SIZE_VO + TILE_SIZE_VO / 2;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** 1:1 décomp `CreateVirtualObject` (event_object_movement.c) :
 *    spriteId = CreateSprite(template, x, y, 0) ;
 *    sprite->subspriteTableNum = elevation < 16 ? elevation : 0 ;
 *    StartSpriteAnim(sprite, sFacingDirection[direction]) ;
 *    sVirtualObjectIds[virtualObjId] = spriteId ;
 *  Async wrapper qui gère le load gfx si pas déjà loaded. */
export async function CreateVirtualObject(
  graphicsId: number,
  virtualObjId: number,
  mapX: number,
  mapY: number,
  elevation: number,
  direction: number,
): Promise<number> {
  const rt = _getRuntime_VO();
  if (!rt) return -1;
  // Cleanup existing vobj at this id (= 1:1 décomp behavior, ré-create override).
  RemoveVirtualObject(virtualObjId);
  // Load gfx async si pas déjà loaded (assets PNG, adaptation port).
  const gfxKey = ObjectEventGfxIdToKey(graphicsId);
  if (!gfxKey) {
    console.error(`[CreateVirtualObject] gfxId 0x${graphicsId.toString(16)} sans clé OBJ_EVENT_GFX_*`);
    return -1;
  }
  await PreloadObjectEventGraphics(gfxKey);
  const pics = PrepareObjectEventGraphics(gfxKey);
  if (!pics) {
    console.error(`[CreateVirtualObject] assets introuvables pour ${gfxKey}`);
    return -1;
  }
  const screenX = _mapToScreenX_VO(mapX);
  const screenY = _mapToScreenY_VO(mapY);
  const spriteId = CreateObjectGraphicsSprite(graphicsId, null, screenX, screenY, 2, pics);
  if (spriteId < 0) return -1;
  // 1:1 décomp CreateVirtualObject : StartSpriteAnim(sprite, sFaceDirectionAnimNums[direction])
  // — avec la VRAIE sAnimTable_Standard (data), 0-3 = ANIM_STD_FACE_* (l'ex mini-moteur
  // jouait GO_* = marche sur place, divergence corrigée par la dissolution).
  const animIdx = _directionToAnimIdx_VO(direction);
  const vobjSprite = rt.gSprites[spriteId];
  if (vobjSprite) StartSpriteAnim_EOM(vobjSprite as Parameters<typeof StartSpriteAnim_EOM>[0], animIdx);
  _gVirtualObjects_VO.set(virtualObjId, {
    spriteId, graphicsId, mapX, mapY, elevation, direction,
  });
  // Expose pour debug
  (globalThis as Record<string, unknown>).gVirtualObjects = _gVirtualObjects_VO;
  return spriteId;
}

/** 1:1 décomp `TurnVirtualObject(virtualObjId, direction)` :
 *    spriteId = sVirtualObjectIds[virtualObjId] ;
 *    StartSpriteAnim(&gSprites[spriteId], sFacingDirection[direction]) ;
 */
export function TurnVirtualObject(virtualObjId: number, direction: number): void {
  const vobj = _gVirtualObjects_VO.get(virtualObjId);
  if (!vobj) return;
  vobj.direction = direction;
  const rt = _getRuntime_VO();
  if (!rt) return;
  const animIdx = _directionToAnimIdx_VO(direction);
  // 1:1 décomp StartSpriteAnim(&gSprites[spriteId], sFaceDirectionAnimNums[direction])
  // — moteur d'anim du template (sprite.anims, voie images), cf. CreateVirtualObject.
  const spr = rt.gSprites[vobj.spriteId];
  if (spr) StartSpriteAnim_EOM(spr as Parameters<typeof StartSpriteAnim_EOM>[0], animIdx);
}

/** Remove a virtual object (= cleanup le sprite). Appelé au map switch ou par
 *  `removeobject` opcode si vobj id matché. */
export function RemoveVirtualObject(virtualObjId: number): void {
  const vobj = _gVirtualObjects_VO.get(virtualObjId);
  if (!vobj) return;
  const rt = _getRuntime_VO();
  if (rt && vobj.spriteId >= 0) {
    _DestroySprite_VO(vobj.spriteId);
  }
  _gVirtualObjects_VO.delete(virtualObjId);
}

/** Clear tous les vobjs. Appelé au map switch. */
export function ClearAllVirtualObjects(): void {
  for (const [id] of _gVirtualObjects_VO) {
    RemoveVirtualObject(id);
  }
}

// Auto-register sur globalThis pour script-opcodes.
(globalThis as { __virtualObjects?: Record<string, unknown> }).__virtualObjects = {
  CreateVirtualObject, TurnVirtualObject, RemoveVirtualObject, ClearAllVirtualObjects,
};
