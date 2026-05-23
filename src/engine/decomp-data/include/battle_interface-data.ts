// AUTO-GENERATED from include/battle_interface.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_interface.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_HEALTHBOX_PLAYER1_TILE = 55039;
export const TAG_HEALTHBOX_PLAYER2_TILE = 55040;
export const TAG_HEALTHBOX_OPPONENT1_TILE = 55041;
export const TAG_HEALTHBOX_OPPONENT2_TILE = 55042;
export const TAG_HEALTHBAR_PLAYER1_TILE = 55044;
export const TAG_HEALTHBAR_OPPONENT1_TILE = 55045;
export const TAG_HEALTHBAR_PLAYER2_TILE = 55046;
export const TAG_HEALTHBAR_OPPONENT2_TILE = 55047;
export const TAG_HEALTHBOX_PALS_1 = 55049;
export const TAG_HEALTHBOX_PALS_2 = 55050;
export const TAG_HEALTHBOX_SAFARI_TILE = 55051;
export const TAG_STATUS_SUMMARY_BAR_TILE = 55052;
export const TAG_STATUS_SUMMARY_BAR_PAL = 55056;
export const TAG_STATUS_SUMMARY_BALLS_PAL = 55058;
export const TAG_STATUS_SUMMARY_BALLS_TILE = 55060;
/** Raw expr: `TAG_HEALTHBAR_PLAYER1_TILE` */
export const TAG_HEALTHBAR_PAL_EXPR = "TAG_HEALTHBAR_PLAYER1_TILE";
/** Raw expr: `TAG_HEALTHBOX_PLAYER1_TILE` */
export const TAG_HEALTHBOX_PAL_EXPR = "TAG_HEALTHBOX_PLAYER1_TILE";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_HP_0 = {
  HP_CURRENT: 0,
  HP_MAX: 1,
} as const;
export const ENUM_HEALTH_1 = {
  HEALTH_BAR: 0,
  EXP_BAR: 1,
} as const;
export const ENUM_HP_2 = {
  HP_BAR_EMPTY: 0,
  HP_BAR_RED: 1,
  HP_BAR_YELLOW: 2,
  HP_BAR_GREEN: 3,
  HP_BAR_FULL: 4,
} as const;
export const ENUM_HEALTHBOX_3 = {
  HEALTHBOX_ALL: 0,
  HEALTHBOX_CURRENT_HP: 1,
  HEALTHBOX_MAX_HP: 2,
  HEALTHBOX_LEVEL: 3,
  HEALTHBOX_NICK: 4,
  HEALTHBOX_HEALTH_BAR: 5,
  HEALTHBOX_EXP_BAR: 6,
  HEALTHBOX_UNUSED_7: 7,
  HEALTHBOX_UNUSED_8: 8,
  HEALTHBOX_STATUS_ICON: 9,
  HEALTHBOX_SAFARI_ALL_TEXT: 10,
  HEALTHBOX_SAFARI_BALLS_TEXT: 11,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateBattlerHealthboxSprites', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'CreateSafariPlayerHealthboxSprites', ret: "u8", arity: 0, params: "void" },
  { name: 'SetBattleBarStruct', ret: "void", arity: 5, params: "u8 battler, u8 healthboxSpriteId, s32 maxVal, s32 oldVal, s32 receivedValue" },
  { name: 'SetHealthboxSpriteInvisible', ret: "void", arity: 1, params: "u8 healthboxSpriteId" },
  { name: 'SetHealthboxSpriteVisible', ret: "void", arity: 1, params: "u8 healthboxSpriteId" },
  { name: 'DestoryHealthboxSprite', ret: "void", arity: 1, params: "u8 healthboxSpriteId" },
  { name: 'DummyBattleInterfaceFunc', ret: "void", arity: 2, params: "u8 healthboxSpriteId, bool8 isDoubleBattleBattlerOnly" },
  { name: 'UpdateOamPriorityInAllHealthboxes', ret: "void", arity: 1, params: "u8 priority" },
  { name: 'InitBattlerHealthboxCoords', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'UpdateHpTextInHealthbox', ret: "void", arity: 3, params: "u8 healthboxSpriteId, s16 value, u8 maxOrCurrent" },
  { name: 'SwapHpBarsWithHpText', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePartyStatusSummarySprites', ret: "u8", arity: 4, params: "u8 battler, struct HpAndStatus *partyInfo, bool8 skipPlayer, bool8 isBattleStart" },
  { name: 'Task_HidePartyStatusSummary', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'UpdateHealthboxAttribute', ret: "void", arity: 3, params: "u8 healthboxSpriteId, struct Pokemon *mon, u8 elementId" },
  { name: 'MoveBattleBar', ret: "s32", arity: 4, params: "u8 battler, u8 healthboxSpriteId, u8 whichBar, u8 unused" },
  { name: 'GetScaledHPFraction', ret: "u8", arity: 3, params: "s16 hp, s16 maxhp, u8 scale" },
  { name: 'GetHPBarLevel', ret: "u8", arity: 2, params: "s16 hp, s16 maxhp" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HidePartyStatusSummary',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'battle_controllers.h',
] as const;
