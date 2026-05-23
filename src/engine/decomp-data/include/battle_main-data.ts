// AUTO-GENERATED from include/battle_main.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_main.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TYPE_MUL_NO_EFFECT = 0;
export const TYPE_MUL_NOT_EFFECTIVE = 5;
export const TYPE_MUL_NORMAL = 10;
export const TYPE_MUL_SUPER_EFFECTIVE = 20;
export const TYPE_FORESIGHT = 254;
export const TYPE_ENDTABLE = 255;
export const BOUNCE_MON = 0;
export const BOUNCE_HEALTHBOX = 1;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_InitBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleMainCB2', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_QuitRecordedBattle', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Battle', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_VsLetterDummy', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_VsLetterInit', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CB2_InitEndLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattleBgTemplateData', ret: "u32", arity: 2, params: "u8 arrayId, u8 caseId" },
  { name: 'GetBattleWindowTemplatePixelWidth', ret: "u32", arity: 2, params: "u32 windowsType, u32 tableId" },
  { name: 'SpriteCB_WildMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCallbackDummy_2', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_FaintOpponentMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ShowAsMoveTarget', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_HideAsMoveTarget', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_OpponentMonFromBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BattleSpriteStartSlideLeft', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_FaintSlideAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DoBounceEffect', ret: "void", arity: 4, params: "u8 battler, u8 which, s8 delta, s8 amplitude" },
  { name: 'EndBounceEffect', ret: "void", arity: 2, params: "u8 battler, u8 which" },
  { name: 'SpriteCB_PlayerMonFromBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TrainerThrowObject', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimSetCenterToCornerVecX', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BeginBattleIntroDummy', ret: "void", arity: 0, params: "void" },
  { name: 'BeginBattleIntro', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchInClearSetData', ret: "void", arity: 0, params: "void" },
  { name: 'FaintClearSetData', ret: "void", arity: 0, params: "void" },
  { name: 'BattleTurnPassed', ret: "void", arity: 0, params: "void" },
  { name: 'IsRunningFromBattleImpossible', ret: "u8", arity: 0, params: "void" },
  { name: 'SwitchPartyOrder', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'SwapTurnOrder', ret: "void", arity: 2, params: "u8 id1, u8 id2" },
  { name: 'GetWhoStrikesFirst', ret: "u8", arity: 3, params: "u8 battler1, u8 battler2, bool8 ignoreChosenMoves" },
  { name: 'RunBattleScriptCommands_PopCallbacksStack', ret: "void", arity: 0, params: "void" },
  { name: 'RunBattleScriptCommands', ret: "void", arity: 0, params: "void" },
  { name: 'TryRunFromBattle', ret: "bool8", arity: 1, params: "u8 battler" },
  { name: 'SpecialStatusesClear', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitBattle',
  'CB2_InitEndLinkBattle',
  'CB2_QuitRecordedBattle',
] as const;
