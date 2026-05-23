// AUTO-GENERATED from src/mirage_tower.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mirage_tower.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_CEILING_CRUMBLE = 4000;
/** Raw expr: `(sizeof(sBlankTile_Gfx) + sizeof(sMirageTower_Gfx))` */
export const MIRAGE_TOWER_GFX_LENGTH_EXPR = "(sizeof(sBlankTile_Gfx) + sizeof(sMirageTower_Gfx))";
export const FOSSIL_DISINTEGRATE_LENGTH = 256;
/** Raw expr: `data[0]` */
export const tXShakeOffset_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tNumShakes_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tShakeDelay_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tYShakeOffset_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const sIndex_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sYOffset_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
export const OUTER_BUFFER_LENGTH = 96;
export const INNER_BUFFER_LENGTH = 48;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_FallingFossil = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 3, affineParam: 0 } as const;
export const sOamData_CeilingCrumbleSmall = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_CeilingCrumbleLarge = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_FallingFossil = { tileTag: "TAG_NONE", paletteTag: "TAG_NONE", oam: "&sOamData_FallingFossil", anims: "sAnims_FallingFossil", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_CeilingCrumbleSmall = { tileTag: "TAG_CEILING_CRUMBLE", paletteTag: "TAG_NONE", oam: "&sOamData_CeilingCrumbleSmall", anims: "sAnims_CeilingCrumbleSmall", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CeilingCrumble" } as const;
export const sSpriteTemplate_CeilingCrumbleLarge = { tileTag: "TAG_CEILING_CRUMBLE", paletteTag: "TAG_NONE", oam: "&sOamData_CeilingCrumbleLarge", anims: "sAnims_CeilingCrumbleLarge", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CeilingCrumble" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sFossil_Pal': { path: 'graphics/object_events/pics/misc/fossil.png', ext: '.gbapal', type: 'u16' },
  'sFossil_Gfx': { path: 'graphics/object_events/pics/misc/fossil.png', ext: '.4bpp', type: 'u8' },
  'sMirageTowerCrumbles_Gfx': { path: 'graphics/misc/mirage_tower_crumbles.png', ext: '.4bpp', type: 'u8' },
  'sMirageTowerCrumbles_Palette': { path: 'graphics/misc/mirage_tower_crumbles.png', ext: '.gbapal', type: 'u16' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sMirageTowerTilemap': { path: 'graphics/misc/mirage_tower.bin', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PlayerDescendMirageTower', ret: "void", arity: 1, params: "u8" },
  { name: 'DoScreenShake', ret: "void", arity: 1, params: "u8" },
  { name: 'IncrementCeilingCrumbleFinishedCount', ret: "void", arity: 0, params: "void" },
  { name: 'WaitCeilingCrumble', ret: "void", arity: 1, params: "u8" },
  { name: 'FinishCeilingCrumbleTask', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateCeilingCrumbleSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_CeilingCrumble', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DoMirageTowerDisintegration', ret: "void", arity: 1, params: "u8" },
  { name: 'InitMirageTowerShake', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FossilFallAndSink', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_FallingFossil', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateDisintegrationEffect', ret: "void", arity: 5, params: "u8 *, u16, u8, u8, u8" },
  { name: 'IsMirageTowerVisible', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateMirageTowerPulseBlend', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ClearMirageTowerPulseBlend', ret: "void", arity: 0, params: "void" },
  { name: 'TryStartMirageTowerPulseBlendEffect', ret: "void", arity: 0, params: "void" },
  { name: 'ClearMirageTowerPulseBlendEffect', ret: "void", arity: 0, params: "void" },
  { name: 'SetMirageTowerVisibility', ret: "void", arity: 0, params: "void" },
  { name: 'StartPlayerDescendMirageTower', ret: "void", arity: 0, params: "void" },
  { name: 'StartScreenShake', ret: "void", arity: 4, params: "u8 yShakeOffset, u8 xShakeOffset, u8 numShakes, u8 shakeDelay" },
  { name: 'DoMirageTowerCeilingCrumble', ret: "void", arity: 0, params: "void" },
  { name: 'SetInvisibleMirageTowerMetatiles', ret: "void", arity: 0, params: "void" },
  { name: 'StartMirageTowerDisintegration', ret: "void", arity: 0, params: "void" },
  { name: 'StartMirageTowerShake', ret: "void", arity: 0, params: "void" },
  { name: 'StartMirageTowerFossilFallAndSink', ret: "void", arity: 0, params: "void" },
  { name: 'SetBgShakeOffsets', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateBgShake', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'sizeof', ret: "FOSSIL_DISINTEGRATE_LENGTH *", arity: 1, params: "u16" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_FossilFallAndSink',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'bg.h',
  'event_data.h',
  'event_object_movement.h',
  'field_camera.h',
  'fieldmap.h',
  'gpu_regs.h',
  'menu.h',
  'random.h',
  'palette.h',
  'palette_util.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'window.h',
  'constants/event_objects.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/metatile_labels.h',
] as const;
