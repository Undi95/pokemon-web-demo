// AUTO-GENERATED from src/cable_car.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/cable_car.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `gSpecialVar_0x8004` */
export const GOING_DOWN_EXPR = "gSpecialVar_0x8004";
export const STATE_END = 255;
/** Raw expr: `data[0]` */
export const sXPos_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sYPos_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sState_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sTimer_EXPR = "data[3]";
/** Raw expr: `data[1]` */
export const sSameDir_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sDelay_EXPR = "data[2]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_TAG_0 = {
  TAG_CABLE_CAR: 1,
  TAG_DOOR: 2,
  TAG_CABLE: 3,
} as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_CableCar = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 0 } as const;
export const sOam_CableCarDoor = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x8)", x: 0, size: "SPRITE_SIZE(16x8)", tileNum: 0, priority: 2, paletteNum: 0 } as const;
export const sOam_Cable = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 2, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplates_CableCar = [
  { tileTag: "TAG_CABLE_CAR", paletteTag: "TAG_CABLE_CAR", oam: "&sOam_CableCar", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CableCar" },
  { tileTag: "TAG_DOOR", paletteTag: "TAG_CABLE_CAR", oam: "&sOam_CableCarDoor", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CableCar" },
] as const;
export const sSpriteTemplate_Cable = { tileTag: "TAG_CABLE", paletteTag: "TAG_CABLE_CAR", oam: "&sOam_Cable", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Cable" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sGround_Tilemap': { path: 'graphics/cable_car/ground.bin', ext: '.lz', type: 'u16' },
  'sTrees_Tilemap': { path: 'graphics/cable_car/trees.bin', ext: '.lz', type: 'u16' },
  'sBgMountains_Tilemap': { path: 'graphics/cable_car/bg_mountains.bin', ext: '.lz', type: 'u16' },
  'sPylonPole_Tilemap': { path: 'graphics/cable_car/pylon_pole.bin', ext: '.lz', type: 'u16' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sPylonTop_Tilemap': { path: 'graphics/cable_car/pylon_top.bin', type: 'u16' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sGroundX_Up', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sGroundY_Up', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sGroundSegmentY_Up', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sGroundX_Down', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sGroundY_Down', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sGroundSegmentY_Down', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_LoadCableCar', ret: "void", arity: 0, params: "void" },
  { name: 'SetBgRegs', ret: "void", arity: 1, params: "bool8" },
  { name: 'CreateCableCarSprites', ret: "void", arity: 0, params: "void" },
  { name: 'InitGroundTilemapData', ret: "void", arity: 1, params: "bool8" },
  { name: 'Task_CableCar', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_AnimateBgGoingUp', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_AnimateBgGoingDown', ret: "void", arity: 1, params: "u8" },
  { name: 'VBlankCB_CableCar', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_CableCar', ret: "void", arity: 0, params: "void" },
  { name: 'AnimateGroundGoingUp', ret: "void", arity: 0, params: "void" },
  { name: 'AnimateGroundGoingDown', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_CableCar', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Cable', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DrawNextGroundSegmentGoingUp', ret: "void", arity: 0, params: "void" },
  { name: 'DrawNextGroundSegmentGoingDown', ret: "void", arity: 0, params: "void" },
  { name: 'Task_LoadCableCar', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CableCar', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_EndCableCar', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_Player', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_HikerGoingUp', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_HikerGoingDown', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BufferNextGroundSegment', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AnimateBgGoingDown',
  'Task_AnimateBgGoingUp',
  'Task_CableCar',
  'Task_LoadCableCar',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_CableCar',
  'CB2_EndCableCar',
  'CB2_LoadCableCar',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'decompress.h',
  'event_data.h',
  'event_object_movement.h',
  'field_weather.h',
  'gpu_regs.h',
  'graphics.h',
  'malloc.h',
  'main.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'random.h',
  'scanline_effect.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'constants/event_object_movement.h',
  'constants/event_objects.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/weather.h',
] as const;
