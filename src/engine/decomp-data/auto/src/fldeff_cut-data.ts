// AUTO-GENERATED from src/fldeff_cut.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/fldeff_cut.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const CUT_NORMAL_SIDE = 3;
/** Raw expr: `CUT_NORMAL_SIDE * CUT_NORMAL_SIDE` */
export const CUT_NORMAL_AREA_EXPR = "CUT_NORMAL_SIDE * CUT_NORMAL_SIDE";
export const CUT_HYPER_SIDE = 5;
/** Raw expr: `CUT_HYPER_SIDE * CUT_HYPER_SIDE` */
export const CUT_HYPER_AREA_EXPR = "CUT_HYPER_SIDE * CUT_HYPER_SIDE";
export const CUT_SPRITE_ARRAY_COUNT = 8;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_LONG_0 = {
  LONG_GRASS_NONE: 0,
  LONG_GRASS_FIELD: 1,
  LONG_GRASS_BASE_LEFT: 2,
  LONG_GRASS_BASE_CENTER: 3,
  LONG_GRASS_BASE_RIGHT: 4,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_CutGrass = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 1, priority: 1, paletteNum: 1, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_CutGrass = { tileTag: "TAG_NONE", paletteTag: "FLDEFF_PAL_TAG_CUT_GRASS", oam: "&sOamData_CutGrass", anims: "sSpriteAnimTable_CutGrass", images: "sSpriteImageTable_CutGrass", affineAnims: "gDummySpriteAffineAnimTable", callback: "CutGrassSpriteCallback1" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FieldCallback_CutTree', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCallback_CutGrass', ret: "void", arity: 0, params: "void" },
  { name: 'StartCutTreeFieldEffect', ret: "void", arity: 0, params: "void" },
  { name: 'StartCutGrassFieldEffect', ret: "void", arity: 0, params: "void" },
  { name: 'SetCutGrassMetatile', ret: "void", arity: 2, params: "s16, s16" },
  { name: 'SetCutGrassMetatiles', ret: "void", arity: 2, params: "s16, s16" },
  { name: 'CutGrassSpriteCallback1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CutGrassSpriteCallback2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CutGrassSpriteCallbackEnd', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'HandleLongGrassOnHyper', ret: "void", arity: 3, params: "u8, s16, s16" },
  { name: 'SetUpFieldMove_Cut', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseCutOnGrass', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseCutOnTree', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_CutGrass', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetLongGrassCaseAt', ret: "u8", arity: 2, params: "s16 x, s16 y" },
  { name: 'FixLongGrassMetatilesWindowTop', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'FixLongGrassMetatilesWindowBottom', ret: "void", arity: 2, params: "s16 x, s16 y" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_object_lock.h',
  'event_object_movement.h',
  'event_scripts.h',
  'faraway_island.h',
  'field_camera.h',
  'field_effect.h',
  'field_player_avatar.h',
  'fieldmap.h',
  'fldeff.h',
  'malloc.h',
  'metatile_behavior.h',
  'overworld.h',
  'party_menu.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'constants/abilities.h',
  'constants/event_objects.h',
  'constants/field_effects.h',
  'constants/songs.h',
  'constants/metatile_labels.h',
] as const;
