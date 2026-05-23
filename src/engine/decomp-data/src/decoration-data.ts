// AUTO-GENERATED from src/decoration.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/decoration.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const PLACE_DECORATION_SELECTOR_TAG = 3045;
export const PLACE_DECORATION_PLAYER_TAG = 8;
/** Raw expr: `(FLAG_DECORATION_14 - FLAG_DECORATION_1 + 1)` */
export const NUM_DECORATION_FLAGS_EXPR = "(FLAG_DECORATION_14 - FLAG_DECORATION_1 + 1)";
/** Raw expr: `data[0]` */
export const tCursorX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tCursorY_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tState_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tInitialX_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tInitialY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tDecorWidth_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tDecorHeight_EXPR = "data[6]";
/** Raw expr: `data[10]` */
export const tButton_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tDecorationMenuCommand_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tDecorationItemsMenuCommand_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tMenuTaskId_EXPR = "data[13]";
export const DECOR_MENU_PLACE = 0;
export const DECOR_MENU_TOSS = 1;
export const DECOR_MENU_TRADE = 2;
export const DECOR_ITEMS_MENU_PLACE = 0;
export const DECOR_ITEMS_MENU_PUT_AWAY = 1;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_Windows = {
  WINDOW_MAIN_MENU: 0,
  WINDOW_DECORATION_CATEGORIES: 1,
  WINDOW_DECORATION_CATEGORY_SUMMARY: 2,
  WINDOW_DECORATION_CATEGORY_ITEMS: 3,
  WINDOW_COUNT: 4,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sDecorationWindowTemplates = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 18, height: "2 * ARRAY_COUNT(sDecorationMainMenuActions)", paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 13, height: 18, paletteNum: 13, baseBlock: 145 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 1, width: 12, height: 2, paletteNum: 15, baseBlock: 379 },
  { bg: 0, tilemapLeft: 16, tilemapTop: 13, width: 13, height: 6, paletteNum: 15, baseBlock: 403 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sPuttingAwayCursorOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 1, paletteNum: 0 } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePal_PlaceDecoration = { data: "(const u16 *)&sPlaceDecorationGraphicsDataBuffer.palette", tag: "PLACE_DECORATION_SELECTOR_TAG" } as const;
export const sSpritePal_PuttingAwayCursorBrendan = { data: "sBrendanPalette", tag: "PLACE_DECORATION_PLAYER_TAG" } as const;
export const sSpritePal_PuttingAwayCursorMay = { data: "sMayPalette", tag: "PLACE_DECORATION_PLAYER_TAG" } as const;

// ─── MenuAction ─────────────────────────────────────────────────────────────
export const sDecorationMainMenuActions = [
  { text: "gText_Decorate", func: "{ .void_u8 = DecorationMenuAction_Decorate" },
  { text: "gText_PutAway", func: "{ .void_u8 = DecorationMenuAction_PutAway" },
  { text: "gText_Toss2", func: "{ .void_u8 = DecorationMenuAction_Toss" },
  { text: "gText_Cancel", func: "{ .void_u8 = DecorationMenuAction_Cancel" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sDecorationMenuPalette': { path: 'graphics/decorations/decoration_menu.pal', ext: '.gbapal', type: 'u16' },
  'sBrendanPalette': { path: 'graphics/decorations/brendan.pal', ext: '.gbapal', type: 'u16' },
  'sMayPalette': { path: 'graphics/decorations/may.pal', ext: '.gbapal', type: 'u16' },
  'sDecorationPuttingAwayCursor': { path: 'graphics/decorations/put_away_cursor.png', ext: '.4bpp', type: 'u8' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sDecorationCategoryNames = ['gText_Desk', 'gText_Chair', 'gText_Plant', 'gText_Ornament', 'gText_Mat', 'gText_Poster', 'gText_Doll', 'gText_Cushion'] as const;
export const sSecretBasePCMenuItemDescriptions = ['gText_PutOutSelectedDecorItem', 'gText_StoreChosenDecorInPC', 'gText_ThrowAwayUnwantedDecors', 'gText_GoBackPrevMenu'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sDecorationStandElevations: readonly number[] = [4,4,4,4,0,3,3,0] as const;
export const sDecorationSlideElevation: readonly number[] = [4,4,4,4,0,4,3,0] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sDecorationActionsCursorPos', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sNumOwnedDecorationsInCurCategory', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSecretBaseItemsIndicesBuffer', isArray: true, init: "{}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sPlayerRoomItemsIndicesBuffer', isArray: true, init: "{}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sDecorationsCursorPos', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sDecorationsScrollOffset', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gCurDecorationIndex', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sCurDecorationCategory', isArray: false, init: "DECORCAT_DESK" },
  { segment: 'EWRAM_DATA', type: "u32 UNUSED", name: 'sFiller', isArray: true, init: "{}" },
  { segment: 'EWRAM_DATA', type: "struct DecorationPCContext", name: 'sDecorationContext', isArray: false, init: "{}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sDecorMenuWindowIds', isArray: true, init: "{}" },
  { segment: 'EWRAM_DATA', type: "struct PlaceDecorationGraphicsDataBuffer", name: 'sPlaceDecorationGraphicsDataBuffer', isArray: false, init: "{}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sCurDecorMapX', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sCurDecorMapY', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sDecor_CameraSpriteObjectIdx1', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sDecor_CameraSpriteObjectIdx2', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sDecorationLastDirectionMoved', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct OamData", name: 'sDecorSelectorOam', isArray: false, init: "{}" },
  { segment: 'EWRAM_DATA', type: "struct DecorRearrangementDataBuffer", name: 'sDecorRearrangementDataBuffer', isArray: true, init: "{}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sCurDecorSelectedInRearrangement', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'HandleDecorationActionsMenuInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PrintCurMainMenuDescription', ret: "void", arity: 0, params: "void" },
  { name: 'DecorationMenuAction_Decorate', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DecorationMenuAction_PutAway', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DecorationMenuAction_Toss', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DecorationMenuAction_Cancel', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ReturnToDecorationActionsAfterInvalidSelection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SecretBasePC_PrepMenuForSelectingStoredDecors', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitDecorationCategoriesWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PrintDecorationCategoryMenuItems', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PrintDecorationCategoryMenuItem', ret: "void", arity: 6, params: "u8 winid, u8 category, u8 x, u8 y, bool8 disabled, u8 speed" },
  { name: 'ColorMenuItemString', ret: "void", arity: 2, params: "u8 *str, bool8 disabled" },
  { name: 'HandleDecorationCategoriesMenuInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SelectDecorationCategory', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ReturnToDecorationCategoriesAfterInvalidSelection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ExitDecorationCategoriesMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ReturnToActionsMenuFromCategories', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ExitTraderDecorationMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CopyDecorationMenuItemName', ret: "void", arity: 2, params: "u8 *dest, u16 decoration" },
  { name: 'DecorationItemsMenu_OnCursorMove', ret: "void", arity: 3, params: "s32 itemIndex, bool8 flag, struct ListMenu *menu" },
  { name: 'DecorationItemsMenu_PrintDecorationInUse', ret: "void", arity: 3, params: "u8 windowId, u32 itemIndex, u8 y" },
  { name: 'ShowDecorationItemsWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'HandleDecorationItemsMenuInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PrintDecorationItemDescription', ret: "void", arity: 1, params: "s32 itemIndex" },
  { name: 'RemoveDecorationItemsOtherWindows', ret: "void", arity: 0, params: "void" },
  { name: 'IsDecorationIndexInSecretBase', ret: "bool8", arity: 1, params: "u8 idx" },
  { name: 'IsDecorationIndexInPlayersRoom', ret: "bool8", arity: 1, params: "u8 idx" },
  { name: 'IdentifyOwnedDecorationsCurrentlyInUse', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitDecorationItemsWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowDecorationCategorySummaryWindow', ret: "void", arity: 1, params: "u8 category" },
  { name: 'DontTossDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DecorationItemsMenuAction_Cancel', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DecorationItemsMenuAction_AttemptPlace', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_PlaceDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ConfigureCameraObjectForPlacingDecoration', ret: "void", arity: 2, params: "struct PlaceDecorationGraphicsDataBuffer *data, u8 decor" },
  { name: 'SetUpPlacingDecorationPlayerAvatar', ret: "void", arity: 2, params: "u8 taskId, struct PlaceDecorationGraphicsDataBuffer *data" },
  { name: 'SetUpDecorationShape', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AttemptPlaceDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AttemptCancelPlaceDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AttemptPlaceDecoration_', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlaceDecorationPrompt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlaceDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlaceDecoration_', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CancelDecoratingPrompt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CancelDecorating', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CancelDecorating_', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'c1_overworld_prev_quest', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCB_InitDecorationItemsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ResetCursorMovement', ret: "void", arity: 0, params: "void" },
  { name: 'ContinueDecorating', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CantPlaceDecorationPrompt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitializePuttingAwayCursorSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitializePuttingAwayCursorSprite2', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'gpu_pal_decompress_alloc_tag_and_upload', ret: "u8", arity: 2, params: "struct PlaceDecorationGraphicsDataBuffer *data, u8 decor" },
  { name: 'HasDecorationsInUse', ret: "bool8", arity: 1, params: "u8 taskId" },
  { name: 'Task_ContinuePuttingAwayDecorations', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ContinuePuttingAwayDecorations', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AttemptPutAwayDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AttemptCancelPutAwayDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AttemptPutAwayDecoration_', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ContinuePuttingAwayDecorationsPrompt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AttemptMarkDecorUnderCursorForRemoval', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ReturnDecorationPrompt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PutAwayDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StopPuttingAwayDecorationsPrompt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StopPuttingAwayDecorations', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StopPuttingAwayDecorations_', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StopPuttingAwayDecorations', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCB_StopPuttingAwayDecorations', ret: "void", arity: 0, params: "void" },
  { name: 'InitializeCameraSprite1', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'LoadPlayerSpritePalette', ret: "void", arity: 0, params: "void" },
  { name: 'FreePlayerSpritePalette', ret: "void", arity: 0, params: "void" },
  { name: 'DecorationItemsMenuAction_AttemptToss', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TossDecorationPrompt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TossDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitDecorationContextItems', ret: "void", arity: 0, params: "void" },
  { name: 'AddDecorationWindow', ret: "u8", arity: 1, params: "u8 windowIndex" },
  { name: 'RemoveDecorationWindow', ret: "void", arity: 1, params: "u8 windowIndex" },
  { name: 'AddDecorationActionsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'InitDecorationActionsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'DoSecretBaseDecorationMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoPlayerRoomDecorationMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ReinitDecorationCategoriesWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowDecorationCategoriesWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CopyDecorationCategoryName', ret: "void", arity: 2, params: "u8 *dest, u8 category" },
  { name: 'InitDecorationItemsMenuLimits', ret: "void", arity: 0, params: "void" },
  { name: 'InitDecorationItemsMenuScrollAndCursor', ret: "void", arity: 0, params: "void" },
  { name: 'InitDecorationItemsMenuScrollAndCursor2', ret: "void", arity: 0, params: "void" },
  { name: 'PrintDecorationItemMenuItems', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AddDecorationItemsScrollIndicators', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveDecorationItemsScrollIndicators', ret: "void", arity: 0, params: "void" },
  { name: 'AddDecorationItemsWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'IdentifyOwnedDecorationsCurrentlyInUseInternal', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'IsSelectedDecorInThePC', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_ShowDecorationItemsWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ReturnToDecorationItemsAfterInvalidSelection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetInitialPositions', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'WarpToInitialPosition', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetDecorationElevation', ret: "u16", arity: 2, params: "u8 decoration, u8 tileIndex" },
  { name: 'ShowDecorationOnMap_', ret: "void", arity: 5, params: "u16 mapX, u16 mapY, u8 decWidth, u8 decHeight, u16 decoration" },
  { name: 'ShowDecorationOnMap', ret: "void", arity: 3, params: "u16 mapX, u16 mapY, u16 decoration" },
  { name: 'SetDecoration', ret: "void", arity: 0, params: "void" },
  { name: 'HasDecorationSpace', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsSecretBaseTrainerSpot', ret: "bool8", arity: 2, params: "u8 behaviorAt, u16 layerType" },
  { name: 'IsntInitialPosition', ret: "bool8", arity: 4, params: "u8 taskId, s16 x, s16 y, u16 layerType" },
  { name: 'IsFloorOrBoardAndHole', ret: "bool8", arity: 2, params: "u16 behaviorAt, const struct Decoration *decoration" },
  { name: 'CanPlaceDecoration', ret: "bool8", arity: 2, params: "u8 taskId, const struct Decoration *decoration" },
  { name: 'Task_InitDecorationItemsWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ApplyCursorMovement_IsInvalid', ret: "bool8", arity: 1, params: "u8 taskId" },
  { name: 'IsHoldingDirection', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_SelectLocation', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ClearPlaceDecorationGraphicsDataBuffer', ret: "void", arity: 1, params: "struct PlaceDecorationGraphicsDataBuffer *data" },
  { name: 'CopyPalette', ret: "void", arity: 2, params: "u16 *dest, u16 pal" },
  { name: 'CopyTile', ret: "void", arity: 2, params: "u8 *dest, u16 tile" },
  { name: 'SetDecorSelectionBoxTiles', ret: "void", arity: 1, params: "struct PlaceDecorationGraphicsDataBuffer *data" },
  { name: 'GetMetatile', ret: "u16", arity: 1, params: "u16 tile" },
  { name: 'SetDecorSelectionMetatiles', ret: "void", arity: 1, params: "struct PlaceDecorationGraphicsDataBuffer *data" },
  { name: 'SetDecorSelectionBoxOamAttributes', ret: "void", arity: 1, params: "u8 decorShape" },
  { name: 'AddDecorationIconObjectFromIconTable', ret: "u8", arity: 3, params: "u16 tilesTag, u16 paletteTag, u8 decor" },
  { name: 'AddDecorationIconObjectFromObjectEvent', ret: "u8", arity: 3, params: "u16 tilesTag, u16 paletteTag, u8 decor" },
  { name: 'AddDecorationIconObject', ret: "u8", arity: 6, params: "u8 decor, s16 x, s16 y, u8 priority, u16 tilesTag, u16 paletteTag" },
  { name: 'ClearDecorationContextIndex', ret: "void", arity: 1, params: "u8 idx" },
  { name: 'PutAwayDecorationIteration', ret: "void", arity: 0, params: "void" },
  { name: 'GetObjectEventLocalIdByFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ClearRearrangementNonSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PutAwayDecoration', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetUpPuttingAwayDecorationPlayerAvatar', ret: "void", arity: 0, params: "void" },
  { name: 'SetDecorRearrangementShape', ret: "void", arity: 2, params: "u8 decor, struct DecorRearrangementDataBuffer *data" },
  { name: 'SetCameraSpritePosition', ret: "void", arity: 2, params: "u8 x, u8 y" },
  { name: 'DecorationIsUnderCursor', ret: "bool8", arity: 3, params: "u8 taskId, u8 idx, struct DecorRearrangementDataBuffer *data" },
  { name: 'SetDecorRearrangementFlagIdIfFlagUnset', ret: "void", arity: 0, params: "void" },
  { name: 'AttemptMarkSpriteDecorUnderCursorForRemoval', ret: "bool8", arity: 1, params: "u8 taskId" },
  { name: 'MarkSpriteDecorsInBoundsForRemoval', ret: "void", arity: 4, params: "u8 left, u8 top, u8 right, u8 bottom" },
  { name: 'Task_ReinitializeDecorationMenuHandler', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'LoadSpritePalette', ret: "else", arity: 1, params: "&sSpritePal_PuttingAwayCursorMay" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ContinuePuttingAwayDecorations',
  'Task_InitDecorationItemsWindow',
  'Task_PlaceDecoration',
  'Task_PutAwayDecoration',
  'Task_ReinitializeDecorationMenuHandler',
  'Task_SelectLocation',
  'Task_ShowDecorationItemsWindow',
  'Task_StopPuttingAwayDecorations',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'decompress.h',
  'decoration.h',
  'decoration_inventory.h',
  'event_data.h',
  'event_object_movement.h',
  'event_scripts.h',
  'field_camera.h',
  'field_player_avatar.h',
  'field_screen_effect.h',
  'field_weather.h',
  'fieldmap.h',
  'graphics.h',
  'international_string_util.h',
  'item_icon.h',
  'item_menu.h',
  'list_menu.h',
  'main.h',
  'menu.h',
  'menu_helpers.h',
  'metatile_behavior.h',
  'overworld.h',
  'palette.h',
  'player_pc.h',
  'script.h',
  'secret_base.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'tilesets.h',
  'trader.h',
  'tv.h',
  'constants/decorations.h',
  'constants/event_objects.h',
  'constants/songs.h',
  'constants/region_map_sections.h',
  'constants/metatile_labels.h',
  'data/decoration/tiles.h',
  'data/decoration/description.h',
  'data/decoration/header.h',
  'data/decoration/icon.h',
  'data/decoration/tilemaps.h',
] as const;
