// AUTO-GENERATED from src/pokenav_ribbons_summary.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_ribbons_summary.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GFXTAG_RIBBON_ICONS_BIG = 9;
export const PALTAG_RIBBON_ICONS_1 = 15;
export const PALTAG_RIBBON_ICONS_2 = 16;
export const PALTAG_RIBBON_ICONS_3 = 17;
export const PALTAG_RIBBON_ICONS_4 = 18;
export const PALTAG_RIBBON_ICONS_5 = 19;
export const RIBBONS_PER_ROW = 9;
/** Raw expr: `(1 + (FIRST_GIFT_RIBBON / RIBBONS_PER_ROW))` */
export const GIFT_RIBBON_ROW_EXPR = "(1 + (FIRST_GIFT_RIBBON / RIBBONS_PER_ROW))";
/** Raw expr: `(RIBBONS_PER_ROW * GIFT_RIBBON_ROW)` */
export const GIFT_RIBBON_START_POS_EXPR = "(RIBBONS_PER_ROW * GIFT_RIBBON_ROW)";
export const MON_SPRITE_X_ON = 40;
export const MON_SPRITE_X_OFF = -32;
export const MON_SPRITE_Y = 104;
/** Raw expr: `data[0]` */
export const sCurrX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sMoveIncr_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sTime_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sDestX_EXPR = "data[3]";
/** Raw expr: `data[0]` */
export const sInvisibleWhenDone_EXPR = "data[0]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_RIBBONS_0 = {
  RIBBONS_SUMMARY_FUNC_NONE: 0,
  RIBBONS_SUMMARY_FUNC_SWITCH_MONS: 1,
  RIBBONS_SUMMARY_FUNC_SELECT_RIBBON: 2,
  RIBBONS_SUMMARY_FUNC_EXPANDED_CURSOR_MOVE: 3,
  RIBBONS_SUMMARY_FUNC_EXPANDED_CANCEL: 4,
  RIBBONS_SUMMARY_FUNC_EXIT: 5,
} as const;
export const ENUM_RIBBONGFX_1 = {
  RIBBONGFX_CHAMPION: 0,
  RIBBONGFX_CONTEST_NORMAL: 1,
  RIBBONGFX_CONTEST_SUPER: 2,
  RIBBONGFX_CONTEST_HYPER: 3,
  RIBBONGFX_CONTEST_MASTER: 4,
  RIBBONGFX_WINNING: 5,
  RIBBONGFX_VICTORY: 6,
  RIBBONGFX_ARTIST: 7,
  RIBBONGFX_EFFORT: 8,
  RIBBONGFX_GIFT_1: 9,
  RIBBONGFX_GIFT_2: 10,
  RIBBONGFX_GIFT_3: 11,
} as const;
export const ENUM_RIBBONANIM_2 = {
  RIBBONANIM_NORMAL: 0,
  RIBBONANIM_ZOOM_IN: 1,
  RIBBONANIM_ZOOM_OUT: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sRibbonCountWindowTemplate = { bg: 2, tilemapLeft: 12, tilemapTop: 13, width: 16, height: 4, paletteNum: 1, baseBlock: 20 } as const;
export const sRibbonSummaryMonNameWindowTemplate = { bg: 2, tilemapLeft: 14, tilemapTop: 1, width: 13, height: 2, paletteNum: 10, baseBlock: 84 } as const;
export const sRibbonMonListIndexWindowTemplate = { bg: 2, tilemapLeft: 1, tilemapTop: 5, width: 7, height: 2, paletteNum: 1, baseBlock: 110 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 1, charBaseIndex: 3, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 6, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_RibbonIconBig = { y: 0, affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_RibbonIconBig = { tileTag: "GFXTAG_RIBBON_ICONS_BIG", paletteTag: "PALTAG_RIBBON_ICONS_1", oam: "&sOamData_RibbonIconBig", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_RibbonIconBig", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sRibbonIcons1_Pal': { path: 'graphics/pokenav/ribbons/icons1.pal', ext: '.gbapal', type: 'u16' },
  'sRibbonIcons2_Pal': { path: 'graphics/pokenav/ribbons/icons2.pal', ext: '.gbapal', type: 'u16' },
  'sRibbonIcons3_Pal': { path: 'graphics/pokenav/ribbons/icons3.pal', ext: '.gbapal', type: 'u16' },
  'sRibbonIcons4_Pal': { path: 'graphics/pokenav/ribbons/icons4.pal', ext: '.gbapal', type: 'u16' },
  'sRibbonIcons5_Pal': { path: 'graphics/pokenav/ribbons/icons5.pal', ext: '.gbapal', type: 'u16' },
  'sMonInfo_Pal': { path: 'graphics/pokenav/ribbons/mon_info.pal', ext: '.gbapal', type: 'u16' },
  'sRibbonIconsSmall_Gfx': { path: 'graphics/pokenav/ribbons/icons.png', ext: '.4bpp.lz', type: 'u32' },
  'sRibbonIconsBig_Gfx': { path: 'graphics/pokenav/ribbons/icons_big.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PrintCurrentMonRibbonCount', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'PrintRibbbonsSummaryMonInfo', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'PrintRibbonsMonListIndex', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'ZoomOutSelectedRibbon', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'UpdateAndZoomInSelectedRibbon', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'PrintRibbonNameAndDescription', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'ResetSpritesAndDrawMonFrontPic', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'AddRibbonListIndexWindow', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'DestroyRibbonsMonFrontPic', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'SlideMonSpriteOff', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'SlideMonSpriteOn', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'AddRibbonCountWindow', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'CreateBigRibbonSprite', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'AddRibbonSummaryMonNameWindow', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'DrawAllRibbonsSmall', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'IsRibbonAnimating', ret: "bool32", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'IsMonSpriteAnimating', ret: "bool32", arity: 1, params: "struct Pokenav_RibbonsSummaryMenu *" },
  { name: 'GetMonRibbons', ret: "void", arity: 1, params: "struct Pokenav_RibbonsSummaryList *" },
  { name: 'HandleExpandedRibbonInput', ret: "u32", arity: 1, params: "struct Pokenav_RibbonsSummaryList *" },
  { name: 'RibbonsSummaryHandleInput', ret: "u32", arity: 1, params: "struct Pokenav_RibbonsSummaryList *" },
  { name: 'ReturnToRibbonsListFromSummary', ret: "u32", arity: 1, params: "struct Pokenav_RibbonsSummaryList *" },
  { name: 'TrySelectRibbonUp', ret: "bool32", arity: 1, params: "struct Pokenav_RibbonsSummaryList *" },
  { name: 'TrySelectRibbonRight', ret: "bool32", arity: 1, params: "struct Pokenav_RibbonsSummaryList *" },
  { name: 'TrySelectRibbonLeft', ret: "bool32", arity: 1, params: "struct Pokenav_RibbonsSummaryList *" },
  { name: 'TrySelectRibbonDown', ret: "bool32", arity: 1, params: "struct Pokenav_RibbonsSummaryList *" },
  { name: 'GetCurrentLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetRibbonsSummaryCurrentIndex', ret: "u32", arity: 0, params: "void" },
  { name: 'GetRibbonsSummaryMonListCount', ret: "u32", arity: 0, params: "void" },
  { name: 'DrawRibbonsMonFrontPic', ret: "u16", arity: 2, params: "s32, s32" },
  { name: 'StartMonSpriteSlide', ret: "void", arity: 4, params: "struct Sprite *, s32, s32, s32" },
  { name: 'SpriteCB_MonSpriteSlide', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'ClearRibbonsSummaryBg', ret: "void", arity: 0, params: "void" },
  { name: 'BufferSmallRibbonGfxData', ret: "void", arity: 2, params: "u16 *, u32" },
  { name: 'DrawRibbonSmall', ret: "void", arity: 2, params: "u32, u32" },
  { name: 'SpriteCB_WaitForRibbonAnimation', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'LoopedTask_OpenRibbonsSummaryMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_SwitchRibbonsSummaryMon', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ExpandSelectedRibbon', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_MoveRibbonsCursorExpanded', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ShrinkExpandedRibbon', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ExitRibbonsSummaryMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'PokenavCallback_Init_RibbonsSummaryMenu', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetRibbonsSummaryMenuCallback', ret: "u32", arity: 0, params: "void" },
  { name: 'FreeRibbonsSummaryScreen1', ret: "void", arity: 0, params: "void" },
  { name: 'GetMonNicknameLevelGender', ret: "void", arity: 3, params: "u8 *nick, u8 *level, u8 *gender" },
  { name: 'GetMonSpeciesPersonalityOtId', ret: "void", arity: 3, params: "u16 *species, u32 *personality, u32 *otId" },
  { name: 'GetCurrMonRibbonCount', ret: "u32", arity: 0, params: "void" },
  { name: 'GetSelectedPosition', ret: "u16", arity: 0, params: "void" },
  { name: 'GetRibbonId', ret: "u32", arity: 0, params: "void" },
  { name: 'OpenRibbonsSummaryMenu', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateRibbonsSummaryLoopedTask', ret: "void", arity: 1, params: "s32 id" },
  { name: 'IsRibbonsSummaryLoopedTaskActive', ret: "u32", arity: 0, params: "void" },
  { name: 'FreeRibbonsSummaryScreen2', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'decompress.h',
  'dynamic_placeholder_text_util.h',
  'graphics.h',
  'international_string_util.h',
  'palette.h',
  'pokenav.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'text.h',
  'trainer_pokemon_sprites.h',
  'window.h',
  'constants/songs.h',
  'data/text/ribbon_descriptions.h',
  'data/text/gift_ribbon_descriptions.h',
] as const;
