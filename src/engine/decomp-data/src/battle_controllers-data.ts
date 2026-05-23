// AUTO-GENERATED from src/battle_controllers.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[10]` */
export const tInitialDelayTimer_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tState_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tCurrentBlock_WrapFrom_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tBlockSendDelayTimer_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tCurrentBlock_End_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tCurrentBlock_Start_EXPR = "data[15]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_LINK_0 = {
  LINK_BUFF_BUFFER_ID: 0,
  LINK_BUFF_ACTIVE_BATTLER: 1,
  LINK_BUFF_ATTACKER: 2,
  LINK_BUFF_TARGET: 3,
  LINK_BUFF_SIZE_LO: 4,
  LINK_BUFF_SIZE_HI: 5,
  LINK_BUFF_ABSENT_BATTLER_FLAGS: 6,
  LINK_BUFF_EFFECT_BATTLER: 7,
  LINK_BUFF_DATA: 8,
} as const;
export const ENUM_SENDTASK_1 = {
  SENDTASK_STATE_INITIALIZE: 0,
  SENDTASK_STATE_INITIAL_DELAY: 1,
  SENDTASK_STATE_COUNT_PLAYERS: 2,
  SENDTASK_STATE_BEGIN_SEND_BLOCK: 3,
  SENDTASK_STATE_FINISH_SEND_BLOCK: 4,
  SENDTASK_STATE_UNUSED_STATE: 5,
} as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sLinkSendTaskId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sLinkReceiveTaskId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sUnused', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct UnusedControllerStruct", name: 'gUnusedControllerStruct', isArray: false, init: "{}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sBattleBuffersTransferData', isArray: true, init: "{}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateTasksForSendRecvLinkBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'InitLinkBtlControllers', ret: "void", arity: 0, params: "void" },
  { name: 'InitSinglePlayerBtlControllers', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattlePartyIds', ret: "void", arity: 0, params: "void" },
  { name: 'Task_HandleSendLinkBuffersData', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleCopyReceivedLinkBuffersData', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'HandleLinkBattleSetup', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpBattleVarsAndBirchZigzagoon', ret: "void", arity: 0, params: "void" },
  { name: 'InitBattleControllers', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_Init', ret: "else", arity: 1, params: "B_RECORD_MODE_PLAYBACK" },
  { name: 'PrepareBufferDataTransfer', ret: "void", arity: 3, params: "u8 bufferId, u8 *data, u16 size" },
  { name: 'PrepareBufferDataTransferLink', ret: "void", arity: 3, params: "u8 bufferId, u16 size, u8 *data" },
  { name: 'TryReceiveLinkBattleData', ret: "void", arity: 0, params: "void" },
  { name: 'BtlController_EmitGetMonData', ret: "void", arity: 3, params: "u8 bufferId, u8 requestId, u8 monToCheck" },
  { name: 'BtlController_EmitGetRawMonData', ret: "UNUSED", arity: 3, params: "u8 bufferId, u8 monId, u8 bytes" },
  { name: 'BtlController_EmitSetMonData', ret: "void", arity: 5, params: "u8 bufferId, u8 requestId, u8 monToCheck, u8 bytes, void *data" },
  { name: 'BtlController_EmitSetRawMonData', ret: "UNUSED", arity: 4, params: "u8 bufferId, u8 monId, u8 bytes, void *data" },
  { name: 'BtlController_EmitLoadMonSprite', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitSwitchInAnim', ret: "void", arity: 3, params: "u8 bufferId, u8 partyId, bool8 dontClearSubstituteBit" },
  { name: 'BtlController_EmitReturnMonToBall', ret: "void", arity: 2, params: "u8 bufferId, bool8 skipAnim" },
  { name: 'BtlController_EmitDrawTrainerPic', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitTrainerSlide', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitTrainerSlideBack', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitFaintAnimation', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitPaletteFade', ret: "UNUSED", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitSuccessBallThrowAnim', ret: "UNUSED", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitBallThrowAnim', ret: "void", arity: 2, params: "u8 bufferId, u8 caseId" },
  { name: 'BtlController_EmitPause', ret: "UNUSED", arity: 3, params: "u8 bufferId, u8 toWait, void *data" },
  { name: 'BtlController_EmitMoveAnimation', ret: "void", arity: 8, params: "u8 bufferId, u16 move, u8 turnOfMove, u16 movePower, s32 dmg, u8 friendship, struct DisableStruct *disableStructPtr, u8 multihit" },
  { name: 'BtlController_EmitPrintString', ret: "void", arity: 2, params: "u8 bufferId, u16 stringId" },
  { name: 'BtlController_EmitPrintSelectionString', ret: "void", arity: 2, params: "u8 bufferId, u16 stringId" },
  { name: 'BtlController_EmitChooseAction', ret: "void", arity: 3, params: "u8 bufferId, u8 action, u16 itemId" },
  { name: 'BtlController_EmitYesNoBox', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitChooseMove', ret: "void", arity: 4, params: "u8 bufferId, bool8 isDoubleBattle, bool8 NoPpNumber, struct ChooseMoveStruct *movePpData" },
  { name: 'BtlController_EmitChooseItem', ret: "void", arity: 2, params: "u8 bufferId, u8 *battlePartyOrder" },
  { name: 'BtlController_EmitChoosePokemon', ret: "void", arity: 5, params: "u8 bufferId, u8 caseId, u8 slotId, u8 abilityId, u8 *data" },
  { name: 'BtlController_EmitCmd23', ret: "UNUSED", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitHealthBarUpdate', ret: "void", arity: 2, params: "u8 bufferId, u16 hpValue" },
  { name: 'BtlController_EmitExpUpdate', ret: "void", arity: 3, params: "u8 bufferId, u8 partyId, u16 expPoints" },
  { name: 'BtlController_EmitStatusIconUpdate', ret: "void", arity: 3, params: "u8 bufferId, u32 status1, u32 status2" },
  { name: 'BtlController_EmitStatusAnimation', ret: "void", arity: 3, params: "u8 bufferId, bool8 status2, u32 status" },
  { name: 'BtlController_EmitStatusXor', ret: "UNUSED", arity: 2, params: "u8 bufferId, u8 b" },
  { name: 'BtlController_EmitDataTransfer', ret: "void", arity: 3, params: "u8 bufferId, u16 size, void *data" },
  { name: 'BtlController_EmitDMA3Transfer', ret: "UNUSED", arity: 4, params: "u8 bufferId, void *dst, u16 size, void *data" },
  { name: 'BtlController_EmitPlayBGM', ret: "UNUSED", arity: 3, params: "u8 bufferId, u16 songId, void *data" },
  { name: 'BtlController_EmitCmd32', ret: "UNUSED", arity: 3, params: "u8 bufferId, u16 size, void *data" },
  { name: 'BtlController_EmitTwoReturnValues', ret: "void", arity: 3, params: "u8 bufferId, u8 ret8, u16 ret16" },
  { name: 'BtlController_EmitChosenMonReturnValue', ret: "void", arity: 3, params: "u8 bufferId, u8 partyId, u8 *battlePartyOrder" },
  { name: 'BtlController_EmitOneReturnValue', ret: "void", arity: 2, params: "u8 bufferId, u16 ret" },
  { name: 'BtlController_EmitOneReturnValue_Duplicate', ret: "void", arity: 2, params: "u8 bufferId, u16 ret" },
  { name: 'BtlController_EmitClearUnkVar', ret: "UNUSED", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitSetUnkVar', ret: "UNUSED", arity: 2, params: "u8 bufferId, u8 b" },
  { name: 'BtlController_EmitClearUnkFlag', ret: "UNUSED", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitToggleUnkFlag', ret: "UNUSED", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitHitAnimation', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitCantSwitch', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitPlaySE', ret: "void", arity: 2, params: "u8 bufferId, u16 songId" },
  { name: 'BtlController_EmitPlayFanfareOrBGM', ret: "void", arity: 3, params: "u8 bufferId, u16 songId, bool8 playBGM" },
  { name: 'BtlController_EmitFaintingCry', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitIntroSlide', ret: "void", arity: 2, params: "u8 bufferId, u8 environmentId" },
  { name: 'BtlController_EmitIntroTrainerBallThrow', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitDrawPartyStatusSummary', ret: "void", arity: 3, params: "u8 bufferId, struct HpAndStatus *hpAndStatus, u8 flags" },
  { name: 'BtlController_EmitHidePartyStatusSummary', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitEndBounceEffect', ret: "void", arity: 1, params: "u8 bufferId" },
  { name: 'BtlController_EmitSpriteInvisibility', ret: "void", arity: 2, params: "u8 bufferId, bool8 isInvisible" },
  { name: 'BtlController_EmitBattleAnimation', ret: "void", arity: 3, params: "u8 bufferId, u8 animationId, u16 argument" },
  { name: 'BtlController_EmitLinkStandbyMsg', ret: "void", arity: 3, params: "u8 bufferId, u8 mode, bool32 record" },
  { name: 'BtlController_EmitResetActionMoveSelection', ret: "void", arity: 2, params: "u8 bufferId, u8 caseId" },
  { name: 'BtlController_EmitEndLinkBattle', ret: "void", arity: 2, params: "u8 bufferId, u8 battleOutcome" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandleCopyReceivedLinkBuffersData',
  'Task_HandleSendLinkBuffersData',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_ai_script_commands.h',
  'battle_anim.h',
  'battle_controllers.h',
  'battle_message.h',
  'cable_club.h',
  'link.h',
  'link_rfu.h',
  'party_menu.h',
  'pokemon.h',
  'recorded_battle.h',
  'task.h',
  'util.h',
  'constants/abilities.h',
] as const;
