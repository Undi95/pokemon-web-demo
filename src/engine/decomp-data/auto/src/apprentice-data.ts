// AUTO-GENERATED from src/apprentice.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/apprentice.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `gSaveBlock2Ptr->playerApprentice` */
export const PLAYER_APPRENTICE_EXPR = "gSaveBlock2Ptr->playerApprentice";
/** Raw expr: `PLAYER_APPRENTICE.questionsAnswered - NUM_WHICH_MON_QUESTIONS` */
export const CURRENT_QUESTION_NUM_EXPR = "PLAYER_APPRENTICE.questionsAnswered - NUM_WHICH_MON_QUESTIONS";
/** Raw expr: `data[4]` */
export const tNoBButton_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tWrapAround_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tWindowId_EXPR = "data[6]";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetRandomAlternateMove', ret: "u16", arity: 1, params: "u8 monId" },
  { name: 'TrySetMove', ret: "bool8", arity: 2, params: "u8 monId, u16 move" },
  { name: 'CreateChooseAnswerTask', ret: "void", arity: 3, params: "bool8 noBButton, u8 itemsCount, u8 windowId" },
  { name: 'CreateAndShowWindow', ret: "u8", arity: 4, params: "u8 left, u8 top, u8 width, u8 height" },
  { name: 'RemoveAndHideWindow', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'Script_GivenApprenticeLvlMode', ret: "void", arity: 0, params: "void" },
  { name: 'Script_SetApprenticeLvlMode', ret: "void", arity: 0, params: "void" },
  { name: 'Script_SetApprenticeId', ret: "void", arity: 0, params: "void" },
  { name: 'ShuffleApprenticeSpecies', ret: "void", arity: 0, params: "void" },
  { name: 'Script_SetRandomQuestionData', ret: "void", arity: 0, params: "void" },
  { name: 'IncrementQuestionsAnswered', ret: "void", arity: 0, params: "void" },
  { name: 'IsFinalQuestion', ret: "void", arity: 0, params: "void" },
  { name: 'Script_CreateApprenticeMenu', ret: "void", arity: 0, params: "void" },
  { name: 'Script_PrintApprenticeMessage', ret: "void", arity: 0, params: "void" },
  { name: 'Script_ResetPlayerApprentice', ret: "void", arity: 0, params: "void" },
  { name: 'GetShouldCheckApprenticeGone', ret: "void", arity: 0, params: "void" },
  { name: 'ApprenticeGetQuestion', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumApprenticePartyMonsAssigned', ret: "void", arity: 0, params: "void" },
  { name: 'SetApprenticePartyMon', ret: "void", arity: 0, params: "void" },
  { name: 'InitQuestionData', ret: "void", arity: 0, params: "void" },
  { name: 'FreeQuestionData', ret: "void", arity: 0, params: "void" },
  { name: 'ApprenticeBufferString', ret: "void", arity: 0, params: "void" },
  { name: 'SetApprenticeMonMove', ret: "void", arity: 0, params: "void" },
  { name: 'SetLeadApprenticeMon', ret: "void", arity: 0, params: "void" },
  { name: 'Script_ApprenticeOpenBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'TrySetApprenticeHeldItem', ret: "void", arity: 0, params: "void" },
  { name: 'SaveApprentice', ret: "void", arity: 0, params: "void" },
  { name: 'SetSavedApprenticeTrainerGfxId', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayerApprenticeTrainerGfxId', ret: "void", arity: 0, params: "void" },
  { name: 'GetShouldApprenticeLeave', ret: "void", arity: 0, params: "void" },
  { name: 'ShiftSavedApprentices', ret: "void", arity: 0, params: "void" },
  { name: 'BufferApprenticeChallengeText', ret: "void", arity: 1, params: "u8 saveApprenticeId" },
  { name: 'Apprentice_ScriptContext_Enable', ret: "void", arity: 0, params: "void" },
  { name: 'ResetApprenticeStruct', ret: "void", arity: 1, params: "struct Apprentice *apprentice" },
  { name: 'ResetAllApprenticeData', ret: "void", arity: 0, params: "void" },
  { name: 'GivenApprenticeLvlMode', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetApprenticeId', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayersApprenticeLvlMode', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'GetMonIdForQuestion', ret: "u8", arity: 3, params: "u8 questionId, u8 *party, u8 *partySlot" },
  { name: 'SetRandomQuestionData', ret: "void", arity: 0, params: "void" },
  { name: 'GetLatestLearnedMoves', ret: "void", arity: 2, params: "u16 species, u16 *moves" },
  { name: 'GetDefaultMove', ret: "u16", arity: 3, params: "u8 monId, u8 speciesArrayId, u8 moveSlot" },
  { name: 'SaveApprenticeParty', ret: "void", arity: 1, params: "u8 numQuestions" },
  { name: 'CreateApprenticeMenu', ret: "void", arity: 1, params: "u8 menu" },
  { name: 'Task_ChooseAnswer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CallApprenticeFunction', ret: "void", arity: 0, params: "void" },
  { name: 'Task_WaitForPrintingMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ScriptContext_Enable', ret: "else", arity: 0, params: "" },
  { name: 'PrintApprenticeMessage', ret: "void", arity: 0, params: "void" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "stringDst, gText_OpenLevel" },
  { name: 'Task_SwitchToFollowupFuncAfterButtonPress', ret: "UNUSED", arity: 1, params: "u8 taskId" },
  { name: 'Task_ExecuteFuncAfterButtonPress', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ExecuteFollowupFuncAfterButtonPress', ret: "UNUSED", arity: 1, params: "TaskFunc task" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ChooseAnswer',
  'Task_ExecuteFuncAfterButtonPress',
  'Task_WaitForPrintingMessage',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'apprentice.h',
  'battle.h',
  'battle_tower.h',
  'data.h',
  'event_data.h',
  'event_object_movement.h',
  'field_player_avatar.h',
  'international_string_util.h',
  'item.h',
  'item_menu.h',
  'main.h',
  'malloc.h',
  'menu.h',
  'new_game.h',
  'party_menu.h',
  'random.h',
  'script.h',
  'script_menu.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'constants/battle_frontier.h',
  'constants/items.h',
  'constants/songs.h',
  'constants/trainers.h',
  'constants/moves.h',
  'data/battle_frontier/apprentice.h',
] as const;
