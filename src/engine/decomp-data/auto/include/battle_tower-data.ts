// AUTO-GENERATED from include/battle_tower.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_tower.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CallBattleTowerFunc', ret: "void", arity: 0, params: "void" },
  { name: 'GetRandomScaledFrontierTrainerId', ret: "u16", arity: 2, params: "u8 challengeNum, u8 battleNum" },
  { name: 'SetBattleFacilityTrainerGfxId', ret: "void", arity: 2, params: "u16 trainerId, u8 tempVarId" },
  { name: 'SetEReaderTrainerGfxId', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattleFacilityTrainerGfxId', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'PutNewBattleTowerRecord', ret: "void", arity: 1, params: "struct EmeraldBattleTowerRecord *newRecordEm" },
  { name: 'GetFrontierTrainerFrontSpriteId', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetFrontierOpponentClass', ret: "u8", arity: 1, params: "u16 trainerId" },
  { name: 'GetFrontierTrainerName', ret: "void", arity: 2, params: "u8 *dst, u16 trainerId" },
  { name: 'IsFrontierTrainerFemale', ret: "bool8", arity: 1, params: "u16 trainerId" },
  { name: 'FillFrontierTrainerParty', ret: "void", arity: 1, params: "u8 monsCount" },
  { name: 'FillFrontierTrainersParties', ret: "void", arity: 1, params: "u8 monsCount" },
  { name: 'GetRandomFrontierMonFromSet', ret: "u16", arity: 1, params: "u16 trainerId" },
  { name: 'FrontierSpeechToString', ret: "void", arity: 1, params: "const u16 *words" },
  { name: 'DoSpecialTrainerBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CalcEmeraldBattleTowerChecksum', ret: "void", arity: 1, params: "struct EmeraldBattleTowerRecord *record" },
  { name: 'CalcRubyBattleTowerChecksum', ret: "void", arity: 1, params: "struct RSBattleTowerRecord *record" },
  { name: 'GetCurrentBattleTowerWinStreak', ret: "u16", arity: 2, params: "u8 lvlMode, u8 battleMode" },
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
  { name: 'GetBattleTowerTrainerLanguage', ret: "void", arity: 2, params: "u8 *dst, u16 trainerId" },
  { name: 'SetFacilityPtrsGetLevel', ret: "u8", arity: 0, params: "void" },
  { name: 'GetFrontierEnemyMonLevel', ret: "u8", arity: 1, params: "u8 lvlMode" },
  { name: 'GetHighestLevelInPlayerParty', ret: "s32", arity: 0, params: "void" },
  { name: 'FacilityClassToGraphicsId', ret: "u8", arity: 1, params: "u8 facilityClass" },
  { name: 'ValidateBattleTowerRecord', ret: "bool32", arity: 1, params: "u8 recordId" },
  { name: 'TrySetLinkBattleTowerEnemyPartyLevel', ret: "void", arity: 0, params: "void" },
] as const;
