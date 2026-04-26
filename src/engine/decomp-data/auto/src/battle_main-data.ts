// AUTO-GENERATED from src/battle_main.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_main.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[4]` */
export const sDelay_EXPR = "data[4]";
export const STATE_INIT = 0;
export const STATE_LINK = 1;
export const STATE_WAIT_LINK = 2;
export const STATE_ASK_RECORD = 3;
export const STATE_PRINT_YES_NO = 4;
export const STATE_HANDLE_YES_NO = 5;
export const STATE_RECORD_NO = 6;
export const STATE_END_RECORD_NO = 7;
export const STATE_WAIT_END = 8;
export const STATE_END = 9;
export const STATE_RECORD_YES = 10;
export const STATE_RECORD_WAIT = 11;
export const STATE_END_RECORD_YES = 12;
/** Raw expr: `data[0]` */
export const sBattler_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const sSpeciesId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sNumFlickers_EXPR = "data[3]";
/** Raw expr: `data[1]` */
export const sSpeedX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSpeedY_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const sSinIndex_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sDelta_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sAmplitude_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sBouncerSpriteId_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sWhich_EXPR = "data[4]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_STATE_0 = {
  STATE_TURN_START_RECORD: 0,
  STATE_BEFORE_ACTION_CHOSEN: 1,
  STATE_WAIT_ACTION_CHOSEN: 2,
  STATE_WAIT_ACTION_CASE_CHOSEN: 3,
  STATE_WAIT_ACTION_CONFIRMED_STANDBY: 4,
  STATE_WAIT_ACTION_CONFIRMED: 5,
  STATE_SELECTION_SCRIPT: 6,
  STATE_WAIT_SET_BEFORE_ACTION: 7,
  STATE_SELECTION_SCRIPT_MAY_RUN: 8,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const gOamData_BattleSpriteOpponentSide = { y: 0, affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const gOamData_BattleSpritePlayerSide = { y: 0, affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 2, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gUnusedBattleInitSprite = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_UnusedBattleInit" } as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sTurnActionsFuncsTable = ['HandleAction_UseMove', 'HandleAction_UseItem', 'HandleAction_Switch', 'HandleAction_Run', 'HandleAction_WatchesCarefully', 'HandleAction_SafariZoneBallThrow', 'HandleAction_ThrowPokeblock', 'HandleAction_GoNear', 'HandleAction_SafariZoneRun', 'HandleAction_WallyBallThrow', 'HandleAction_RunBattleScript', 'HandleAction_TryFinish', 'HandleAction_ActionFinished', 'HandleAction_NothingIsFainted'] as const;
export const sEndTurnFuncsTable = ['HandleEndTurn_ContinueBattle', 'HandleEndTurn_BattleWon', 'HandleEndTurn_BattleLost', 'HandleEndTurn_BattleLost', 'HandleEndTurn_RanFromBattle', 'HandleEndTurn_FinishBattle', 'HandleEndTurn_MonFled', 'HandleEndTurn_FinishBattle', 'HandleEndTurn_FinishBattle', 'HandleEndTurn_FinishBattle', 'HandleEndTurn_FinishBattle'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_BG0_X', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_BG0_Y', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_BG1_X', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_BG1_Y', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_BG2_X', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_BG2_Y', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_BG3_X', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_BG3_Y', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_WIN0H', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_WIN0V', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_WIN1H', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattle_WIN1V', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gDisplayedStringBattle', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleTextBuff1', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleTextBuff2', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleTextBuff3', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sFlickerArray', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gBattleTypeFlags', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleEnvironment', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gUnusedFirstBattleVar1', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct MultiPartnerMenuPokemon", name: 'gMultiPartnerParty', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gActiveBattler', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gBattleControllerExecFlags', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlersCount', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattlerPartyIndexes', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlerPositions', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gActionsByTurnOrder', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlerByTurnOrder', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gCurrentTurnActionNumber', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gCurrentActionFuncId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct BattlePokemon", name: 'gBattleMons', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlerSpriteIds', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gCurrMovePos', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gChosenMovePos', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gCurrentMove', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gChosenMove', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gCalledMove', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s32", name: 'gBattleMoveDamage', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s32", name: 'gHpDealt', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s32", name: 'gBideDmg', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gLastUsedItem', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gLastUsedAbility', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlerAttacker', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlerTarget', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlerFainted', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gEffectBattler', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gPotentialItemEffectBattler', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gAbsentBattlerFlags', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gCritMultiplier', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gMultiHitCounter', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gUnusedBattleMainVar', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gChosenActionByBattler', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gLastPrintedMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gLastMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gLastLandedMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gLastHitByType', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gLastResultingMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gLockedMoves', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gLastHitBy', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gChosenMoveByBattler', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gMoveResultFlags', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gHitMarker', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sUnusedBattlersArray', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBideTarget', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gUnusedFirstBattleVar2', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSideStatuses', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct SideTimer", name: 'gSideTimers', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gStatuses3', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct DisableStruct", name: 'gDisableStructs', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gPauseCounterBattle', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gPaydayMoney', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gRandomTurnNumber', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleCommunication', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleOutcome', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct ProtectStruct", name: 'gProtectStructs', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct SpecialStatus", name: 'gSpecialStatuses', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattleWeather', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct WishFutureKnock", name: 'gWishFutureKnock', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gIntroSlideFlags', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gSentPokesToOpponent', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gDynamicBasePower', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gExpShareExp', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct BattleEnigmaBerry", name: 'gEnigmaBerries', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct BattleScripting", name: 'gBattleScripting', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gActionSelectionCursor', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gMoveSelectionCursor', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlerStatusSummaryTaskId', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattlerInMenuId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gDoingBattleAnim', isArray: false, init: "FALSE" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gTransformedPersonalities', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gPlayerDpadHoldFrames', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gBattleMovePower', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gMoveToLearn', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBattleMonForms', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "MainCallback", name: 'gPreBattleCallback1', isArray: false, init: "NULL" },
  { segment: 'COMMON_DATA', type: "struct BattleResults", name: 'gBattleResults', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gLeveledUpInBattle', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gHealthboxSpriteIds', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gMultiUsePlayerCursor', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gNumberOfMovesToChoose', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gBattleControllerData', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_InitBattleInternal', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_PreInitMultiBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_PreInitIngamePlayerPartnerBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_HandleStartMultiPartnerBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_HandleStartMultiBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_HandleStartBattle', ret: "void", arity: 0, params: "void" },
  { name: 'TryCorrectShedinjaLanguage', ret: "void", arity: 1, params: "struct Pokemon *mon" },
  { name: 'CreateNPCTrainerParty', ret: "u8", arity: 3, params: "struct Pokemon *party, u16 trainerNum, bool8 firstTrainer" },
  { name: 'BattleMainCB1', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_EndLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'EndLinkBattleInSteps', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitAskRecordBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_AskRecordBattle', ret: "void", arity: 0, params: "void" },
  { name: 'AskRecordBattle', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_MoveWildMonToRight', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_WildMonShowHealthbox', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_WildMonAnimate', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Flicker', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_AnimFaintOpponent', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BlinkVisible', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Idle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BattleSpriteSlideLeft', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TurnValuesCleanUp', ret: "void", arity: 1, params: "bool8 var0" },
  { name: 'SpriteCB_BounceEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BattleStartClearSetData', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroGetMonsData', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroPrepareBackgroundSlide', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroDrawTrainersOrMonsSprites', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroDrawPartySummaryScreens', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroPrintTrainerWantsToBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroPrintWildMonAttacked', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroPrintOpponentSendsOut', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroPrintPlayerSendsOut', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroOpponent1SendsOutMonAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroOpponent2SendsOutMonAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroRecordMonsToDex', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroPlayer1SendsOutMonAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'TryDoEventsBeforeFirstTurn', ret: "void", arity: 0, params: "void" },
  { name: 'HandleTurnActionSelectionState', ret: "void", arity: 0, params: "void" },
  { name: 'RunTurnActionsFunctions', ret: "void", arity: 0, params: "void" },
  { name: 'SetActionsAndBattlersTurnOrder', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateBattlerPartyOrdersOnSwitch', ret: "void", arity: 0, params: "void" },
  { name: 'AllAtActionConfirmed', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckFocusPunch_ClearVarsBeforeTurnStarts', ret: "void", arity: 0, params: "void" },
  { name: 'FreeResetData_ReturnToOvOrDoEvolutions', ret: "void", arity: 0, params: "void" },
  { name: 'ReturnFromBattleToOverworld', ret: "void", arity: 0, params: "void" },
  { name: 'TryEvolvePokemon', ret: "void", arity: 0, params: "void" },
  { name: 'WaitForEvoSceneToFinish', ret: "void", arity: 0, params: "void" },
  { name: 'HandleEndTurn_ContinueBattle', ret: "void", arity: 0, params: "void" },
  { name: 'HandleEndTurn_BattleWon', ret: "void", arity: 0, params: "void" },
  { name: 'HandleEndTurn_BattleLost', ret: "void", arity: 0, params: "void" },
  { name: 'HandleEndTurn_RanFromBattle', ret: "void", arity: 0, params: "void" },
  { name: 'HandleEndTurn_MonFled', ret: "void", arity: 0, params: "void" },
  { name: 'HandleEndTurn_FinishBattle', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_UnusedBattleInit', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_UnusedBattleInit_Main', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CB2_InitBattle', ret: "void", arity: 0, params: "void" },
  { name: 'SetMainCallback2', ret: "else", arity: 1, params: "CB2_HandleStartBattle" },
  { name: 'BufferPartyVsScreenHealth_AtStart', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayerBerryDataInBattleStruct', ret: "void", arity: 0, params: "void" },
  { name: 'SetAllPlayersBerryData', ret: "void", arity: 0, params: "void" },
  { name: 'FindLinkBattleMaster', ret: "void", arity: 2, params: "u8 numPlayers, u8 multiPlayerId" },
  { name: 'SetMultiPartnerMenuParty', ret: "void", arity: 1, params: "u8 offset" },
  { name: 'SetCloseLinkCallback', ret: "else", arity: 0, params: "" },
  { name: 'BattleMainCB2', ret: "void", arity: 0, params: "void" },
  { name: 'FreeRestoreBattleData', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_QuitRecordedBattle', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_Battle', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'VBlankCB_Battle', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_VsLetterDummy', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_VsLetter', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_VsLetterInit', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BufferPartyVsScreenHealth_AtEnd', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CB2_InitEndLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattleBgTemplateData', ret: "u32", arity: 2, params: "u8 arrayId, u8 caseId" },
  { name: 'GetBattleWindowTemplatePixelWidth', ret: "u32", arity: 2, params: "u32 windowsType, u32 tableId" },
  { name: 'SpriteCB_WildMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCallbackDummy_2', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_InitFlicker', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_FaintOpponentMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ShowAsMoveTarget', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_HideAsMoveTarget', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_OpponentMonFromBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BattleSpriteStartSlideLeft', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetIdleSpriteCallback', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_FaintSlideAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DoBounceEffect', ret: "void", arity: 4, params: "u8 battler, u8 which, s8 delta, s8 amplitude" },
  { name: 'EndBounceEffect', ret: "void", arity: 2, params: "u8 battler, u8 which" },
  { name: 'SpriteCB_PlayerMonFromBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TrainerThrowObject_Main', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TrainerThrowObject', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimSetCenterToCornerVecX', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BeginBattleIntroDummy', ret: "void", arity: 0, params: "void" },
  { name: 'BeginBattleIntro', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchInClearSetData', ret: "void", arity: 0, params: "void" },
  { name: 'FaintClearSetData', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroSkipRecordMonsToDex', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'BattleIntroPlayer2SendsOutMonAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'BattleIntroSwitchInPlayerMons', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'BattleTurnPassed', ret: "void", arity: 0, params: "void" },
  { name: 'IsRunningFromBattleImpossible', ret: "u8", arity: 0, params: "void" },
  { name: 'SwitchPartyOrder', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'BtlController_EmitChoosePokemon', ret: "else", arity: 5, params: "B_COMM_TO_CONTROLLER, PARTY_ACTION_CHOOSE_MON, PARTY_SIZE, ABILITY_NONE, gBattleStruct->battlerPartyOrders[gActiveBattler]" },
  { name: 'SwapTurnOrder', ret: "void", arity: 2, params: "u8 id1, u8 id2" },
  { name: 'GetWhoStrikesFirst', ret: "u8", arity: 3, params: "u8 battler1, u8 battler2, bool8 ignoreChosenMoves" },
  { name: 'SpecialStatusesClear', ret: "void", arity: 0, params: "void" },
  { name: 'PlayBGM', ret: "else", arity: 1, params: "MUS_VICTORY_TRAINER" },
  { name: 'RunBattleScriptCommands_PopCallbacksStack', ret: "void", arity: 0, params: "void" },
  { name: 'RunBattleScriptCommands', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_AskRecordBattle',
  'CB2_EndLinkBattle',
  'CB2_HandleStartBattle',
  'CB2_HandleStartMultiBattle',
  'CB2_HandleStartMultiPartnerBattle',
  'CB2_InitAskRecordBattle',
  'CB2_InitBattle',
  'CB2_InitBattleInternal',
  'CB2_InitEndLinkBattle',
  'CB2_PreInitIngamePlayerPartnerBattle',
  'CB2_PreInitMultiBattle',
  'CB2_QuitRecordedBattle',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_ai_script_commands.h',
  'battle_arena.h',
  'battle_controllers.h',
  'battle_interface.h',
  'battle_main.h',
  'battle_message.h',
  'battle_pyramid.h',
  'battle_scripts.h',
  'battle_setup.h',
  'battle_tower.h',
  'battle_util.h',
  'berry.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'dma3.h',
  'event_data.h',
  'evolution_scene.h',
  'graphics.h',
  'gpu_regs.h',
  'international_string_util.h',
  'item.h',
  'link.h',
  'link_rfu.h',
  'load_save.h',
  'main.h',
  'malloc.h',
  'm4a.h',
  'palette.h',
  'party_menu.h',
  'pokeball.h',
  'pokedex.h',
  'pokemon.h',
  'random.h',
  'recorded_battle.h',
  'roamer.h',
  'safari_zone.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'trig.h',
  'tv.h',
  'util.h',
  'window.h',
  'constants/abilities.h',
  'constants/battle_move_effects.h',
  'constants/battle_string_ids.h',
  'constants/hold_effects.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/party_menu.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/trainers.h',
  'cable_club.h',
  'data/text/abilities.h',
] as const;
