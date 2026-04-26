// AUTO-GENERATED from src/menu_helpers.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/menu_helpers.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_SWAP_LINE = 109;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_SwapLine = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_SwapLine = { tileTag: "TAG_SWAP_LINE", paletteTag: "TAG_SWAP_LINE", oam: "&sOamData_SwapLine", anims: "sAnims_SwapLine", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct YesNoFuncTable", name: 'sYesNo', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sMessageWindowId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_ContinueTaskAfterMessagePrints', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_CallYesOrNoCallback', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ResetVramOamAndBgCntRegs', ret: "void", arity: 0, params: "void" },
  { name: 'ResetAllBgsCoordinates', ret: "void", arity: 0, params: "void" },
  { name: 'SetVBlankHBlankCallbacksToNull', ret: "void", arity: 0, params: "void" },
  { name: 'DisplayMessageAndContinueTask', ret: "void", arity: 8, params: "u8 taskId, u8 windowId, u16 tileNum, u8 paletteNum, u8 fontId, u8 textSpeed, const u8 *string, void *taskFunc" },
  { name: 'RunTextPrintersRetIsActive', ret: "bool16", arity: 1, params: "u8 textPrinterId" },
  { name: 'DoYesNoFuncWithChoice', ret: "void", arity: 2, params: "u8 taskId, const struct YesNoFuncTable *data" },
  { name: 'CreateYesNoMenuWithCallbacks', ret: "void", arity: 8, params: "u8 taskId, const struct WindowTemplate *template, u8 unused1, u8 unused2, u8 unused3, u16 tileStart, u8 palette, const struct YesNoFuncTable *yesNo" },
  { name: 'AdjustQuantityAccordingToDPadInput', ret: "bool8", arity: 2, params: "s16 *quantity, u16 max" },
  { name: 'GetLRKeysPressed', ret: "u8", arity: 0, params: "void" },
  { name: 'GetLRKeysPressedAndHeld', ret: "u8", arity: 0, params: "void" },
  { name: 'IsHoldingItemAllowed', ret: "bool8", arity: 1, params: "u16 itemId" },
  { name: 'IsWritingMailAllowed', ret: "bool8", arity: 1, params: "u16 itemId" },
  { name: 'MenuHelpers_IsLinkActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsActiveOverworldLinkBusy', ret: "bool8", arity: 0, params: "void" },
  { name: 'MenuHelpers_ShouldWaitForLinkRecv', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetItemListPerPageCount', ret: "void", arity: 5, params: "struct ItemSlot *slots, u8 slotsCount, u8 *pageItems, u8 *totalItems, u8 maxPerPage" },
  { name: 'SetCursorWithinListBounds', ret: "void", arity: 4, params: "u16 *scrollOffset, u16 *cursorPos, u8 maxShownItems, u8 totalItems" },
  { name: 'SetCursorScrollWithinListBounds', ret: "void", arity: 5, params: "u16 *scrollOffset, u16 *cursorPos, u8 shownItems, u8 totalItems, u8 maxShownItems" },
  { name: 'LoadListMenuSwapLineGfx', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSwapLineSprites', ret: "void", arity: 2, params: "u8 *spriteIds, u8 count" },
  { name: 'DestroySwapLineSprites', ret: "void", arity: 2, params: "u8 *spriteIds, u8 count" },
  { name: 'DestroySprite', ret: "else", arity: 1, params: "&gSprites[spriteIds[i]]" },
  { name: 'SetSwapLineSpritesInvisibility', ret: "void", arity: 3, params: "u8 *spriteIds, u8 count, bool8 invisible" },
  { name: 'UpdateSwapLineSpritesPos', ret: "void", arity: 4, params: "u8 *spriteIds, u8 count, s16 x, u16 y" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CallYesOrNoCallback',
  'Task_ContinueTaskAfterMessagePrints',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'task.h',
  'window.h',
  'menu.h',
  'menu_helpers.h',
  'gpu_regs.h',
  'bg.h',
  'main.h',
  'text.h',
  'graphics.h',
  'link.h',
  'string_util.h',
  'sound.h',
  'mail.h',
  'overworld.h',
  'decompress.h',
  'constants/songs.h',
  'constants/items.h',
] as const;
