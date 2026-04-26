// AUTO-GENERATED from src/battle_tower.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_tower.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `k` */
export const INDEX_EXPR = "k";
export const STEVEN_OTID = 61226;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sUnused: readonly number[] = [179,141,200,183] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sBattleTowerFuncs = ['InitTowerChallenge', 'GetTowerData', 'SetTowerData', 'SetNextFacilityOpponent', 'SetTowerBattleWon', 'AwardBattleTowerRibbons', 'SaveTowerChallenge', 'GetOpponentIntroSpeech', 'BattleTowerNop1', 'BattleTowerNop2', 'LoadMultiPartnerCandidatesData', 'ShowPartnerCandidateMessage', 'LoadLinkMultiOpponentsData', 'TowerTryCloseLink', 'SetMultiPartnerGfx', 'SetTowerInterviewData', 'GetOpponentIntroSpeech2'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u16", name: 'gFrontierTempParty', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitTowerChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetTowerData', ret: "void", arity: 0, params: "void" },
  { name: 'SetTowerData', ret: "void", arity: 0, params: "void" },
  { name: 'SetNextFacilityOpponent', ret: "void", arity: 0, params: "void" },
  { name: 'SetTowerBattleWon', ret: "void", arity: 0, params: "void" },
  { name: 'AwardBattleTowerRibbons', ret: "void", arity: 0, params: "void" },
  { name: 'SaveTowerChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetOpponentIntroSpeech', ret: "void", arity: 0, params: "void" },
  { name: 'GetOpponentIntroSpeech2', ret: "void", arity: 0, params: "void" },
  { name: 'BattleTowerNop1', ret: "void", arity: 0, params: "void" },
  { name: 'BattleTowerNop2', ret: "void", arity: 0, params: "void" },
  { name: 'LoadMultiPartnerCandidatesData', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPartnerCandidateMessage', ret: "void", arity: 0, params: "void" },
  { name: 'LoadLinkMultiOpponentsData', ret: "void", arity: 0, params: "void" },
  { name: 'TowerTryCloseLink', ret: "void", arity: 0, params: "void" },
  { name: 'SetMultiPartnerGfx', ret: "void", arity: 0, params: "void" },
  { name: 'SetTowerInterviewData', ret: "void", arity: 0, params: "void" },
  { name: 'ValidateBattleTowerRecordChecksums', ret: "void", arity: 0, params: "void" },
  { name: 'SaveCurrentWinStreak', ret: "void", arity: 0, params: "void" },
  { name: 'ValidateApprenticesChecksums', ret: "void", arity: 0, params: "void" },
  { name: 'SetNextBattleTentOpponent', ret: "void", arity: 0, params: "void" },
  { name: 'CopyEReaderTrainerFarewellMessage', ret: "void", arity: 0, params: "void" },
  { name: 'ClearBattleTowerRecord', ret: "void", arity: 1, params: "struct EmeraldBattleTowerRecord *record" },
  { name: 'FillTrainerParty', ret: "void", arity: 3, params: "u16 trainerId, u8 firstMonId, u8 monCount" },
  { name: 'FillTentTrainerParty_', ret: "void", arity: 3, params: "u16 trainerId, u8 firstMonId, u8 monCount" },
  { name: 'FillFactoryFrontierTrainerParty', ret: "void", arity: 2, params: "u16 trainerId, u8 firstMonId" },
  { name: 'FillFactoryTentTrainerParty', ret: "void", arity: 2, params: "u16 trainerId, u8 firstMonId" },
  { name: 'GetFrontierTrainerFixedIvs', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'FillPartnerParty', ret: "void", arity: 1, params: "u16 trainerId" },
  { name: 'SetEReaderTrainerChecksum', ret: "void", arity: 1, params: "struct BattleTowerEReaderTrainer *ereaderTrainer" },
  { name: 'SetTentPtrsGetLevel', ret: "u8", arity: 0, params: "void" },
  { name: 'CallBattleTowerFunc', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseSpecialBattleTowerTrainer', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetRandomScaledFrontierTrainerId', ret: "u16", arity: 2, params: "u8 challengeNum, u8 battleNum" },
  { name: 'GetRandomScaledFrontierTrainerIdRange', ret: "UNUSED", arity: 4, params: "u8 challengeNum, u8 battleNum, u16 *trainerIdPtr, u8 *rangePtr" },
  { name: 'SetBattleFacilityTrainerGfxId', ret: "void", arity: 2, params: "u16 trainerId, u8 tempVarId" },
  { name: 'SetEReaderTrainerGfxId', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattleFacilityTrainerGfxId', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'PutNewBattleTowerRecord', ret: "void", arity: 1, params: "struct EmeraldBattleTowerRecord *newRecordEm" },
  { name: 'GetFrontierTrainerFrontSpriteId', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetFrontierOpponentClass', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetFrontierTrainerFacilityClass', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetFrontierTrainerName', ret: "void", arity: 2, params: "u8 *dst, u16 trainerId" },
  { name: 'IsFrontierTrainerFemale', ret: "bool8", arity: 1, params: "u16 trainerId" },
  { name: 'FillFrontierTrainerParty', ret: "void", arity: 1, params: "u8 monsCount" },
  { name: 'FillFrontierTrainersParties', ret: "void", arity: 1, params: "u8 monsCount" },
  { name: 'FillTentTrainerParty', ret: "void", arity: 1, params: "u8 monsCount" },
  { name: 'Unused_CreateApprenticeMons', ret: "UNUSED", arity: 2, params: "u16 trainerId, u8 firstMonId" },
  { name: 'GetRandomFrontierMonFromSet', ret: "u16", arity: 1, params: "u16 trainerId" },
  { name: 'FillFactoryTrainerParty', ret: "void", arity: 0, params: "void" },
  { name: 'FrontierSpeechToString', ret: "void", arity: 1, params: "const u16 *words" },
  { name: 'BufferApprenticeChallengeText', ret: "else", arity: 1, params: "trainerId - TRAINER_RECORD_MIXING_APPRENTICE" },
  { name: 'FrontierSpeechToString2', ret: "void", arity: 1, params: "const u16 *words" },
  { name: 'HandleSpecialTrainerBattleEnd', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartBattleAfterTransition', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoSpecialTrainerBattle', ret: "void", arity: 0, params: "void" },
  { name: 'SaveBattleTowerRecord', ret: "void", arity: 0, params: "void" },
  { name: 'GetApprenticeMultiPartnerParty', ret: "void", arity: 1, params: "u16 trainerId" },
  { name: 'GetRecordMixFriendMultiPartnerParty', ret: "void", arity: 1, params: "u16 trainerId" },
  { name: 'GetPotentialPartnerMoveAndSpecies', ret: "void", arity: 2, params: "u16 trainerId, u16 monId" },
  { name: 'CalcEmeraldBattleTowerChecksum', ret: "void", arity: 1, params: "struct EmeraldBattleTowerRecord *record" },
  { name: 'CalcRubyBattleTowerChecksum', ret: "void", arity: 1, params: "struct RSBattleTowerRecord *record" },
  { name: 'GetCurrentBattleTowerWinStreak', ret: "u16", arity: 2, params: "u8 lvlMode, u8 battleMode" },
  { name: 'GetMonCountForBattleMode', ret: "u8", arity: 1, params: "u8 battleMode" },
  { name: 'FillEReaderTrainerWithPlayerData', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetEreaderTrainerFrontSpriteId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetEreaderTrainerClassId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetEreaderTrainerName', ret: "void", arity: 1, params: "u8 *dst" },
  { name: 'ValidateEReaderTrainer', ret: "void", arity: 0, params: "void" },
  { name: 'ClearEReaderTrainer', ret: "void", arity: 1, params: "struct BattleTowerEReaderTrainer *ereaderTrainer" },
  { name: 'CopyEReaderTrainerGreeting', ret: "void", arity: 0, params: "void" },
  { name: 'TryHideBattleTowerReporter', ret: "void", arity: 0, params: "void" },
  { name: 'RubyBattleTowerRecordToEmerald', ret: "bool32", arity: 2, params: "struct RSBattleTowerRecord *src, struct EmeraldBattleTowerRecord *dst" },
  { name: 'EmeraldBattleTowerRecordToRuby', ret: "bool32", arity: 2, params: "struct EmeraldBattleTowerRecord *src, struct RSBattleTowerRecord *dst" },
  { name: 'CalcApprenticeChecksum', ret: "void", arity: 1, params: "struct Apprentice *apprentice" },
  { name: 'ClearApprentice', ret: "void", arity: 1, params: "struct Apprentice *apprentice" },
  { name: 'GetBattleTowerTrainerLanguage', ret: "void", arity: 2, params: "u8 *dst, u16 trainerId" },
  { name: 'SetFacilityPtrsGetLevel', ret: "u8", arity: 0, params: "void" },
  { name: 'GetFrontierEnemyMonLevel', ret: "u8", arity: 1, params: "u8 lvlMode" },
  { name: 'GetHighestLevelInPlayerParty', ret: "s32", arity: 0, params: "void" },
  { name: 'GetBattleTentTrainerId', ret: "u16", arity: 0, params: "void" },
  { name: 'FacilityClassToGraphicsId', ret: "u8", arity: 1, params: "u8 facilityClass" },
  { name: 'ValidateBattleTowerRecord', ret: "bool32", arity: 1, params: "u8 recordId" },
  { name: 'TrySetLinkBattleTowerEnemyPartyLevel', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_StartBattleAfterTransition',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_tower.h',
  'apprentice.h',
  'event_data.h',
  'battle_setup.h',
  'overworld.h',
  'random.h',
  'text.h',
  'main.h',
  'international_string_util.h',
  'battle.h',
  'frontier_util.h',
  'strings.h',
  'recorded_battle.h',
  'easy_chat.h',
  'gym_leader_rematch.h',
  'battle_transition.h',
  'trainer_see.h',
  'new_game.h',
  'string_util.h',
  'data.h',
  'link.h',
  'field_message_box.h',
  'tv.h',
  'battle_factory.h',
  'constants/apprentice.h',
  'constants/battle_dome.h',
  'constants/battle_frontier.h',
  'constants/battle_frontier_mons.h',
  'constants/battle_tent.h',
  'constants/battle_tent_mons.h',
  'constants/battle_tent_trainers.h',
  'constants/battle_tower.h',
  'constants/frontier_util.h',
  'constants/items.h',
  'constants/trainers.h',
  'constants/event_objects.h',
  'constants/moves.h',
  'data/battle_frontier/battle_frontier_trainer_mons.h',
  'data/battle_frontier/battle_frontier_trainers.h',
  'data/battle_frontier/battle_frontier_mons.h',
  'data/battle_frontier/battle_tent.h',
] as const;
