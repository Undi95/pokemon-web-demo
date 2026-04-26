// AUTO-GENERATED from src/party_menu.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/party_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_HELD_ITEM = 55120;
/** Raw expr from .c (can't be evaluated): `(1 << 0)` */
export const PARTY_PAL_SELECTED_EXPR = "(1 << 0)";
/** Raw expr from .c (can't be evaluated): `(1 << 1)` */
export const PARTY_PAL_FAINTED_EXPR = "(1 << 1)";
/** Raw expr from .c (can't be evaluated): `(1 << 2)` */
export const PARTY_PAL_TO_SWITCH_EXPR = "(1 << 2)";
/** Raw expr from .c (can't be evaluated): `(1 << 3)` */
export const PARTY_PAL_MULTI_ALT_EXPR = "(1 << 3)";
/** Raw expr from .c (can't be evaluated): `(1 << 4)` */
export const PARTY_PAL_SWITCHING_EXPR = "(1 << 4)";
/** Raw expr from .c (can't be evaluated): `(1 << 5)` */
export const PARTY_PAL_TO_SOFTBOIL_EXPR = "(1 << 5)";
/** Raw expr from .c (can't be evaluated): `(1 << 6)` */
export const PARTY_PAL_NO_MON_EXPR = "(1 << 6)";
/** Raw expr from .c (can't be evaluated): `(1 << 7)` */
export const PARTY_PAL_UNUSED_EXPR = "(1 << 7)";
export const MENU_DIR_DOWN = 1;
export const MENU_DIR_UP = -1;
export const MENU_DIR_RIGHT = 2;
export const MENU_DIR_LEFT = -2;
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tKeepOpen_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tHP_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tMaxHP_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tHPIncrement_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tHPToAdd_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tPartyId_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const tStartHP_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tSlot1Left_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tSlot1Top_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tSlot1Width_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tSlot1Height_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tSlot2Left_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const tSlot2Top_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const tSlot2Width_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[7]` */
export const tSlot2Height_EXPR = "data[7]";
/** Raw expr from .c (can't be evaluated): `data[8]` */
export const tSlot1Offset_EXPR = "data[8]";
/** Raw expr from .c (can't be evaluated): `data[9]` */
export const tSlot2Offset_EXPR = "data[9]";
/** Raw expr from .c (can't be evaluated): `data[10]` */
export const tSlot1SlideDir_EXPR = "data[10]";
/** Raw expr from .c (can't be evaluated): `data[11]` */
export const tSlot2SlideDir_EXPR = "data[11]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tUsedOnSlot_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tHadEffect_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tLastSlotUsed_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tXPos_EXPR = "data[0]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MENU_0 = {
  MENU_SUMMARY: 0,
  MENU_SWITCH: 1,
  MENU_CANCEL1: 2,
  MENU_ITEM: 3,
  MENU_GIVE: 4,
  MENU_TAKE_ITEM: 5,
  MENU_MAIL: 6,
  MENU_TAKE_MAIL: 7,
  MENU_READ: 8,
  MENU_CANCEL2: 9,
  MENU_SHIFT: 10,
  MENU_SEND_OUT: 11,
  MENU_ENTER: 12,
  MENU_NO_ENTRY: 13,
  MENU_STORE: 14,
  MENU_REGISTER: 15,
  MENU_TRADE1: 16,
  MENU_TRADE2: 17,
  MENU_TOSS: 18,
  MENU_FIELD_MOVES: 19,
} as const;
export const ENUM_ACTIONS_1 = {
  ACTIONS_NONE: 0,
  ACTIONS_SWITCH: 1,
  ACTIONS_SHIFT: 2,
  ACTIONS_SEND_OUT: 3,
  ACTIONS_ENTER: 4,
  ACTIONS_NO_ENTRY: 5,
  ACTIONS_STORE: 6,
  ACTIONS_SUMMARY_ONLY: 7,
  ACTIONS_ITEM: 8,
  ACTIONS_MAIL: 9,
  ACTIONS_REGISTER: 10,
  ACTIONS_TRADE: 11,
  ACTIONS_SPIN_TRADE: 12,
  ACTIONS_TAKEITEM_TOSS: 13,
} as const;
export const ENUM_FIELD_2 = {
  FIELD_MOVE_CUT: 0,
  FIELD_MOVE_FLASH: 1,
  FIELD_MOVE_ROCK_SMASH: 2,
  FIELD_MOVE_STRENGTH: 3,
  FIELD_MOVE_SURF: 4,
  FIELD_MOVE_FLY: 5,
  FIELD_MOVE_DIVE: 6,
  FIELD_MOVE_WATERFALL: 7,
  FIELD_MOVE_TELEPORT: 8,
  FIELD_MOVE_DIG: 9,
  FIELD_MOVE_SECRET_POWER: 10,
  FIELD_MOVE_MILK_DRINK: 11,
  FIELD_MOVE_SOFT_BOILED: 12,
  FIELD_MOVE_SWEET_SCENT: 13,
  FIELD_MOVES_COUNT: 14,
} as const;
export const ENUM_PARTY_3 = {
  PARTY_BOX_LEFT_COLUMN: 0,
  PARTY_BOX_RIGHT_COLUMN: 1,
} as const;
export const ENUM_TAG_4 = {
  TAG_POKEBALL: 1200,
  TAG_POKEBALL_SMALL: 1201,
  TAG_STATUS_ICONS: 1202,
} as const;
export const ENUM_CAN_5 = {
  CAN_LEARN_MOVE: 0,
  CANNOT_LEARN_MOVE: 1,
  ALREADY_KNOWS_MOVE: 2,
  CANNOT_LEARN_MOVE_IS_EGG: 3,
} as const;
export const ENUM_WIN_6 = {
  WIN_MSG: 0,
} as const;

// ─── FillBgTilemapBufferRect calls (frame layout, top-level constants only) ─
export const FILL_BG_CALLS = [
  { bg: 1, tile: 14, x: 23, y: 17, w: 7, h: 2, palNum: 1 },
] as const;

// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────
export const PALETTE_FADES = [
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
] as const;

// ─── Task_* functions (state machine steps) ─────────────────────────────────
// Function bodies require manual transcription; these names identify each step.
export const TASK_NAMES = [
  'Task_BattlePyramidChooseMonHeldItems',
  'Task_CancelAfterAorBPress',
  'Task_CancelChooseMonYesNo',
  'Task_CancelParticipationYesNo',
  'Task_ChooseContestMon',
  'Task_ChooseMonForMoveRelearner',
  'Task_ChoosePartyMon',
  'Task_ClosePartyMenu',
  'Task_ClosePartyMenuAfterText',
  'Task_ClosePartyMenuAndSetCB2',
  'Task_ContinueChoosingHalfParty',
  'Task_DisplayGaveMailFromBagMessage',
  'Task_DisplayGaveMailFromPartyMessage',
  'Task_DisplayHPRestoredMessage',
  'Task_DisplayLevelUpStatsPg1',
  'Task_DisplayLevelUpStatsPg2',
  'Task_DoLearnedMoveFanfareAfterText',
  'Task_ExitPartyMenu',
  'Task_FieldMoveExitAreaYesNo',
  'Task_FieldMoveWaitForFade',
  'Task_GiveHoldItem',
  'Task_HandleCancelChooseMonYesNoInput',
  'Task_HandleCancelParticipationYesNoInput',
  'Task_HandleChooseMonInput',
  'Task_HandleFieldMoveExitAreaYesNoInput',
  'Task_HandleLoseMailMessageYesNoInput',
  'Task_HandleReplaceMoveYesNoInput',
  'Task_HandleSelectionMenuInput',
  'Task_HandleSendMailToPCYesNoInput',
  'Task_HandleSpinTradeYesNoInput',
  'Task_HandleStopLearningMoveYesNoInput',
  'Task_HandleSwitchItemsFromBagYesNoInput',
  'Task_HandleSwitchItemsYesNoInput',
  'Task_HandleTossHeldItemYesNoInput',
  'Task_HandleWhichMoveInput',
  'Task_InitMultiPartnerPartySlideIn',
  'Task_LearnNextMoveOrClosePartyMenu',
  'Task_LearnedMove',
  'Task_LoseMailMessageYesNo',
  'Task_MultiPartnerPartySlideIn',
  'Task_PartyMenuModifyHP',
  'Task_PartyMenuReplaceMove',
  'Task_PartyMenuWaitForFade',
  'Task_PrintAndWaitForText',
  'Task_ReplaceMoveYesNo',
  'Task_ReturnToChooseMonAfterText',
  'Task_ReturnToPartyMenuWhileLearningMove',
  'Task_SacredAshDisplayHPRestored',
  'Task_SacredAshLoop',
  'Task_SendMailToPCYesNo',
  'Task_SetSacredAshCB',
  'Task_ShowSummaryScreenToForgetMove',
  'Task_SlideSelectedSlotsOffscreen',
  'Task_SlideSelectedSlotsOnscreen',
  'Task_SpinTradeYesNo',
  'Task_StopLearningMoveYesNo',
  'Task_SwitchHoldItemsPrompt',
  'Task_SwitchItemsFromBagYesNo',
  'Task_SwitchItemsYesNo',
  'Task_TossHeldItem',
  'Task_TossHeldItemYesNo',
  'Task_TryCreateSelectionWindow',
  'Task_TryLearnNewMoves',
  'Task_TryLearningNextMove',
  'Task_TryLearningNextMoveAfterText',
  'Task_UpdateHeldItemSprite',
  'Task_UpdateHeldItemSpriteAndClosePartyMenu',
  'Task_ValidateChosenHalfParty',
  'Task_WaitAfterMultiPartnerPartySlideIn',
  'Task_WaitForLinkAndReturnToChooseMon',
  'Task_WriteMailToGiveMonAfterText',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ChooseContestMon',
  'CB2_ChooseMonForMoveRelearner',
  'CB2_ChooseMonToGiveItem',
  'CB2_GiveHoldItem',
  'CB2_InitPartyMenu',
  'CB2_PartyMenuFromStartMenu',
  'CB2_ReadHeldMail',
  'CB2_ReturnToBagMenu',
  'CB2_ReturnToPartyMenuFromFlyMap',
  'CB2_ReturnToPartyMenuFromReadingMail',
  'CB2_ReturnToPartyMenuFromSummaryScreen',
  'CB2_ReturnToPartyMenuFromWritingMail',
  'CB2_ReturnToPartyMenuWhileLearningMove',
  'CB2_ReturnToPartyOrBagMenuFromWritingMail',
  'CB2_SelectBagItemToGive',
  'CB2_SetUpExitToBattleScreen',
  'CB2_ShowPartyMenuForItemUse',
  'CB2_ShowPokemonSummaryScreen',
  'CB2_ShowSummaryScreenToForgetMove',
  'CB2_UpdatePartyMenu',
  'CB2_WriteMailToGiveMon',
  'CB2_WriteMailToGiveMonFromBag',
] as const;
