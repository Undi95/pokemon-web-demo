// AUTO-GENERATED from src/trainer_hill.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/trainer_hill.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const HILL_MAX_TIME = 215999;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sEReader_Pal': { path: 'graphics/trainer_hill/ereader.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sFloorStrings = ['gText_TrainerHill1F', 'gText_TrainerHill2F', 'gText_TrainerHill3F', 'gText_TrainerHill4F'] as const;
export const sModeStrings = ['gText_NormalTagMatch', 'gText_VarietyTagMatch', 'gText_UniqueTagMatch', 'gText_ExpertTagMatch'] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sHillFunctions = ['TrainerHillStartChallenge', 'GetOwnerState', 'GiveChallengePrize', 'CheckFinalTime', 'TrainerHillResumeTimer', 'TrainerHillSetPlayerLost', 'TrainerHillGetChallengeStatus', 'BufferChallengeTime', 'GetAllFloorsUsed', 'GetInEReaderMode', 'IsTrainerHillChallengeActive', 'ShowTrainerHillPostBattleText', 'SetAllTrainerFlags', 'GetGameSaved', 'SetGameSaved', 'ClearGameSaved', 'GetChallengeWon', 'TrainerHillSetMode'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'TrainerHillStartChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetOwnerState', ret: "void", arity: 0, params: "void" },
  { name: 'GiveChallengePrize', ret: "void", arity: 0, params: "void" },
  { name: 'CheckFinalTime', ret: "void", arity: 0, params: "void" },
  { name: 'TrainerHillResumeTimer', ret: "void", arity: 0, params: "void" },
  { name: 'TrainerHillSetPlayerLost', ret: "void", arity: 0, params: "void" },
  { name: 'TrainerHillGetChallengeStatus', ret: "void", arity: 0, params: "void" },
  { name: 'BufferChallengeTime', ret: "void", arity: 0, params: "void" },
  { name: 'GetAllFloorsUsed', ret: "void", arity: 0, params: "void" },
  { name: 'GetInEReaderMode', ret: "void", arity: 0, params: "void" },
  { name: 'IsTrainerHillChallengeActive', ret: "void", arity: 0, params: "void" },
  { name: 'ShowTrainerHillPostBattleText', ret: "void", arity: 0, params: "void" },
  { name: 'SetAllTrainerFlags', ret: "void", arity: 0, params: "void" },
  { name: 'GetGameSaved', ret: "void", arity: 0, params: "void" },
  { name: 'SetGameSaved', ret: "void", arity: 0, params: "void" },
  { name: 'ClearGameSaved', ret: "void", arity: 0, params: "void" },
  { name: 'GetChallengeWon', ret: "void", arity: 0, params: "void" },
  { name: 'TrainerHillSetMode', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpDataStruct', ret: "void", arity: 0, params: "void" },
  { name: 'FreeDataStruct', ret: "void", arity: 0, params: "void" },
  { name: 'TrainerHillDummy', ret: "void", arity: 0, params: "void" },
  { name: 'SetTimerValue', ret: "void", arity: 2, params: "u32 *dst, u32 val" },
  { name: 'GetTimerValue', ret: "u32", arity: 1, params: "u32 *src" },
  { name: 'SetTrainerHillMonLevel', ret: "void", arity: 2, params: "struct Pokemon *mon, u8 level" },
  { name: 'GetPrizeItemId', ret: "u16", arity: 0, params: "void" },
  { name: 'CallTrainerHillFunction', ret: "void", arity: 0, params: "void" },
  { name: 'ResetTrainerHillResults', ret: "void", arity: 0, params: "void" },
  { name: 'GetFloorId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetTrainerHillOpponentClass', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetTrainerHillTrainerName', ret: "void", arity: 2, params: "u8 *dst, u16 trainerId" },
  { name: 'GetTrainerHillTrainerFrontSpriteId', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'InitTrainerHillBattleStruct', ret: "void", arity: 0, params: "void" },
  { name: 'FreeTrainerHillBattleStruct', ret: "void", arity: 0, params: "void" },
  { name: 'CopyTrainerHillTrainerText', ret: "void", arity: 2, params: "u8 which, u16 localId" },
  { name: 'SetTrainerHillVBlankCounter', ret: "else", arity: 1, params: "&gSaveBlock1Ptr->trainerHill.timer" },
  { name: 'InTrainerHillChallenge', ret: "bool8", arity: 0, params: "void" },
  { name: 'TrainerHillDummy_Unused', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'PrintOnTrainerHillRecordsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadTrainerHillObjectEventTemplates', ret: "void", arity: 0, params: "void" },
  { name: 'LoadTrainerHillFloorObjectEventScripts', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetMapDataForFloor', ret: "u16", arity: 4, params: "u8 floorId, u32 x, u32 y, u32 floorWidth" },
  { name: 'GenerateTrainerHillFloorLayout', ret: "void", arity: 1, params: "u16 *mapArg" },
  { name: 'InTrainerHill', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetCurrentTrainerHillMapId', ret: "u8", arity: 0, params: "void" },
  { name: 'OnTrainerHillRoof', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'SetWarpDestinationTrainerHill4F', ret: "WarpEvent*", arity: 0, params: "void" },
  { name: 'SetWarpDestinationTrainerHillFinalFloor', ret: "WarpEvent*", arity: 1, params: "u8 warpEventId" },
  { name: 'LocalIdToHillTrainerId', ret: "u16", arity: 1, params: "u8 localId" },
  { name: 'GetHillTrainerFlag', ret: "bool8", arity: 1, params: "u8 objectEventId" },
  { name: 'SetHillTrainerFlag', ret: "void", arity: 0, params: "void" },
  { name: 'CreateNPCTrainerHillParty', ret: "void", arity: 2, params: "u16 trainerId, u8 firstMonId" },
  { name: 'FillHillTrainerParty', ret: "void", arity: 0, params: "void" },
  { name: 'FillHillTrainersParties', ret: "void", arity: 0, params: "void" },
  { name: 'GetTrainerHillAIFlags', ret: "u32", arity: 0, params: "void" },
  { name: 'GetTrainerEncounterMusicIdInTrainerHill', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetNumFloorsInTrainerHillChallenge', ret: "u8", arity: 0, params: "void" },
  { name: 'TryLoadTrainerHillEReaderPalette', ret: "void", arity: 0, params: "void" },
  { name: 'OnTrainerHillEReaderChallengeFloor', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetPrizeListId', ret: "u8", arity: 1, params: "bool8 allowTMs" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_tower.h',
  'battle_setup.h',
  'ereader_helpers.h',
  'event_data.h',
  'event_scripts.h',
  'fieldmap.h',
  'field_message_box.h',
  'international_string_util.h',
  'item.h',
  'main.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'pokemon.h',
  'script.h',
  'string_util.h',
  'strings.h',
  'text.h',
  'trainer_hill.h',
  'window.h',
  'util.h',
  'constants/battle_ai.h',
  'constants/event_object_movement.h',
  'constants/event_objects.h',
  'constants/items.h',
  'constants/layouts.h',
  'constants/moves.h',
  'constants/trainers.h',
  'constants/trainer_hill.h',
  'constants/trainer_types.h',
  'data/battle_frontier/trainer_hill.h',
] as const;
