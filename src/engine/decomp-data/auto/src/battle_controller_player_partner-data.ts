// AUTO-GENERATED from src/battle_controller_player_partner.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_controller_player_partner.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tExpTask_monId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tExpTask_gainedExp_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tExpTask_bank_EXPR = "data[2]";
/** Raw expr: `data[10]` */
export const tExpTask_frames_EXPR = "data[10]";
/** Raw expr: `data[0]` */
export const sSpeedX_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const sSpeedY_EXPR = "data[2]";

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sUnused: readonly number[] = [131,77,243,95,111,79,235,62,103,46,16,70,140,61,40,53,197,44,21,127,181,86,157,83,59,67,218,54,121,42,14,83] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PlayerPartnerHandleGetMonData', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleGetRawMonData', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleSetMonData', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleSetRawMonData', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleLoadMonSprite', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleSwitchInAnim', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleReturnMonToBall', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleDrawTrainerPic', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleTrainerSlide', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleTrainerSlideBack', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleFaintAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandlePaletteFade', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleSuccessBallThrowAnim', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleBallThrowAnim', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandlePause', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleMoveAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandlePrintString', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandlePrintSelectionString', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleChooseAction', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleYesNoBox', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleChooseMove', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleChooseItem', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleChoosePokemon', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleCmd23', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleHealthBarUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleExpUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleStatusIconUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleStatusAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleStatusXor', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleDataTransfer', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleDMA3Transfer', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandlePlayBGM', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleCmd32', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleTwoReturnValues', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleChosenMonReturnValue', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleOneReturnValue', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleOneReturnValue_Duplicate', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleClearUnkVar', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleSetUnkVar', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleClearUnkFlag', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleToggleUnkFlag', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleHitAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleCantSwitch', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandlePlaySE', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandlePlayFanfareOrBGM', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleFaintingCry', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleIntroSlide', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleIntroTrainerBallThrow', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleDrawPartyStatusSummary', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleHidePartyStatusSummary', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleEndBounceEffect', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleSpriteInvisibility', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleBattleAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleLinkStandbyMsg', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleResetActionMoveSelection', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerHandleEndLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerCmdEnd', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerBufferRunCommand', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerBufferExecCompleted', ret: "void", arity: 0, params: "void" },
  { name: 'Task_LaunchLvlUpAnim', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DestroyExpTaskAndCompleteOnInactiveTextPrinter', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_PrepareToGiveExpWithExpBar', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_GiveExpWithExpBar', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_UpdateLvlInHealthbox', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SwitchIn_WaitAndEnd', ret: "void", arity: 0, params: "void" },
  { name: 'CopyPlayerPartnerMonData', ret: "u32", arity: 2, params: "u8 monId, u8 *dst" },
  { name: 'SetPlayerPartnerMonData', ret: "void", arity: 1, params: "u8 monId" },
  { name: 'StartSendOutAnim', ret: "void", arity: 2, params: "u8 battler, bool8 dontClearSubstituteBit" },
  { name: 'DoSwitchOutAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerDoMoveAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartSendOutAnim', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'EndDrawPartyStatusSummary', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerPartnerDummy', ret: "void", arity: 0, params: "void" },
  { name: 'SetControllerToPlayerPartner', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnBattlerSpriteCallbackDummy', ret: "void", arity: 0, params: "void" },
  { name: 'FreeTrainerSpriteAfterSlide', ret: "void", arity: 0, params: "void" },
  { name: 'Intro_DelayAndEnd', ret: "void", arity: 0, params: "void" },
  { name: 'Intro_WaitForHealthbox', ret: "void", arity: 0, params: "void" },
  { name: 'Intro_ShowHealthbox', ret: "void", arity: 0, params: "void" },
  { name: 'WaitForMonAnimAfterLoad', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnHealthbarDone', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnInactiveTextPrinter', ret: "void", arity: 0, params: "void" },
  { name: 'Task_GiveExpToMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'UpdateHealthboxAttribute', ret: "else", arity: 3, params: "gHealthboxSpriteIds[battler], &gPlayerParty[monIndex], HEALTHBOX_ALL" },
  { name: 'FreeMonSpriteAfterFaintAnim', ret: "void", arity: 0, params: "void" },
  { name: 'FreeMonSpriteAfterSwitchOutAnim', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnInactiveTextPrinter2', ret: "void", arity: 0, params: "void" },
  { name: 'DoHitAnimBlinkSpriteEffect', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchIn_ShowSubstitute', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchIn_ShowHealthbox', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchIn_TryShinyAnim', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnFinishedStatusAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnFinishedBattleAnimation', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_GiveExpToMon',
  'Task_GiveExpWithExpBar',
  'Task_LaunchLvlUpAnim',
  'Task_PrepareToGiveExpWithExpBar',
  'Task_StartSendOutAnim',
  'Task_UpdateLvlInHealthbox',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_ai_script_commands.h',
  'battle_anim.h',
  'battle_controllers.h',
  'battle_message.h',
  'battle_interface.h',
  'battle_setup.h',
  'battle_tower.h',
  'bg.h',
  'data.h',
  'item_use.h',
  'link.h',
  'main.h',
  'm4a.h',
  'palette.h',
  'pokeball.h',
  'pokemon.h',
  'reshow_battle_screen.h',
  'sound.h',
  'string_util.h',
  'task.h',
  'text.h',
  'util.h',
  'window.h',
  'constants/battle_anim.h',
  'constants/songs.h',
  'constants/trainers.h',
] as const;
