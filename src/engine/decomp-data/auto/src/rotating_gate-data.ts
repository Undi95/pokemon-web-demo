// AUTO-GENERATED from src/rotating_gate.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/rotating_gate.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const ROTATING_GATE_TILE_TAG = 4864;
export const ROTATING_GATE_PUZZLE_MAX = 12;
export const GATE_ARM_MAX_LENGTH = 2;
export const GATE_ROT_NONE = 255;
/** Raw expr: `max(ARRAY_COUNT(sRotatingGate_FortreePuzzleConfig), \` */
export const MAX_GATES_EXPR = "max(ARRAY_COUNT(sRotatingGate_FortreePuzzleConfig), \\";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_GATE_0 = {
  GATE_SHAPE_L1: 0,
  GATE_SHAPE_L2: 1,
  GATE_SHAPE_L3: 2,
  GATE_SHAPE_L4: 3,
  GATE_SHAPE_T1: 4,
  GATE_SHAPE_T2: 5,
  GATE_SHAPE_T3: 6,
  GATE_SHAPE_T4: 7,
  GATE_SHAPE_UNUSED_T1: 8,
  GATE_SHAPE_UNUSED_T2: 9,
  GATE_SHAPE_UNUSED_T3: 10,
  GATE_SHAPE_UNUSED_T4: 11,
} as const;
export const ENUM_GATE_1 = {
  GATE_ORIENTATION_0: 0,
  GATE_ORIENTATION_90: 1,
  GATE_ORIENTATION_180: 2,
  GATE_ORIENTATION_270: 3,
  GATE_ORIENTATION_MAX: 4,
} as const;
export const ENUM_GATE_2 = {
  GATE_ARM_NORTH: 0,
  GATE_ARM_EAST: 1,
  GATE_ARM_SOUTH: 2,
  GATE_ARM_WEST: 3,
} as const;
export const ENUM_ROTATE_3 = {
  ROTATE_NONE: 0,
  ROTATE_ANTICLOCKWISE: 1,
  ROTATE_CLOCKWISE: 2,
} as const;
export const ENUM_PUZZLE_4 = {
  PUZZLE_NONE: 0,
  PUZZLE_FORTREE_CITY_GYM: 1,
  PUZZLE_ROUTE110_TRICK_HOUSE_PUZZLE6: 2,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_RotatingGateLarge = { y: 0, affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 2, affineParam: 0 } as const;
export const sOamData_RotatingGateRegular = { y: 0, affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 2, paletteNum: 2, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_RotatingGateLarge = { tileTag: "ROTATING_GATE_TILE_TAG", paletteTag: "TAG_NONE", oam: "&sOamData_RotatingGateLarge", anims: "sSpriteAnimTable_RotatingGateLarge", images: 0, affineAnims: "sSpriteAffineAnimTable_RotatingGate", callback: "SpriteCallback_RotatingGate" } as const;
export const sSpriteTemplate_RotatingGateRegular = { tileTag: "ROTATING_GATE_TILE_TAG", paletteTag: "TAG_NONE", oam: "&sOamData_RotatingGateRegular", anims: "sSpriteAnimTable_RotatingGateRegular", images: 0, affineAnims: "sSpriteAffineAnimTable_RotatingGate", callback: "SpriteCallback_RotatingGate" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sRotatingGateTiles_1': { path: 'graphics/rotating_gates/l1.png', ext: '.4bpp', type: 'u8' },
  'sRotatingGateTiles_2': { path: 'graphics/rotating_gates/l2.png', ext: '.4bpp', type: 'u8' },
  'sRotatingGateTiles_3': { path: 'graphics/rotating_gates/l3.png', ext: '.4bpp', type: 'u8' },
  'sRotatingGateTiles_4': { path: 'graphics/rotating_gates/l4.png', ext: '.4bpp', type: 'u8' },
  'sRotatingGateTiles_5': { path: 'graphics/rotating_gates/t1.png', ext: '.4bpp', type: 'u8' },
  'sRotatingGateTiles_6': { path: 'graphics/rotating_gates/t2.png', ext: '.4bpp', type: 'u8' },
  'sRotatingGateTiles_7': { path: 'graphics/rotating_gates/t3.png', ext: '.4bpp', type: 'u8' },
  'sRotatingGateTiles_8': { path: 'graphics/rotating_gates/t4.png', ext: '.4bpp', type: 'u8' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sRotatingGate_GateSpriteIds', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sRotatingGate_PuzzleCount', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SpriteCallback_RotatingGate', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'RotatingGate_CreateGate', ret: "u8", arity: 3, params: "u8 gateId, s16 deltaX, s16 deltaY" },
  { name: 'RotatingGate_HideGatesOutsideViewport', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetCurrentMapRotatingGatePuzzleType', ret: "s32", arity: 0, params: "void" },
  { name: 'RotatingGate_ResetAllGateOrientations', ret: "void", arity: 0, params: "void" },
  { name: 'RotatingGate_GetGateOrientation', ret: "s32", arity: 1, params: "u8 gateId" },
  { name: 'RotatingGate_SetGateOrientation', ret: "void", arity: 2, params: "u8 gateId, u8 orientation" },
  { name: 'RotatingGate_RotateInDirection', ret: "void", arity: 2, params: "u8 gateId, u32 rotationDirection" },
  { name: 'RotatingGate_LoadPuzzleConfig', ret: "void", arity: 0, params: "void" },
  { name: 'RotatingGate_CreateGatesWithinViewport', ret: "void", arity: 2, params: "s16 deltaX, s16 deltaY" },
  { name: 'LoadRotatingGatePics', ret: "void", arity: 0, params: "void" },
  { name: 'RotatingGate_DestroyGatesOutsideViewport', ret: "void", arity: 0, params: "void" },
  { name: 'RotatingGate_CanRotate', ret: "s32", arity: 2, params: "u8 gateId, s32 rotationDirection" },
  { name: 'RotatingGate_HasArm', ret: "s32", arity: 2, params: "u8 gateId, u8 armInfo" },
  { name: 'RotatingGate_TriggerRotationAnimation', ret: "void", arity: 2, params: "u8 gateId, s32 rotationDirection" },
  { name: 'RotatingGate_GetRotationInfo', ret: "u8", arity: 3, params: "u8 direction, s16 x, s16 y" },
  { name: 'RotatingGate_InitPuzzle', ret: "void", arity: 0, params: "void" },
  { name: 'RotatingGatePuzzleCameraUpdate', ret: "void", arity: 2, params: "s16 deltaX, s16 deltaY" },
  { name: 'RotatingGate_InitPuzzleAndGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'CheckForRotatingGatePuzzleCollision', ret: "bool32", arity: 3, params: "u8 direction, s16 x, s16 y" },
  { name: 'CheckForRotatingGatePuzzleCollisionWithoutAnimation', ret: "bool32", arity: 3, params: "u8 direction, s16 x, s16 y" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bike.h',
  'event_data.h',
  'event_object_movement.h',
  'fieldmap.h',
  'rotating_gate.h',
  'sound.h',
  'sprite.h',
  'constants/songs.h',
] as const;
