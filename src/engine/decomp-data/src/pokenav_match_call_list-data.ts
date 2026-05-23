// AUTO-GENERATED from src/pokenav_match_call_list.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_match_call_list.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_HandleMatchCallInput', ret: "u32", arity: 1, params: "struct Pokenav_MatchCallMenu *" },
  { name: 'GetExitMatchCallMenuId', ret: "u32", arity: 1, params: "struct Pokenav_MatchCallMenu *" },
  { name: 'CB2_HandleMatchCallOptionsInput', ret: "u32", arity: 1, params: "struct Pokenav_MatchCallMenu *" },
  { name: 'CB2_HandleCheckPageInput', ret: "u32", arity: 1, params: "struct Pokenav_MatchCallMenu *" },
  { name: 'CB2_HandleCallExitInput', ret: "u32", arity: 1, params: "struct Pokenav_MatchCallMenu *" },
  { name: 'LoopedTask_BuildMatchCallList', ret: "u32", arity: 1, params: "s32" },
  { name: 'ShouldDoNearbyMessage', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavCallback_Init_MatchCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetMatchCallCallback', ret: "u32", arity: 0, params: "void" },
  { name: 'FreeMatchCallSubstruct1', ret: "void", arity: 0, params: "void" },
  { name: 'IsRematchEntryRegistered', ret: "bool32", arity: 1, params: "int rematchIndex" },
  { name: 'IsMatchCallListInitFinished', ret: "int", arity: 0, params: "void" },
  { name: 'GetNumberRegistered', ret: "int", arity: 0, params: "void" },
  { name: 'GetNumSpecialTrainers', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetNumNormalTrainers', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetNormalTrainerHeaderId', ret: "UNUSED", arity: 1, params: "int index" },
  { name: 'GetMatchCallMapSec', ret: "mapsec_u16_t", arity: 1, params: "int index" },
  { name: 'ShouldDrawRematchPokeballIcon', ret: "bool32", arity: 1, params: "int index" },
  { name: 'GetMatchCallTrainerPic', ret: "int", arity: 1, params: "int index" },
  { name: 'MatchCall_GetMessage', ret: "else", arity: 2, params: "state->matchCallEntries[index].headerId, gStringVar4" },
  { name: 'GetMatchCallOptionCursorPos', ret: "u16", arity: 0, params: "void" },
  { name: 'GetMatchCallOptionId', ret: "u16", arity: 1, params: "int optionId" },
  { name: 'BufferMatchCallNameAndDesc', ret: "void", arity: 2, params: "struct PokenavMatchCallEntry *matchCallEntry, u8 *str" },
  { name: 'GetMatchTableMapSectionId', ret: "mapsec_u8_t", arity: 1, params: "int rematchIndex" },
  { name: 'GetIndexDeltaOfNextCheckPageDown', ret: "int", arity: 1, params: "int index" },
  { name: 'GetIndexDeltaOfNextCheckPageUp', ret: "int", arity: 1, params: "int index" },
  { name: 'HasRematchEntry', ret: "UNUSED", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_setup.h',
  'data.h',
  'event_data.h',
  'gym_leader_rematch.h',
  'international_string_util.h',
  'main.h',
  'match_call.h',
  'overworld.h',
  'pokemon.h',
  'pokenav.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'constants/songs.h',
  'data/text/match_call_messages.h',
] as const;
