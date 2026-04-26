// AUTO-GENERATED from src/pokedex.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokedex.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_SEARCH_PARAM_ON_SCREEN = 6;
/** Raw expr: `(MAX_SEARCH_PARAM_ON_SCREEN - 1)` */
export const MAX_SEARCH_PARAM_CURSOR_POS_EXPR = "(MAX_SEARCH_PARAM_ON_SCREEN - 1)";
export const MAX_MONS_ON_SCREEN = 4;
export const LIST_SCROLL_STEP = 16;
export const POKEBALL_ROTATION_TOP = 64;
/** Raw expr: `(POKEBALL_ROTATION_TOP - 16)` */
export const POKEBALL_ROTATION_BOTTOM_EXPR = "(POKEBALL_ROTATION_TOP - 16)";
export const MON_PAGE_X = 48;
export const MON_PAGE_Y = 56;
export const TAG_DEX_INTERFACE = 4096;
/** Raw expr: `data[0]` */
export const tLoadScreenTaskId_EXPR = "data[0]";
/** Raw expr: `vars[0]` */
export const temp_dexCount_EXPR = "vars[0]";
/** Raw expr: `vars[1]` */
export const temp_isHoennDex_EXPR = "vars[1]";
/** Raw expr: `vars[2]` */
export const temp_dexNum_EXPR = "vars[2]";
/** Raw expr: `data[1]` */
export const sIsDownArrow_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tScrolling_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMonSpriteDone_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBgLoaded_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tSkipCry_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tMonSpriteId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tTrainerSpriteId_EXPR = "data[5]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tDexNum_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tPalTimer_EXPR = "data[2]";
/** Raw expr: `data[12]` */
export const tOtIdLo_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tOtIdHi_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tPersonalityLo_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tPersonalityHi_EXPR = "data[15]";
export const FOOTPRINT_COLOR_IDX = 2;
export const NUM_FOOTPRINT_TILES = 4;
/** Raw expr: `data[0]` */
export const tTopBarItem_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMenuItem_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCursorPos_Mode_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tScrollOffset_Mode_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tCursorPos_Order_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tScrollOffset_Order_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tCursorPos_Name_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tScrollOffset_Name_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tCursorPos_Color_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tScrollOffset_Color_EXPR = "data[9]";
/** Raw expr: `data[10]` */
export const tCursorPos_TypeLeft_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tScrollOffset_TypeLeft_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tCursorPos_TypeRight_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tScrollOffset_TypeRight_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tCursorPos_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tScrollOffset_EXPR = "data[15]";
/** Raw expr: `SEARCH_TOPBAR_SEARCH` */
export const SEARCH_BG_SEARCH_EXPR = "SEARCH_TOPBAR_SEARCH";
/** Raw expr: `SEARCH_TOPBAR_SHIFT` */
export const SEARCH_BG_SHIFT_EXPR = "SEARCH_TOPBAR_SHIFT";
/** Raw expr: `SEARCH_TOPBAR_CANCEL` */
export const SEARCH_BG_CANCEL_EXPR = "SEARCH_TOPBAR_CANCEL";
/** Raw expr: `(SEARCH_NAME + SEARCH_TOPBAR_COUNT)` */
export const SEARCH_BG_NAME_EXPR = "(SEARCH_NAME + SEARCH_TOPBAR_COUNT)";
/** Raw expr: `(SEARCH_COLOR + SEARCH_TOPBAR_COUNT)` */
export const SEARCH_BG_COLOR_EXPR = "(SEARCH_COLOR + SEARCH_TOPBAR_COUNT)";
/** Raw expr: `(SEARCH_TYPE_LEFT + SEARCH_TOPBAR_COUNT)` */
export const SEARCH_BG_TYPE_SELECTION_LEFT_EXPR = "(SEARCH_TYPE_LEFT + SEARCH_TOPBAR_COUNT)";
/** Raw expr: `(SEARCH_TYPE_RIGHT + SEARCH_TOPBAR_COUNT)` */
export const SEARCH_BG_TYPE_SELECTION_RIGHT_EXPR = "(SEARCH_TYPE_RIGHT + SEARCH_TOPBAR_COUNT)";
/** Raw expr: `(SEARCH_ORDER + SEARCH_TOPBAR_COUNT)` */
export const SEARCH_BG_ORDER_EXPR = "(SEARCH_ORDER + SEARCH_TOPBAR_COUNT)";
/** Raw expr: `(SEARCH_MODE + SEARCH_TOPBAR_COUNT)` */
export const SEARCH_BG_MODE_EXPR = "(SEARCH_MODE + SEARCH_TOPBAR_COUNT)";
/** Raw expr: `(SEARCH_OK + SEARCH_TOPBAR_COUNT)` */
export const SEARCH_BG_OK_EXPR = "(SEARCH_OK + SEARCH_TOPBAR_COUNT)";
/** Raw expr: `(SEARCH_COUNT + SEARCH_TOPBAR_COUNT)` */
export const SEARCH_BG_TYPE_TITLE_EXPR = "(SEARCH_COUNT + SEARCH_TOPBAR_COUNT)";
/** Raw expr: `data[0]` */
export const sTaskId_EXPR = "data[0]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PAGE_0 = {
  PAGE_MAIN: 0,
  PAGE_INFO: 1,
  PAGE_SEARCH: 2,
  PAGE_SEARCH_RESULTS: 3,
  PAGE_UNK: 4,
  PAGE_AREA: 5,
  PAGE_CRY: 6,
  PAGE_SIZE: 7,
} as const;
export const ENUM_AREA_1 = {
  AREA_SCREEN: 0,
  CRY_SCREEN: 1,
  SIZE_SCREEN: 2,
  CANCEL_SCREEN: 3,
  SCREEN_COUNT: 4,
} as const;
export const ENUM_SEARCH_2 = {
  SEARCH_NAME: 0,
  SEARCH_COLOR: 1,
  SEARCH_TYPE_LEFT: 2,
  SEARCH_TYPE_RIGHT: 3,
  SEARCH_ORDER: 4,
  SEARCH_MODE: 5,
  SEARCH_OK: 6,
  SEARCH_COUNT: 7,
} as const;
export const ENUM_SEARCH_3 = {
  SEARCH_TOPBAR_SEARCH: 0,
  SEARCH_TOPBAR_SHIFT: 1,
  SEARCH_TOPBAR_CANCEL: 2,
  SEARCH_TOPBAR_COUNT: 3,
} as const;
export const ENUM_ORDER_4 = {
  ORDER_NUMERICAL: 0,
  ORDER_ALPHABETICAL: 1,
  ORDER_HEAVIEST: 2,
  ORDER_LIGHTEST: 3,
  ORDER_TALLEST: 4,
  ORDER_SMALLEST: 5,
} as const;
export const ENUM_NAME_5 = {
  NAME_ABC: 1,
  NAME_DEF: 2,
  NAME_GHI: 3,
  NAME_JKL: 4,
  NAME_MNO: 5,
  NAME_PQR: 6,
  NAME_STU: 7,
  NAME_VWX: 8,
  NAME_YZ: 9,
} as const;
export const ENUM_WIN_6 = {
  WIN_INFO: 0,
  WIN_FOOTPRINT: 1,
  WIN_CRY_WAVE: 2,
  WIN_VU_METER: 3,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sPokemonList_WindowTemplate = { bg: 2, tilemapLeft: 0, tilemapTop: 0, width: 32, height: 32, paletteNum: 0, baseBlock: 1 } as const;
export const sInfoScreen_WindowTemplates = [
  { bg: 2, tilemapLeft: 0, tilemapTop: 0, width: 32, height: 20, paletteNum: 0, baseBlock: 1 },
  { bg: 2, tilemapLeft: 25, tilemapTop: 8, width: 2, height: 2, paletteNum: 15, baseBlock: 641 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 12, width: 32, height: 7, paletteNum: 8, baseBlock: 645 },
  { bg: 2, tilemapLeft: 18, tilemapTop: 3, width: 10, height: 8, paletteNum: 9, baseBlock: 869 },
] as const;
export const sNewEntryInfoScreen_WindowTemplates = [
  { bg: 2, tilemapLeft: 0, tilemapTop: 0, width: 32, height: 20, paletteNum: 0, baseBlock: 1 },
  { bg: 2, tilemapLeft: 25, tilemapTop: 8, width: 2, height: 2, paletteNum: 15, baseBlock: 641 },
] as const;
export const sSearchMenu_WindowTemplate = { bg: 2, tilemapLeft: 0, tilemapTop: 0, width: 32, height: 20, paletteNum: 0, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sPokedex_BgTemplate = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;
export const sInfoScreen_BgTemplate = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;
export const sNewEntryInfoScreen_BgTemplate = [
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 1, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;
export const sSearchMenu_BgTemplate = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_ScrollBar = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_ScrollArrow = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_InterfaceText = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_RotatingPokeBall = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_WINDOW", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_SeenOwnText = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Dex8x16 = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sScrollBarSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_ScrollBar", anims: "sSpriteAnimTable_ScrollBar", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Scrollbar" } as const;
export const sScrollArrowSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_ScrollArrow", anims: "sSpriteAnimTable_ScrollArrow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ScrollArrow" } as const;
export const sInterfaceTextSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_InterfaceText", anims: "sSpriteAnimTable_InterfaceText", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_DexListInterfaceText" } as const;
export const sRotatingPokeBallSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_RotatingPokeBall", anims: "sSpriteAnimTable_RotatingPokeBall", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_RotatingPokeBall" } as const;
export const sSeenOwnTextSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_SeenOwnText", anims: "sSpriteAnimTable_SeenOwnText", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SeenOwnInfo" } as const;
export const sHoennNationalTextSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_InterfaceText", anims: "sSpriteAnimTable_HoennNationalText", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SeenOwnInfo" } as const;
export const sHoennDexSeenOwnNumberSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_Dex8x16", anims: "sSpriteAnimTable_HoennSeenOwnNumber", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SeenOwnInfo" } as const;
export const sNationalDexSeenOwnNumberSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_Dex8x16", anims: "sSpriteAnimTable_NationalSeenOwnNumber", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SeenOwnInfo" } as const;
export const sDexListStartMenuCursorSpriteTemplate = { tileTag: "TAG_DEX_INTERFACE", paletteTag: "TAG_DEX_INTERFACE", oam: "&sOamData_Dex8x16", anims: "sSpriteAnimTable_DexListStartMenuCursor", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_DexListStartMenuCursor" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sCaughtBall_Gfx': { path: 'graphics/pokedex/caught_ball.png', ext: '.4bpp', type: 'u8' },
  'sSizeScreenSilhouette_Pal': { path: 'graphics/pokedex/size_silhouette.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sScrollMonIncrements: readonly number[] = [4,8,16,32,32] as const;
export const sScrollTimers: readonly number[] = [8,4,2,1,1] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'sLastSelectedPokemon', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sPokeBallRotation', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gUnusedPokedexU8', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_Pokedex', ret: "void", arity: 0, params: "void" },
  { name: 'Task_OpenPokedexMainPage', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandlePokedexInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForScroll', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandlePokedexStartMenuInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_OpenInfoScreenAfterMonMovement', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForExitInfoScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForExitSearch', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ClosePokedex', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_OpenSearchResults', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleSearchResultsInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForSearchResultsScroll', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleSearchResultsStartMenuInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_OpenSearchResultsInfoScreenAfterMonMovement', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForExitSearchResultsInfoScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ReturnToPokedexFromSearchResults', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ClosePokedexFromSearchResultsStartMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadPokedexListPage', ret: "bool8", arity: 1, params: "u8" },
  { name: 'LoadPokedexBgPalette', ret: "void", arity: 1, params: "bool8" },
  { name: 'FreeWindowAndBgBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePokedexList', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'CreateMonDexNum', ret: "void", arity: 4, params: "u16, u8, u8, u16" },
  { name: 'CreateCaughtBall', ret: "void", arity: 4, params: "u16, u8, u8, u16" },
  { name: 'CreateMonName', ret: "u8", arity: 3, params: "u16, u8, u8" },
  { name: 'ClearMonListEntry', ret: "void", arity: 3, params: "u8 x, u8 y, u16 unused" },
  { name: 'CreateMonSpritesAtPos', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'UpdateDexListScroll', ret: "bool8", arity: 3, params: "u8, u8, u8" },
  { name: 'TryDoPokedexScroll', ret: "u16", arity: 2, params: "u16, u16" },
  { name: 'UpdateSelectedMonSpriteId', ret: "void", arity: 0, params: "void" },
  { name: 'TryDoInfoScreenScroll', ret: "bool8", arity: 0, params: "void" },
  { name: 'ClearMonSprites', ret: "u8", arity: 0, params: "void" },
  { name: 'GetPokemonSpriteToDisplay', ret: "u16", arity: 1, params: "u16" },
  { name: 'CreatePokedexMonSprite', ret: "u32", arity: 3, params: "u16, s16, s16" },
  { name: 'CreateInterfaceSprites', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_MoveMonForInfoScreen', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Scrollbar', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ScrollArrow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_DexListInterfaceText', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_RotatingPokeBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_SeenOwnInfo', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_DexListStartMenuCursor', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_PokedexListMonSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'LoadInfoScreen', ret: "u8", arity: 2, params: "struct PokedexListItem *, u8 monSpriteId" },
  { name: 'IsInfoScreenScrolling', ret: "bool8", arity: 1, params: "u8" },
  { name: 'StartInfoScreenScroll', ret: "u8", arity: 2, params: "struct PokedexListItem *, u8" },
  { name: 'Task_LoadInfoScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleInfoScreenInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SwitchScreensFromInfoScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LoadInfoScreenWaitForFade', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ExitInfoScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LoadAreaScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForAreaScreenInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_SwitchScreensFromAreaScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LoadCryScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleCryScreenInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SwitchScreensFromCryScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadPlayArrowPalette', ret: "void", arity: 1, params: "bool8" },
  { name: 'Task_LoadSizeScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleSizeScreenInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SwitchScreensFromSizeScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadScreenSelectBarMain', ret: "void", arity: 1, params: "u16" },
  { name: 'LoadScreenSelectBarSubmenu', ret: "void", arity: 1, params: "u16" },
  { name: 'HighlightScreenSelectBarItem', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'HighlightSubmenuScreenSelectBarItem', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'Task_DisplayCaughtMonDexPage', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleCaughtMonPageInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ExitCaughtMonPage', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_SlideCaughtMonToCenter', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'PrintMonInfo', ret: "void", arity: 4, params: "u32 num, u32, u32 owned, u32 newEntry" },
  { name: 'PrintMonHeight', ret: "void", arity: 3, params: "u16 height, u8 left, u8 top" },
  { name: 'PrintMonWeight', ret: "void", arity: 3, params: "u16 weight, u8 left, u8 top" },
  { name: 'ResetOtherVideoRegisters', ret: "void", arity: 1, params: "u16" },
  { name: 'PrintCryScreenSpeciesName', ret: "u8", arity: 4, params: "u8, u16, u8, u8" },
  { name: 'PrintDecimalNum', ret: "void", arity: 4, params: "u8 windowId, u16 num, u8 left, u8 top" },
  { name: 'DrawFootprint', ret: "void", arity: 2, params: "u8 windowId, u16 dexNum" },
  { name: 'CreateSizeScreenTrainerPic', ret: "u16", arity: 4, params: "u16, s16, s16, s8" },
  { name: 'GetNextPosition', ret: "u16", arity: 4, params: "u8, u16, u16, u16" },
  { name: 'LoadSearchMenu', ret: "u8", arity: 0, params: "void" },
  { name: 'Task_LoadSearchMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SwitchToSearchMenuTopBar', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleSearchTopBarInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SwitchToSearchMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleSearchMenuInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartPokedexSearch', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitAndCompleteSearch', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SearchCompleteWaitForInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SelectSearchMenuItem', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleSearchParameterInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ExitSearch', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ExitSearchWaitForFade', ret: "void", arity: 1, params: "u8" },
  { name: 'HighlightSelectedSearchTopBarItem', ret: "void", arity: 1, params: "u8" },
  { name: 'HighlightSelectedSearchMenuItem', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'PrintSelectedSearchParameters', ret: "void", arity: 1, params: "u8" },
  { name: 'DrawOrEraseSearchParameterBox', ret: "void", arity: 1, params: "bool8" },
  { name: 'PrintSearchParameterText', ret: "void", arity: 1, params: "u8" },
  { name: 'GetSearchModeSelection', ret: "u8", arity: 2, params: "u8 taskId, u8 option" },
  { name: 'SetDefaultSearchModeAndOrder', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateSearchParameterScrollArrows', ret: "void", arity: 1, params: "u8" },
  { name: 'EraseAndPrintSearchTextBox', ret: "void", arity: 1, params: "const u8 *" },
  { name: 'EraseSelectorArrow', ret: "void", arity: 1, params: "u32" },
  { name: 'PrintSelectorArrow', ret: "void", arity: 1, params: "u32" },
  { name: 'PrintSearchParameterTitle', ret: "void", arity: 2, params: "u32, const u8 *" },
  { name: 'ClearSearchParameterBoxText', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPokedex', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPokedexScrollPositions', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Pokedex', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPokedexView', ret: "void", arity: 1, params: "struct PokedexView *pokedexView" },
  { name: 'CB2_OpenPokedex', ret: "void", arity: 0, params: "void" },
  { name: 'CopyToBgTilemapBuffer', ret: "else", arity: 4, params: "0, gPokedexStartMenuSearchResults_Tilemap, 0, 0x280" },
  { name: 'PrintMonDexNumAndName', ret: "void", arity: 5, params: "u8 windowId, u8 fontId, const u8 *str, u8 left, u8 top" },
  { name: 'CreateMonListEntry', ret: "void", arity: 3, params: "u8 position, u16 b, u16 ignored" },
  { name: 'CreateScrollingPokemonSprite', ret: "void", arity: 2, params: "u8 direction, u16 selectedMon" },
  { name: 'SpriteCB_EndMoveMonForInfoScreen', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'PrintInfoScreenText', ret: "void", arity: 3, params: "const u8 *str, u8 left, u8 top" },
  { name: 'FreeInfoScreenWindowAndBgBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'DisplayCaughtMonDexPage', ret: "u8", arity: 3, params: "u16 dexNum, u32 otId, u32 personality" },
  { name: 'GetPokedexHeightWeight', ret: "u16", arity: 2, params: "u16 dexNum, u8 data" },
  { name: 'GetSetPokedexFlag', ret: "s8", arity: 2, params: "u16 nationalDexNo, u8 caseID" },
  { name: 'GetNationalPokedexCount', ret: "u16", arity: 1, params: "u8 caseID" },
  { name: 'GetHoennPokedexCount', ret: "u16", arity: 1, params: "u8 caseID" },
  { name: 'GetKantoPokedexCount', ret: "u16", arity: 1, params: "u8 caseID" },
  { name: 'HasAllHoennMons', ret: "bool16", arity: 0, params: "void" },
  { name: 'HasAllKantoMons', ret: "bool8", arity: 0, params: "void" },
  { name: 'HasAllMons', ret: "bool16", arity: 0, params: "void" },
  { name: 'PrintInfoSubMenuText', ret: "void", arity: 4, params: "u8 windowId, const u8 *str, u8 left, u8 top" },
  { name: 'UnusedPrintNum', ret: "UNUSED", arity: 4, params: "u8 windowId, u16 num, u8 left, u8 top" },
  { name: 'UnusedPrintMonName', ret: "UNUSED", arity: 4, params: "u8 windowId, const u8 *name, u8 left, u8 top" },
  { name: 'RS_DrawFootprint', ret: "UNUSED", arity: 2, params: "u16 offset, u16 tileNum" },
  { name: 'GetPokedexMonPersonality', ret: "u32", arity: 1, params: "u16 species" },
  { name: 'CreateMonSpriteFromNationalDexNumber', ret: "u16", arity: 4, params: "u16 nationalNum, s16 x, s16 y, u16 paletteSlot" },
  { name: 'DoPokedexSearch', ret: "int", arity: 6, params: "u8 dexMode, u8 order, u8 abcGroup, u8 bodyColor, u8 type1, u8 type2" },
  { name: 'PrintSearchText', ret: "void", arity: 3, params: "const u8 *str, u32 x, u32 y" },
  { name: 'ClearSearchMenuRect', ret: "void", arity: 4, params: "u32 x, u32 y, u32 width, u32 height" },
  { name: 'FreeSearchWindowAndBgBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'SetSearchRectHighlight', ret: "void", arity: 4, params: "u8 flags, u8 x, u8 y, u8 width" },
  { name: 'DrawSearchMenuItemBgHighlight', ret: "void", arity: 3, params: "u8 searchBg, bool8 unselected, bool8 disabled" },
  { name: 'SetInitialSearchMenuBgHighlights', ret: "void", arity: 1, params: "u8 topBarItem" },
  { name: 'SearchParamCantScrollUp', ret: "bool8", arity: 1, params: "u8 taskId" },
  { name: 'SearchParamCantScrollDown', ret: "bool8", arity: 1, params: "u8 taskId" },
  { name: 'SpriteCB_SearchParameterScrollArrow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ClosePokedex',
  'Task_ClosePokedexFromSearchResultsStartMenu',
  'Task_DisplayCaughtMonDexPage',
  'Task_ExitCaughtMonPage',
  'Task_ExitInfoScreen',
  'Task_ExitSearch',
  'Task_ExitSearchWaitForFade',
  'Task_HandleCaughtMonPageInput',
  'Task_HandleCryScreenInput',
  'Task_HandleInfoScreenInput',
  'Task_HandlePokedexInput',
  'Task_HandlePokedexStartMenuInput',
  'Task_HandleSearchMenuInput',
  'Task_HandleSearchParameterInput',
  'Task_HandleSearchResultsInput',
  'Task_HandleSearchResultsStartMenuInput',
  'Task_HandleSearchTopBarInput',
  'Task_HandleSizeScreenInput',
  'Task_LoadAreaScreen',
  'Task_LoadCryScreen',
  'Task_LoadInfoScreen',
  'Task_LoadInfoScreenWaitForFade',
  'Task_LoadSearchMenu',
  'Task_LoadSizeScreen',
  'Task_OpenInfoScreenAfterMonMovement',
  'Task_OpenPokedexMainPage',
  'Task_OpenSearchResults',
  'Task_OpenSearchResultsInfoScreenAfterMonMovement',
  'Task_ReturnToPokedexFromSearchResults',
  'Task_SearchCompleteWaitForInput',
  'Task_SelectSearchMenuItem',
  'Task_StartPokedexSearch',
  'Task_SwitchScreensFromAreaScreen',
  'Task_SwitchScreensFromCryScreen',
  'Task_SwitchScreensFromInfoScreen',
  'Task_SwitchScreensFromSizeScreen',
  'Task_SwitchToSearchMenu',
  'Task_SwitchToSearchMenuTopBar',
  'Task_WaitAndCompleteSearch',
  'Task_WaitForAreaScreenInput',
  'Task_WaitForExitInfoScreen',
  'Task_WaitForExitSearch',
  'Task_WaitForExitSearchResultsInfoScreen',
  'Task_WaitForScroll',
  'Task_WaitForSearchResultsScroll',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_OpenPokedex',
  'CB2_Pokedex',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_main.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'event_data.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'main.h',
  'malloc.h',
  'menu.h',
  'm4a.h',
  'overworld.h',
  'palette.h',
  'pokedex.h',
  'pokedex_area_screen.h',
  'pokedex_cry_screen.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text_window.h',
  'trainer_pokemon_sprites.h',
  'trig.h',
  'window.h',
  'constants/rgb.h',
  'constants/songs.h',
  'data/pokemon/pokedex_orders.h',
  'data/pokemon/pokedex_text.h',
  'data/pokemon/pokedex_entries.h',
  'data/pokemon_graphics/footprint_table.h',
] as const;
