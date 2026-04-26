// AUTO-GENERATED from src/battle_pike.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_pike.c
// Generated: 2026-04-26

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sBattlePikeFunctions = ['SetRoomType', 'GetBattlePikeData', 'SetBattlePikeData', 'IsNextRoomFinal', 'SetupRoomObjectEvents', 'GetRoomType', 'SetInWildMonRoom', 'ClearInWildMonRoom', 'SavePikeChallenge', 'PikeDummy1', 'PikeDummy2', 'GetRoomInflictedStatus', 'GetRoomInflictedStatusMon', 'HealOneOrTwoMons', 'BufferNPCMessage', 'StatusInflictionScreenFlash', 'GetInBattlePike', 'SetHintedRoom', 'GetHintedRoomIndex', 'GetRoomTypeHint', 'ClearPikeTrainerIds', 'BufferTrainerIntro', 'GetCurrentRoomPikeQueenFightType', 'HealSomeMonsBeforePikeQueen', 'SetHealingroomTypesDisabled', 'IsPartyFullHealed', 'SaveMonHeldItems', 'RestoreMonHeldItems', 'InitPikeChallenge'] as const;
export const sStatusInflictionScreenFlashFuncs = ['StatusInflictionFadeOut', 'StatusInflictionFadeIn'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetRoomType', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattlePikeData', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattlePikeData', ret: "void", arity: 0, params: "void" },
  { name: 'IsNextRoomFinal', ret: "void", arity: 0, params: "void" },
  { name: 'SetupRoomObjectEvents', ret: "void", arity: 0, params: "void" },
  { name: 'GetRoomType', ret: "void", arity: 0, params: "void" },
  { name: 'SetInWildMonRoom', ret: "void", arity: 0, params: "void" },
  { name: 'ClearInWildMonRoom', ret: "void", arity: 0, params: "void" },
  { name: 'SavePikeChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'PikeDummy1', ret: "void", arity: 0, params: "void" },
  { name: 'PikeDummy2', ret: "void", arity: 0, params: "void" },
  { name: 'GetRoomInflictedStatus', ret: "void", arity: 0, params: "void" },
  { name: 'GetRoomInflictedStatusMon', ret: "void", arity: 0, params: "void" },
  { name: 'HealOneOrTwoMons', ret: "void", arity: 0, params: "void" },
  { name: 'BufferNPCMessage', ret: "void", arity: 0, params: "void" },
  { name: 'StatusInflictionScreenFlash', ret: "void", arity: 0, params: "void" },
  { name: 'GetInBattlePike', ret: "void", arity: 0, params: "void" },
  { name: 'SetHintedRoom', ret: "void", arity: 0, params: "void" },
  { name: 'GetHintedRoomIndex', ret: "void", arity: 0, params: "void" },
  { name: 'GetRoomTypeHint', ret: "void", arity: 0, params: "void" },
  { name: 'ClearPikeTrainerIds', ret: "void", arity: 0, params: "void" },
  { name: 'BufferTrainerIntro', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentRoomPikeQueenFightType', ret: "void", arity: 0, params: "void" },
  { name: 'HealSomeMonsBeforePikeQueen', ret: "void", arity: 0, params: "void" },
  { name: 'SetHealingroomTypesDisabled', ret: "void", arity: 0, params: "void" },
  { name: 'IsPartyFullHealed', ret: "void", arity: 0, params: "void" },
  { name: 'SaveMonHeldItems', ret: "void", arity: 0, params: "void" },
  { name: 'RestoreMonHeldItems', ret: "void", arity: 0, params: "void" },
  { name: 'InitPikeChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetNextRoomType', ret: "u8", arity: 0, params: "void" },
  { name: 'PrepareOneTrainer', ret: "void", arity: 1, params: "bool8 difficult" },
  { name: 'GetNPCRoomGraphicsId', ret: "u16", arity: 0, params: "void" },
  { name: 'PrepareTwoTrainers', ret: "void", arity: 0, params: "void" },
  { name: 'TryHealMons', ret: "void", arity: 1, params: "u8 healCount" },
  { name: 'Task_DoStatusInflictionScreenFlash', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AtLeastTwoAliveMons', ret: "bool8", arity: 0, params: "void" },
  { name: 'SpeciesToPikeMonId', ret: "u8", arity: 1, params: "u16 species" },
  { name: 'CanEncounterWildMon', ret: "bool8", arity: 1, params: "u8 monLevel" },
  { name: 'GetPikeQueenFightType', ret: "u8", arity: 1, params: "u8" },
  { name: 'StatusInflictionFadeOut', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'StatusInflictionFadeIn', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CallBattlePikeFunction', ret: "void", arity: 0, params: "void" },
  { name: 'HealMon', ret: "void", arity: 1, params: "struct Pokemon *mon" },
  { name: 'DoesAbilityPreventStatus', ret: "bool8", arity: 2, params: "struct Pokemon *mon, u32 status" },
  { name: 'DoesTypePreventStatus', ret: "bool8", arity: 2, params: "u16 species, u32 status" },
  { name: 'TryInflictRandomStatus', ret: "bool8", arity: 0, params: "void" },
  { name: 'AtLeastOneHealthyMon', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetInWildMonRoom', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'TryGenerateBattlePikeWildMon', ret: "bool32", arity: 1, params: "bool8 checkKeenEyeIntimidate" },
  { name: 'GetBattlePikeWildMonHeaderId', ret: "u8", arity: 0, params: "void" },
  { name: 'DoStatusInflictionScreenFlash', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StartStatusInflictionScreenFlash', ret: "void", arity: 5, params: "s16 fadeOutDelay, s16 fadeInDelay, s16 numFades, s16 fadeOutSpeed, s16 fadeInSpped" },
  { name: 'IsStatusInflictionScreenFlashTaskFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'InBattlePike', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoStatusInflictionScreenFlash',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_pike.h',
  'event_data.h',
  'frontier_util.h',
  'fieldmap.h',
  'save.h',
  'battle.h',
  'random.h',
  'task.h',
  'battle_tower.h',
  'party_menu.h',
  'malloc.h',
  'palette.h',
  'script.h',
  'battle_setup.h',
  'constants/event_objects.h',
  'constants/battle_frontier.h',
  'constants/frontier_util.h',
  'constants/abilities.h',
  'constants/layouts.h',
  'constants/rgb.h',
  'constants/trainers.h',
  'constants/moves.h',
  'constants/party_menu.h',
  'constants/battle_pike.h',
] as const;
