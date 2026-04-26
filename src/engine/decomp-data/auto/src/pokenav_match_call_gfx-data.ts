// AUTO-GENERATED from src/pokenav_match_call_gfx.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_match_call_gfx.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GFXTAG_CURSOR = 7;
export const GFXTAG_TRAINER_PIC = 8;
export const PALTAG_CURSOR = 12;
export const PALTAG_TRAINER_PIC = 13;
/** Raw expr: `data[0]` */
export const tSinIdx_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSinVal_EXPR = "data[1]";
/** Raw expr: `data[15]` */
export const tActive_EXPR = "data[15]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_POKEBALL_0 = {
  POKEBALL_ICON_TOP: 20480,
  POKEBALL_ICON_BOTTOM: 20481,
  POKEBALL_ICON_EMPTY: 20482,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sMatchCallLocationWindowTemplate = { bg: 2, tilemapLeft: 0, tilemapTop: 5, width: 11, height: 2, paletteNum: 2, baseBlock: 16 } as const;
export const sMatchCallInfoBoxWindowTemplate = { bg: 2, tilemapLeft: 0, tilemapTop: 9, width: 11, height: 8, paletteNum: 2, baseBlock: 38 } as const;
export const sCallMsgBoxWindowTemplate = { bg: 1, tilemapLeft: 1, tilemapTop: 12, width: 28, height: 4, paletteNum: 1, baseBlock: 10 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sMatchCallBgTemplates = [
  { bg: 1, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 6, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 128 },
  { bg: 3, charBaseIndex: 1, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOptionsCursorOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x16)", x: 0, size: "SPRITE_SIZE(8x16)", tileNum: 0, priority: 1, paletteNum: 0 } as const;
export const sTrainerPicOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sOptionsCursorSpriteTemplate = { tileTag: "GFXTAG_CURSOR", paletteTag: "PALTAG_CURSOR", oam: "&sOptionsCursorOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_OptionsCursor" } as const;
export const sTrainerPicSpriteTemplate = { tileTag: "GFXTAG_TRAINER_PIC", paletteTag: "PALTAG_TRAINER_PIC", oam: "&sTrainerPicOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sOptionsCursor_Pal': { path: 'graphics/pokenav/match_call/options_cursor.png', ext: '.gbapal', type: 'u16' },
  'sOptionsCursor_Gfx': { path: 'graphics/pokenav/match_call/options_cursor.png', ext: '.4bpp.lz', type: 'u32' },
  'sCallWindow_Pal': { path: 'graphics/pokenav/match_call/call_window.pal', ext: '.gbapal', type: 'u16' },
  'sListWindow_Pal': { path: 'graphics/pokenav/match_call/list_window.pal', ext: '.gbapal', type: 'u16' },
  'sPokeball_Pal': { path: 'graphics/pokenav/match_call/pokeball.pal', ext: '.gbapal', type: 'u16' },
  'sPokeball_Gfx': { path: 'graphics/pokenav/match_call/pokeball.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sMatchCallOptionTexts = ['gText_Call', 'gText_Check', 'gText_Cancel6'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetCurrentLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoopedTask_OpenMatchCall', ret: "u32", arity: 1, params: "s32" },
  { name: 'CreateMatchCallList', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyMatchCallList', ret: "void", arity: 0, params: "void" },
  { name: 'FreeMatchCallSprites', ret: "void", arity: 0, params: "void" },
  { name: 'LoadCallWindowAndFade', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'DrawMatchCallLeftColumnWindows', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'UpdateMatchCallInfoBox', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'PrintMatchCallLocation', ret: "void", arity: 2, params: "struct Pokenav_MatchCallGfx *, int" },
  { name: 'AllocMatchCallSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetPokeballIconsFlashing', ret: "void", arity: 1, params: "bool32" },
  { name: 'PrintMatchCallSelectionOptions', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'ShowOptionsCursor', ret: "bool32", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'UpdateCursorGfxPos', ret: "void", arity: 2, params: "struct Pokenav_MatchCallGfx *, int" },
  { name: 'IsDma3ManagerBusyWithBgCopy1', ret: "bool32", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'UpdateWindowsReturnToTrainerList', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'DrawMsgBoxForMatchCallMsg', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'IsDma3ManagerBusyWithBgCopy2', ret: "bool32", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'PrintCallingDots', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'WaitForCallingDotsText', ret: "bool32", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'PrintMatchCallMessage', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'WaitForMatchCallMessageText', ret: "bool32", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'DrawMsgBoxForCloseByMsg', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'PrintTrainerIsCloseBy', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'WaitForTrainerIsCloseByText', ret: "bool32", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'EraseCallMessageBox', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'WaitForCallMessageBoxErase', ret: "bool32", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'UpdateWindowsToShowCheckPage', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'LoadCheckPageTrainerPic', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'WaitForTrainerPic', ret: "bool32", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'TrainerPicSlideOffscreen', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'Task_FlashPokeballIcons', ret: "void", arity: 1, params: "u8" },
  { name: 'TryDrawRematchPokeballIcon', ret: "void", arity: 3, params: "u16, u32, u32" },
  { name: 'PrintNumberRegisteredLabel', ret: "void", arity: 1, params: "u16" },
  { name: 'PrintNumberRegistered', ret: "void", arity: 1, params: "u16" },
  { name: 'PrintNumberOfBattlesLabel', ret: "void", arity: 1, params: "u16" },
  { name: 'PrintNumberOfBattles', ret: "void", arity: 1, params: "u16" },
  { name: 'PrintMatchCallInfoLabel', ret: "void", arity: 3, params: "u16, const u8 *, int" },
  { name: 'PrintMatchCallInfoNumber', ret: "void", arity: 3, params: "u16, const u8 *, int" },
  { name: 'CreateOptionsCursorSprite', ret: "void", arity: 2, params: "struct Pokenav_MatchCallGfx *, int" },
  { name: 'CloseMatchCallSelectOptionsWindow', ret: "void", arity: 1, params: "struct Pokenav_MatchCallGfx *" },
  { name: 'SpriteCB_TrainerPicSlideOnscreen', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_TrainerPicSlideOffscreen', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_OptionsCursor', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'MatchCallListCursorDown', ret: "u32", arity: 1, params: "s32" },
  { name: 'MatchCallListCursorUp', ret: "u32", arity: 1, params: "s32" },
  { name: 'MatchCallListPageDown', ret: "u32", arity: 1, params: "s32" },
  { name: 'MatchCallListPageUp', ret: "u32", arity: 1, params: "s32" },
  { name: 'SelectMatchCallEntry', ret: "u32", arity: 1, params: "s32" },
  { name: 'MoveMatchCallOptionsCursor', ret: "u32", arity: 1, params: "s32" },
  { name: 'CancelMatchCallSelection', ret: "u32", arity: 1, params: "s32" },
  { name: 'DoMatchCallMessage', ret: "u32", arity: 1, params: "s32" },
  { name: 'DoTrainerCloseByMessage', ret: "u32", arity: 1, params: "s32" },
  { name: 'CloseMatchCallMessage', ret: "u32", arity: 1, params: "s32" },
  { name: 'ShowCheckPage', ret: "u32", arity: 1, params: "s32" },
  { name: 'ShowCheckPageUp', ret: "u32", arity: 1, params: "s32" },
  { name: 'ShowCheckPageDown', ret: "u32", arity: 1, params: "s32" },
  { name: 'ExitCheckPage', ret: "u32", arity: 1, params: "s32" },
  { name: 'ExitMatchCall', ret: "u32", arity: 1, params: "s32" },
  { name: 'OpenMatchCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateMatchCallLoopedTask', ret: "void", arity: 1, params: "s32 index" },
  { name: 'IsMatchCallLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'FreeMatchCallSubstruct2', ret: "void", arity: 0, params: "void" },
  { name: 'ClearRematchPokeballIcon', ret: "void", arity: 2, params: "u16 windowId, u32 tileOffset" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "mapName, gText_Unknown" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_FlashPokeballIcons',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'dma3.h',
  'graphics.h',
  'international_string_util.h',
  'main.h',
  'match_call.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'pokenav.h',
  'region_map.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'text_window.h',
  'trig.h',
  'window.h',
  'constants/game_stat.h',
  'constants/region_map_sections.h',
  'constants/songs.h',
] as const;
