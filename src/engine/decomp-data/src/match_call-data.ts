// AUTO-GENERATED from src/match_call.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/match_call.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `FRONTIER_FACILITY_PIKE` */
export const MATCH_CALL_FACTORY_EXPR = "FRONTIER_FACILITY_PIKE";
/** Raw expr: `FRONTIER_FACILITY_FACTORY` */
export const MATCH_CALL_PIKE_EXPR = "FRONTIER_FACILITY_FACTORY";
/** Raw expr: `{STR_TRAINER_NAME, STR_NONE,             STR_NONE}` */
export const STRS_NORMAL_MSG_EXPR = "{STR_TRAINER_NAME, STR_NONE,             STR_NONE}";
/** Raw expr: `{STR_TRAINER_NAME, STR_SPECIES_IN_ROUTE, STR_NONE}` */
export const STRS_WILD_BATTLE_EXPR = "{STR_TRAINER_NAME, STR_SPECIES_IN_ROUTE, STR_NONE}";
/** Raw expr: `{STR_TRAINER_NAME, STR_NONE,             STR_NONE}` */
export const STRS_BATTLE_NEGATIVE_EXPR = "{STR_TRAINER_NAME, STR_NONE,             STR_NONE}";
/** Raw expr: `{STR_TRAINER_NAME, STR_SPECIES_IN_PARTY, STR_NONE}` */
export const STRS_BATTLE_POSITIVE_EXPR = "{STR_TRAINER_NAME, STR_SPECIES_IN_PARTY, STR_NONE}";
/** Raw expr: `{STR_TRAINER_NAME, STR_MAP_NAME,         STR_NONE}` */
export const STRS_BATTLE_REQUEST_EXPR = "{STR_TRAINER_NAME, STR_MAP_NAME,         STR_NONE}";
/** Raw expr: `{STR_TRAINER_NAME, STR_FACILITY_NAME,    STR_FRONTIER_STREAK}` */
export const STRS_FRONTIER_EXPR = "{STR_TRAINER_NAME, STR_FACILITY_NAME,    STR_FRONTIER_STREAK}";
export const NUM_STRVARS_IN_MSG = 3;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const tWindowId_EXPR = "data[2]";
/** Raw expr: `data[5]` */
export const tIconTaskId_EXPR = "data[5]";
export const TILE_MC_WINDOW = 624;
export const TILE_POKENAV_ICON = 633;
/** Raw expr: `data[0]` */
export const tTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSpinStage_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTileNum_EXPR = "data[2]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_STR_0 = {
  STR_TRAINER_NAME: 0,
  STR_MAP_NAME: 1,
  STR_SPECIES_IN_ROUTE: 2,
  STR_SPECIES_IN_PARTY: 3,
  STR_FACILITY_NAME: 4,
  STR_FRONTIER_STREAK: 5,
  STR_NONE: -1,
} as const;
export const ENUM_GEN_1 = {
  GEN_TOPIC_PERSONAL: 1,
  GEN_TOPIC_STREAK: 2,
  GEN_TOPIC_STREAK_RECORD: 3,
  GEN_TOPIC_B_DOME: 4,
  GEN_TOPIC_B_PIKE: 5,
  GEN_TOPIC_B_PYRAMID: 6,
} as const;
export const ENUM_B_2 = {
  B_TOPIC_WILD: 1,
  B_TOPIC_NEGATIVE: 2,
  B_TOPIC_POSITIVE: 3,
} as const;
export const ENUM_REQ_3 = {
  REQ_TOPIC_SAME_ROUTE: 1,
  REQ_TOPIC_DIFF_ROUTE: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sMatchCallTextWindow = { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 15, baseBlock: 512 } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sMatchCallWindow_Pal': { path: 'graphics/pokenav/match_call/window.png', ext: '.gbapal', type: 'u16' },
  'sMatchCallWindow_Gfx': { path: 'graphics/pokenav/match_call/window.png', ext: '.4bpp', type: 'u8' },
  'sPokenavIcon_Pal': { path: 'graphics/pokenav/match_call/nav_icon.png', ext: '.gbapal', type: 'u16' },
  'sPokenavIcon_Gfx': { path: 'graphics/pokenav/match_call/nav_icon.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sBattleFrontierFacilityNames = ['gText_BattleTower2', 'gText_BattleDome', 'gText_BattlePalace', 'gText_BattleArena', 'gText_BattlePike', 'gText_BattleFactory', 'gText_BattlePyramid'] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sMatchCallTaskFuncs = ['MatchCall_LoadGfx', 'MatchCall_DrawWindow', 'MatchCall_ReadyIntro', 'MatchCall_SlideWindowIn', 'MatchCall_PrintIntro', 'MatchCall_PrintMessage', 'MatchCall_SlideWindowOut', 'MatchCall_EndCall'] as const;
export const sPopulateMatchCallStringVarFuncs = ['PopulateTrainerName', 'PopulateMapName', 'PopulateSpeciesFromTrainerLocation', 'PopulateSpeciesFromTrainerParty', 'PopulateBattleFrontierFacilityName', 'PopulateBattleFrontierStreak'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct MatchCallState", name: 'sMatchCallState', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct BattleFrontierStreakInfo", name: 'sBattleFrontierStreakInfo', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BATTLE_TEXT_IDS', ret: "define", arity: 1, params: "msgId" },
  { name: 'GetCurrentTotalMinutes', ret: "u32", arity: 1, params: "struct Time *" },
  { name: 'GetNumRegisteredTrainers', ret: "u32", arity: 0, params: "void" },
  { name: 'GetActiveMatchCallTrainerId', ret: "u32", arity: 1, params: "u32" },
  { name: 'GetTrainerMatchCallId', ret: "int", arity: 1, params: "int" },
  { name: 'GetRematchTrainerLocation', ret: "mapsec_u16_t", arity: 1, params: "int" },
  { name: 'TrainerIsEligibleForRematch', ret: "bool32", arity: 1, params: "int" },
  { name: 'StartMatchCall', ret: "void", arity: 0, params: "void" },
  { name: 'ExecuteMatchCall', ret: "void", arity: 1, params: "u8" },
  { name: 'DrawMatchCallTextBoxBorder_Internal', ret: "void", arity: 3, params: "u32, u32, u32" },
  { name: 'Task_SpinPokenavIcon', ret: "void", arity: 1, params: "u8" },
  { name: 'InitMatchCallTextPrinter', ret: "void", arity: 2, params: "int, const u8 *" },
  { name: 'RunMatchCallTextPrinter', ret: "bool32", arity: 1, params: "int" },
  { name: 'ShouldTrainerRequestBattle', ret: "bool32", arity: 1, params: "int" },
  { name: 'BuildMatchCallString', ret: "void", arity: 3, params: "int, const struct MatchCallText *, u8 *" },
  { name: 'GetFrontierStreakInfo', ret: "u16", arity: 2, params: "u16, u32 *" },
  { name: 'PopulateMatchCallStringVars', ret: "void", arity: 2, params: "int, const s8 *" },
  { name: 'PopulateMatchCallStringVar', ret: "void", arity: 3, params: "int, int, u8 *" },
  { name: 'MatchCall_LoadGfx', ret: "bool32", arity: 1, params: "u8" },
  { name: 'MatchCall_DrawWindow', ret: "bool32", arity: 1, params: "u8" },
  { name: 'MatchCall_ReadyIntro', ret: "bool32", arity: 1, params: "u8" },
  { name: 'MatchCall_SlideWindowIn', ret: "bool32", arity: 1, params: "u8" },
  { name: 'MatchCall_PrintIntro', ret: "bool32", arity: 1, params: "u8" },
  { name: 'MatchCall_PrintMessage', ret: "bool32", arity: 1, params: "u8" },
  { name: 'MatchCall_SlideWindowOut', ret: "bool32", arity: 1, params: "u8" },
  { name: 'MatchCall_EndCall', ret: "bool32", arity: 1, params: "u8" },
  { name: 'PopulateTrainerName', ret: "void", arity: 2, params: "int, u8 *" },
  { name: 'PopulateMapName', ret: "void", arity: 2, params: "int, u8 *" },
  { name: 'PopulateSpeciesFromTrainerLocation', ret: "void", arity: 2, params: "int, u8 *" },
  { name: 'PopulateSpeciesFromTrainerParty', ret: "void", arity: 2, params: "int, u8 *" },
  { name: 'PopulateBattleFrontierFacilityName', ret: "void", arity: 2, params: "int, u8 *" },
  { name: 'PopulateBattleFrontierStreak', ret: "void", arity: 2, params: "int, u8 *" },
  { name: 'InitMatchCallCounters', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateMatchCallMinutesCounter', ret: "bool32", arity: 0, params: "void" },
  { name: 'CheckMatchCallChance', ret: "bool32", arity: 0, params: "void" },
  { name: 'MapAllowsMatchCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'UpdateMatchCallStepCounter', ret: "bool32", arity: 0, params: "void" },
  { name: 'SelectMatchCallTrainer', ret: "bool32", arity: 0, params: "void" },
  { name: 'TryStartMatchCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'StartMatchCallFromScript', ret: "void", arity: 1, params: "const u8 *message" },
  { name: 'IsMatchCallTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetNumRematchTrainersFought', ret: "u32", arity: 0, params: "void" },
  { name: 'GetNthRematchTrainerFought', ret: "u32", arity: 1, params: "int n" },
  { name: 'SelectMatchCallMessage', ret: "bool32", arity: 2, params: "int trainerId, u8 *str" },
  { name: 'GetLandEncounterSlot', ret: "u8", arity: 0, params: "void" },
  { name: 'GetWaterEncounterSlot', ret: "u8", arity: 0, params: "void" },
  { name: 'GetNumOwnedBadges', ret: "int", arity: 0, params: "void" },
  { name: 'GetPokedexRatingLevel', ret: "u8", arity: 1, params: "u16 numSeen" },
  { name: 'BufferPokedexRatingForMatchCall', ret: "void", arity: 1, params: "u8 *destStr" },
  { name: 'LoadMatchCallWindowGfx', ret: "void", arity: 3, params: "u32 windowId, u32 destOffset, u32 paletteId" },
  { name: 'DrawMatchCallTextBoxBorder', ret: "void", arity: 3, params: "u32 windowId, u32 tileOffset, u32 paletteId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_SpinPokenavIcon',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_setup.h',
  'bg.h',
  'data.h',
  'event_data.h',
  'event_object_movement.h',
  'field_player_avatar.h',
  'main.h',
  'match_call.h',
  'menu.h',
  'new_game.h',
  'overworld.h',
  'palette.h',
  'pokedex.h',
  'pokemon.h',
  'random.h',
  'region_map.h',
  'rtc.h',
  'script.h',
  'script_movement.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'wild_encounter.h',
  'window.h',
  'constants/abilities.h',
  'constants/battle_frontier.h',
  'constants/event_objects.h',
  'constants/region_map_sections.h',
  'constants/songs.h',
  'constants/trainers.h',
] as const;
