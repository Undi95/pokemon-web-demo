// AUTO-GENERATED from src/battle_pyramid_bag.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_pyramid_bag.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_SCROLL_ARROW = 2910;
export const TAG_PYRAMID_BAG = 4132;
export const TAG_ITEM_ICON = 4133;
export const TAG_ITEM_ICON_ALT = 4134;
/** Raw expr: `((u8)-1)` */
export const POS_NONE_EXPR = "((u8)-1)";
/** Raw expr: `data[0]` */
export const tListTaskId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tListPos_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tQuantity_EXPR = "data[2]";
/** Raw expr: `data[8]` */
export const tNumToToss_EXPR = "data[8]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_LIST: 0,
  WIN_INFO: 1,
  WIN_MSG: 2,
  WIN_TOSS_NUM: 3,
} as const;
export const ENUM_ACTION_1 = {
  ACTION_USE_FIELD: 0,
  ACTION_TOSS: 1,
  ACTION_GIVE: 2,
  ACTION_CANCEL: 3,
  ACTION_USE_BATTLE: 4,
  ACTION_DUMMY: 5,
} as const;
export const ENUM_COLORID_2 = {
  COLORID_DARK_GRAY: 0,
  COLORID_LIGHT_GRAY: 1,
  COLORID_WHITE_BG: 2,
  COLORID_NONE: 255,
} as const;
export const ENUM_MENU_3 = {
  MENU_WIN_1x1: 0,
  MENU_WIN_1x2: 1,
  MENU_WIN_2x2: 2,
  MENU_WIN_2x3: 3,
  MENU_WIN_YESNO: 4,
} as const;
export const ENUM_ANIM_4 = {
  ANIM_BAG_STILL: 0,
  ANIM_BAG_SHAKE: 1,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 14, tilemapTop: 2, width: 15, height: 16, paletteNum: 15, baseBlock: 30 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 13, width: 14, height: 6, paletteNum: 15, baseBlock: 270 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 354 },
  { bg: 1, tilemapLeft: 24, tilemapTop: 17, width: 5, height: 2, paletteNum: 15, baseBlock: 462 },
] as const;
export const sWindowTemplates_MenuActions = [
  { bg: 1, tilemapLeft: 22, tilemapTop: 17, width: 7, height: 2, paletteNum: 15, baseBlock: 472 },
  { bg: 1, tilemapLeft: 22, tilemapTop: 15, width: 7, height: 4, paletteNum: 15, baseBlock: 472 },
  { bg: 1, tilemapLeft: 15, tilemapTop: 15, width: 14, height: 4, paletteNum: 15, baseBlock: 472 },
  { bg: 1, tilemapLeft: 15, tilemapTop: 13, width: 14, height: 6, paletteNum: 15, baseBlock: 472 },
  { bg: 1, tilemapLeft: 24, tilemapTop: 15, width: 5, height: 4, paletteNum: 15, baseBlock: 472 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 3, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_PyramidBag = { y: 0, affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_PyramidBag = { tileTag: "TAG_PYRAMID_BAG", paletteTag: "TAG_PYRAMID_BAG", oam: "&sOamData_PyramidBag", anims: "sAnims_PyramidBag", images: 0, affineAnims: "sAffineAnims_PyramidBag", callback: "SpriteCallbackDummy" } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct PyramidBagMenuState", name: 'gPyramidBagMenuState', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_HandlePyramidBagInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ChooseItemsToTossFromPyramidBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ClosePyramidBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BeginItemSwap', ret: "void", arity: 1, params: "u8" },
  { name: 'OpenContextMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'TryCloseBagToGiveItem', ret: "void", arity: 1, params: "u8" },
  { name: 'HandleMenuActionInput_2x2', ret: "void", arity: 1, params: "u8" },
  { name: 'HandleMenuActionInput_SingleRow', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitCloseErrorMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'SetTaskToMainPyramidBagInputHandler', ret: "void", arity: 1, params: "u8" },
  { name: 'AskConfirmToss', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ChooseHowManyToToss', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TossItem', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowCantHoldMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'PerformItemSwap', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemSwapHandleInput', ret: "void", arity: 1, params: "u8" },
  { name: 'CancelItemSwap', ret: "void", arity: 1, params: "u8" },
  { name: 'SetBagItemsListTemplate', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_LoadPyramidBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'InitPyramidBagBgs', ret: "void", arity: 0, params: "void" },
  { name: 'AddScrollArrows', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePyramidBagInputTask', ret: "void", arity: 0, params: "void" },
  { name: 'InitPyramidBagScroll', ret: "void", arity: 0, params: "void" },
  { name: 'InitPyramidBagWindows', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePyramidBagSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSwapLine', ret: "void", arity: 0, params: "void" },
  { name: 'LoadPyramidBagPalette', ret: "void", arity: 0, params: "void" },
  { name: 'ShakePyramidBag', ret: "void", arity: 0, params: "void" },
  { name: 'ShowNumToToss', ret: "void", arity: 0, params: "void" },
  { name: 'CloseBattlePyramidBagTextWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadPyramidBagGfx', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadPyramidBagMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowItemIcon', ret: "void", arity: 2, params: "u16, u8" },
  { name: 'CopyBagItemName', ret: "void", arity: 2, params: "u8 *, u16" },
  { name: 'FreeItemIconSpriteByAltId', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintItemDescription', ret: "void", arity: 1, params: "s32" },
  { name: 'PrintSelectorArrowAtPos', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'PyramidBagPrint', ret: "void", arity: 8, params: "u8, const u8 *, u8, u8, u8, u8, u8, u8" },
  { name: 'PyramidBagPrint_Quantity', ret: "void", arity: 8, params: "u8, const u8 *, u8, u8, u8, u8, u8, u8" },
  { name: 'OpenMenuActionWindowById', ret: "u8", arity: 1, params: "u8" },
  { name: 'CloseMenuActionWindowById', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintMenuActionText_SingleRow', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintMenuActionText_MultiRow', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'IsValidMenuAction', ret: "bool8", arity: 1, params: "s8" },
  { name: 'CreatePyramidBagYesNo', ret: "void", arity: 2, params: "u8, const struct YesNoFuncTable *" },
  { name: 'DrawTossNumberWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'UpdateSwapLinePos', ret: "void", arity: 1, params: "u8" },
  { name: 'SetSwapLineInvisibility', ret: "void", arity: 1, params: "bool8" },
  { name: 'SpriteCB_BagWaitForShake', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'BagAction_UseOnField', ret: "void", arity: 1, params: "u8" },
  { name: 'BagAction_Toss', ret: "void", arity: 1, params: "u8" },
  { name: 'BagAction_Give', ret: "void", arity: 1, params: "u8" },
  { name: 'BagAction_Cancel', ret: "void", arity: 1, params: "u8" },
  { name: 'BagAction_UseInBattle', ret: "void", arity: 1, params: "u8" },
  { name: 'BagCursorMoved', ret: "void", arity: 3, params: "s32, bool8, struct ListMenu *" },
  { name: 'PrintItemQuantity', ret: "void", arity: 3, params: "u8 windowId, u32 itemId, u8 y" },
  { name: 'TossItem', ret: "void", arity: 1, params: "u8" },
  { name: 'DontTossItem', ret: "void", arity: 1, params: "u8" },
  { name: 'InitBattlePyramidBagCursorPosition', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_PyramidBagMenuFromStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'OpenBattlePyramidBagInBattle', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'ChooseItemsToTossFromPyramidBag', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToPyramidBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'GoToBattlePyramidBagMenu', ret: "void", arity: 2, params: "u8 location, MainCallback exitCallback" },
  { name: 'CB2_PyramidBag', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_PyramidBag', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveScrollArrow', ret: "void", arity: 0, params: "void" },
  { name: 'SwapItems', ret: "void", arity: 2, params: "u8 id1, u8 id2" },
  { name: 'MovePyramidBagItemSlotInList', ret: "void", arity: 2, params: "u8 from, u8 to" },
  { name: 'CompactItems', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePyramidBagList', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePyramidBagCursorPos', ret: "void", arity: 0, params: "void" },
  { name: 'PrintSelectorArrow', ret: "void", arity: 2, params: "u8 listMenuTaskId, u8 colorId" },
  { name: 'CloseBattlePyramidBag', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetMainCallback2', ret: "else", arity: 1, params: "gPyramidBagMenuState.exitCallback" },
  { name: 'CloseMenuActionWindow', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateNumToToss', ret: "void", arity: 1, params: "s16 num" },
  { name: 'Task_CloseBattlePyramidBagMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TryStoreHeldItemsInPyramidBag', ret: "void", arity: 0, params: "void" },
  { name: 'GetMenuActionWindowId', ret: "UNUSED", arity: 1, params: "u8 windowArrayId" },
  { name: 'DisplayItemMessageInBattlePyramid', ret: "void", arity: 3, params: "u8 taskId, const u8 *str, TaskFunc callback" },
  { name: 'FreeItemIconSprite', ret: "void", arity: 1, params: "u8 spriteArrId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BeginItemSwap',
  'Task_ChooseHowManyToToss',
  'Task_ChooseItemsToTossFromPyramidBag',
  'Task_CloseBattlePyramidBagMessage',
  'Task_ClosePyramidBag',
  'Task_HandlePyramidBagInput',
  'Task_ItemSwapHandleInput',
  'Task_TossItem',
  'Task_WaitCloseErrorMessage',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_LoadPyramidBagMenu',
  'CB2_PyramidBag',
  'CB2_PyramidBagMenuFromStartMenu',
  'CB2_ReturnToPyramidBagMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_controllers.h',
  'battle_pyramid_bag.h',
  'bg.h',
  'decompress.h',
  'event_data.h',
  'field_effect.h',
  'field_weather.h',
  'graphics.h',
  'gpu_regs.h',
  'international_string_util.h',
  'item.h',
  'item_icon.h',
  'item_menu.h',
  'item_use.h',
  'list_menu.h',
  'mail.h',
  'malloc.h',
  'menu.h',
  'menu_helpers.h',
  'overworld.h',
  'palette.h',
  'party_menu.h',
  'task.h',
  'text_window.h',
  'scanline_effect.h',
  'script.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'constants/items.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
