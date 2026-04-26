// AUTO-GENERATED from src/pokeblock.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokeblock.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_MENU_ITEMS = 9;
/** Raw expr: `(MAX_MENU_ITEMS / 2)` */
export const MENU_MIDPOINT_EXPR = "(MAX_MENU_ITEMS / 2)";
export const TILE_HIGHLIGHT_NONE = 5;
export const TILE_HIGHLIGHT_BLUE = 4101;
export const TILE_HIGHLIGHT_RED = 8197;
export const TAG_POKEBLOCK_CASE = 14800;
export const TAG_SCROLL_ARROW = 1110;
export const POKEBLOCK_MAX_FEEL = 99;
/** Raw expr: `data[0]` */
export const tListTaskId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tWindowId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tToSwapId_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTimer_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_TITLE: 0,
  WIN_LIST: 1,
  WIN_SPICY: 2,
  WIN_DRY: 3,
  WIN_SWEET: 4,
  WIN_BITTER: 5,
  WIN_SOUR: 6,
  WIN_FEEL: 7,
  WIN_ACTIONS_TALL: 8,
  WIN_ACTIONS: 9,
  WIN_TOSS_MSG: 10,
} as const;
export const ENUM_PKBL_1 = {
  PKBL_USE_ON_FIELD: 0,
  PKBL_TOSS: 1,
  PKBL_CANCEL: 2,
  PKBL_USE_IN_BATTLE: 3,
  PKBL_USE_ON_FEEDER: 4,
  PKBL_GIVE_TO_LADY: 5,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 10, height: 2, paletteNum: 15, baseBlock: 30 },
  { bg: 0, tilemapLeft: 15, tilemapTop: 1, width: 14, height: 18, paletteNum: 15, baseBlock: 50 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 13, width: 5, height: 2, paletteNum: 15, baseBlock: 302 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 5, height: 2, paletteNum: 15, baseBlock: 312 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 17, width: 5, height: 2, paletteNum: 15, baseBlock: 322 },
  { bg: 0, tilemapLeft: 8, tilemapTop: 13, width: 5, height: 2, paletteNum: 15, baseBlock: 332 },
  { bg: 0, tilemapLeft: 8, tilemapTop: 15, width: 5, height: 2, paletteNum: 15, baseBlock: 342 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 17, width: 2, height: 2, paletteNum: 15, baseBlock: 352 },
  { bg: 1, tilemapLeft: 7, tilemapTop: 5, width: 6, height: 6, paletteNum: 15, baseBlock: 356 },
  { bg: 1, tilemapLeft: 7, tilemapTop: 7, width: 6, height: 4, paletteNum: 15, baseBlock: 392 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 416 },
] as const;
export const sTossPkblockWindowTemplate = { bg: 1, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: 15, baseBlock: 524 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplatesForPokeblockMenu = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 3, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_PokeblockCase = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_PokeblockCase = { tileTag: "TAG_POKEBLOCK_CASE", paletteTag: "TAG_POKEBLOCK_CASE", oam: "&sOamData_PokeblockCase", anims: "sSpriteAnimTable_PokeblockCase", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const gPokeblockNames = ['gText_RedPokeblock', 'gText_BluePokeblock', 'gText_PinkPokeblock', 'gText_GreenPokeblock', 'gText_YellowPokeblock', 'gText_PurplePokeblock', 'gText_IndigoPokeblock', 'gText_BrownPokeblock', 'gText_LiteBluePokeblock', 'gText_OlivePokeblock', 'gText_GrayPokeblock', 'gText_BlackPokeblock', 'gText_WhitePokeblock', 'gText_GoldPokeblock'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct PokeblockSavedData", name: 'sSavedPokeblockData', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_InitPokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'InitPokeblockMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadPokeblockMenuGfx', ret: "bool8", arity: 0, params: "void" },
  { name: 'HandleInitBackgrounds', ret: "void", arity: 0, params: "void" },
  { name: 'HandleInitWindows', ret: "void", arity: 0, params: "void" },
  { name: 'SetMenuItemsCountAndMaxShowed', ret: "void", arity: 0, params: "void" },
  { name: 'LimitMenuScrollAndRow', ret: "void", arity: 0, params: "void" },
  { name: 'SetInitialScroll', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePokeblockList', ret: "void", arity: 0, params: "void" },
  { name: 'CreateScrollArrows', ret: "void", arity: 0, params: "void" },
  { name: 'MovePokeblockMenuCursor', ret: "void", arity: 3, params: "s32, bool8, struct ListMenu *" },
  { name: 'DrawPokeblockMenuTitleText', ret: "void", arity: 0, params: "void" },
  { name: 'DrawPokeblockMenuHighlight', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'PutPokeblockListMenuString', ret: "void", arity: 2, params: "u8 *, u16" },
  { name: 'Task_HandlePokeblockMenuInput', ret: "void", arity: 1, params: "u8" },
  { name: 'PokeblockAction_UseOnField', ret: "void", arity: 1, params: "u8" },
  { name: 'PokeblockAction_Toss', ret: "void", arity: 1, params: "u8" },
  { name: 'PokeblockAction_Cancel', ret: "void", arity: 1, params: "u8" },
  { name: 'PokeblockAction_UseInBattle', ret: "void", arity: 1, params: "u8" },
  { name: 'PokeblockAction_UseOnPokeblockFeeder', ret: "void", arity: 1, params: "u8" },
  { name: 'PokeblockAction_GiveToContestLady', ret: "void", arity: 1, params: "u8" },
  { name: 'TossedPokeblockMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'CloseTossPokeblockWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FreeDataAndExitPokeblockCase', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandlePokeblockActionsInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowPokeblockActionsWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandlePokeblocksSwapInput', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_ShakePokeblockCase', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DrawPokeblockInfo', ret: "void", arity: 1, params: "s32" },
  { name: 'UpdatePokeblockSwapMenu', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'UsePokeblockOnField', ret: "void", arity: 0, params: "void" },
  { name: 'ReturnToPokeblockCaseOnField', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTossPokeblockYesNoMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'TossPokeblock', ret: "void", arity: 1, params: "u8" },
  { name: 'OpenPokeblockCaseInBattle', ret: "void", arity: 0, params: "void" },
  { name: 'OpenPokeblockCaseOnFeeder', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_PokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_PokeblockMenu', ret: "void", arity: 0, params: "void" },
  { name: 'PrintOnPokeblockWindow', ret: "void", arity: 3, params: "u8 windowId, const u8 *string, s32 x" },
  { name: 'CompactPokeblockSlots', ret: "void", arity: 0, params: "void" },
  { name: 'SwapPokeblockMenuItems', ret: "void", arity: 2, params: "u32 id1, u32 id2" },
  { name: 'ResetPokeblockScrollPositions', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyScrollArrows', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePokeblockCaseSprite', ret: "u8", arity: 3, params: "s16 x, s16 y, u8 subpriority" },
  { name: 'FadePaletteAndSetTaskToClosePokeblockCase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetMainCallback2', ret: "else", arity: 1, params: "sSavedPokeblockData.callback" },
  { name: 'ClearPokeblock', ret: "void", arity: 1, params: "u8 pkblId" },
  { name: 'ClearPokeblocks', ret: "void", arity: 0, params: "void" },
  { name: 'GetHighestPokeblocksFlavorLevel', ret: "u8", arity: 1, params: "const struct Pokeblock *pokeblock" },
  { name: 'GetPokeblocksFeel', ret: "u8", arity: 1, params: "const struct Pokeblock *pokeblock" },
  { name: 'GetFirstFreePokeblockSlot', ret: "s8", arity: 0, params: "void" },
  { name: 'AddPokeblock', ret: "bool32", arity: 1, params: "const struct Pokeblock *pokeblock" },
  { name: 'TryClearPokeblock', ret: "bool32", arity: 1, params: "u8 pkblId" },
  { name: 'GetPokeblockData', ret: "s16", arity: 2, params: "const struct Pokeblock *pokeblock, u8 field" },
  { name: 'PokeblockGetGain', ret: "s16", arity: 2, params: "u8 nature, const struct Pokeblock *pokeblock" },
  { name: 'PokeblockCopyName', ret: "void", arity: 2, params: "const struct Pokeblock *pokeblock, u8 *dest" },
  { name: 'CopyMonFavoritePokeblockName', ret: "bool8", arity: 2, params: "u8 nature, u8 *dest" },
  { name: 'GetPokeblocksFlavor', ret: "u8", arity: 1, params: "const struct Pokeblock *pokeblock" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_FreeDataAndExitPokeblockCase',
  'Task_HandlePokeblockActionsInput',
  'Task_HandlePokeblockMenuInput',
  'Task_HandlePokeblocksSwapInput',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitPokeblockMenu',
  'CB2_PokeblockMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_controllers.h',
  'battle_message.h',
  'bg.h',
  'decompress.h',
  'event_data.h',
  'field_screen_effect.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'item.h',
  'item_menu.h',
  'lilycove_lady.h',
  'list_menu.h',
  'main.h',
  'menu.h',
  'menu_helpers.h',
  'overworld.h',
  'palette.h',
  'pokeblock.h',
  'pokemon.h',
  'safari_zone.h',
  'scanline_effect.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'text_window.h',
  'constants/items.h',
  'constants/songs.h',
  'constants/rgb.h',
] as const;
