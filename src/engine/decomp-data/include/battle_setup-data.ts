// AUTO-GENERATED from include/battle_setup.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_setup.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const REMATCHES_COUNT = 5;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BattleSetup_StartWildBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleSetup_StartBattlePikeWildBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleSetup_StartRoamerBattle', ret: "void", arity: 0, params: "void" },
  { name: 'StartWallyTutorialBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleSetup_StartScriptedWildBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleSetup_StartLatiBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleSetup_StartLegendaryBattle', ret: "void", arity: 0, params: "void" },
  { name: 'StartGroudonKyogreBattle', ret: "void", arity: 0, params: "void" },
  { name: 'StartRegiBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleSetup_GetEnvironmentId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetSpecialBattleTransition', ret: "u8", arity: 1, params: "s32 id" },
  { name: 'ChooseStarter', ret: "void", arity: 0, params: "void" },
  { name: 'ResetTrainerOpponentIds', ret: "void", arity: 0, params: "void" },
  { name: 'SetMapVarsToTrainer', ret: "void", arity: 0, params: "void" },
  { name: 'ConfigureAndSetUpOneTrainerBattle', ret: "void", arity: 2, params: "u8 trainerObjEventId, const u8 *trainerScript" },
  { name: 'ConfigureTwoTrainersBattle', ret: "void", arity: 2, params: "u8 trainerObjEventId, const u8 *trainerScript" },
  { name: 'SetUpTwoTrainersBattle', ret: "void", arity: 0, params: "void" },
  { name: 'GetTrainerFlagFromScriptPointer', ret: "bool32", arity: 1, params: "const u8 *data" },
  { name: 'SetTrainerFacingDirection', ret: "void", arity: 0, params: "void" },
  { name: 'GetTrainerBattleMode', ret: "u8", arity: 0, params: "void" },
  { name: 'GetTrainerFlag', ret: "bool8", arity: 0, params: "void" },
  { name: 'HasTrainerBeenFought', ret: "bool8", arity: 1, params: "u16 trainerId" },
  { name: 'SetTrainerFlag', ret: "void", arity: 1, params: "u16 trainerId" },
  { name: 'ClearTrainerFlag', ret: "void", arity: 1, params: "u16 trainerId" },
  { name: 'BattleSetup_StartTrainerBattle', ret: "void", arity: 0, params: "void" },
  { name: 'BattleSetup_StartRematchBattle', ret: "void", arity: 0, params: "void" },
  { name: 'ShowTrainerIntroSpeech', ret: "void", arity: 0, params: "void" },
  { name: 'ShowTrainerCantBattleSpeech', ret: "void", arity: 0, params: "void" },
  { name: 'PlayTrainerEncounterMusic', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateRematchIfDefeated', ret: "void", arity: 1, params: "s32 rematchTableId" },
  { name: 'IncrementRematchStepCounter', ret: "void", arity: 0, params: "void" },
  { name: 'TryUpdateRandomTrainerRematches', ret: "void", arity: 2, params: "u16 mapGroup, u16 mapNum" },
  { name: 'DoesSomeoneWantRematchIn', ret: "bool32", arity: 2, params: "u16 mapGroup, u16 mapNum" },
  { name: 'IsRematchTrainerIn', ret: "bool32", arity: 2, params: "u16 mapGroup, u16 mapNum" },
  { name: 'GetLastBeatenRematchTrainerId', ret: "u16", arity: 1, params: "u16 trainerId" },
  { name: 'ShouldTryRematchBattle', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsTrainerReadyForRematch', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShouldTryGetTrainerScript', ret: "void", arity: 0, params: "void" },
  { name: 'CountBattledRematchTeams', ret: "u16", arity: 1, params: "u16 trainerId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gym_leader_rematch.h',
] as const;
