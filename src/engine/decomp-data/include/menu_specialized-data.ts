// AUTO-GENERATED from include/menu_specialized.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/menu_specialized.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_CONDITION_SPARKLES = 10;
export const CONDITION_GRAPH_TOP_Y = 56;
export const CONDITION_GRAPH_BOTTOM_Y = 121;
/** Raw expr: `(CONDITION_GRAPH_BOTTOM_Y - CONDITION_GRAPH_TOP_Y + 1)` */
export const CONDITION_GRAPH_HEIGHT_EXPR = "(CONDITION_GRAPH_BOTTOM_Y - CONDITION_GRAPH_TOP_Y + 1)";
export const CONDITION_GRAPH_CENTER_X = 155;
/** Raw expr: `((CONDITION_GRAPH_BOTTOM_Y + CONDITION_GRAPH_TOP_Y) / 2 + 3)` */
export const CONDITION_GRAPH_CENTER_Y_EXPR = "((CONDITION_GRAPH_BOTTOM_Y + CONDITION_GRAPH_TOP_Y) / 2 + 3)";
export const CONDITION_GRAPH_UPDATE_STEPS = 10;
export const CONDITION_GRAPH_LOAD_MAX = 4;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MAILBOXWIN_0 = {
  MAILBOXWIN_TITLE: 0,
  MAILBOXWIN_LIST: 1,
  MAILBOXWIN_OPTIONS: 2,
  MAILBOXWIN_COUNT: 3,
} as const;
export const ENUM_RELEARNERWIN_1 = {
  RELEARNERWIN_DESC_BATTLE: 0,
  RELEARNERWIN_DESC_CONTEST: 1,
  RELEARNERWIN_MOVE_LIST: 2,
  RELEARNERWIN_MSG: 3,
  RELEARNERWIN_YESNO: 4,
} as const;
export const ENUM_TAG_2 = {
  TAG_CONDITION_MON: 100,
  TAG_CONDITION_BALL: 101,
  TAG_CONDITION_CANCEL: 102,
  TAG_CONDITION_BALL_PLACEHOLDER: 103,
  TAG_CONDITION_SPARKLE: 104,
  TAG_CONDITION_MON_MARKINGS: 105,
  TAG_CONDITION_MARKINGS_MENU: 106,
  TAG_CONDITION_MARKINGS_MENU_2: 107,
} as const;
export const ENUM_CONDITION_3 = {
  CONDITION_ICON_SELECTED: 0,
  CONDITION_ICON_UNSELECTED: 1,
} as const;
export const ENUM_CONDITION_4 = {
  CONDITION_COOL: 0,
  CONDITION_TOUGH: 1,
  CONDITION_SMART: 2,
  CONDITION_CUTE: 3,
  CONDITION_BEAUTY: 4,
  CONDITION_COUNT: 5,
} as const;
export const ENUM_GRAPH_5 = {
  GRAPH_COOL: 0,
  GRAPH_BEAUTY: 1,
  GRAPH_CUTE: 2,
  GRAPH_SMART: 3,
  GRAPH_TOUGH: 4,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MailboxMenu_Alloc', ret: "bool8", arity: 1, params: "u8 count" },
  { name: 'MailboxMenu_AddWindow', ret: "u8", arity: 1, params: "u8 windowIdx" },
  { name: 'MailboxMenu_CreateList', ret: "u8", arity: 1, params: "struct PlayerPCItemPageStruct *page" },
  { name: 'MailboxMenu_AddScrollArrows', ret: "void", arity: 1, params: "struct PlayerPCItemPageStruct *page" },
  { name: 'MailboxMenu_Free', ret: "void", arity: 0, params: "void" },
  { name: 'MailboxMenu_RemoveWindow', ret: "void", arity: 1, params: "u8 windowIdx" },
  { name: 'ConditionGraph_Init', ret: "void", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_InitWindow', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'ConditionGraph_InitResetScanline', ret: "void", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_ResetScanline', ret: "bool8", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_Draw', ret: "void", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_TryUpdate', ret: "bool8", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_Update', ret: "void", arity: 1, params: "struct ConditionGraph *graph" },
  { name: 'ConditionGraph_CalcPositions', ret: "void", arity: 2, params: "u8 *conditions, struct UCoords16 *positions" },
  { name: 'ConditionGraph_SetNewPositions', ret: "void", arity: 3, params: "struct ConditionGraph *graph, struct UCoords16 *old, struct UCoords16 *new" },
  { name: 'ConditionMenu_UpdateMonEnter', ret: "bool8", arity: 2, params: "struct ConditionGraph *graph, s16 *x" },
  { name: 'ConditionMenu_UpdateMonExit', ret: "bool8", arity: 2, params: "struct ConditionGraph *graph, s16 *x" },
  { name: 'MoveConditionMonOnscreen', ret: "bool8", arity: 1, params: "s16 *x" },
  { name: 'MoveConditionMonOffscreen', ret: "bool8", arity: 1, params: "s16 *x" },
  { name: 'GetConditionMenuMonNameAndLocString', ret: "void", arity: 7, params: "u8 *locationDst, u8 *nameDst, u16 boxId, u16 monId, u16 partyId, u16 numMons, bool8 excludesCancel" },
  { name: 'GetConditionMenuMonConditions', ret: "void", arity: 8, params: "struct ConditionGraph *graph, u8 *numSparkles, u16 boxId, u16 monId, u16 partyId, u16 id, u16 numMons, bool8 excludesCancel" },
  { name: 'GetConditionMenuMonGfx', ret: "void", arity: 7, params: "void *tilesDst, void *palDst, u16 boxId, u16 monId, u16 partyId, u16 numMons, bool8 excludesCancel" },
  { name: 'LoadConditionMonPicTemplate', ret: "void", arity: 3, params: "struct SpriteSheet *sheet, struct SpriteTemplate *template, struct SpritePalette *pal" },
  { name: 'LoadConditionSelectionIcons', ret: "void", arity: 3, params: "struct SpriteSheet *sheets, struct SpriteTemplate *template, struct SpritePalette *pals" },
  { name: 'GetBoxOrPartyMonData', ret: "s32", arity: 4, params: "u16 boxId, u16 monId, s32 request, u8 *dst" },
  { name: 'LoadConditionSparkle', ret: "void", arity: 2, params: "struct SpriteSheet *sheet, struct SpritePalette *pal" },
  { name: 'ResetConditionSparkleSprites', ret: "void", arity: 1, params: "struct Sprite **sprites" },
  { name: 'CreateConditionSparkleSprites', ret: "void", arity: 3, params: "struct Sprite **sprites, u8 monSpriteId, u8 _count" },
  { name: 'DestroyConditionSparkleSprites', ret: "void", arity: 1, params: "struct Sprite **sprites" },
  { name: 'FreeConditionSparkles', ret: "void", arity: 1, params: "struct Sprite **sprites" },
  { name: 'MoveRelearnerPrintMessage', ret: "void", arity: 1, params: "u8 *str" },
  { name: 'MoveRelearnerRunTextPrinters', ret: "bool16", arity: 0, params: "void" },
  { name: 'MoveRelearnerCreateYesNoMenu', ret: "void", arity: 0, params: "void" },
  { name: 'LoadMoveRelearnerMovesList', ret: "u8", arity: 2, params: "const struct ListMenuItem *items, u16 numChoices" },
  { name: 'InitMoveRelearnerWindows', ret: "void", arity: 1, params: "bool8 useContestWindow" },
  { name: 'DrawLevelUpWindowPg1', ret: "void", arity: 6, params: "u16 windowId, u16 *statsBefore, u16 *statsAfter, u8 bgClr, u8 fgClr, u8 shadowClr" },
  { name: 'DrawLevelUpWindowPg2', ret: "void", arity: 5, params: "u16 windowId, u16 *currStats, u8 bgClr, u8 fgClr, u8 shadowClr" },
  { name: 'GetMonLevelUpWindowStats', ret: "void", arity: 2, params: "struct Pokemon *mon, u16 *currStats" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'sprite.h',
  'player_pc.h',
  'list_menu.h',
  'pokemon.h',
  'constants/berry.h',
] as const;
