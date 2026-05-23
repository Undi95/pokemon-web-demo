// AUTO-GENERATED from src/egg_hatch.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/egg_hatch.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GFXTAG_EGG = 12345;
export const GFXTAG_EGG_SHARD = 23456;
export const PALTAG_EGG = 54321;
/** Raw expr: `(DISPLAY_WIDTH / 2)` */
export const EGG_X_EXPR = "(DISPLAY_WIDTH / 2)";
/** Raw expr: `(DISPLAY_HEIGHT / 2 - 5)` */
export const EGG_Y_EXPR = "(DISPLAY_HEIGHT / 2 - 5)";
/** Raw expr: `data[0]` */
export const tTimer_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sSinIdx_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sDelayTimer_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const sVelocX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sVelocY_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sAccelY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sDeltaX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sDeltaY_EXPR = "data[5]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_EGG_0 = {
  EGG_ANIM_NORMAL: 0,
  EGG_ANIM_CRACKED_1: 1,
  EGG_ANIM_CRACKED_2: 2,
  EGG_ANIM_CRACKED_3: 3,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWinTemplates_EggHatch = { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 0, baseBlock: 64 } as const;
export const sYesNoWinTemplate = { bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: 15, baseBlock: 424 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates_EggHatch = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 24, screenSize: 3, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 8, screenSize: 1, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Egg = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_EggShard = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_Egg = { tileTag: "GFXTAG_EGG", paletteTag: "PALTAG_EGG", oam: "&sOamData_Egg", anims: "sSpriteAnimTable_Egg", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_EggShard = { tileTag: "GFXTAG_EGG_SHARD", paletteTag: "PALTAG_EGG", oam: "&sOamData_EggShard", anims: "sSpriteAnimTable_EggShard", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_EggShard" } as const;

// ─── SpriteSheet ─────────────────────────────────────────────────────────────
export const sEggHatch_Sheet = { data: "sEggHatchTiles", size: "sizeof(sEggHatchTiles)", tag: "GFXTAG_EGG" } as const;
export const sEggShards_Sheet = { data: "sEggShardTiles", size: "sizeof(sEggShardTiles)", tag: "GFXTAG_EGG_SHARD" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sEgg_SpritePalette = { data: "sEggPalette", tag: "PALTAG_EGG" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sEggPalette': { path: 'graphics/pokemon/egg/normal.pal', ext: '.gbapal', type: 'u16' },
  'sEggHatchTiles': { path: 'graphics/pokemon/egg/hatch.png', ext: '.4bpp', type: 'u8' },
  'sEggShardTiles': { path: 'graphics/pokemon/egg/shard.png', ext: '.4bpp', type: 'u8' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_EggHatch', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_LoadEggHatch', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_EggHatch', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_Egg_Shake1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Egg_Shake2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Egg_Shake3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Egg_WaitHatch', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Egg_Hatch', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Egg_Reveal', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_EggShard', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'EggHatchPrintMessage', ret: "void", arity: 5, params: "u8, u8 *, u8, u8, u8" },
  { name: 'CreateRandomEggShardSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateEggShardSprite', ret: "void", arity: 6, params: "u8, u8, s16, s16, s16, u8" },
  { name: 'CreateHatchedMon', ret: "void", arity: 2, params: "struct Pokemon *egg, struct Pokemon *temp" },
  { name: 'AddHatchedMonToParty', ret: "void", arity: 1, params: "u8 id" },
  { name: 'ScriptHatchMon', ret: "void", arity: 0, params: "void" },
  { name: '_CheckDaycareMonReceivedMail', ret: "bool8", arity: 2, params: "struct DayCare *daycare, u8 daycareId" },
  { name: 'CheckDaycareMonReceivedMail', ret: "bool8", arity: 0, params: "void" },
  { name: 'EggHatchCreateMonSprite', ret: "u8", arity: 4, params: "u8 useAlt, u8 state, u8 partyId, u16 *speciesLoc" },
  { name: 'VBlankCB_EggHatch', ret: "void", arity: 0, params: "void" },
  { name: 'EggHatch', ret: "void", arity: 0, params: "void" },
  { name: 'EggHatchSetMonNickname', ret: "void", arity: 0, params: "void" },
  { name: 'Task_EggHatchPlayBGM', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetEggCyclesToSubtract', ret: "u8", arity: 0, params: "void" },
  { name: 'CountPartyAliveNonEggMons', ret: "u16", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_EggHatch',
  'Task_EggHatchPlayBGM',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_EggHatch',
  'CB2_LoadEggHatch',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'pokemon.h',
  'egg_hatch.h',
  'pokedex.h',
  'constants/items.h',
  'script.h',
  'decompress.h',
  'task.h',
  'palette.h',
  'main.h',
  'event_data.h',
  'sound.h',
  'constants/songs.h',
  'text.h',
  'text_window.h',
  'string_util.h',
  'menu.h',
  'trig.h',
  'random.h',
  'malloc.h',
  'dma3.h',
  'gpu_regs.h',
  'bg.h',
  'm4a.h',
  'window.h',
  'graphics.h',
  'constants/abilities.h',
  'daycare.h',
  'overworld.h',
  'scanline_effect.h',
  'field_weather.h',
  'international_string_util.h',
  'naming_screen.h',
  'pokemon_storage_system.h',
  'field_screen_effect.h',
  'trade.h',
  'data.h',
  'battle.h',
  'constants/rgb.h',
] as const;
