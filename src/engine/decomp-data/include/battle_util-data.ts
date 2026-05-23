// AUTO-GENERATED from include/battle_util.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_util.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(1 << 0)` */
export const MOVE_LIMITATION_ZEROMOVE_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const MOVE_LIMITATION_PP_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const MOVE_LIMITATION_DISABLED_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const MOVE_LIMITATION_TORMENTED_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const MOVE_LIMITATION_TAUNT_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const MOVE_LIMITATION_IMPRISON_EXPR = "(1 << 5)";
export const MOVE_LIMITATIONS_ALL = 255;
export const ABILITYEFFECT_ON_SWITCHIN = 0;
export const ABILITYEFFECT_ENDTURN = 1;
export const ABILITYEFFECT_MOVES_BLOCK = 2;
export const ABILITYEFFECT_ABSORBING = 3;
export const ABILITYEFFECT_ON_DAMAGE = 4;
export const ABILITYEFFECT_IMMUNITY = 5;
export const ABILITYEFFECT_FORECAST = 6;
export const ABILITYEFFECT_SYNCHRONIZE = 7;
export const ABILITYEFFECT_ATK_SYNCHRONIZE = 8;
export const ABILITYEFFECT_INTIMIDATE1 = 9;
export const ABILITYEFFECT_INTIMIDATE2 = 10;
export const ABILITYEFFECT_TRACE = 11;
export const ABILITYEFFECT_CHECK_OTHER_SIDE = 12;
export const ABILITYEFFECT_CHECK_BATTLER_SIDE = 13;
export const ABILITYEFFECT_FIELD_SPORT = 14;
export const ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER = 15;
export const ABILITYEFFECT_COUNT_OTHER_SIDE = 16;
export const ABILITYEFFECT_COUNT_BATTLER_SIDE = 17;
export const ABILITYEFFECT_COUNT_ON_FIELD = 18;
export const ABILITYEFFECT_CHECK_ON_FIELD = 19;
export const ABILITYEFFECT_MUD_SPORT = 253;
export const ABILITYEFFECT_WATER_SPORT = 254;
export const ABILITYEFFECT_SWITCH_IN_WEATHER = 255;
export const ITEMEFFECT_ON_SWITCH_IN = 0;
export const ITEMEFFECT_NORMAL = 1;
export const ITEMEFFECT_DUMMY = 2;
export const ITEMEFFECT_MOVE_END = 3;
export const ITEMEFFECT_KINGSROCK_SHELLBELL = 4;
/** Raw expr: `((!ABILITY_ON_FIELD(ABILITY_CLOUD_NINE) && !ABILITY_ON_FIELD(ABILITY_AIR_LOCK)))` */
export const WEATHER_HAS_EFFECT_EXPR = "((!ABILITY_ON_FIELD(ABILITY_CLOUD_NINE) && !ABILITY_ON_FIELD(ABILITY_AIR_LOCK)))";
/** Raw expr: `((!ABILITY_ON_FIELD2(ABILITY_CLOUD_NINE) && !ABILITY_ON_FIELD2(ABILITY_AIR_LOCK)))` */
export const WEATHER_HAS_EFFECT2_EXPR = "((!ABILITY_ON_FIELD2(ABILITY_CLOUD_NINE) && !ABILITY_ON_FIELD2(ABILITY_AIR_LOCK)))";
export const DISOBEDIENCE_OBEDIENT = 0;
export const DISOBEDIENCE_IGNORED = 1;
export const DISOBEDIENCE_OTHER = 2;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'HandleAction_UseMove', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_Switch', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_UseItem', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_Run', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_WatchesCarefully', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_SafariZoneBallThrow', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_ThrowPokeblock', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_GoNear', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_SafariZoneRun', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_WallyBallThrow', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_TryFinish', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_NothingIsFainted', ret: "void", arity: 0, params: "void" },
  { name: 'HandleAction_ActionFinished', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattlerForBattleScript', ret: "u8", arity: 1, params: "u8 caseId" },
  { name: 'PressurePPLose', ret: "void", arity: 3, params: "u8 target, u8 attacker, u16 move" },
  { name: 'PressurePPLoseOnUsingPerishSong', ret: "void", arity: 1, params: "u8 attacker" },
  { name: 'PressurePPLoseOnUsingImprison', ret: "void", arity: 1, params: "u8 attacker" },
  { name: 'MarkBattlerForControllerExec', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'MarkBattlerReceivedLinkData', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'CancelMultiTurnMoves', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'WasUnableToUseMove', ret: "bool8", arity: 1, params: "u8 battler" },
  { name: 'PrepareStringBattle', ret: "void", arity: 2, params: "u16 stringId, u8 battler" },
  { name: 'ResetSentPokesToOpponentValue', ret: "void", arity: 0, params: "void" },
  { name: 'OpponentSwitchInResetSentPokesToOpponentValue', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'UpdateSentPokesToOpponentValue', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'BattleScriptPush', ret: "void", arity: 1, params: "const u8 *bsPtr" },
  { name: 'BattleScriptPushCursor', ret: "void", arity: 0, params: "void" },
  { name: 'BattleScriptPop', ret: "void", arity: 0, params: "void" },
  { name: 'TrySetCantSelectMoveBattleScript', ret: "u8", arity: 0, params: "void" },
  { name: 'CheckMoveLimitations', ret: "u8", arity: 3, params: "u8 battler, u8 unusableMoves, u8 check" },
  { name: 'AreAllMovesUnusable', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetImprisonedMovesCount', ret: "u8", arity: 2, params: "u8 battler, u16 move" },
  { name: 'DoFieldEndTurnEffects', ret: "u8", arity: 0, params: "void" },
  { name: 'DoBattlerEndTurnEffects', ret: "u8", arity: 0, params: "void" },
  { name: 'HandleWishPerishSongOnTurnEnd', ret: "bool8", arity: 0, params: "void" },
  { name: 'HandleFaintedMonActions', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryClearRageStatuses', ret: "void", arity: 0, params: "void" },
  { name: 'AtkCanceler_UnableToUseMove', ret: "u8", arity: 0, params: "void" },
  { name: 'HasNoMonsToSwitch', ret: "bool8", arity: 3, params: "u8 battler, u8 partyIdBattlerOn1, u8 partyIdBattlerOn2" },
  { name: 'CastformDataTypeChange', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'AbilityBattleEffects', ret: "u8", arity: 5, params: "u8 caseID, u8 battler, u8 ability, u8 special, u16 moveArg" },
  { name: 'BattleScriptExecute', ret: "void", arity: 1, params: "const u8 *BS_ptr" },
  { name: 'BattleScriptPushCursorAndCallback', ret: "void", arity: 1, params: "const u8 *BS_ptr" },
  { name: 'ItemBattleEffects', ret: "u8", arity: 3, params: "u8 caseID, u8 battler, bool8 moveTurn" },
  { name: 'ClearFuryCutterDestinyBondGrudge', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'HandleAction_RunBattleScript', ret: "void", arity: 0, params: "void" },
  { name: 'GetMoveTarget', ret: "u8", arity: 2, params: "u16 move, u8 setTarget" },
  { name: 'IsMonDisobedient', ret: "u8", arity: 0, params: "void" },
] as const;
