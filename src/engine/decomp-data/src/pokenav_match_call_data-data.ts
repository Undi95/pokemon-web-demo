// AUTO-GENERATED from src/pokenav_match_call_data.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_match_call_data.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const REMATCH_CALL_START = 65534;
export const ALWAYS_AVAILABLE = 65535;
export const NO_FLAG_TO_SET = 65535;
/** Raw expr: `{NULL, ALWAYS_AVAILABLE, NO_FLAG_TO_SET}` */
export const MATCH_CALL_TEXT_END_EXPR = "{NULL, ALWAYS_AVAILABLE, NO_FLAG_TO_SET}";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MC_0 = {
  MC_TYPE_NPC: 0,
  MC_TYPE_TRAINER: 1,
  MC_TYPE_WALLY: 2,
  MC_TYPE_BIRCH: 3,
  MC_TYPE_RIVAL: 4,
  MC_TYPE_LEADER: 5,
} as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sMatchCallGetEnabledFuncs = ['MatchCall_GetEnabled_NPC', 'MatchCall_GetEnabled_Trainer', 'MatchCall_GetEnabled_Wally', 'MatchCall_GetEnabled_Rival', 'MatchCall_GetEnabled_Birch'] as const;
export const sMatchCallGetMapSecFuncs = ['MatchCall_GetMapSec_NPC', 'MatchCall_GetMapSec_Trainer', 'MatchCall_GetMapSec_Wally', 'MatchCall_GetMapSec_Rival', 'MatchCall_GetMapSec_Birch'] as const;
export const sMatchCall_IsRematchableFunctions = ['MatchCall_IsRematchable_NPC', 'MatchCall_IsRematchable_Trainer', 'MatchCall_IsRematchable_Wally', 'MatchCall_IsRematchable_Rival', 'MatchCall_IsRematchable_Birch'] as const;
export const sMatchCall_HasCheckPageFunctions = ['MatchCall_HasCheckPage_NPC', 'MatchCall_HasCheckPage_Trainer', 'MatchCall_HasCheckPage_Wally', 'MatchCall_HasCheckPage_Rival', 'MatchCall_HasCheckPage_Birch'] as const;
export const sMatchCall_GetRematchTableIdxFunctions = ['MatchCall_GetRematchTableIdx_NPC', 'MatchCall_GetRematchTableIdx_Trainer', 'MatchCall_GetRematchTableIdx_Wally', 'MatchCall_GetRematchTableIdx_Rival', 'MatchCall_GetRematchTableIdx_Birch'] as const;
export const sMatchCall_GetMessageFunctions = ['MatchCall_GetMessage_NPC', 'MatchCall_GetMessage_Trainer', 'MatchCall_GetMessage_Wally', 'MatchCall_GetMessage_Rival', 'MatchCall_GetMessage_Birch'] as const;
export const sMatchCall_GetNameAndDescFunctions = ['MatchCall_GetNameAndDesc_NPC', 'MatchCall_GetNameAndDesc_Trainer', 'MatchCall_GetNameAndDesc_Wally', 'MatchCall_GetNameAndDesc_Rival', 'MatchCall_GetNameAndDesc_Birch'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MatchCall_GetEnabled_NPC', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetEnabled_Trainer', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetEnabled_Wally', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetEnabled_Birch', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetEnabled_Rival', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetMapSec_NPC', ret: "mapsec_u8_t", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetMapSec_Trainer', ret: "mapsec_u8_t", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetMapSec_Wally', ret: "mapsec_u8_t", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetMapSec_Birch', ret: "mapsec_u8_t", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetMapSec_Rival', ret: "mapsec_u8_t", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_IsRematchable_NPC', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_IsRematchable_Trainer', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_IsRematchable_Wally', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_IsRematchable_Birch', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_IsRematchable_Rival', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_HasCheckPage_NPC', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_HasCheckPage_Trainer', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_HasCheckPage_Wally', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_HasCheckPage_Birch', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_HasCheckPage_Rival', ret: "bool32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetRematchTableIdx_NPC', ret: "u32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetRematchTableIdx_Trainer', ret: "u32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetRematchTableIdx_Wally', ret: "u32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetRematchTableIdx_Birch', ret: "u32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetRematchTableIdx_Rival', ret: "u32", arity: 1, params: "match_call_t" },
  { name: 'MatchCall_GetMessage_NPC', ret: "void", arity: 2, params: "match_call_t, u8 *" },
  { name: 'MatchCall_GetMessage_Trainer', ret: "void", arity: 2, params: "match_call_t, u8 *" },
  { name: 'MatchCall_GetMessage_Wally', ret: "void", arity: 2, params: "match_call_t, u8 *" },
  { name: 'MatchCall_GetMessage_Birch', ret: "void", arity: 2, params: "match_call_t, u8 *" },
  { name: 'MatchCall_GetMessage_Rival', ret: "void", arity: 2, params: "match_call_t, u8 *" },
  { name: 'MatchCall_GetNameAndDesc_NPC', ret: "void", arity: 3, params: "match_call_t, const u8 **, const u8 **" },
  { name: 'MatchCall_GetNameAndDesc_Trainer', ret: "void", arity: 3, params: "match_call_t, const u8 **, const u8 **" },
  { name: 'MatchCall_GetNameAndDesc_Wally', ret: "void", arity: 3, params: "match_call_t, const u8 **, const u8 **" },
  { name: 'MatchCall_GetNameAndDesc_Birch', ret: "void", arity: 3, params: "match_call_t, const u8 **, const u8 **" },
  { name: 'MatchCall_GetNameAndDesc_Rival', ret: "void", arity: 3, params: "match_call_t, const u8 **, const u8 **" },
  { name: 'MatchCall_BufferCallMessageText', ret: "void", arity: 2, params: "const match_call_text_data_t *, u8 *" },
  { name: 'MatchCall_BufferCallMessageTextByRematchTeam', ret: "void", arity: 3, params: "const match_call_text_data_t *, u16, u8 *" },
  { name: 'MatchCall_GetNameAndDescByRematchIdx', ret: "void", arity: 3, params: "u32, const u8 **, const u8 **" },
  { name: 'MatchCallGetFunctionIndex', ret: "u32", arity: 1, params: "match_call_t matchCall" },
  { name: 'GetTrainerIdxByRematchIdx', ret: "u32", arity: 1, params: "u32 rematchIdx" },
  { name: 'GetRematchIdxByTrainerIdx', ret: "s32", arity: 1, params: "s32 trainerIdx" },
  { name: 'MatchCall_GetEnabled', ret: "bool32", arity: 1, params: "u32 idx" },
  { name: 'MatchCall_GetMapSec', ret: "mapsec_u8_t", arity: 1, params: "u32 idx" },
  { name: 'MatchCall_IsRematchable', ret: "bool32", arity: 1, params: "u32 idx" },
  { name: 'MatchCall_HasCheckPage', ret: "bool32", arity: 1, params: "u32 idx" },
  { name: 'MatchCall_GetRematchTableIdx', ret: "u32", arity: 1, params: "u32 idx" },
  { name: 'MatchCall_GetMessage', ret: "void", arity: 2, params: "u32 idx, u8 *dest" },
  { name: 'MatchCall_GetNameAndDesc', ret: "void", arity: 3, params: "u32 idx, const u8 **desc, const u8 **name" },
  { name: 'MatchCall_GetOverrideFacilityClass', ret: "int", arity: 1, params: "u32 idx" },
  { name: 'MatchCall_HasRematchId', ret: "bool32", arity: 1, params: "u32 idx" },
  { name: 'SetMatchCallRegisteredFlag', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_setup.h',
  'data.h',
  'event_data.h',
  'string_util.h',
  'battle.h',
  'gym_leader_rematch.h',
  'match_call.h',
  'pokenav.h',
  'strings.h',
  'international_string_util.h',
  'constants/region_map_sections.h',
  'constants/trainers.h',
] as const;
