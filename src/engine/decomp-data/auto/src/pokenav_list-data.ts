// AUTO-GENERATED from src/pokenav_list.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_list.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GFXTAG_ARROW = 10;
export const PALTAG_ARROW = 20;
/** Raw expr: `data[0]` */
export const sTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sOffset_EXPR = "data[1]";
/** Raw expr: `data[7]` */
export const sInvisible_EXPR = "data[7]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_RightArrow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x16)", x: 0, size: "SPRITE_SIZE(8x16)", tileNum: 0, priority: 2, paletteNum: 0 } as const;
export const sOamData_UpDownArrow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x8)", x: 0, size: "SPRITE_SIZE(16x8)", tileNum: 0, priority: 2, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_RightArrow = { tileTag: "GFXTAG_ARROW", paletteTag: "PALTAG_ARROW", oam: "&sOamData_RightArrow", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_RightArrow" } as const;
export const sSpriteTemplate_UpDownArrow = { tileTag: "GFXTAG_ARROW", paletteTag: "PALTAG_ARROW", oam: "&sOamData_UpDownArrow", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sListArrowSpriteSheets = { data: "sListArrow_Gfx", size: 192, tag: "GFXTAG_ARROW" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sListArrowPalettes = { data: "sListArrow_Pal", tag: "PALTAG_ARROW" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sListArrow_Pal': { path: 'graphics/pokenav/list_arrows.png', ext: '.gbapal', type: 'u16' },
  'sListArrow_Gfx': { path: 'graphics/pokenav/list_arrows.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const fieldNames = ['gText_PokenavMatchCall_Strategy', 'gText_PokenavMatchCall_TrainerPokemon', 'gText_PokenavMatchCall_SelfIntroduction'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u32", name: 'sMoveWindowDownIndex', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitPokenavListBg', ret: "void", arity: 1, params: "struct PokenavList *" },
  { name: 'CopyPokenavListMenuTemplate', ret: "bool32", arity: 4, params: "struct PokenavListSub *, const struct BgTemplate *, struct PokenavListTemplate *, s32" },
  { name: 'InitPokenavListWindowState', ret: "void", arity: 2, params: "struct PokenavListWindowState *, struct PokenavListTemplate *" },
  { name: 'SpriteCB_UpArrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DownArrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_RightArrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'ToggleListArrows', ret: "void", arity: 2, params: "struct PokenavListSub *, bool32" },
  { name: 'DestroyListArrows', ret: "void", arity: 1, params: "struct PokenavListSub *" },
  { name: 'CreateListArrowSprites', ret: "void", arity: 2, params: "struct PokenavListWindowState *, struct PokenavListSub *" },
  { name: 'LoadListArrowGfx', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMatchCallFlavorText', ret: "void", arity: 3, params: "struct PokenavListWindowState *, struct PokenavListSub *, u32" },
  { name: 'PrintMatchCallFieldNames', ret: "void", arity: 2, params: "struct PokenavListSub *, u32" },
  { name: 'PrintMatchCallListTrainerName', ret: "void", arity: 2, params: "struct PokenavListWindowState *, struct PokenavListSub *" },
  { name: 'PrintCheckPageTrainerName', ret: "void", arity: 2, params: "struct PokenavListWindowState *, struct PokenavListSub *" },
  { name: 'EraseListEntry', ret: "void", arity: 3, params: "struct PokenavListMenuWindow *, s32, s32" },
  { name: 'CreateMoveListWindowTask', ret: "void", arity: 2, params: "s32, struct PokenavListSub *" },
  { name: 'PrintListItems', ret: "void", arity: 6, params: "void *, u32, u32, u32, u32, struct PokenavListSub *" },
  { name: 'InitListItems', ret: "void", arity: 2, params: "struct PokenavListWindowState *, struct PokenavListSub *" },
  { name: 'InitPokenavListWindow', ret: "void", arity: 1, params: "struct PokenavListMenuWindow *" },
  { name: 'LoopedTask_CreatePokenavList', ret: "u32", arity: 1, params: "s32" },
  { name: 'IsPrintListItemsTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoopedTask_PrintListItems', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_MoveListWindow', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_EraseListForCheckPage', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ReshowListFromCheckPage', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_PrintCheckPageInfo', ret: "u32", arity: 1, params: "s32" },
  { name: 'CreatePokenavList', ret: "bool32", arity: 3, params: "const struct BgTemplate *bgTemplate, struct PokenavListTemplate *listTemplate, s32 tileOffset" },
  { name: 'IsCreatePokenavListTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'DestroyPokenavList', ret: "void", arity: 0, params: "void" },
  { name: 'CopyWindowToVram', ret: "else", arity: 2, params: "listSub->listWindow.windowId, COPYWIN_GFX" },
  { name: 'ShouldShowUpArrow', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldShowDownArrow', ret: "bool32", arity: 0, params: "void" },
  { name: 'MoveListWindow', ret: "void", arity: 2, params: "s32 delta, bool32 printItems" },
  { name: 'PokenavList_IsMoveWindowTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavList_MoveCursorUp', ret: "int", arity: 0, params: "void" },
  { name: 'PokenavList_MoveCursorDown', ret: "int", arity: 0, params: "void" },
  { name: 'PokenavList_PageUp', ret: "int", arity: 0, params: "void" },
  { name: 'PokenavList_PageDown', ret: "int", arity: 0, params: "void" },
  { name: 'PokenavList_GetSelectedIndex', ret: "u32", arity: 0, params: "void" },
  { name: 'PokenavList_GetTopIndex', ret: "u32", arity: 0, params: "void" },
  { name: 'PokenavList_EraseListForCheckPage', ret: "void", arity: 0, params: "void" },
  { name: 'PrintCheckPageInfo', ret: "void", arity: 1, params: "s16 delta" },
  { name: 'PokenavList_ReshowListFromCheckPage', ret: "void", arity: 0, params: "void" },
  { name: 'PokenavList_IsTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavList_DrawCurrentItemIcon', ret: "void", arity: 0, params: "void" },
  { name: 'SetListMarginTile', ret: "void", arity: 2, params: "struct PokenavListMenuWindow *listWindow, bool32 draw" },
  { name: 'PokenavList_ToggleVerticalArrows', ret: "void", arity: 1, params: "bool32 invisible" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'pokenav.h',
  'window.h',
  'strings.h',
  'text.h',
  'bg.h',
  'menu.h',
  'decompress.h',
  'international_string_util.h',
] as const;
