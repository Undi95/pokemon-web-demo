// AUTO-GENERATED from src/menu_specialized.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/menu_specialized.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const sSparkleId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sDelayTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sNumExtraSparkles_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sCurSparkleId_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sMonSpriteId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sNextSparkleSpriteId_EXPR = "data[5]";

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates_MailboxMenu = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 24, height: 2, paletteNum: 15, baseBlock: 8 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 1, width: 8, height: 18, paletteNum: 15, baseBlock: 56 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 11, height: 8, paletteNum: 15, baseBlock: 56 },
] as const;
export const sMoveRelearnerWindowTemplates = [
  { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 16, height: 12, paletteNum: 15, baseBlock: 10 },
  { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 16, height: 12, paletteNum: 15, baseBlock: 202 },
  { bg: 1, tilemapLeft: 19, tilemapTop: 1, width: 10, height: 12, paletteNum: 15, baseBlock: 394 },
  { bg: 1, tilemapLeft: 4, tilemapTop: 15, width: 22, height: 4, paletteNum: 15, baseBlock: 514 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 8, width: 5, height: 4, paletteNum: 15, baseBlock: 602 },
] as const;
export const sMoveRelearnerYesNoMenuTemplate = { bg: 0, tilemapLeft: 22, tilemapTop: 8, width: 5, height: 4, paletteNum: 15, baseBlock: 602 } as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_ConditionMonPic = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOam_ConditionSelectionIcon = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_ConditionSparkle = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, size: "SPRITE_SIZE(16x16)", priority: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const dataTemplate = { tileTag: "TAG_CONDITION_BALL", paletteTag: "TAG_CONDITION_BALL", oam: "&sOam_ConditionSelectionIcon", anims: "sAnims_ConditionSelectionIcon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ConditionSparkle = { tileTag: "TAG_CONDITION_SPARKLE", paletteTag: "TAG_CONDITION_SPARKLE", oam: "&sOam_ConditionSparkle", anims: "sAnims_ConditionSparkle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ConditionSparkle" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sConditionPokeball_Gfx': { path: 'graphics/pokenav/condition/pokeball.png', ext: '.4bpp', type: 'u32' },
  'sConditionPokeballPlaceholder_Gfx': { path: 'graphics/pokenav/condition/pokeball_placeholder.png', ext: '.4bpp', type: 'u32' },
  'sConditionSparkle_Gfx': { path: 'graphics/pokenav/condition/sparkle.png', ext: '.gbapal', type: 'u16' },
  'sConditionSparkle_Pal': { path: 'graphics/pokenav/condition/sparkle.png', ext: '.4bpp', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sLvlUpStatStrings = ['gText_MaxHP', 'gText_Attack', 'gText_Defense', 'gText_SpAtk', 'gText_SpDef', 'gText_Speed'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sMailboxWindowIds', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MailboxMenu_MoveCursorFunc', ret: "void", arity: 3, params: "s32, bool8, struct ListMenu *" },
  { name: 'ConditionGraph_CalcRightHalf', ret: "void", arity: 1, params: "struct ConditionGraph *" },
  { name: 'ConditionGraph_CalcLeftHalf', ret: "void", arity: 1, params: "struct ConditionGraph *" },
  { name: 'MoveRelearnerCursorCallback', ret: "void", arity: 3, params: "s32, bool8, struct ListMenu *" },
  { name: 'MoveRelearnerDummy', ret: "void", arity: 0, params: "void" },
  { name: 'SetNextConditionSparkle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ConditionSparkle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'ShowAllConditionSparkles', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'MailboxMenu_Alloc', ret: "bool8", arity: 1, params: "u8 count" },
  { name: 'MailboxMenu_AddWindow', ret: "u8", arity: 1, params: "u8 windowIdx" },
  { name: 'MailboxMenu_RemoveWindow', ret: "void", arity: 1, params: "u8 windowIdx" },
  { name: 'MailboxMenu_GetWindowId', ret: "UNUSED", arity: 1, params: "u8 windowIdx" },
  { name: 'MailboxMenu_ItemPrintFunc', ret: "void", arity: 3, params: "u8 windowId, u32 itemId, u8 y" },
  { name: 'MailboxMenu_CreateList', ret: "u8", arity: 1, params: "struct PlayerPCItemPageStruct *page" },
  { name: 'MailboxMenu_AddScrollArrows', ret: "void", arity: 1, params: "struct PlayerPCItemPageStruct *page" },
  { name: 'MailboxMenu_Free', ret: "void", arity: 0, params: "void" },
  { name: 'ConditionGraph_Init', ret: "void", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_SetNewPositions', ret: "void", arity: 3, params: "struct ConditionGraph *graph, struct UCoords16 *old, struct UCoords16 *new" },
  { name: 'ConditionGraph_TryUpdate', ret: "bool8", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_InitResetScanline', ret: "void", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_ResetScanline', ret: "bool8", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_Draw', ret: "void", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_InitWindow', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'ConditionGraph_Update', ret: "void", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_CalcLine', ret: "void", arity: 6, params: "struct ConditionGraph *graph, u16 *scanline, struct UCoords16 *pos1, struct UCoords16 *pos2, bool8 dir, u16 *overflowScanline" },
  { name: 'ConditionGraph_CalcPositions', ret: "void", arity: 2, params: "u8 *conditions, struct UCoords16 *positions" },
  { name: 'InitMoveRelearnerWindows', ret: "void", arity: 1, params: "bool8 useContestWindow" },
  { name: 'LoadMoveRelearnerMovesList', ret: "u8", arity: 2, params: "const struct ListMenuItem *items, u16 numChoices" },
  { name: 'MoveRelearnerLoadBattleMoveDescription', ret: "void", arity: 1, params: "u32 chosenMove" },
  { name: 'MoveRelearnerMenuLoadContestMoveDescription', ret: "void", arity: 1, params: "u32 chosenMove" },
  { name: 'MoveRelearnerPrintMessage', ret: "void", arity: 1, params: "u8 *str" },
  { name: 'MoveRelearnerRunTextPrinters', ret: "bool16", arity: 0, params: "void" },
  { name: 'MoveRelearnerCreateYesNoMenu', ret: "void", arity: 0, params: "void" },
  { name: 'GetBoxOrPartyMonData', ret: "s32", arity: 4, params: "u16 boxId, u16 monId, s32 request, u8 *dst" },
  { name: 'GetConditionMenuMonNameAndLocString', ret: "void", arity: 7, params: "u8 *locationDst, u8 *nameDst, u16 boxId, u16 monId, u16 partyId, u16 numMons, bool8 excludesCancel" },
  { name: 'GetConditionMenuMonConditions', ret: "void", arity: 8, params: "struct ConditionGraph *graph, u8 *numSparkles, u16 boxId, u16 monId, u16 partyId, u16 id, u16 numMons, bool8 excludesCancel" },
  { name: 'GetConditionMenuMonGfx', ret: "void", arity: 7, params: "void *tilesDst, void *palDst, u16 boxId, u16 monId, u16 partyId, u16 numMons, bool8 excludesCancel" },
  { name: 'MoveConditionMonOnscreen', ret: "bool8", arity: 1, params: "s16 *x" },
  { name: 'MoveConditionMonOffscreen', ret: "bool8", arity: 1, params: "s16 *x" },
  { name: 'ConditionMenu_UpdateMonEnter', ret: "bool8", arity: 2, params: "struct ConditionGraph *graph, s16 *x" },
  { name: 'ConditionMenu_UpdateMonExit', ret: "bool8", arity: 2, params: "struct ConditionGraph *graph, s16 *x" },
  { name: 'LoadConditionMonPicTemplate', ret: "void", arity: 3, params: "struct SpriteSheet *sheet, struct SpriteTemplate *template, struct SpritePalette *pal" },
  { name: 'LoadConditionSelectionIcons', ret: "void", arity: 3, params: "struct SpriteSheet *sheets, struct SpriteTemplate *template, struct SpritePalette *pals" },
  { name: 'LoadConditionSparkle', ret: "void", arity: 2, params: "struct SpriteSheet *sheet, struct SpritePalette *pal" },
  { name: 'SpriteCB_ConditionSparkle_DoNextAfterDelay', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ConditionSparkle_WaitForAllAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetConditionSparklePosition', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitConditionSparkles', ret: "void", arity: 3, params: "u8 count, bool8 allowFirstShowAll, struct Sprite **sprites" },
  { name: 'ResetConditionSparkleSprites', ret: "void", arity: 1, params: "struct Sprite **sprites" },
  { name: 'CreateConditionSparkleSprites', ret: "void", arity: 3, params: "struct Sprite **sprites, u8 monSpriteId, u8 _count" },
  { name: 'DestroyConditionSparkleSprites', ret: "void", arity: 1, params: "struct Sprite **sprites" },
  { name: 'FreeConditionSparkles', ret: "void", arity: 1, params: "struct Sprite **sprites" },
  { name: 'DrawLevelUpWindowPg1', ret: "void", arity: 6, params: "u16 windowId, u16 *statsBefore, u16 *statsAfter, u8 bgClr, u8 fgClr, u8 shadowClr" },
  { name: 'DrawLevelUpWindowPg2', ret: "void", arity: 5, params: "u16 windowId, u16 *currStats, u8 bgClr, u8 fgClr, u8 shadowClr" },
  { name: 'GetMonLevelUpWindowStats', ret: "void", arity: 2, params: "struct Pokemon *mon, u16 *currStats" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle_main.h',
  'contest_effect.h',
  'data.h',
  'decompress.h',
  'gpu_regs.h',
  'graphics.h',
  'menu.h',
  'international_string_util.h',
  'menu.h',
  'menu_specialized.h',
  'move_relearner.h',
  'palette.h',
  'player_pc.h',
  'pokemon_summary_screen.h',
  'pokemon_storage_system.h',
  'scanline_effect.h',
  'sound.h',
  'strings.h',
  'string_util.h',
  'text.h',
  'text_window.h',
  'trig.h',
  'window.h',
  'constants/songs.h',
  'gba/io_reg.h',
] as const;
