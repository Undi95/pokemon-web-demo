// AUTO-GENERATED from src/use_pokeblock.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/use_pokeblock.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_UP_DOWN = 0;
export const TAG_CONDITION = 1;
export const NUM_SELECTIONS_LOADED = 3;
/** Raw expr: `data[0]` */
export const tTimer_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sSpeed_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTargetX_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_NAME: 0,
  WIN_NATURE: 1,
  WIN_TEXT: 2,
  WIN_COUNT: 3,
} as const;
export const ENUM_STATE_1 = {
  STATE_HANDLE_INPUT: 0,
  STATE_UPDATE_SELECTION: 1,
  STATE_2: 2,
  STATE_CLOSE: 3,
  STATE_4: 4,
  STATE_CONFIRM_SELECTION: 5,
  STATE_HANDLE_CONFIRMATION: 6,
  STATE_WAIT_MSG: 7,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 13, tilemapTop: 1, width: 13, height: 4, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 14, width: 11, height: 2, paletteNum: 15, baseBlock: 53 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 17, width: 28, height: 2, paletteNum: 15, baseBlock: 75 },
] as const;
export const sUsePokeblockYesNoWinTemplate = { bg: 0, tilemapLeft: 24, tilemapTop: 11, width: 5, height: 4, paletteNum: 15, baseBlock: 131 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 256 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 23, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_UpDown = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 1, paletteNum: 0 } as const;
export const sOam_Condition = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 1, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_UpDown = { tileTag: "TAG_UP_DOWN", paletteTag: "TAG_UP_DOWN", oam: "&sOam_UpDown", anims: "sAnims_UpDown", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Condition = { tileTag: "TAG_CONDITION", paletteTag: "TAG_CONDITION", oam: "&sOam_Condition", anims: "sAnims_Condition", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Condition" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sMonFrame_Gfx': { path: 'graphics/pokeblock/use_screen/mon_frame.png', ext: '.4bpp', type: 'u32' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sMonFrame_Pal': { path: 'graphics/pokeblock/use_screen/mon_frame_pal.bin', type: 'u32' },
  'sMonFrame_Tilemap': { path: 'graphics/pokeblock/use_screen/mon_frame.bin', type: 'u32' },
  'sGraphData_Tilemap': { path: 'graphics/pokeblock/use_screen/graph_data.bin', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sConditionNames = ['gText_Coolness', 'gText_Toughness', 'gText_Smartness', 'gText_Cuteness', 'gText_Beauty3'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "MainCallback", name: 'sExitCallback', isArray: false, init: "NULL" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gPokeblockMonId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gPokeblockGain', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadUsePokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_UsePokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToUsePokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ShowUsePokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ShowUsePokeblockMenuForResults', ret: "void", arity: 0, params: "void" },
  { name: 'ShowUsePokeblockMenuForResults', ret: "void", arity: 0, params: "void" },
  { name: 'LoadPartyInfo', ret: "void", arity: 0, params: "void" },
  { name: 'LoadAndCreateSelectionIcons', ret: "void", arity: 0, params: "void" },
  { name: 'GetSelectionIdFromPartyId', ret: "u8", arity: 1, params: "u8" },
  { name: 'LoadConditionTitle', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadUsePokeblockMenuGfx', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateMonPic', ret: "void", arity: 1, params: "u8" },
  { name: 'UpdateMonInfoText', ret: "void", arity: 2, params: "u16, bool8" },
  { name: 'UsePokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateSelection', ret: "void", arity: 1, params: "bool8" },
  { name: 'CloseUsePokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'AskUsePokeblock', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAskUsePokeblockInput', ret: "s8", arity: 0, params: "void" },
  { name: 'IsSheenMaxed', ret: "bool8", arity: 0, params: "void" },
  { name: 'PrintWontEatAnymore', ret: "void", arity: 0, params: "void" },
  { name: 'FeedPokeblockToMon', ret: "void", arity: 0, params: "void" },
  { name: 'EraseMenuWindow', ret: "void", arity: 0, params: "void" },
  { name: 'GetPartyIdFromSelectionId', ret: "u8", arity: 1, params: "u8" },
  { name: 'ShowPokeblockResults', ret: "void", arity: 0, params: "void" },
  { name: 'CalculateConditionEnhancements', ret: "void", arity: 0, params: "void" },
  { name: 'LoadAndCreateUpDownSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CalculateNumAdditionalSparkles', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintFirstEnhancement', ret: "void", arity: 0, params: "void" },
  { name: 'TryPrintNextEnhancement', ret: "bool8", arity: 0, params: "void" },
  { name: 'BufferEnhancedText', ret: "void", arity: 3, params: "u8 *, u8, s16" },
  { name: 'PrintMenuWindowText', ret: "void", arity: 1, params: "const u8 *" },
  { name: 'CalculatePokeblockEffectiveness', ret: "void", arity: 2, params: "struct Pokeblock *, struct Pokemon *" },
  { name: 'SpriteCB_UpDown', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'LoadInitialMonInfo', ret: "void", arity: 0, params: "void" },
  { name: 'LoadMonInfo', ret: "void", arity: 2, params: "s16, u8" },
  { name: 'LoadNewSelection_CancelToMon', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadNewSelection_MonToCancel', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadNewSelection_MonToMon', ret: "bool8", arity: 0, params: "void" },
  { name: 'SpriteCB_SelectionIconPokeball', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_SelectionIconCancel', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_MonPic', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Condition', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CB2_ReturnAndChooseMonToGivePokeblock', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_UsePokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'GetMonConditions', ret: "void", arity: 2, params: "struct Pokemon *mon, u8 *data" },
  { name: 'AddPokeblockToConditions', ret: "void", arity: 2, params: "struct Pokeblock *pokeblock, struct Pokemon *mon" },
  { name: 'GetPartyIdFromSelectionId_', ret: "UNUSED", arity: 1, params: "u8 selectionId" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "sprite, CONDITION_ICON_UNSELECTED" },
  { name: 'LoadConditionGfx', ret: "void", arity: 0, params: "void" },
  { name: 'CreateConditionSprite', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ReturnAndChooseMonToGivePokeblock',
  'CB2_ReturnToUsePokeblockMenu',
  'CB2_ShowUsePokeblockMenuForResults',
  'CB2_UsePokeblockMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'dma3.h',
  'pokeblock.h',
  'malloc.h',
  'decompress.h',
  'graphics.h',
  'palette.h',
  'pokenav.h',
  'menu_specialized.h',
  'scanline_effect.h',
  'text.h',
  'bg.h',
  'window.h',
  'text_window.h',
  'constants/rgb.h',
  'sound.h',
  'constants/songs.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'menu.h',
  'gpu_regs.h',
  'graphics.h',
  'pokemon_summary_screen.h',
  'item_menu.h',
] as const;
