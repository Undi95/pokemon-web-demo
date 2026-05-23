// AUTO-GENERATED from src/battle_controller_player.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_controller_player.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tExpTask_monId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tExpTask_gainedExp_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tExpTask_battler_EXPR = "data[2]";
/** Raw expr: `data[10]` */
export const tExpTask_frames_EXPR = "data[10]";
/** Raw expr: `data[0]` */
export const sSpeedX_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const sSpeedY_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const tBattlerId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tStartTimer_EXPR = "data[1]";
/** Raw expr: `data[5]` */
export const sBattlerId_EXPR = "data[5]";

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sUnused: readonly number[] = [72,72,32,90,80,80,80,88] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PlayerHandleGetMonData', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleSetMonData', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleSetRawMonData', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleLoadMonSprite', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleSwitchInAnim', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleReturnMonToBall', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleDrawTrainerPic', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleTrainerSlide', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleTrainerSlideBack', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleFaintAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandlePaletteFade', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleSuccessBallThrowAnim', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleBallThrowAnim', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandlePause', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleMoveAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandlePrintString', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandlePrintSelectionString', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleChooseAction', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleYesNoBox', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleChooseMove', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleChooseItem', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleChoosePokemon', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleCmd23', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleHealthBarUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleExpUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleStatusIconUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleStatusAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleStatusXor', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleDataTransfer', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleDMA3Transfer', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandlePlayBGM', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleCmd32', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleTwoReturnValues', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleChosenMonReturnValue', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleOneReturnValue', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleOneReturnValue_Duplicate', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleClearUnkVar', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleSetUnkVar', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleClearUnkFlag', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleToggleUnkFlag', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleHitAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleCantSwitch', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandlePlaySE', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandlePlayFanfareOrBGM', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleFaintingCry', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleIntroSlide', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleIntroTrainerBallThrow', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleDrawPartyStatusSummary', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleHidePartyStatusSummary', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleEndBounceEffect', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleSpriteInvisibility', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleBattleAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleLinkStandbyMsg', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleResetActionMoveSelection', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleEndLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerCmdEnd', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerBufferRunCommand', ret: "void", arity: 0, params: "void" },
  { name: 'HandleInputChooseTarget', ret: "void", arity: 0, params: "void" },
  { name: 'HandleInputChooseMove', ret: "void", arity: 0, params: "void" },
  { name: 'MoveSelectionCreateCursorAt', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'MoveSelectionDestroyCursorAt', ret: "void", arity: 1, params: "u8" },
  { name: 'MoveSelectionDisplayPpNumber', ret: "void", arity: 0, params: "void" },
  { name: 'MoveSelectionDisplayPpString', ret: "void", arity: 0, params: "void" },
  { name: 'MoveSelectionDisplayMoveType', ret: "void", arity: 0, params: "void" },
  { name: 'MoveSelectionDisplayMoveNames', ret: "void", arity: 0, params: "void" },
  { name: 'HandleMoveSwitching', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchIn_HandleSoundAndEnd', ret: "void", arity: 0, params: "void" },
  { name: 'WaitForMonSelection', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteWhenChoseItem', ret: "void", arity: 0, params: "void" },
  { name: 'Task_LaunchLvlUpAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PrepareToGiveExpWithExpBar', ret: "void", arity: 1, params: "u8" },
  { name: 'DestroyExpTaskAndCompleteOnInactiveTextPrinter', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_GiveExpWithExpBar', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_UpdateLvlInHealthbox', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintLinkStandbyMsg', ret: "void", arity: 0, params: "void" },
  { name: 'CopyPlayerMonData', ret: "u32", arity: 2, params: "u8, u8 *" },
  { name: 'SetPlayerMonData', ret: "void", arity: 1, params: "u8" },
  { name: 'StartSendOutAnim', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'DoSwitchOutAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerDoMoveAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartSendOutAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'EndDrawPartyStatusSummary', ret: "void", arity: 0, params: "void" },
  { name: 'BattleControllerDummy', ret: "void", arity: 0, params: "void" },
  { name: 'SetControllerToPlayer', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerBufferExecCompleted', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnBankSpritePosX_0', ret: "void", arity: 0, params: "void" },
  { name: 'HandleInputChooseAction', ret: "void", arity: 0, params: "void" },
  { name: 'UnusedEndBounceEffect', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'HandleMoveInputUnused', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'SetLinkBattleEndCallbacks', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattleEndCallbacks', ret: "void", arity: 0, params: "void" },
  { name: 'SetLinkStandbyCallback', ret: "else", arity: 0, params: "" },
  { name: 'CompleteOnBattlerSpriteCallbackDummy', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnBankSpriteCallbackDummy2', ret: "void", arity: 0, params: "void" },
  { name: 'FreeTrainerSpriteAfterSlide', ret: "void", arity: 0, params: "void" },
  { name: 'Intro_DelayAndEnd', ret: "void", arity: 0, params: "void" },
  { name: 'Intro_WaitForShinyAnimAndHealthbox', ret: "void", arity: 0, params: "void" },
  { name: 'Intro_TryShinyAnimShowHealthbox', ret: "void", arity: 0, params: "void" },
  { name: 'm4aMPlayVolumeControl', ret: "else", arity: 3, params: "&gMPlayInfo_BGM, TRACKS_ALL, 0x100" },
  { name: 'SwitchIn_CleanShinyAnimShowSubstitute', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchIn_TryShinyAnimShowHealthbox', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PlayerController_RestoreBgmAfterCry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CompleteOnHealthbarDone', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnInactiveTextPrinter', ret: "void", arity: 0, params: "void" },
  { name: 'Task_GiveExpToMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'UpdateHealthboxAttribute', ret: "else", arity: 3, params: "gHealthboxSpriteIds[battler], &gPlayerParty[monIndex], HEALTHBOX_ALL" },
  { name: 'FreeMonSpriteAfterFaintAnim', ret: "void", arity: 0, params: "void" },
  { name: 'FreeMonSpriteAfterSwitchOutAnim', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnInactiveTextPrinter2', ret: "void", arity: 0, params: "void" },
  { name: 'OpenPartyMenuToChooseMon', ret: "void", arity: 0, params: "void" },
  { name: 'BtlController_EmitChosenMonReturnValue', ret: "else", arity: 3, params: "B_COMM_TO_ENGINE, PARTY_SIZE, NULL" },
  { name: 'OpenBagAndChooseItem', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnSpecialAnimDone', ret: "void", arity: 0, params: "void" },
  { name: 'DoHitAnimBlinkSpriteEffect', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleYesNoInput', ret: "void", arity: 0, params: "void" },
  { name: 'BtlController_EmitTwoReturnValues', ret: "else", arity: 3, params: "B_COMM_TO_ENGINE, B_ACTION_NOTHING_FAINTED, 0" },
  { name: 'ActionSelectionCreateCursorAt', ret: "void", arity: 2, params: "u8 cursorPosition, u8 baseTileNum" },
  { name: 'ActionSelectionDestroyCursorAt', ret: "void", arity: 1, params: "u8 cursorPosition" },
  { name: 'CB2_SetUpReshowBattleScreenAfterMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_SetUpReshowBattleScreenAfterMenu2', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnFinishedStatusAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'CompleteOnFinishedBattleAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHandleGetRawMonData', ret: "void", arity: 0, params: "void" },
  { name: 'HandleChooseActionAfterDma3', ret: "void", arity: 0, params: "void" },
  { name: 'HandleChooseMoveAfterDma3', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerChooseMoveInBattlePalace', ret: "void", arity: 0, params: "void" },
  { name: 'InitMoveSelectionsVarsAndStrings', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_FreePlayerSpriteLoadMonSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_GiveExpToMon',
  'Task_GiveExpWithExpBar',
  'Task_LaunchLvlUpAnim',
  'Task_PlayerController_RestoreBgmAfterCry',
  'Task_PrepareToGiveExpWithExpBar',
  'Task_StartSendOutAnim',
  'Task_UpdateLvlInHealthbox',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_SetUpReshowBattleScreenAfterMenu',
  'CB2_SetUpReshowBattleScreenAfterMenu2',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_arena.h',
  'battle_controllers.h',
  'battle_dome.h',
  'battle_interface.h',
  'battle_message.h',
  'battle_setup.h',
  'battle_tv.h',
  'bg.h',
  'data.h',
  'item.h',
  'item_menu.h',
  'link.h',
  'main.h',
  'm4a.h',
  'palette.h',
  'party_menu.h',
  'pokeball.h',
  'pokemon.h',
  'random.h',
  'recorded_battle.h',
  'reshow_battle_screen.h',
  'sound.h',
  'string_util.h',
  'task.h',
  'text.h',
  'util.h',
  'window.h',
  'constants/battle_anim.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/party_menu.h',
  'constants/songs.h',
  'constants/trainers.h',
  'constants/rgb.h',
] as const;
